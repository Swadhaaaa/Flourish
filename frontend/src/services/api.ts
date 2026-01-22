const API_URL = 'http://localhost:8000/api/ai';

export const api = {
    // Tone Shield
    analyzeTone: async (message: string, sender: string) => {
        const res = await fetch(`${API_URL}/tone-shield`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message, sender })
        });
        return res.json();
    },

    // Auto Schedule
    autoSchedule: async (text: string) => {
        const res = await fetch(`${API_URL}/auto-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return res.json();
    },

    // Burnout
    predictBurnout: async (data: any) => {
        const res = await fetch(`${API_URL}/burnout-prediction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Boundary Check (Simulated)
    checkBoundary: async () => {
        const res = await fetch(`${API_URL}/boundary-check`);
        return res.json();
    },

    // Workload Insight (Simulated)
    getWorkloadInsight: async () => {
        const res = await fetch(`${API_URL}/workload-insight`);
        return res.json();
    }
};
