import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#ef4444', margin: '0 0 12px' }}>⚠️ Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
              An unexpected error occurred in this view. Don't worry, your data is safe.
            </p>
            {this.state.error && (
              <pre style={{ textAlign: 'left', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#dc2626', overflowX: 'auto', marginBottom: '16px' }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;