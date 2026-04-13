import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/ui/DynamicForm/DynamicForm';

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (formData) => {
        setError('');
        setLoading(true);

        const res = await login(formData.nick, formData.clave);
        if (res.success) {
            navigate('/admin');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-page section-padding">
            <div className="container" style={{ maxWidth: '450px', margin: '80px auto' }}>
                <div className="admin-card">
                    <div className="text-center mb-5">
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px' }}>Acceso <span>Admin</span></h2>
                        <p className="text-dim">Gestiona la excelencia de ArchiPlanner</p>
                    </div>

                    <DynamicForm
                        fields={[
                            { name: 'nick', label: 'Usuario', type: 'text', placeholder: ' ', required: true },
                            { name: 'clave', label: 'Contraseña', type: 'password', placeholder: ' ', required: true }
                        ]}
                        onSubmit={handleLoginSubmit}
                        submitText="Iniciar Sesión"
                        isLoading={loading}
                        error={error}
                    />
                    
                    <div className="text-center mt-4">
                        <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                            Usa las credenciales por defecto para la primera sesión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
