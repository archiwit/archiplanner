import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminButton } from '../ui/AdminFormFields';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                borderRadius: '24px',
                border: '1px solid var(--color-border)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    marginBottom: '10px'
                }}>
                    <ShieldAlert size={44} />
                </div>

                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', color: 'var(--color-text)' }}>
                        Acceso Restringido
                    </h2>
                    <p style={{ color: 'var(--color-text-dim)', lineHeight: '1.6', fontSize: '15px' }}>
                        Tu cuenta no tiene los permisos necesarios para ver este módulo. 
                        Por favor, utiliza el menú lateral para navegar por las áreas permitidas.
                    </p>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <AdminButton 
                        onClick={() => navigate('/admin')} 
                        icon={ArrowLeft}
                        variant="secondary"
                        size="md"
                    >
                        Volver al Dashboard
                    </AdminButton>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
