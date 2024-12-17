import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './util/auth-config';
import './index.css';
import App from './App';
import { MsalProvider } from '@azure/msal-react';

// MSAL should be instantiated outside the component tree to prevent it from being re-instantiated on re-renders
export const msalInstance = new PublicClientApplication(msalConfig);

// Default to using the 1st account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* instance={msalInstance} */}
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>

  </React.StrictMode>
);
