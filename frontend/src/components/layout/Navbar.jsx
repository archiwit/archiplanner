import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { UPLOADS_URL } from '../../config';

const Navbar = () => {
    const { companyConfig, token, user, logout } = useAuth();
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

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-wrapper">
                <Link to="/" className="logo">
                    {companyConfig?.logo_horizontal_path ? (
                        <img 
                            src={`${UPLOADS_URL}${companyConfig.logo_horizontal_path}`} 
                            alt={companyConfig.nombre_empresa} 
                            style={{ height: '45px', width: 'auto', objectFit: 'contain' }} 
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {companyConfig?.logo_cuadrado_path && (
                                <img 
                                    src={`${UPLOADS_URL}${companyConfig.logo_cuadrado_path}`} 
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
                        <li>
                            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} end>
                                Inicio
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/servicios" onClick={() => setMobileMenuOpen(false)}>
                                Servicios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/galeria" onClick={() => setMobileMenuOpen(false)}>
                                Galería
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/nosotros" onClick={() => setMobileMenuOpen(false)}>
                                Nosotros
                            </NavLink>
                        </li>
                        <li>
                            <Link to="/contacto" className="cta-nav" onClick={() => setMobileMenuOpen(false)}>
                                Cotizar ahora
                            </Link>
                        </li>
                        {token && (
                            <li className="nav-user-item">
                                <NavLink to="/admin" className="admin-link-nav" title="Panel de Administración">
                                    {user?.foto ? (
                                        <img 
                                            src={`${UPLOADS_URL}${user.foto}`} 
                                            alt={user.nombre} 
                                            className="nav-profile-photo"
                                        />
                                    ) : (
                                        <User size={18} />
                                    )}
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
