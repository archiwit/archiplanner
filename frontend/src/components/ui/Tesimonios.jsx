import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./style/Testimonio.css";
import { API_BASE_URL, getUploadUrl } from '../../config';

export default function EditorialTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/testimonials`);
                if (res.ok) {
                    const data = await res.json();
                    setTestimonials(data);
                }
            } catch (err) {
                console.error('Error fetching testimonials:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Detector de centro dinámico
    const updateFeaturedCard = useCallback(() => {
        if (!viewportRef.current || !trackRef.current) return;

        const viewportRect = viewportRef.current.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;

        let closestCard = null;
        let minDistance = Infinity;

        // Busca TODAS las tarjetas
        const cards = trackRef.current.querySelectorAll('.editorial-card');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(cardCenter - viewportCenter);

            // Solo considera tarjetas visibles
            if (rect.right > viewportRect.left && rect.left < viewportRect.right) {
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            }
        });

        // Remueve clase de todas y la agrega solo a la más cercana
        cards.forEach(card => card.classList.remove('is-featured'));
        if (closestCard && minDistance < viewportRect.width * 0.15) {
            closestCard.classList.add('is-featured');
        }

        rafRef.current = requestAnimationFrame(updateFeaturedCard);
    }, []);

    useEffect(() => {
        if (!loading && testimonials.length > 0) {
            // Inicia el loop de detección
            rafRef.current = requestAnimationFrame(updateFeaturedCard);

            // Limpia al desmontar
            return () => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        }
    }, [testimonials, loading, updateFeaturedCard]);

    const getImageUrlLocal = (path) => getUploadUrl(path);


    if (loading) return null;
    if (testimonials.length === 0) return null;

    const loopedTestimonials = [...testimonials, ...testimonials];

    return (
        <section className="editorial-testimonials">
            <div className="editorial-testimonials__header">
                <span className="editorial-testimonials__eyebrow">Testimonios</span>
                <h2 className="editorial-testimonials__title">
                    Historias contadas por quienes vivieron la experiencia
                </h2>
            </div>

            <div className="editorial-testimonials__viewport" ref={viewportRef}>
                <div
                    className="editorial-testimonials__track"
                    ref={trackRef}
                    style={{ animationDuration: `${testimonials.length * 8}s` }}
                >
                    {loopedTestimonials.map((item, index) => (
                        <article
                            className="editorial-card"
                            key={`${item.id}-${index}`}
                        >
                            <div className="editorial-card__image-wrap">
                                <img
                                    src={getImageUrlLocal(item.image)}
                                    alt={item.name}
                                    className="editorial-card__image"
                                />
                            </div>

                            <div className="editorial-card__content">
                                <p className="editorial-card__quote">"{item.message || item.quote}"</p>
                                <div className="editorial-card__meta">
                                    <h3>{item.name}</h3>
                                    <span>{item.event_title || item.role}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}