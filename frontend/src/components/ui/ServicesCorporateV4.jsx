import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const ServicesCorporateV4 = ({ 
    category = 'corporativos', 
    services = [], 
    title = 'Eventos Corporativos', 
    tag = 'Empresariales' 
}) => {
    const filtered = services.filter(s => s.seccion?.toLowerCase() === category.toLowerCase() || s.seccion?.toLowerCase() === 'empresariales');
    
    const fallbacks = [
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012',
        'https://images.unsplash.com/photo-1475721027187-402ad2989a3b?q=80&w=2070',
        'https://images.unsplash.com/photo-1540575861501-7c93b177ca4a?q=80&w=2070'
    ];

    // Elegant fallback logic for the 1+2 layout
    const main = filtered[0] || { titulo: "Excelencia Corporativa", tag: "Meetings", descripcion: "Lideramos la organización de encuentros de alto nivel con una visión editorial y moderna." };
    const secondary = [
        filtered[1] || { titulo: "Team Building", tag: "Incentivos", descripcion: "" },
        filtered[2] || { titulo: "Capacitaciones", tag: "Learning", descripcion: "" }
    ];

    return (
        <div className="v4-services-corporate-container">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '40px' }}>
                {tag && <span className="tag" style={{ color: 'var(--color-primary)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '11px', fontWeight: '800' }}>{tag}</span>}
                {title && <h2 style={{ fontSize: '48px', marginTop: '10px' }}>{title}</h2>}
            </div>

            <div className="corporate-asymmetric" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', minHeight: '600px' }}>
                {/* Large Main Feature */}
                <div className="corp-left-large" style={{ position: 'relative', borderRadius: '30px', overflow: 'hidden', background: '#111' }}>
                    <div className="corp-media-container" style={{ height: '100%', width: '100%' }}>
                        <img 
                            src={getImageUrl(main.imagen)} 
                            alt={main.titulo} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = fallbacks[0]} 
                        />
                    </div>
                    <div className="corp-overlay-info" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '50px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>{main.tag}</span>
                        <h3 style={{ fontSize: '36px', color: 'white', marginTop: '10px', marginBottom: '15px' }}>{main.titulo}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', maxWidth: '500px' }}>
                            {(main.descripcion || "").replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                        </p>
                    </div>
                </div>

                {/* Stacked Secondary Items */}
                <div className="corp-right-stacked" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {secondary.map((s, idx) => (
                        <div key={s.id || idx} className="corp-item-stacked" style={{ flex: 1, position: 'relative', borderRadius: '30px', overflow: 'hidden', background: '#111' }}>
                            <div className="corp-media-container" style={{ height: '100%', width: '100%' }}>
                                <img 
                                    src={getImageUrl(s.imagen)} 
                                    alt={s.titulo} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = fallbacks[idx + 1]} 
                                />
                            </div>
                            <div className="corp-overlay-info" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '30px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>{s.tag}</span>
                                <h3 style={{ fontSize: '22px', color: 'white', marginTop: '5px' }}>{s.titulo}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Responsive Adjustments using inline style tag for simplicity in this bridge component */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 991px) {
                    .corporate-asymmetric { grid-template-columns: 1fr !important; min-height: auto !important; }
                    .corp-left-large { height: 450px !important; }
                    .corp-item-stacked { height: 300px !important; }
                }
            ` }} />
        </div>
    );
};

export default ServicesCorporateV4;
