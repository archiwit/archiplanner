import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import { UPLOADS_URL } from '../../config';

const SectionHeroModern = ({ data = {}, ctas = {}, stories = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();

    const title = data.titulo || "Creamos Historias";
    const subtitle = data.subtitulo || "Diseño editorial y curaduría de eventos para almas sofisticadas";
    
    // Select items that have "destacar en hero moderno" active
    const featuredItems = stories.filter(s => s.en_hero === 1).slice(0, 6);
    if (featuredItems.length === 0 && stories.length > 0) {
        featuredItems.push(...stories.slice(0, 4));
    }

    // Auto-advance
    useEffect(() => {
        if (featuredItems.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % featuredItems.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [featuredItems.length]);

    const bgMedia = data.media_path || '/uploads/hero-placeholder.jpg';
    const mediaType = data.media_type || 'image';
    const buttonLabel = data.buttonLabel || "Comenzar mi Historia";

    const handleCardClick = (idx, eventId) => {
        if (idx === activeIndex) {
            navigate(`/galeria/${eventId}`);
        } else {
            setActiveIndex(idx);
        }
    };

    const getCardStatus = (idx) => {
        if (idx === activeIndex) return 'active';
        if (idx === (activeIndex + 1) % featuredItems.length) return 'upcoming';
        if (idx === (activeIndex + 2) % featuredItems.length) return 'upcoming secondary';
        if (idx === (activeIndex - 1 + featuredItems.length) % featuredItems.length) return 'passed';
        return 'hidden';
    };


    const anchoTotal = data.ancho_total !== false; // Default true if not explicitly false
    const widthClass = anchoTotal ? 'is-full-width' : 'is-framed';

    return (
        <section className={`hero-modern ${widthClass}`}>
            {/* Background Layer (Muted) */}
            <div className="hero-media-bg">
                {mediaType === 'video' ? (
                    <video 
                        key={bgMedia}
                        src={getImageUrl(bgMedia)} 
                        className="fade-in-blur hero-main-bg-img" 
                        autoPlay muted loop playsInline
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <img 
                        key={bgMedia}
                        src={getImageUrl(bgMedia)} 
                        alt="Background" 
                        className="fade-in-blur hero-main-bg-img" 
                    />
                )}
                <div className="hero-media-overlay"></div>
            </div>

            <div className="hero-modern-content">
                <div className="hero-text-side">
                    <span className="hero-m-tag">Exclusividad & Estilo</span>
                    <h1 className="hero-m-title">
                        {title.split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                                {i === 1 ? <span>{word}</span> : word}{' '}
                            </React.Fragment>
                        ))}
                    </h1>
                    <p className="hero-m-desc">{subtitle}</p>
                    
                    <div className="hero-m-actions">
                        <a href="/contacto" className="btn-admin-primary">
                            {buttonLabel} <ChevronRight size={16} />
                        </a>
                    </div>
                </div>

                {/* Layered Cards Carousel (Sliding from Right to Left) */}
                <div className="hero-explorer-cards">
                    {featuredItems.map((item, idx) => {
                        const status = getCardStatus(idx);
                        if (status === 'hidden') return null;

                        return (
                            <div 
                                key={item.id} 
                                className={`explorer-card ${status}`}
                                onClick={() => handleCardClick(idx, item.id)}
                            >
                                <div className="card-visual">
                                    <img 
                                        src={getImageUrl(item.portada_url || item.portada)} 
                                        alt={item.titulo} 
                                        style={{ objectPosition: item.metadata?.portada_focal || 'center center' }}
                                    />
                                    <div className="card-overlay"></div>
                                </div>
                                <div className="card-info">
                                    <span className="category">{item.categoria_nombre || 'Evento'}</span>
                                    <h4 className="title">{item.titulo}</h4>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SectionHeroModern;
