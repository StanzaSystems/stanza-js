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

const rootElementId = 'root';
const rootElement = document.getElementById(rootElementId);

if (rootElement == null) {
  throw new Error(
    `Could not find element with id ${rootElementId} on the page`
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <StanzaProvider instance={stanzaInstance}>
      <App />
    </StanzaProvider>
  </React.StrictMode>
);
