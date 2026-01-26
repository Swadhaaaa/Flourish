import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://tea-hack.onrender.com';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const checkBoundary = async () => {
    try {
        const response = await api.get('/api/ai/boundary-check');
        return response.data;
    } catch (error) {
        console.error('Boundary Check Error:', error);
        return { status: 'green', title: 'All Clear', message: 'System active' };
    }
};

export const getWorkloadInsight = async () => {
    try {
        const response = await api.get('/api/ai/workload-insight');
        return response.data;
    } catch (error) {
        console.error('Workload Insight Error:', error);
        return { title: 'Insight Unavailable', recommendation: 'Could not fetch data' };
    }
};


export const analyzeReflection = async (text: string) => {
    try {
        const response = await api.post('/api/ai/analyze-reflection', { text });
        return response.data;
    } catch (error) {
        console.error('Reflection Analysis Error:', error);
        throw error;
    }
};

export const predictBurnout = async (metrics: any) => {
    try {
        const response = await api.post('/api/ai/burnout-prediction', metrics);
        return response.data;
    } catch (error) {
        console.error('Burnout Prediction Error:', error);
        throw error;
    }
};

export const generateSchedule = async (text: string) => {
    try {
        const response = await api.post('/api/ai/auto-schedule', { text });
        return response.data;
    } catch (error) {
        console.error('Schedule Generation Error:', error);
        throw error;
    }
};

export const analyzeEmail = async (content: string, sender: string) => {
    try {
        const response = await api.post('/api/ai/tone-shield', { content, sender });
        return response.data;
    } catch (error) {
        console.error('Email Analysis Error:', error);
        throw error;
    }
};

// --- Scheduler & Chatbot ---

export const sendChatMessage = async (message: string, sessionId: number | string, userId: string = "1") => {
    try {
        const response = await api.post('/api/scheduler/chat', { message, session_id: sessionId, user_id: userId });
        return response.data;
    } catch (error) {
        console.error('Chat Error:', error);
        throw error;
    }
};

export const getSessions = async (userId: string = "1") => {
    const response = await api.get(`/api/scheduler/sessions?user_id=${userId}`);
    return response.data;
};

export const createSession = async (title: string = "New Chat", userId: string = "1") => {
    const response = await api.post('/api/scheduler/sessions', { title, user_id: userId });
    return response.data;
};

export const clearSession = async (sessionId: number) => {
    const response = await api.post('/api/scheduler/sessions/clear', { session_id: sessionId });
    return response.data;
};

export const getSessionHistory = async (sessionId: number) => {
    const response = await api.get(`/api/scheduler/sessions/${sessionId}/history`);
    return response.data;
};

export const getTasks = async (activeOnly: boolean = true, userId: string = "1") => {
    const response = await api.get(`/api/scheduler/tasks?active_only=${activeOnly}&user_id=${userId}`);
    return response.data;
};

export const addTask = async (task: any, userId: string = "1") => {
    const response = await api.post('/api/scheduler/tasks', { ...task, user_id: userId });
    return response.data;
};

export const getEmployees = async (userId: string = "1") => {
    const response = await api.get(`/api/scheduler/employees?user_id=${userId}`);
    return response.data;
};

export const addEmployee = async (employee: any, userId: string = "1") => {
    const response = await api.post('/api/scheduler/employees', { ...employee, user_id: userId });
    return response.data;
};

export const generateSchedulerSchedule = async (constraints: string = "", userId: string = "1") => {
    const response = await api.post('/api/scheduler/schedule/generate', { constraints, user_id: userId });
    return response.data;
};

export const getSchedulerSchedule = async (userId: string = "1") => {
    const response = await api.get(`/api/scheduler/schedule?user_id=${userId}`);
    return response.data;
};

export const updateTask = async (taskId: number, updates: any) => {
    const response = await api.put(`/api/scheduler/tasks/${taskId}`, updates);
    return response.data;
};

export const updateScheduleItem = async (scheduleId: number, updates: any) => {
    const response = await api.put(`/api/scheduler/schedule/${scheduleId}`, updates);
    return response.data;
};

export default api;
