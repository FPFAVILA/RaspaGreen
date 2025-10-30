import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { trackPageView } from './utils/tracking';

const AppWithTracking = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithTracking />
    </BrowserRouter>
  </StrictMode>
);
