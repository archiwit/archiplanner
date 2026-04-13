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
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#fff', 
                    background: '#121212', 
                    height: '100vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                    <h2 style={{ color: '#ff8484' }}>Algo salió mal</h2>
                    <p style={{ opacity: 0.7, maxWidth: '500px', margin: '15px auto' }}>
                        La aplicación encontró un error inesperado al renderizar esta página. 
                        Esto suele ocurrir por datos incompletos o fallos de conexión.
                    </p>
                    <div style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        textAlign: 'left',
                        marginBottom: '30px',
                        maxWidth: '80%',
                        overflow: 'auto',
                        border: '1px solid rgba(255,132,132,0.2)'
                    }}>
                        <code style={{ color: '#ff8484' }}>{this.state.error?.toString()}</code>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#ff8484',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#121212',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Recargar Página
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin'}
                        style={{
                            marginTop: '15px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Volver al Dashboard
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
