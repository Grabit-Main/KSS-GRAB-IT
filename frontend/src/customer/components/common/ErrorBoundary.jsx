import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Grabit ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '24px', background: '#F5F5F7', textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            background: '#FFFFFF', padding: '36px 32px', borderRadius: '24px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.08)', maxWidth: '440px', width: '100%',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px', lineHeight: 1.5 }}>
              We ran into a temporary rendering issue. Tap below to reload the app seamlessly.
            </p>
            {this.state.error && (
              <div style={{
                background: '#FFF1F2', border: '1px solid #FECDD3', color: '#E11D48',
                fontSize: '11px', fontFamily: 'monospace', padding: '8px 12px',
                borderRadius: '10px', marginBottom: '20px', wordBreak: 'break-word', textAlign: 'left'
              }}>
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#0071E3', color: '#FFFFFF', border: 'none',
                padding: '12px 24px', borderRadius: '14px', fontSize: '14px',
                fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,113,227,0.3)'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
