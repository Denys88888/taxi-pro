import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </HashRouter>
);
