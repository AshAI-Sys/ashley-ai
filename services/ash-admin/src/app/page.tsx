'use client'

export default function HomePage() {
  return (
    <div style={{
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
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/ash-ai-logo.png"
            alt="Ashley AI Logo"
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              display: 'block'
            }}
          />
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Ashley AI Admin
        </h1>

        <p style={{
          color: '#6b7280',
          marginBottom: '32px'
        }}>
          Apparel Smart Hub - Artificial Intelligence
        </p>

        <a
          href="/login"
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Access Production System
        </a>
      </div>
    </div>
  )
}
