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

export default api;
