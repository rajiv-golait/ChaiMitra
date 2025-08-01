import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n/i18n'; // Initialize i18next
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// Temporarily disabled to fix reload issue
// serviceWorkerRegistration.register();
// console.log('Service worker registered');
serviceWorkerRegistration.unregister();
