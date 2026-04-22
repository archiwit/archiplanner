import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    AlertCircle, Mail, Lock, User as UserIcon, 
    ChevronLeft, Smartphone, Calendar, 
    Search, CheckCircle2, RefreshCw
} from 'lucide-react';
import DynamicForm from '../components/ui/DynamicForm/DynamicForm';
import Swal from 'sweetalert2';
import './style/LoginV4.css';

// SVG Icons for Socials
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.48,16.68 6.48,12C6.48,7.31 9.03,4.72 12.19,4.72C13.9,4.72 15.82,5.42 17.13,6.69L19.22,4.6C17.52,3.05 14.91,2 12.19,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12.19,22C17.41,22 21.58,18.17 21.58,12C21.58,11.67 21.5,11.34 21.35,11.1V11.1Z" />
    </svg>
);

const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17.06,14.41L17.12,14.51C17.75,15.65 18.1,16.89 18.1,18.16C18.1,21.55 15.63,24 12.1,24C10.7,24 9.17,23.46 8,22.61C6.83,23.46 5.3,24 3.9,24C0.37,24 -2.1,21.55 -2.1,18.16C-2.1,16.89 -1.75,15.65 -1.12,14.51L-1.06,14.41C0.21,12.11 2.21,10.74 3.9,10.74C5.3,10.74 6.83,11.28 8,12.13C9.17,11.28 10.7,10.74 12.1,10.74C13.79,10.74 15.79,12.11 17.06,14.41M12.1,9.74C10.15,9.74 8.52,8.4 8.52,6.75C8.52,5.1 10.15,3.76 12.1,3.76C14.05,3.76 15.68,5.1 15.68,6.75C15.68,8.4 14.05,9.74 12.1,9.74Z" />
    </svg>
);

const MicrosoftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M1 1h10v10H1zM12 1h10v10H12zM1 12h10v10H1zM12 12h10v10H12z" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { user, login, socialLogin, registerSocialUser, linkSocialAccount, register, requestPasswordReset, verifyAndResetPassword } = useAuth();
    
    const [isRegistering, setIsRegistering] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login', 'forgot', 'reset'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [resetEmail, setResetEmail] = useState('');
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code/Password

    // Auto-redirect if already logged in
    useEffect(() => {
        if (user) {
            const destination = user.rol === 'cliente' ? '/client' : '/admin';
            navigate(destination);
        }
    }, [user, navigate]);

    // Clear messages on mode switch
    useEffect(() => {
        setError('');
        setSuccessMsg('');
    }, [isRegistering, authMode]);

    const handleLoginSubmit = async (data) => {
        setError('');
        setLoading(true);
        try {
            const result = await login(data.nick, data.clave);
            console.log('[DEBUG] Login result:', result);
            
            if (result?.success) {
                const destination = result.user.rol === 'cliente' ? '/client' : '/admin';
                navigate(destination);
            } else {
                setError(result?.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            console.error('[DEBUG] Login error catch:', err);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (data) => {
        setError('');
        setLoading(true);
        
        // Auto-generate credentials if not provided
        const finalData = { ...data };
        if (!finalData.nick || !finalData.clave) {
            const firstLetter = (finalData.nombre || '').charAt(0).toUpperCase();
            const phonePart = (finalData.telefono || '').replace(/\D/g, ''); 
            const generated = `${firstLetter}${phonePart}`;
            if (!finalData.nick) finalData.nick = generated;
            if (!finalData.clave) finalData.clave = generated;
        }

        try {
            const result = await register(finalData);
            if (result.success) {
                const destination = result.user.rol === 'cliente' ? '/client' : '/admin';
                navigate(destination);
            } else {
                setError(result.message || 'Error al registrar');
            }
        } catch (err) {
            setError(err.message || 'Error inesperado al registrar');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (data) => {
        setError('');
        setLoading(true);
        try {
            const res = await requestPasswordReset(data.email);
            if (res.success) {
                setResetEmail(data.email);
                setResetStep(2);
                setSuccessMsg('Código de verificación enviado');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Error al procesar solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleResetConfirm = async (data) => {
        setError('');
        setLoading(true);
        try {
            const res = await verifyAndResetPassword(resetEmail, data.code, data.new_password);
            if (res.success) {
                setSuccessMsg('Contraseña cambiada. Ya puedes iniciar sesión.');
                setTimeout(() => setAuthMode('login'), 2000);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Error al restablecer');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        let pickedEmail = null;
        
        try {
            // 1. Selector de Cuentas PREMIUM
            const accountResult = await Swal.fire({
                title: `Acceder con ${provider}`,
                html: `
                    <p style="font-size: 13px; margin-bottom: 20px; opacity: 0.7;">Selecciona una cuenta para continuar a ArchiPlanner</p>
                    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px; margin: 0 auto;">
                        <div class="swal-acc-item" data-email="archiplannerbga@gmail.com"
                             style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #111; border: 1px solid #333; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="width: 40px; height: 40px; background: #B76E79; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">LA</div>
                            <div style="text-align: left;">
                                <div style="font-weight: 600; font-size: 14px; color: #fff;">Luis Archila</div>
                                <div style="font-size: 12px; color: #888;">archiplannerbga@gmail.com</div>
                            </div>
                        </div>
                        <div class="swal-acc-item" data-email="nuevo@example.com"
                             style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #111; border: 1px solid #333; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="width: 40px; height: 40px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 18px;">+</div>
                            <div style="text-align: left;">
                                <div style="font-weight: 600; font-size: 14px; color: #fff;">Usar otra cuenta</div>
                                <div style="font-size: 12px; color: #888;">Simular nuevo registro</div>
                            </div>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                background: '#1a1a1a',
                color: '#fff',
                didOpen: () => {
                    const items = Swal.getHtmlContainer().querySelectorAll('.swal-acc-item');
                    items.forEach(item => {
                        item.addEventListener('click', () => {
                            pickedEmail = item.getAttribute('data-email');
                            Swal.clickConfirm();
                        });
                    });
                },
                preConfirm: () => pickedEmail
            });

            if (!accountResult.isConfirmed || !accountResult.value) return;

            const selectedEmail = accountResult.value;
            setLoading(true);
            const res = await socialLogin(provider, selectedEmail, '');

            if (res.success) {
                navigate('/admin');
                return;
            }

            if (res.needsCompletion) {
                setLoading(false);
                // 2. Formulario de Registro Rápido
                const registrationResult = await Swal.fire({
                    title: '¡Casi listo!',
                    html: `
                        <p style="font-size: 13px; margin-bottom: 25px; opacity: 0.7;">Completa estos datos para tu perfil exclusivo.</p>
                        <div style="display: flex; flex-direction: column; gap: 12px; padding: 0 5px;">
                            <input id="swal-input1" type="text" placeholder="Nombre" value="${res.suggestedData?.name || ''}" 
                                   style="width: 100%; padding: 14px; background: #000; color: #fff; border: 1px solid #333; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
                            <input id="swal-input2" type="text" placeholder="Apellido" 
                                   style="width: 100%; padding: 14px; background: #000; color: #fff; border: 1px solid #333; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
                            <input id="swal-input3" type="text" placeholder="WhatsApp / Teléfono" 
                                   style="width: 100%; padding: 14px; background: #000; color: #fff; border: 1px solid #333; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
                        </div>
                    `,
                    confirmButtonText: 'Finalizar Registro',
                    confirmButtonColor: '#B76E79',
                    background: '#1a1a1a',
                    color: '#fff',
                    preConfirm: () => {
                        const n = document.getElementById('swal-input1').value;
                        const a = document.getElementById('swal-input2').value;
                        const t = document.getElementById('swal-input3').value;
                        if (!n || !t) {
                            Swal.showValidationMessage('Nombre y Teléfono son obligatorios');
                            return false;
                        }
                        return [n, a, t];
                    }
                });

                if (registrationResult.isConfirmed && registrationResult.value) {
                    const [nombre, apellido, telefono] = registrationResult.value;
                    setLoading(true);
                    const regRes = await registerSocialUser({ nombre, apellido, telefono, email: selectedEmail, provider });

                    if (regRes.success) {
                        navigate('/admin');
                    } else if (regRes.phoneExists) {
                        const linkResult = await Swal.fire({
                            title: '¿Ya nos conocemos?',
                            text: `El teléfono ${telefono} ya está en uso. ¿Vincular a ${regRes.existingUser.email}?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, vincular',
                            confirmButtonColor: '#B76E79',
                            background: '#1a1a1a',
                            color: '#fff'
                        });

                        if (linkResult.isConfirmed) {
                            await linkSocialAccount(regRes.existingUser.email);
                            navigate('/admin');
                        }
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: regRes.message, background: '#1a1a1a', color: '#fff' });
                    }
                }
            }
        } catch (err) {
            console.error('Error social login:', err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de comunicación con el servidor', background: '#1a1a1a', color: '#fff' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-v4-wrapper">
            {/* Elegant Background Video */}
            <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="video-bg"
                src="https://player.vimeo.com/external/371433846.sd.mp4?s=2317046045353521237a3794301548e65e492652&profile_id=164&oauth2_token_id=57447761"
            ></video>
            <div className="video-overlay"></div>

            <div className={`auth-container ${isRegistering ? 'right-panel-active' : ''}`}>
                
                {/* --- REGISTER PANEL --- */}
                <div className="auth-panel register-panel">
                    <h1>Crear Cuenta</h1>
                    <span className="subtitle">Únete a la experiencia ArchiPlanner</span>
                    <div className="social-container">
                        <button className="social-btn" title="Google" onClick={() => handleSocialLogin('Google')}><GoogleIcon /></button>
                        <button className="social-btn" title="Apple" onClick={() => handleSocialLogin('Apple')}><AppleIcon /></button>
                        <button className="social-btn" title="Microsoft" onClick={() => handleSocialLogin('Microsoft')}><MicrosoftIcon /></button>
                    </div>
                    <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '12px' }}>O usa tu correo para registrarte</p>
                    
                    <DynamicForm
                        fields={[
                            { name: 'nombre', label: 'Nombre', type: 'text', placeholder: ' ', required: true },
                            { name: 'apellido', label: 'Apellido', type: 'text', placeholder: ' ', required: true },
                            { name: 'documento', label: 'Cédula / NIT', type: 'text', placeholder: ' ', required: false },
                            { name: 'ciudad_cedula', label: 'Ciudad de Expedición', type: 'text', placeholder: ' ', required: false },
                            { name: 'direccion', label: 'Dirección de Residencia', type: 'text', placeholder: ' ', fullWidth: true, required: false },
                            { name: 'email', label: 'Correo', type: 'email', placeholder: ' ', required: true },
                            { name: 'telefono', label: 'Teléfono / WhatsApp', type: 'text', placeholder: ' ', icon: 'Smartphone', required: true },
                            { name: 'nacimiento', label: 'Fecha de Nacimiento', type: 'date', placeholder: ' ' },
                            { name: 'nick', label: 'Usuario (Opcional)', type: 'text', placeholder: ' ', required: false },
                            { name: 'clave', label: 'Contraseña (Opcional)', type: 'password', placeholder: '••••', required: false, fullWidth: true },
                            { name: 'necesidad', label: '¿Qué necesitas para tu evento?', type: 'textarea', placeholder: ' ', fullWidth: true },
                        ]}
                        onSubmit={handleRegisterSubmit}
                        submitText="Registrarse"
                        isLoading={loading}
                        error={error}
                    />

                    <div className="mobile-toggle">
                        ¿Ya tienes cuenta? <span onClick={() => setIsRegistering(false)}>Inicia Sesión</span>
                    </div>
                </div>

                {/* --- LOGIN / RESET PANEL --- */}
                <div className="auth-panel login-panel">
                    {authMode === 'login' ? (
                        <>
                            <h1>Iniciar Sesión</h1>
                            <span className="subtitle">Bienvenido de nuevo a la exclusividad</span>
                            <div className="social-container">
                                <button className="social-btn" title="Google" onClick={() => handleSocialLogin('Google')}><GoogleIcon /></button>
                                <button className="social-btn" title="Apple" onClick={() => handleSocialLogin('Apple')}><AppleIcon /></button>
                                <button className="social-btn" title="Microsoft" onClick={() => handleSocialLogin('Microsoft')}><MicrosoftIcon /></button>
                            </div>
                            <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '12px' }}>Ingresa con tu usuario y contraseña</p>
                            
                            <DynamicForm
                                fields={[
                                    { name: 'nick', label: 'Usuario o Correo', type: 'text', placeholder: ' ', required: true, fullWidth: true },
                                    { name: 'clave', label: 'Contraseña', type: 'password', placeholder: '••••', required: true, fullWidth: true },
                                ]}
                                onSubmit={(data) => handleLoginSubmit(data)}
                                submitText="Ingresar"
                                isLoading={loading}
                                error={error}
                            />
                            
                            <span className="forgot-link" onClick={() => setAuthMode('forgot')}>
                                ¿Olvidaste tu contraseña?
                            </span>

                            <div className="mobile-toggle">
                                ¿No tienes cuenta? <span onClick={() => setIsRegistering(true)}>Regístrate</span>
                            </div>
                        </>
                    ) : (
                        <div className="reset-flow fade-in">
                            <button className="action-btn" onClick={() => setAuthMode('login')} style={{ marginBottom: '20px', padding: 0, opacity: 0.6 }}>
                                <ChevronLeft size={16} /> Volver
                            </button>
                            <h1>Recuperar Acceso</h1>
                            <p>Te enviaremos un código de verificación por correo.</p>
                            
                            {resetStep === 1 ? (
                                <DynamicForm
                                    fields={[
                                        { name: 'email', label: 'Tu Correo Registrado', type: 'email', placeholder: ' ', required: true, fullWidth: true },
                                    ]}
                                    onSubmit={handleForgotPassword}
                                    submitText="Enviar Código"
                                    isLoading={loading}
                                    error={error}
                                />
                            ) : (
                                <DynamicForm
                                    fields={[
                                        { name: 'code', label: 'Código de 6 dígitos', type: 'text', placeholder: '000000', required: true, fullWidth: true },
                                        { name: 'newPassword', label: 'Nueva Contraseña', type: 'password', placeholder: '••••', required: true, fullWidth: true },
                                    ]}
                                    onSubmit={handleResetConfirm}
                                    submitText="Cambiar Contraseña"
                                    isLoading={loading}
                                    error={error}
                                    successMessage={successMsg}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* --- OVERLAY SLIDER --- */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <div className="logo mb-4" style={{ fontSize: '32px' }}>Archi<span>Planner</span></div>
                            <h1>¿Eres Nuevo Aquí?</h1>
                            <p>Ingresa tus datos personales y comienza tu viaje con nosotros</p>
                            <button className="ghost-btn" onClick={() => setIsRegistering(true)}>Registrarse</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>¡Bienvenido de Nuevo!</h1>
                            <p>Para mantenerte conectado con nosotros, inicia sesión con tu cuenta personal</p>
                            <button className="ghost-btn" onClick={() => setIsRegistering(false)}>Iniciar Sesión</button>
                        </div>
                    </div>
                </div>
            </div>

            <span className="back-to-web" onClick={() => navigate('/')}>
               &larr; Volver al sitio web principal
            </span>
        </div>
    );
};

export default Login;
