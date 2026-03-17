import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lock, MessageCircle, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { importPublicKey, importPrivateKey, deriveSharedSecret, encryptMessage, decryptMessage } from '../utils/e2ee';
import { io, Socket } from 'socket.io-client';

// URL is now passed as a prop for consistency

interface SisterhoodChatProps {
    peerId: string;
    peerName: string;
    peerPhoto: string;
    apiUrl: string;
    onClose: () => void;
}

export default function SisterhoodChat({ peerId, peerName, peerPhoto, apiUrl, onClose }: SisterhoodChatProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);
    const [loadingKey, setLoadingKey] = useState(true);
    const [keyError, setKeyError] = useState<string | null>(null);
    const [isPeerTyping, setIsPeerTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingSocketMsgs = useRef<any[]>([]);
    const typingTimeoutRef = useRef<any>(null);
    const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);

    // Connection ID is consistently sorted to act as a unique channel
    const chatId = [user?.uid, peerId].sort().join('_');

    // 1. Establish E2EE Key
    useEffect(() => {
        const setupE2EE = async () => {
            try {
                const peerDoc = await getDoc(doc(db, 'users', peerId));
                if (!peerDoc.exists() || !peerDoc.data().publicKey) {
                    console.error("Peer has no public key");
                    setLoadingKey(false);
                    return;
                }
                const peerPublicKeyStr = peerDoc.data().publicKey;
                const peerKey = await importPublicKey(peerPublicKeyStr);

                const privKeyStr = localStorage.getItem(`e2ee_priv_${user?.uid}`);
                if (!privKeyStr) {
                    console.error("DEBUG: Local private key missing from LocalStorage for UID:", user?.uid);
                    setKeyError("Encryption keys missing on this device. You need to re-initialize your secure chat profile.");
                    setLoadingKey(false);
                    return;
                }
                const myPrivKey = await importPrivateKey(privKeyStr);

                const shared = await deriveSharedSecret(myPrivKey, peerKey);
                setSharedKey(shared);
                console.log("E2EE Shared Key Derived Successfully");

                // Decrypt any buffered messages
                if (pendingSocketMsgs.current.length > 0) {
                    console.log(`Processing ${pendingSocketMsgs.current.length} buffered messages`);
                    for (const data of pendingSocketMsgs.current) {
                        handleIncomingMessage(data, shared);
                    }
                    pendingSocketMsgs.current = [];
                }
            } catch (err) {
                console.error("E2EE Setup failed", err);
            } finally {
                setLoadingKey(false);
            }
        };
        if (user && peerId) setupE2EE();
    }, [user, peerId]);

    const handleIncomingMessage = async (data: any, key: CryptoKey) => {
        try {
            const decryptedText = await decryptMessage(key, data.ciphertext, data.iv);
            const newMessage = {
                id: `socket_${Date.now()}_${Math.random()}`,
                senderId: data.senderId,
                text: decryptedText,
                ciphertext: data.ciphertext, // Use this for deduplication
                createdAt: new Date(),
                isSocket: true
            };
            setMessages(prev => {
                const isDuplicate = prev.some(m => m.ciphertext === data.ciphertext);
                if (isDuplicate) return prev;
                // Play notification sound for incoming messages ONLY
                if (data.senderId !== user?.uid) {
                    new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => { });
                }
                return [...prev, newMessage];
            });
        } catch (err) {
            console.error("Decryption failed for socket message", err);
        }
    };

    // 2. WebSocket Connection (Permanent)
    useEffect(() => {
        if (!user || !peerId) return;

        console.log(`DEBUG: SisterhoodChat connecting to Sockets at: ${apiUrl}`);
        const socket = io(apiUrl);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log("WebSocket Status: CONNECTED");
            setIsConnected(true);
            socket.emit('join_room', { chatId });
        });

        socket.on('connect_error', (err) => {
            console.error("WebSocket Status: ERROR", err);
            setIsConnected(false);
        });

        socket.on('disconnect', () => {
            console.log("WebSocket Status: DISCONNECTED");
            setIsConnected(false);
        });

        socket.on('receive_message', (data) => {
            console.log("Socket: New encrypted message received");
            if (sharedKey) {
                handleIncomingMessage(data, sharedKey);
            } else {
                console.log("Socket: Buffering message (Key not ready)");
                pendingSocketMsgs.current.push(data);
            }
        });

        socket.on('user_typing', () => setIsPeerTyping(true));
        socket.on('user_stop_typing', () => setIsPeerTyping(false));

        return () => {
            console.log("Cleaning up socket connection");
            socket.disconnect();
        };
    }, [user, peerId, chatId, !!sharedKey]); // Re-bind listener if sharedKey exists now

    // 3. Listen to Firestore Messages (Source of Truth)
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
                try {
                    const decryptedText = await decryptMessage(sharedKey, data.ciphertext, data.iv);
                    msgs.push({ id: doc.id, ...data, text: decryptedText });
                } catch (e) {
                    msgs.push({ id: doc.id, ...data, text: "[Decryption Failed]" });
                }
            }

            setMessages(prev => {
                // Keep socket messages that aren't in Firestore yet
                const firestoreCiphertexts = new Set(msgs.map(m => m.ciphertext));
                const uniqueSocketMsgs = prev.filter(m => m.isSocket && !firestoreCiphertexts.has(m.ciphertext));

                // Sort combined list by createdAt if possible, or just keep order
                return [...msgs, ...uniqueSocketMsgs];
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();
    }, [sharedKey, chatId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (socketRef.current?.connected) {
            socketRef.current.emit('typing', { chatId });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('stop_typing', { chatId });
            }, 2000);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !sharedKey || !user) return;

        const plaintext = inputText;
        setInputText('');

        // Stop typing immediately on send
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socketRef.current?.emit('stop_typing', { chatId });

        try {
            const { ciphertext, iv } = await encryptMessage(sharedKey, plaintext);

            // 1. Send via Socket
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('send_message', {
                    chatId,
                    senderId: user.uid,
                    ciphertext,
                    iv
                });
            } else {
                console.warn("Socket not connected, relying on Firestore only");
            }

            // 2. Persist in Firestore
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

    const deleteMessage = async (msgId: string) => {
        if (!msgId) return;
        setDeletingMsgId(msgId);
        try {
            // Remove from Firestore if it's a persisted message (not a socket-only one)
            if (!msgId.startsWith('socket_')) {
                await deleteDoc(doc(db, `connections/${chatId}/messages`, msgId));
            }
            // Remove from local state immediately
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch (err) {
            console.error('Failed to delete message', err);
        } finally {
            setDeletingMsgId(null);
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
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                    <Lock className="w-3 h-3" /> E2EE
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} title={`Backend: ${apiUrl}`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {isConnected ? 'Live' : 'Reconnecting...'}
                                </span>
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
                    ) : keyError ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-amber-500" />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Security Setup Needed</h4>
                            <p className="text-sm text-slate-500 mb-6">{keyError}</p>
                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase"
                                >
                                    Try Refreshing
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem(`e2ee_priv_${user?.uid}`);
                                        // Use window.location.href for reset to ensure total state clearance
                                        // regarding E2EE keys across all components
                                        window.location.href = '/work/sisterhood';
                                    }}
                                    className="w-full py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl font-bold text-xs uppercase"
                                >
                                    Reset Security Profile
                                </button>
                                <p className="text-[10px] text-slate-400 mt-2 italic">
                                    Note: Encryption keys are device-specific. If you just logged in here, you may need to reset them in Sisterhood settings.
                                </p>
                            </div>
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
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}>
                                    {isMe && (
                                        <button
                                            onClick={() => deleteMessage(msg.id)}
                                            disabled={deletingMsgId === msg.id}
                                            className="self-center mr-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-slate-700 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                                            title="Delete message"
                                        >
                                            <Trash2 className={`w-3.5 h-3.5 ${deletingMsgId === msg.id ? 'animate-pulse' : ''}`} />
                                        </button>
                                    )}
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
                    {isPeerTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400 italic">{peerName} is typing</span>
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-rose-400 rounded-full animate-bounce" />
                                    <span className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
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
