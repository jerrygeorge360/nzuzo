import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmiConfig';
import App from './App';
import './styles.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './views/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/org/:contractAddress"
                element={
                  <ErrorBoundary fallback={<div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Something went wrong with this organization dashboard. <br /><button className="send-action-btn" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>Reload Page</button></div>}>
                    <App />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>
);