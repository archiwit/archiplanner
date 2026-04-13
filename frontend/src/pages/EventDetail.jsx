import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { ArrowLeft, Play, ExternalLink, Calendar, MapPin, Heart, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

// Custom Organic Leaf SVG Component
const OrganicLeaf = ({ color, style }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 421.68 194.66"
        className="organic-leaf-svg"
        style={{ ...style, '--leaf-color': color }}
    >
        <path fill="currentColor" d="M411.23,119.96c-21.93,5.61-42.64,2.86-60.28-11.66-13.17-10.84-35.87-44.83-40.55-50.1-6.2-7.61-14.22-16.99-19.25-21.87-16.19-15.7-45.74-29.55-68.29-33.67-30.32-5.55-49.2-1.98-78.75,6.78-13.56,4.02-25.72,10.81-37.19,21.1,2.04.16,2.98.26,3.92.3,27.8,1.23,53.1,10.24,76.75,24.5,5.88,3.96,18.8,13.44,24.05,17.79,9.25,7.65,13.17,11.19,13.73,14.36-.96.24-1.49-.47-2.15-.94-13.16-9.42-36.36-20.97-50.7-28.36-9-4.36-17.7-7.43-26.5-10.16-22.62-7.03-45.62-10.75-69.44-8.47-4.72.45-9.2,1.45-13.53,2.85C19.78,54.35,8.71,74.39,2.38,91.27-.47,98.86-.08,111.22.18,119.83c31.73-53.35,51.25-57.04,85.62-59.47,0,5.39.11,10.17-.02,14.95-.44,16.85,2.9,33.2,10.71,47.82,10.35,19.38,26.1,34.13,45.57,44.7,32.56,17.68,67.88,24.41,104.38,26.38,20.01,1.08,39.95.16,59.84-2.52,42.27-5.7,76.5-25.81,104.17-57.71,4.3-4.95,8.48-10.15,11.24-17.12-3.91,1.17-7.15,2.26-10.45,3.11Z" />
    </svg>
);

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config } = useBranding();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMediaIdx, setActiveMediaIdx] = useState(null);

    useScrollReveal([loading]);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const res = await api.get(`/galeria/eventos/${id}`);
                const data = res.data;
                if (data.metadata && typeof data.metadata === 'string') {
                    data.metadata = JSON.parse(data.metadata);
                }
                if (data.media) {
                    data.media.sort((a, b) => (a.orden || 0) - (b.orden || 0));
                }
                setEvento(data);
            } catch (err) {
                console.error(err);
                navigate('/galeria');
            } finally {
                setLoading(false);
            }
        };
        fetchEvento();
    }, [id, navigate]);

    if (loading) return (
        <div className="admin-loader-container">
            <div className="loader"></div>
            <p>Reconstruyendo la historia...</p>
        </div>
    );
    if (!evento) return null;

    const nextMedia = () => {
        if (!evento.media) return;
        setActiveMediaIdx((prev) => (prev + 1) % evento.media.length);
    };

    const prevMedia = () => {
        if (!evento.media) return;
        setActiveMediaIdx((prev) => (prev - 1 + evento.media.length) % evento.media.length);
    };

    const metadata = evento.metadata || {};

    return (
        <div className="event-detail-page fade-in">
            {/* Elegant Hero Section */}
            <header className="event-hero-romantic">
                <div
                    className="event-hero-bg"
                    style={{
                        backgroundImage: `url(${getImageUrl(evento.portada_url)})`,
                        backgroundPosition: metadata.portada_focal || 'center'
                    }}
                ></div>
                <div className="container event-hero-content">
                </div>
            </header>

            {/* Floating Editorial Title */}
            <div className="floating-title-wrap scroll-reveal">
                <div className="flex-end gap-12 mb-auto scroll-reveal w-full">
                    <button className="btn-back-minimal" onClick={() => navigate('/galeria')}>
                        <ArrowLeft size={14} /> Regresar a Experiencias
                    </button>
                </div>
                <div className="container">
                    <h1 className="hero-title-romantic">{evento.titulo}</h1>
                </div>
                <div className="scroll-reveal mt-auto text-left">
                    <div className="flex gap-24 mt-24 opacity-40 text-[10px] uppercase tracking-[4px] text-white">
                        <span className="flex-center gap-8"><Heart size={12} /> {evento.categoria_nombre}</span>
                    </div>
                </div>
            </div>


            {/* Story / Narrative Section */}
            <section className="event-story-section container">
                <div className="scroll-reveal">
                    <span className="story-tag">Nuestra Historia</span>
                    <div className="story-decorator"></div>
                    <blockquote className="event-story-text font-serif">
                        {evento.narrativa || evento.descripcion || 'Una experiencia curada para trascender el tiempo y el espacio.'}
                    </blockquote>
                    <div className="story-decorator"></div>
                </div>
            </section>

            {/* Immersive Media Grid */}
            <section className="event-media-section container pb-30">
                <div className="media-masonry">
                    {evento.media?.map((m, idx) => (
                        <div
                            key={m.id || idx}
                            className="media-item scroll-reveal cursor-pointer"
                            onClick={() => setActiveMediaIdx(idx)}
                        >
                            {m.tipo === 'image' && (
                                <img src={getImageUrl(m.url)} alt="" loading="lazy" />
                            )}
                            {m.tipo === 'video' && (
                                <div className="video-player-wrapper glass-panel">
                                    <video
                                        src={getImageUrl(m.url)}
                                        controls
                                        className="w-full"
                                    />
                                </div>
                            )}
                            {m.tipo === 'embed' && (
                                <div className="embed-container glass-panel">
                                    <iframe
                                        src={m.external_url.includes('vimeo')
                                            ? m.external_url.replace('vimeo.com/', 'player.vimeo.com/video/')
                                            : m.external_url.replace('watch?v=', 'embed/')
                                        }
                                        title="External Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Un mensaje de amor */}
            <section className="event-story-section container">

                {/* Immersive Editorial Message Section */}
                {(metadata.mensaje_novios || (metadata.paleta && metadata.paleta.length > 0)) && (
                    <div className="event-story-full-immersive scroll-reveal">
                        <div className="story-split-layout">
                            {/* Left: Dramatic Image with Subtle Fusion */}
                            <div className="story-visual-side-xl">
                                <div className="fusion-depth-container">
                                    <img src="/assets/images/story/dramatic_still_life.png" alt="Romantic Detail" className="fusion-image-xl" />
                                    <div className="fusion-mask-edge"></div>
                                </div>
                            </div>

                            {/* Right: Romantic Narrative */}
                            <div className="story-content-side-xl">
                                <div className="narrative-wrapper">
                                    <span className="editorial-tag mb-24">Un mensaje de amor</span>
                                    <p className="romantic-quote-spread">
                                        {metadata.mensaje_novios || 'Nuestra historia es el comienzo de un viaje eterno, donde cada detalle cuenta el relato de un amor que trasciende lo convencional.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Organic Leaf Palette Composition */}
                        {metadata.paleta && metadata.paleta.length > 0 && (
                            <div className="organic-leaves-composition">
                                <h4 className="section-label mb-64 text-center" style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '4px' }}>
                                    Esencia & Color
                                </h4>
                                <div className="leaves-organic-track">
                                    {metadata.paleta.map((color, idx) => {
                                        // Random-like deterministic values for organic feel
                                        const rotation = (idx * 45) % 180 - 90;
                                        const scale = 0.8 + (idx % 3) * 0.2;
                                        const yOffset = (idx % 2 === 0) ? -20 : 20;
                                        const animDelay = `${idx * 0.5}s`;

                                        return (
                                            <div key={idx} className="leaf-organic-wrapper">
                                                <OrganicLeaf
                                                    color={color}
                                                    style={{
                                                        transform: `rotate(${rotation}deg) scale(${scale}) translateY(${yOffset}px)`,
                                                        animationDelay: animDelay
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Centered Closing Action */}
                        <div className="story-closing-footer">
                            <a
                                href={`https://wa.me/${config?.telefono?.replace(/[^0-9]/g, '') || '573214567890'}?text=${encodeURIComponent(`¡Hola ArchiPlanner! Vi la historia de "${evento.titulo}" y me encantaría algo así para mi evento.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-admin-primary btn-xl"
                            >
                                Diseñar mi Historia <MessageCircle size={18} className="ml-12" />
                            </a>
                        </div>
                    </div>
                )}
            </section>


            {/* Instagram Style Lightbox Carousel */}
            {activeMediaIdx !== null && (
                <div className="lightbox-overlay">
                    <button className="lightbox-close" onClick={() => setActiveMediaIdx(null)}><X size={30} /></button>

                    <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevMedia(); }}>
                        <ChevronLeft size={40} />
                    </button>

                    <div className="lightbox-slider-container">
                        <div
                            className="lightbox-slider"
                            style={{ transform: `translateX(-${activeMediaIdx * 100}%)` }}
                        >
                            {evento.media.map((m, i) => (
                                <div key={m.id || i} className="lightbox-slide">
                                    {m.tipo === 'image' ? (
                                        <img src={getImageUrl(m.url)} alt="" />
                                    ) : m.tipo === 'video' ? (
                                        <video src={getImageUrl(m.url)} controls />
                                    ) : (
                                        <div className="embed-full">
                                            <iframe
                                                src={m.external_url?.includes('vimeo')
                                                    ? m.external_url.replace('vimeo.com/', 'player.vimeo.com/video/')
                                                    : m.external_url?.replace('watch?v=', 'embed/')
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextMedia(); }}>
                        <ChevronRight size={40} />
                    </button>

                    <div className="lightbox-counter">
                        {activeMediaIdx + 1} / {evento.media.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetail;
