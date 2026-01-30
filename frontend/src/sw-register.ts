// Service Worker Registration
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const register = () => {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then((registration) => {
                    console.log('SW registered:', registration);
                })
                .catch((error) => {
                    console.log('SW registration failed:', error);
                });
        };

        if (document.readyState === 'complete') {
            register();
        } else {
            window.addEventListener('load', register);
        }
    }
}
