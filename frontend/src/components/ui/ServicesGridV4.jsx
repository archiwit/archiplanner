import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const ServicesGridV4 = ({ 
    category = 'principales', 
    variant = 'classic', 
    services = [], 
    title = '', 
    tag = '',
    centered = false
}) => {
    // Filter services by category if provided, otherwise show all
    const filtered = category === 'todos' 
        ? services 
        : services.filter(s => s.seccion?.toLowerCase() === category.toLowerCase());

    const fallbacks = [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070'
    ];

    if (filtered.length === 0) {
        return (
            <div className="v4-services-empty-state" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,132,132,0.05)', borderRadius: '20px', border: '1px dashed rgba(255,132,132,0.2)' }}>
                <p style={{ color: '#ff8484', fontSize: '14px' }}>No hay servicios disponibles en la categoría <strong>"{category}"</strong>.</p>
                <p style={{ fontSize: '12px', opacity: 0.6 }}>Asegúrate de configurar la sección correctamente en las propiedades.</p>
            </div>
        );
    }

    if (variant === 'delicate') {
        return (
            <div className={`v4-services-delicate-container ${centered ? 'text-center' : ''}`}>
                {(title || tag) && (
                    <div className="section-header" style={{ marginBottom: '50px', textAlign: centered ? 'center' : 'left' }}>
                        {tag && <span className="tag" style={{ color: 'var(--color-primary)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '11px', fontWeight: '800' }}>{tag}</span>}
                        {title && <h2 style={{ fontSize: '42px', marginTop: '10px' }}>{title}</h2>}
                    </div>
                )}
                <div className="grid-bottom-3-delicate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    {filtered.map((s, idx) => (
                        <div key={s.id || idx} className="service-card-delicate" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="card-img" style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', marginBottom: '25px', border: '1px solid rgba(212,175,55,0.2)', padding: '10px' }}>
                                <img 
                                    src={getImageUrl(s.imagen)} 
                                    alt={s.titulo} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    onError={(e) => e.target.src = fallbacks[idx % 3]} 
                                />
                            </div>
                            <h3 style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", marginBottom: '15px' }}>{s.titulo}</h3>
                            <div 
                                dangerouslySetInnerHTML={{ __html: s.descripcion }} 
                                className="social-desc-html" 
                                style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8, maxWidth: '320px', marginBottom: '20px' }} 
                            />
                            <a href='/contacto' className="btn-text" style={{ fontSize: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', textDecoration: 'none' }}>Consultar Detalles →</a>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Classic Layout
    return (
        <div className={`v4-services-classic-container ${centered ? 'text-center' : ''}`}>
            {(title || tag) && (
                <div className="section-header" style={{ marginBottom: '50px', textAlign: centered ? 'center' : 'left' }}>
                    {tag && <span className="tag" style={{ color: 'var(--color-primary)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '11px', fontWeight: '800' }}>{tag}</span>}
                    {title && <h2 style={{ fontSize: '48px', marginTop: '10px' }}>{title}</h2>}
                </div>
            )}
            <div className="grid-top-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                {filtered.map((s, idx) => (
                    <div key={s.id || idx} className="service-card" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                        <div className="card-img" style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
                            <img 
                                src={getImageUrl(s.imagen)} 
                                alt={s.titulo} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => e.target.src = fallbacks[idx % 3]} 
                            />
                        </div>
                        <div className="card-body" style={{ padding: '40px' }}>
                            <span className="tag" style={{ fontSize: '10px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', display: 'block', marginBottom: '10px' }}>{s.tag || category}</span>
                            <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>{s.titulo}</h3>
                            <div 
                                dangerouslySetInnerHTML={{ __html: s.descripcion }} 
                                className="card-desc-html" 
                                style={{ fontSize: '15px', lineHeight: '1.7', opacity: 0.7 }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesGridV4;
