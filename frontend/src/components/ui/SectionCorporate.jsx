import React from 'react';
import { UPLOADS_URL } from '../../config';

const SectionCorporate = ({ corporativos = [] }) => {
    const getImageUrl = (path, idx) => {
        const fallbacks = [
            'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012',
            'https://images.unsplash.com/photo-1475721027187-402ad2989a3b?q=80&w=2070',
            'https://images.unsplash.com/photo-1540575861501-7c93b177ca4a?q=80&w=2070'
        ];
        if (!path) return fallbacks[idx % 3];
        if (path.startsWith('http')) return path;
        const prefix = path.startsWith('/') ? '' : '/';
        return `${UPLOADS_URL}${prefix}${path}`;
    };


    const fallbacks = [
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012',
        'https://images.unsplash.com/photo-1475721027187-402ad2989a3b?q=80&w=2070',
        'https://images.unsplash.com/photo-1540575861501-7c93b177ca4a?q=80&w=2070'
    ];

    // Si hay menos de 3, mostramos una lista simple o usamos placeholders para completar el diseño premiun
    const main = corporativos[0] || { titulo: "Excelencia Corporativa", tag: "Meetings", descripcion: "Lideramos la organización de encuentros de alto nivel." };
    const secondary = [
        corporativos[1] || { titulo: "Team Building", tag: "Incentivos" },
        corporativos[2] || { titulo: "Capacitaciones", tag: "Learning" }
    ];

    return (
        <section className="services-detailed section-padding">
            <div className="container">
                <div className="section-header scroll-reveal" style={{ textAlign: 'left', marginBottom: '40px' }}>
                    <span className="tag">Empresariales</span>
                    <h2>Eventos Corporativos</h2>
                </div>

                <div className="corporate-asymmetric">
                    {/* Grande Izquierda */}
                    <div className="corp-left-large scroll-reveal">
                        <div className="corp-media-container" style={{ height: '100%', background: '#1a1a1a' }}>
                            <img src={getImageUrl(main.imagen, 0)} alt={main.titulo} onError={(e) => e.target.src = fallbacks[0]} />
                        </div>
                        <div className="corp-overlay-info">
                            <span>{main.tag}</span>
                            <h3>{main.titulo}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '10px' }}>
                                {(main.descripcion || "").replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                            </p>
                        </div>
                    </div>

                    {/* 2 Apilados Derecha */}
                    <div className="corp-right-stacked">
                        {secondary.map((s, idx) => (
                            <div key={s.id || idx} className="corp-item-stacked scroll-reveal" style={{ transitionDelay: `${(idx + 1) * 0.2}s` }}>
                                <div className="corp-media-container" style={{ height: '100%', background: '#1a1a1a' }}>
                                    <img src={getImageUrl(s.imagen, idx + 1)} alt={s.titulo} onError={(e) => e.target.src = fallbacks[idx + 1]} />
                                </div>
                                <div className="corp-overlay-info">
                                    <span style={{ fontSize: '10px' }}>{s.tag}</span>
                                    <h3 style={{ fontSize: '18px' }}>{s.titulo}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionCorporate;
