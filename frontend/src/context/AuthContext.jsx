import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem('archiplanner_user');
            return u ? JSON.parse(u) : null;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            localStorage.removeItem('archiplanner_user');
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [companyConfig, setCompanyConfig] = useState({
        nombre_empresa: 'Archi Planner',
        email_contacto: '',
        telefono: '',
        city: '',
        ig_url: '',
        fb_url: '',
        pn_url: ''
    });

    useEffect(() => {
        // Load Company Info (Dynamic)
        const fetchConfig = async () => {
            try {
                const res = await api.get('/config');
                setCompanyConfig(res.data);
            } catch (err) {
                console.error('Error fetching company config:', err);
            }
        };

        // Validate session if token exists
        if (token) {
            // In Phase 2 this will call /api/auth/me
            setLoading(false);
        } else {
            setLoading(false);
        }

        fetchConfig();
    }, [token]);

    const login = async (nick, clave) => {
        try {
            const res = await api.post('/auth/login', { nick, clave });
            if (res.data.success) {
                const sessionData = { token: res.data.token, user: res.data.user };
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
            return { success: false, message: res.data.message || 'Credenciales inválidas' };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Error de conexión' };
        }
    };

    const socialLogin = async (provider, email, name) => {
        try {
            const res = await api.post('/auth/social-login', { provider, email, name });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
            return { 
                success: false, 
                needsCompletion: res.data.needsCompletion,
                suggestedData: res.data.suggestedData 
            };
        } catch (err) {
            return { success: false, message: 'Error en autenticación social' };
        }
    };

    const registerSocialUser = async (userData) => {
        try {
            const res = await api.post('/auth/social-register-complete', userData);
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
            return res.data; // Puede traer phoneExists: true
        } catch (err) {
            return { success: false, message: 'Error al completar registro' };
        }
    };

    const linkSocialAccount = async (email) => {
        try {
            const res = await api.post('/auth/link-social-account', { email });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
        } catch (err) { return { success: false }; }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register-public', userData); // Public endpoint
            if (res.data.success) {
                // Auto login after register
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Error al registrar' };
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            return res.data;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Error al solicitar código' };
        }
    };

    const verifyAndResetPassword = async (email, code, newPassword) => {
        try {
            const res = await api.post('/auth/reset-password', { email, code, newPassword });
            return res.data;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Error al restablecer contraseña' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('archiplanner_user');
        setToken(null);
        setUser(null);
    };

    const updateAuthUser = (newData) => {
        if (!user) return;
        const updated = { ...user, ...newData };
        setUser(updated);
        localStorage.setItem('archiplanner_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            socialLogin,
            registerSocialUser,
            linkSocialAccount,
            register,
            requestPasswordReset,
            verifyAndResetPassword,
            logout, 
            loading, 
            companyConfig,
            setCompanyConfig,
            updateAuthUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
