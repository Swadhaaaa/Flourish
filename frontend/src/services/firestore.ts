import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Task {
    id: string;
    title: string;
    desc: string;
    time: string;
    status: 'todo' | 'progress' | 'done';
    color: string;
    priority: string;
    progress: number;
    createdAt?: any;
}

export const getUserTasks = async (userId: string): Promise<Task[]> => {
    try {
        const tasksRef = collection(db, 'users', userId, 'tasks');
        const q = query(tasksRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Task));
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

export const addTask = async (userId: string, task: Omit<Task, 'id'>) => {
    try {
        const tasksRef = collection(db, 'users', userId, 'tasks');
        const docRef = await addDoc(tasksRef, {
            ...task,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...task };
    } catch (error) {
        console.error("Error adding task:", error);
        throw error;
    }
};

export const updateTask = async (userId: string, taskId: string, data: Partial<Task>) => {
    try {
        const taskRef = doc(db, 'users', userId, 'tasks', taskId);
        await updateDoc(taskRef, data);
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

export const deleteTask = async (userId: string, taskId: string) => {
    try {
        const taskRef = doc(db, 'users', userId, 'tasks', taskId);
        await deleteDoc(taskRef);
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};

export interface PeriodLog {
    id: string;
    date: any; // Firestore Timestamp
    symptoms: string[];
    mood: string;
    flow: 'light' | 'medium' | 'heavy' | 'none';
    energy: number;
    notes?: string;
    createdAt?: any;
}

export const addPeriodLog = async (userId: string, logData: Omit<PeriodLog, 'id'>) => {
    try {
        const logsRef = collection(db, 'users', userId, 'period_logs');
        const docRef = await addDoc(logsRef, {
            ...logData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...logData };
    } catch (error) {
        console.error("Error adding period log:", error);
        throw error;
    }
};

export const getPeriodLogs = async (userId: string): Promise<PeriodLog[]> => {
    try {
        const logsRef = collection(db, 'users', userId, 'period_logs');
        // Order by date descending
        const q = query(logsRef); // In real app, add orderBy('date', 'desc')
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PeriodLog));
    } catch (error) {
        console.error("Error fetching period logs:", error);
        return [];
    }
};
