import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InstagramFeed from '../ui/InstagramFeed';

import { UPLOADS_URL } from '../../config';

const Footer = () => {
    const { companyConfig } = useAuth();
    return (
        <footer className="footer section-padding bg-graphite-dark">
            <div className="container footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="logo">
                        {companyConfig?.logo_cuadrado_path ? (
                            <img 
                                src={`${UPLOADS_URL}${companyConfig.logo_cuadrado_path}`} 
                                alt={companyConfig.nombre_empresa} 
                                style={{ height: '50px', width: 'auto' }} 
                            />
                        ) : companyConfig?.logo_horizontal_path ? (
                            <img 
                                src={`${UPLOADS_URL}${companyConfig.logo_horizontal_path}`} 
                                alt={companyConfig.nombre_empresa} 
                                style={{ height: '40px', width: 'auto' }} 
                            />
                        ) : (
                            <>Archi<span>Planner</span></>
                        )}
                    </Link>
                    <p>Curadores de momentos inolvidables. Diseño y planificación integral de eventos de lujo.</p>
                </div>
                <div className="footer-links">
                    <h4>Explora</h4>
                    <ul>
                        <li><Link to="/servicios">Servicios</Link></li>
                        <li><Link to="/galeria">Galería</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                        <li><Link to="/login" style={{ opacity: 0.4 }}>Admin Stack</Link></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h4>Información</h4>
                    <p>{companyConfig?.email_contacto || 'hola@archiplanner.com'}</p>
                    <p>{companyConfig?.telefono || '+57 300 000 0000'}</p>
                    <p>{companyConfig?.city || 'Bucaramanga, Colombia'}</p>
                    {companyConfig?.ceo && <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>CEO: {companyConfig.ceo}</p>}
                </div>
                <div className="footer-redes">
                    <InstagramFeed />
                    <div className="social-links">
                        <a href={companyConfig?.ig_url || "#"} target="_blank" rel="noopener noreferrer" title="Instagram">IG</a>
                        <a href={companyConfig?.fb_url || "#"} target="_blank" rel="noopener noreferrer" title="Facebook">FB</a>
                        <a href={companyConfig?.tt_url || "#"} target="_blank" rel="noopener noreferrer" title="TikTok">TT</a>
                        <a href={companyConfig?.li_url || "#"} target="_blank" rel="noopener noreferrer" title="LinkedIn">LI</a>
                        <a href={companyConfig?.x_url || "#"} target="_blank" rel="noopener noreferrer" title="Red-X">X</a>
                        {companyConfig?.web_url && (
                            <a href={companyConfig.web_url} target="_blank" rel="noopener noreferrer" title="Sitio Web">WEB</a>
                        )}
                    </div>
                </div>
            </div>
            <div className="container footer-bottom">
                <p>&copy; {new Date().getFullYear()} ArchiPlanner. Todos los derechos reservados. Diseñado con Distinción.</p>
            </div>
        </footer>
    );
};


export default Footer;
