import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/config');
            setConfig(res.data);
            applyBranding(res.data);
        } catch (err) {
            console.error('Error fetching branding config:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyBranding = (data) => {
        if (!data) return;
        
        const root = document.documentElement;
        if (data.color_primario) root.style.setProperty('--color-primary', data.color_primario);
        if (data.color_secundario) root.style.setProperty('--color-secondary', data.color_secundario);
        if (data.color_terciario) root.style.setProperty('--color-tertiary', data.color_terciario);
        if (data.color_fondo) root.style.setProperty('--color-bg', data.color_fondo);
        
        // Generate dim version for primary (translucency)
        if (data.color_primario) {
            const hex = data.color_primario.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            root.style.setProperty('--color-primary-dim', `rgba(${r}, ${g}, ${b}, 0.15)`);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <BrandingContext.Provider value={{ config, loading, refreshBranding: fetchConfig }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => useContext(BrandingContext);
