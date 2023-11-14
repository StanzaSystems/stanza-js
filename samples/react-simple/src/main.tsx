import React from 'react';
import ReactDOM from 'react-dom/client';
import { createStanzaInstance, StanzaProvider } from '@getstanza/react';
import { worker } from '@getstanza/mocks-browser';
import App from './App';
import './index.css';
import { config } from './stanzaConfig';

let loadPromise: Promise<any>;
if (import.meta.env.MODE === 'development') {
  loadPromise = worker.start();
} else {
  loadPromise = Promise.resolve();
}

await loadPromise;

const stanzaInstance = createStanzaInstance(config);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StanzaProvider instance={stanzaInstance}>
      <App />
    </StanzaProvider>
  </React.StrictMode>,
);
