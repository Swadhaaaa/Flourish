import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString()
            }, { merge: true });

            navigate("/onboarding"); // Redirect to onboarding flow
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email/password login here
        console.log("Email login logic needed");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-glow-gradient opacity-40 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8 space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Flourish</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Begin Your Journey</h1>
                    <p className="text-muted">Create your account and start thriving</p>
                </div>

                <div className="bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 block">Full Name</label>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 block">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Check className="w-4 h-4 text-primary" />
                            <span>I agree to the Terms of Service and Privacy Policy</span>
                        </div>

                        <button type="submit" className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(238,180,180,0.3)]">
                            Create Account
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-surface text-muted">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z" />
                            </svg>
                            Microsoft
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-muted">
                        Already have an account? <a href="#" className="text-primary hover:text-primary/80 transition-colors">Log in</a>
                    </p>

                    <p className="mt-6 text-center text-xs text-muted/60 max-w-xs mx-auto leading-relaxed">
                        Your privacy is our priority. We use bank-level encryption to protect your data.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
