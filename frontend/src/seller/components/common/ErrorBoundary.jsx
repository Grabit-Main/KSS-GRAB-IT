import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Grabit UI Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/seller/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.toString() || 'Unknown rendering error';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F5F7',
            padding: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #D2D2D7',
              padding: '32px 28px',
              maxWidth: '540px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#FFF0EE',
                color: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1D1D1F', marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '13px', color: '#86868B', marginBottom: 16, lineHeight: 1.4 }}>
              An unexpected error occurred while rendering this page.
            </p>

            {/* Error Diagnostics Box */}
            <div
              style={{
                textAlign: 'left',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FFE0DF',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: 20,
                maxHeight: '180px',
                overflowY: 'auto',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#D02B20',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              <strong>Error:</strong> {errorMessage}
              {componentStack && (
                <div style={{ marginTop: 8, color: '#666', fontSize: '11px' }}>
                  {componentStack.slice(0, 300)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#FFFFFF',
                  color: '#1D1D1F',
                  border: '1px solid #D2D2D7',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#0071E3',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>Reset & Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
