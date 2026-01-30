// Utility to capture and manage PWA install prompt events

let deferredPrompt: any;

// Initialize the listener
export const initPwaPrompt = () => {
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA prompt captured');
        });
    }
};

export const getDeferredPrompt = () => deferredPrompt;

export const clearDeferredPrompt = () => {
    deferredPrompt = null;
};
