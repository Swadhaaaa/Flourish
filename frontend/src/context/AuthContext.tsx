import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    userProfile: any;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    googleSignIn: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch user profile from Firestore
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data());
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signUp = async (email: string, pass: string, name: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        // Create user document in Firestore
        const profileData = {
            uid: result.user.uid,
            name,
            email,
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", result.user.uid), profileData);
        setUserProfile(profileData);
    };

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const googleSignIn = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const newProfile = {
                uid: result.user.uid,
                name: result.user.displayName || '',
                email: result.user.email,
                createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
        } else {
            setUserProfile(userDoc.data());
        }
    };

    const updateUserProfile = async (data: any) => {
        if (!user) return;
        const updatedProfile = { ...userProfile, ...data };
        await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
        setUserProfile(updatedProfile);
    };

    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, googleSignIn, logout, updateUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
