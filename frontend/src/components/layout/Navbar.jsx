import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ChevronDown, ChevronRight, Bell, Calendar } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { companyConfig, token, user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    // Current menu items (from DB or Default) with Safety check
    let navItems = [];
    try {
        const raw = companyConfig?.nav_config ? JSON.parse(companyConfig.nav_config) : null;
        navItems = Array.isArray(raw) ? raw : [
            { id: '1', label: 'Inicio', path: '/' },
            { id: '2', label: 'Servicios', path: '/servicios' },
            { id: '3', label: 'Galería', path: '/galeria' },
            { id: 'calendario', label: 'Calendario', path: 'https://calendar.google.com/calendar/u/0?cid=YjlhYTBhYzQ1ODU2OGYyNGRmMmM2YTk5MWVkMTk5MGI2OTdiMzMxZmM3ZTcxOWNhNDg2ZDUxYzU5NmM4MDJhOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t', type: 'external' },
            { id: '4', label: 'Nosotros', path: '/nosotros' },
            { id: '5', label: 'Contacto', path: '/contacto', type: 'cta' }
        ];
    } catch (e) {
        navItems = [];
    }

    /**
     * Recursive Function to render Multi-Level Dropdowns
     */
    const renderNavItems = (items, level = 1) => {
        if (!Array.isArray(items)) return null;
        return items.map(item => {
            const hasChildren = item.children && item.children.length > 0;
            const isCTA = item.type === 'cta';

            return (
                <li key={item.id} className={level === 1 ? 'nav-item' : 'dropdown-item'}>
                    <NavLink 
                        to={item.path || '#'} 
                        target={item.type === 'external' ? '_blank' : undefined}
                        className={({ isActive }) => `
                            ${level === 1 ? 'nav-item-link' : 'dropdown-link'} 
                            ${isCTA ? 'cta-nav' : ''} 
                            ${isActive && item.path !== '#' && item.type !== 'external' ? 'active' : ''}
                        `}
                        onClick={() => !hasChildren && setMobileMenuOpen(false)}
                        end={item.path === '/'}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {item.svg ? (
                                <span className="nav-custom-svg" dangerouslySetInnerHTML={{ __html: item.svg }} style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center' }} />
                            ) : item.image ? (
                                <img 
                                    src={getImageUrl(item.image)} 
                                    alt="" 
                                    style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
                                />
                            ) : null}
                            {item.label}
                            {item.type === 'external' && <Calendar size={12} style={{ opacity: 0.7 }} />}
                            {hasChildren && (level === 1 ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                        </span>
                    </NavLink>
                    
                    {hasChildren && (
                        <ul className={level === 1 ? 'dropdown-menu' : 'dropdown-menu sub-dropdown-menu'}>
                            {renderNavItems(item.children, level + 1)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-wrapper">
                <Link to="/" className="logo">
                    {companyConfig?.logo_horizontal_path ? (
                        <img 
                            src={getImageUrl(companyConfig.logo_horizontal_path)} 
                            alt={companyConfig.nombre_empresa} 
                            style={{ height: '45px', width: 'auto', objectFit: 'contain' }} 
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {companyConfig?.logo_cuadrado_path && (
                                <img 
                                    src={getImageUrl(companyConfig.logo_cuadrado_path)} 
                                    alt="" 
                                    style={{ height: '35px', width: '35px', borderRadius: '4px', objectFit: 'cover' }} 
                                />
                            )}
                            <span style={{ fontWeight: '400', fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
                                {companyConfig?.nombre_empresa?.split(' ')[0] || 'Archi'}
                                <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>
                                    {companyConfig?.nombre_empresa?.split(' ').slice(1).join(' ') || 'Planner'}
                                </span>
                            </span>
                        </div>
                    )}
                </Link>
                
                <button 
                    className="nav-toggle" 
                    onClick={toggleMenu}
                    aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <nav className={`nav ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                    <ul>
                        {renderNavItems(navItems)}
                        {token ? (
                            <>
                                <li className="nav-user-item" style={{ marginRight: '10px' }}>
                                    <NotificationBell />
                                </li>
                                <li className="nav-user-item">
                                    <NavLink to="/admin" className="nav-item-link" title="Panel de Administración">
                                        {user?.foto ? (
                                            <img 
                                                src={getImageUrl(user.foto)} 
                                                alt={user.nombre} 
                                                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                                            />
                                        ) : (
                                            <User size={18} />
                                        )}
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <li className="nav-user-item">
                                <NavLink to="/login" className="nav-item-link" title="Iniciar Sesión">
                                    <User size={18} />
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
