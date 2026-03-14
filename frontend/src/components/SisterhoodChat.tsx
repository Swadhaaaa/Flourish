import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lock, MessageCircle } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { importPublicKey, importPrivateKey, deriveSharedSecret, encryptMessage, decryptMessage } from '../utils/e2ee';

interface SisterhoodChatProps {
    peerId: string;
    peerName: string;
    peerPhoto: string;
    onClose: () => void;
}

export default function SisterhoodChat({ peerId, peerName, peerPhoto, onClose }: SisterhoodChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);
    const [loadingKey, setLoadingKey] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Connection ID is consistently sorted to act as a unique channel
    const chatId = [user?.uid, peerId].sort().join('_');

    // 1. Establish E2EE Key
    useEffect(() => {
        const setupE2EE = async () => {
            try {
                // Fetch Peer's public key from Firestore directly or assume it's passed
                const peerDoc = await getDoc(doc(db, 'users', peerId));
                if (!peerDoc.exists() || !peerDoc.data().publicKey) {
                    console.error("Peer has no public key");
                    setLoadingKey(false);
                    return;
                }
                const peerPublicKeyStr = peerDoc.data().publicKey;
                const peerKey = await importPublicKey(peerPublicKeyStr);

                // Fetch our private key from LocalStorage
                const privKeyStr = localStorage.getItem(`e2ee_priv_${user?.uid}`);
                if (!privKeyStr) {
                    console.error("Local private key missing");
                    setLoadingKey(false);
                    return;
                }
                const myPrivKey = await importPrivateKey(privKeyStr);

                // Derive shared key
                const shared = await deriveSharedSecret(myPrivKey, peerKey);
                setSharedKey(shared);
            } catch (err) {
                console.error("E2EE Setup failed", err);
            } finally {
                setLoadingKey(false);
            }
        };
        if (user && peerId) setupE2EE();
    }, [user, peerId]);

    // 2. Listen to Messages
    useEffect(() => {
        if (!sharedKey) return;

        const q = query(
            collection(db, `connections/${chatId}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const msgs: any[] = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                // Decrypt message
                try {
                    const decryptedText = await decryptMessage(sharedKey, data.ciphertext, data.iv);
                    msgs.push({ id: doc.id, ...data, text: decryptedText });
                } catch (e) {
                    msgs.push({ id: doc.id, ...data, text: "[Decryption Failed]" });
                }
            }
            setMessages(msgs);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();
    }, [sharedKey, chatId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !sharedKey || !user) return;

        const plaintext = inputText;
        setInputText('');

        try {
            const { ciphertext, iv } = await encryptMessage(sharedKey, plaintext);
            await addDoc(collection(db, `connections/${chatId}/messages`), {
                senderId: user.uid,
                ciphertext,
                iv,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to send encrypted message", err);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed bottom-0 right-0 top-0 md:top-auto md:w-[400px] w-full md:h-[600px] bg-white dark:bg-slate-900 shadow-2xl md:rounded-tl-3xl z-50 flex flex-col border-l border-t border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#FFF0E5]/50 dark:bg-slate-900 rounded-tl-3xl">
                    <div className="flex items-center gap-3">
                        <img src={peerPhoto} alt={peerName} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{peerName}</h3>
                            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                <Lock className="w-3 h-3" /> End-to-End Encrypted
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
                    {loadingKey ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Lock className="w-8 h-8 mb-2 animate-pulse text-rose-300" />
                            <p className="text-sm font-bold">Securing connection...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-rose-500" />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Say Hi to {peerName}!</h4>
                            <p className="text-sm text-slate-500">Connections form the safety net of Sisterhood. Start the conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                        ? 'bg-rose-500 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type an encrypted message..."
                            disabled={loadingKey}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-200"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || loadingKey}
                            className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 transition-colors shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
