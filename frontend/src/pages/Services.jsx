import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SectionHeader from '../components/ui/SectionHeader';
import { API_BASE_URL, UPLOADS_URL } from '../config';
import StoryGallery from '../components/ui/StoryGallery';
import SectionCTA from '../components/ui/SectionCTA';
import SectionCorporate from '../components/ui/SectionCorporate';
import useCTAs from '../hooks/useCTAs';

const Services = () => {
    const [servicios, setServicios] = React.useState({ principales: [], sociales: [], corporativos: [] });
    const [loading, setLoading] = React.useState(true);
    const { ctas } = useCTAs();

    useScrollReveal([loading]);

    React.useEffect(() => {
        const fetchServicios = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/servicios`);
                const data = await res.json();
                
                const cat = {
                    principales: data.filter(s => s.seccion === 'principales'),
                    sociales: data.filter(s => s.seccion === 'sociales'),
                    corporativos: data.filter(s => s.seccion === 'corporativos' || s.seccion === 'empresariales')
                };
                
                setServicios(cat);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching servicios:', err);
                setLoading(false);
            }
        };
        fetchServicios();
    }, []);

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

    return (
        <div className="services-page">
            <section className="page-header section-padding container">
                <div className="header-content scroll-reveal">
                    <span className="tag">Propuesta de Valor</span>
                    <h1>Eventos que Cuentan <br/><span>Historias Únicas</span></h1>
                    <p>Desde grandes hitos hasta los momentos más íntimos, curamos cada detalle para lograr la perfección.</p>
                    <div className="underline"></div>
                </div>
            </section>

            {/* Corporativos - Diseño Asimétrico Independiente */}
            {servicios.corporativos.length > 0 && (
                <SectionCorporate corporativos={servicios.corporativos} />
            )}

            {/* Principales (Grid Premium de 3) */}
            <section className="services-detailed section-padding bg-graphite-light">
                <div className="container">
                    <SectionHeader tag="Principales" title="Grandes Hitos" />
                    <div className="grid-top-3 reveal-grid">
                        {servicios.principales.map((s, idx) => (
                            <div key={s.id} className="service-card scroll-reveal">
                                <div className="card-img" style={{ height: '240px' }}>
                                    <img 
                                        src={getImageUrl(s.imagen, fallbacks[idx % 3])} 
                                        alt={s.titulo} 
                                        onError={(e) => e.target.src = fallbacks[idx % 3]} 
                                    />
                                </div>
                                <div className="card-body" style={{ padding: '24px' }}>
                                    <span className="tag" style={{ fontSize: '10px', marginBottom: '8px' }}>{s.tag}</span>
                                    <h3 style={{ fontSize: '22px' }}>{s.titulo}</h3>
                                    <div dangerouslySetInnerHTML={{ __html: s.descripcion }} className="card-desc-html" style={{ fontSize: '14px', lineHeight: '1.5' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sociales (Grid Delicado de 3) */}
            <section className="services-detailed section-padding">
                <div className="container">
                    <SectionHeader tag="Íntimos" title="Sociales y Familiares" />
                    <div className="grid-bottom-3-delicate reveal-grid">
                        {servicios.sociales.map((s, idx) => (
                            <div key={s.id} className="service-card-delicate scroll-reveal">
                                <div className="card-img" style={{ width: '160px', height: '160px' }}>
                                    <img 
                                        src={getImageUrl(s.imagen, fallbacks[(idx + 1) % 3])} 
                                        alt={s.titulo} 
                                        onError={(e) => e.target.src = fallbacks[(idx + 1) % 3]} 
                                    />
                                </div>
                                <h3>{s.titulo}</h3>
                                <div dangerouslySetInnerHTML={{ __html: s.descripcion }} className="social-desc-html" style={{ fontSize: '13px', opacity: 0.8 }} />
                                <a href='/contacto' className="btn-text" style={{ fontSize: '12px', marginTop: '12px' }}>Consultar Detalles →</a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Gallery */}
            <section className="gallery-section section-padding bg-graphite-light">
                <div className="container">
                    <SectionHeader tag="Momentos" title="Style & Emotion" centered={true} />
                    <StoryGallery />
                </div>
            </section>

            {/* CTA Final */}
            <SectionCTA cta={ctas['services_final']} />
        </div>
    );
};


export default Services;
