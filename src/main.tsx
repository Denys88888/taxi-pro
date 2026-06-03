import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </HashRouter>
);
