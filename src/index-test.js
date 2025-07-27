import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test App - No Reloading</h1>
      <p>If you see this without continuous reloading, the issue is in the main app components.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);

// No service worker registration
console.log('Test app loaded');
