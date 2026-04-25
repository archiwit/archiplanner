import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InstagramFeed from '../ui/InstagramFeed';
import { Mail, Phone, MapPin, Camera, Share2, Globe } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const Footer = () => {
    const { companyConfig } = useAuth();

    // Default configuration for the footer with safety check
    let footerConfig = null;
    try {
        const raw = companyConfig?.footer_config ? JSON.parse(companyConfig.footer_config) : null;
        footerConfig = raw || {
            columns: [
                { id: 'c1', type: 'brand', title: 'Sobre Nosotros', hook: 'Curadores de momentos inolvidables. Diseño y planificación integral de eventos de lujo.' },
                { id: 'c2', type: 'links', title: 'Explora', items: [
                    { label: 'Servicios', path: '/servicios' },
                    { label: 'Galería', path: '/galeria' },
                    { label: 'Nosotros', path: '/nosotros' },
                    { label: 'Contacto', path: '/contacto' }
                ]},
                { id: 'c3', type: 'contact', title: 'Información', showIcons: true },
                { id: 'c4', type: 'social', title: 'Siguenos', showInstagram: true }
            ],
            bottom: {
                copyright: 'Todos los derechos reservados. Diseñado con Distinción.',
                devName: 'ArchiWit',
                devUrl: 'https://ArchiWit.com',
                policies: [
                    { label: 'Privacidad', path: '/privacidad' },
                    { label: 'Protección', path: '/proteccion' }
                ]
            }
        };
    } catch (e) {
        footerConfig = { columns: [], bottom: { copyright: '', devName: 'ArchiWit', devUrl: '#', policies: [] } };
    }

    const renderColumn = (col) => {
        if (!col) return null;
        switch (col.type) {
            case 'brand':
                return (
                    <div className="footer-brand" key={col.id}>
                        <Link to="/" className="logo">
                            {companyConfig?.icon_footer_svg ? (
                                <div className="footer-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.icon_footer_svg }} style={{ width: 'auto', maxHeight: '50px', marginBottom: '15px' }} />
                            ) : companyConfig?.logo_horizontal_path ? (
                                <img 
                                    src={getImageUrl(companyConfig.logo_horizontal_path)} 
                                    alt={companyConfig.nombre_empresa} 
                                    style={{ height: '40px', width: 'auto' }} 
                                />
                            ) : (
                                <span style={{ fontWeight: '400', fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
                                    {companyConfig?.nombre_empresa?.split(' ')[0] || 'Archi'}
                                    <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>
                                        {companyConfig?.nombre_empresa?.split(' ').slice(1).join(' ') || 'Planner'}
                                    </span>
                                </span>
                            )}
                        </Link>
                        <p>{col.hook}</p>
                    </div>
                );
            case 'links':
                return (
                    <div className="footer-links" key={col.id}>
                        <h4>{col.title}</h4>
                        <ul>
                            {(col.items || []).map((item, idx) => (
                                <li key={idx}><Link to={item.path}>{item.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                );
            case 'contact':
                return (
                    <div className="footer-contact" key={col.id}>
                        <h4>{col.title}</h4>
                        <div className="contact-list">
                            {companyConfig?.email_contacto && (
                                <p><Mail size={20} /> {companyConfig.email_contacto}</p>
                            )}
                            {companyConfig?.telefono && (
                                <p><Phone size={20} /> {companyConfig.telefono}</p>
                            )}
                            {companyConfig?.city && (
                                <p><MapPin size={20} /> {companyConfig.city}</p>
                            )}
                        </div>
                    </div>
                );
            case 'social':
                return (
                    <div className="footer-redes" key={col.id}>
                        {col.showInstagram && <InstagramFeed />}
                        <div className="social-links">
                            {col.items && col.items.length > 0 ? (
                                col.items.map((sItem, sIdx) => (
                                    <a 
                                        key={sItem.id || sIdx} 
                                        href={sItem.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        title={sItem.label}
                                    >
                                        {sItem.svg ? (
                                            <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: sItem.svg }} />
                                        ) : sItem.image ? (
                                            <img 
                                                src={getImageUrl(sItem.image)} 
                                                alt={sItem.label} 
                                                style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
                                            />
                                        ) : (
                                            <Share2 size={18} />
                                        )}
                                    </a>
                                ))
                            ) : (
                                <>
                                    {companyConfig?.ig_url && companyConfig.ig_url !== '#' && (
                                        <a href={companyConfig.ig_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                                            {companyConfig.ig_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.ig_svg }} /> : <Camera size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.fb_url && companyConfig.fb_url !== '#' && (
                                        <a href={companyConfig.fb_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                                            {companyConfig.fb_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.fb_svg }} /> : <Share2 size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.tt_url && companyConfig.tt_url !== '#' && (
                                        <a href={companyConfig.tt_url} target="_blank" rel="noopener noreferrer" title="TikTok">
                                            {companyConfig.tt_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.tt_svg }} /> : <Globe size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.li_url && companyConfig.li_url !== '#' && (
                                        <a href={companyConfig.li_url} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                            {companyConfig.li_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.li_svg }} /> : <Share2 size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.x_url && companyConfig.x_url !== '#' && (
                                        <a href={companyConfig.x_url} target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                                            {companyConfig.x_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.x_svg }} /> : <Globe size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.web_url && companyConfig.web_url !== '#' && (
                                        <a href={companyConfig.web_url} target="_blank" rel="noopener noreferrer" title="WhatsApp / Web">
                                            {companyConfig.ws_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.ws_svg }} /> : <Phone size={18} />}
                                        </a>
                                    )}
                                    {companyConfig?.pi_url && companyConfig.pi_url !== '#' && (
                                        <a href={companyConfig.pi_url} target="_blank" rel="noopener noreferrer" title="Pinterest">
                                            {companyConfig.pi_svg ? <div className="social-custom-svg" dangerouslySetInnerHTML={{ __html: companyConfig.pi_svg }} /> : <Globe size={18} />}
                                        </a>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <footer className="footer section-padding bg-graphite-dark">
            <div className="container footer-grid">
                {Array.isArray(footerConfig?.columns) && footerConfig.columns.map(col => renderColumn(col))}
            </div>
            <div className="container footer-bottom">
                <div className="footer-bottom-left">
                    <p>
                        &copy; {new Date().getFullYear()} {companyConfig?.nombre_empresa || 'ArchiPlanner'}. 
                        {footerConfig?.bottom?.copyright || ''} 
                        {footerConfig?.bottom?.devName && (
                             <> Desarrollado por <a href={footerConfig.bottom.devUrl || '#'} target="_blank" rel="noopener noreferrer">{footerConfig.bottom.devName}</a></>
                        )}
                    </p>
                </div>
                <div className="footer-bottom-right">
                    {Array.isArray(footerConfig?.bottom?.policies) && footerConfig.bottom.policies.map((policy, idx) => (
                        <Link key={idx} to={policy.path}>{policy.label}</Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
