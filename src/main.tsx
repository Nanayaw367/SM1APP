import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for complete offline Android functionality
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[EduTab PWA] New version available.');
  },
  onOfflineReady() {
    console.log('[EduTab PWA] App is ready to work 100% offline with local IndexedDB!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
