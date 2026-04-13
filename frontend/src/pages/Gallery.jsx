import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const Gallery = () => {
    const [filter, setFilter] = useState('all');
    const [eventos, setEventos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useScrollReveal([loading, filter]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eRes, cRes] = await Promise.all([
                    api.get('/galeria/eventos'),
                    api.get('/galeria/categorias')
                ]);
                setEventos(eRes.data);
                setCategorias(cRes.data);
            } catch (err) {
                console.error('Error fetching gallery:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = filter === 'all' 
        ? eventos.filter(e => e.activo)
        : eventos.filter(e => e.activo && String(e.categoria_id) === String(filter));

    if (loading) return <div className="page-loader">Curando experiencias...</div>;

    return (
        <div className="gallery-page fade-in">
            <section className="page-header section-padding container">
                <div className="header-content scroll-reveal">
                    <span className="tag">Nuestro Trabajo</span>
                    <h1>Galería de <br/><span>Experiencias</span></h1>
                    <p>Una curaduría visual de los hitos que hemos tenido el honor de planificar.</p>
                    <div className="underline"></div>
                </div>
            </section>

            <section className="gallery-filters-section container scroll-reveal">
                <div className="filters">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos
                    </button>
                    {categorias.map((cat) => (
                        <button 
                            key={cat.id}
                            className={`filter-btn ${filter === cat.id.toString() || filter === cat.id ? 'active' : ''}`}
                            onClick={() => setFilter(cat.id)}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            </section>

            <section className="gallery-section section-padding">
                <div className="container">
                    <div className="masonry-grid reveal-grid">
                        {filteredItems.map((item) => {
                            const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') : (item.metadata || {});
                            return (
                                <div 
                                    key={item.id} 
                                    className="gallery-card scroll-reveal"
                                    onClick={() => navigate(`/galeria/${item.id}`)}
                                >
                                    <img 
                                        src={getImageUrl(item.portada_url)} 
                                        alt={item.titulo} 
                                        style={{ objectPosition: meta.portada_focal || 'center' }}
                                    />
                                    <div className="gallery-card-overlay">
                                        <span className="cat-tag">{item.categoria_nombre}</span>
                                        <h3>{item.titulo}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="empty-gallery text-center py-50">
                            <p className="opacity-50 italic">Próximamente más experiencias en esta categoría...</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Gallery;
