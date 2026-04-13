import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('archiplanner_user');
        return u ? JSON.parse(u) : null;
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
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('archiplanner_user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Error de conexión' };
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
