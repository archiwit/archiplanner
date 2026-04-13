import React from 'react';
import { UPLOADS_URL } from '../../config';

const SectionFeatured = ({ principales = [], sociales = [] }) => {
    const getImageUrl = (path, fallback) => {
        if (!path) return fallback;
        if (path.startsWith('http')) return path;
        const prefix = path.startsWith('/') ? '' : '/';
        return `${UPLOADS_URL}${prefix}${path}`;
    };


    const fallbacks = [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070'
    ];

    // Tomamos los primeros 3 de principales para el top grid
    const featured = principales.slice(0, 3);
    // Tomamos los sociales para el bottom grid
    const delicate = sociales;

    return (
        <section className="services-overview section-padding">
            <div className="container featured-grid-container">
                <div className="section-header scroll-reveal">
                    <span className="tag">Principales</span>
                    <h2>Grandes Hitos</h2>
                </div>

                <div className="grid-top-3 reveal-grid">
                    {featured.map((s, idx) => (
                        <div key={s.id} className="service-card scroll-reveal">
                            <div className="card-img">
                                {s.icono_svg ? (
                                    <div className="service-icon-svg" dangerouslySetInnerHTML={{ __html: s.icono_svg }} />
                                ) : (
                                    <img src={getImageUrl(s.imagen, fallbacks[idx % 3])} alt={s.titulo} onError={(e) => e.target.src = fallbacks[idx % 3]} />
                                )}
                            </div>
                            <div className="card-body">
                                <span className="tag" style={{ marginBottom: "-5px" }}>{s.tag}</span>
                                <h3>{s.titulo}</h3>
                                <div dangerouslySetInnerHTML={{ __html: s.descripcion }} className="card-desc-html" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-header scroll-reveal" style={{ marginTop: '60px' }}>
                    <span className="tag">Momentos Íntimos</span>
                    <h2>Sociales y Familiares</h2>
                </div>

                <div className="grid-bottom-3-delicate reveal-grid">
                    {delicate.map((s, idx) => (
                        <div key={s.id} className="service-card-delicate scroll-reveal">
                            <div className="card-icon-area">
                                {s.icono_svg ? (
                                    <div className="service-icon-svg" dangerouslySetInnerHTML={{ __html: s.icono_svg }} />
                                ) : (
                                    <img src={getImageUrl(s.imagen, fallbacks[(idx + 1) % 3])} alt={s.titulo} onError={(e) => e.target.src = fallbacks[(idx + 1) % 3]} />
                                )}
                            </div>
                            <div className="card-content-area">
                                <h4>{s.titulo}</h4>
                                <div dangerouslySetInnerHTML={{ __html: s.descripcion }} className="social-desc-html" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SectionFeatured;
