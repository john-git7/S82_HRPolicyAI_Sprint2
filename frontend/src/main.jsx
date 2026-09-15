import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Safety net: catch and log any stale web-vitals / startTime errors without crashing the app.
// This guards against stale Render deploy artifacts or third-party script conflicts.
const _origOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (
    typeof message === 'string' &&
    (message.includes('startTime') || message.includes('reportAllChanges'))
  ) {
    console.warn('[HRPolicyAI] Suppressed stale web-vitals error:', message);
    return true; // prevent default error propagation
  }
  if (_origOnError) return _origOnError(message, source, lineno, colno, error);
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason);
  if (msg.includes('startTime') || msg.includes('reportAllChanges')) {
    console.warn('[HRPolicyAI] Suppressed stale web-vitals rejection:', msg);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
