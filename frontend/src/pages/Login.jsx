import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ nick: '', clave: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.nick, formData.clave);
            if (result.success) {
                navigate('/admin');
            } else {
                setError(result.message || 'Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page section-padding">
            <div className="container" style={{ maxWidth: '450px', margin: '140px auto' }}>
                <div className="contact-form-wrapper" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <div className="text-center mb-5">
                        <div className="logo mb-2" style={{ fontSize: '32px' }}>Archi<span>Planner</span></div>
                        <p style={{ letterSpacing: '2px', fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>Sistema Administrativo</p>
                    </div>

                    <h2 className="text-center mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>Acceso Admin</h2>
                    
                    {error && (
                        <div className="error-msg" style={{ 
                            background: 'rgba(255, 132, 132, 0.1)', 
                            color: 'var(--color-primary)', 
                            padding: '12px', 
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Usuario</label>
                            <input 
                                type="text" 
                                name="nick"
                                placeholder="Tu nick (ej: ArchiPlanner)" 
                                value={formData.nick}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input 
                                type="password" 
                                name="clave"
                                placeholder="••••" 
                                value={formData.clave}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full" 
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loading ? 'Validando...' : (
                                <>
                                    <LogIn size={18} />
                                    Entrar al sistema
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-4">
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: '13px' }}
                    >
                        &larr; Volver al sitio web
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
