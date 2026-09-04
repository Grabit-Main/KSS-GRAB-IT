import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// Global listener to silently swallow injected third-party analytics/extension error
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event?.error?.message?.includes("reading 'startTime'") &&
      event?.error?.message?.includes('Cannot read properties of undefined')
    ) {
      event.preventDefault();
    }
  });

  // Prevent third-party browser extension script crashes from bubbling
  window.addEventListener('error', (event) => {
    if (
      event.filename && (
        event.filename.includes('extensions::') ||
        event.filename.includes('chrome-extension://') ||
        event.filename.includes('edge://') ||
        event.filename.includes('VM')
      )
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
