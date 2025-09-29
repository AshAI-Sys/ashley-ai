"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
function HomePage() {
    return (<div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif'
        }}>
      <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '400px'
        }}>
        <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
        }}>
          ASH AI Admin
        </h1>
        
        <p style={{
            color: '#6b7280',
            marginBottom: '32px'
        }}>
          Manufacturing ERP System
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <a href="/login" style={{
            display: 'inline-block',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            marginBottom: '12px'
        }}>
            Login to Dashboard
          </a>
        </div>
        
        <div>
          <a href="/test" style={{
            display: 'inline-block',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500'
        }}>
            Test System
          </a>
        </div>
      </div>
    </div>);
}
