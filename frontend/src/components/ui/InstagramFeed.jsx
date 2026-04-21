import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/instagram');
        const data = res.data;

        if (Array.isArray(data)) {
          // Filtrar solo imágenes (no videos) y tomar las primeras 3
          const filtered = data
            .filter(post => post.media_type !== 'VIDEO')
            .slice(0, 3);
          setPosts(filtered);
        } else {
          setError('Invalid data format');
        }
      } catch (err) {
        console.error('Error loading Instagram:', err);
        setError('No pudimos cargar las publicaciones en este momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="instagram-feed">
        <div className="insta-grid">
          <div className="insta-post skeleton-shimmer" style={{ minHeight: '100px', borderRadius: '4px' }}></div>
          <div className="insta-post skeleton-shimmer" style={{ minHeight: '100px', borderRadius: '4px' }}></div>
          <div className="insta-post skeleton-shimmer" style={{ minHeight: '100px', borderRadius: '4px' }}></div>
        </div>
        <h4>@archi.planner</h4>
      </div>
    );
  }

  // Si hay error o no hay posts, mostramos un fallback elegante en lugar de un mensaje de error seco
  if (error || posts.length === 0) {
    return (
      <div className="instagram-feed">
        <div className="insta-fallback-card">
          <h4>@archi.planner</h4>
          <p>Sigue nuestra curaduría de eventos de lujo y momentos inolvidables.</p>
          <a
            href="https://www.instagram.com/archi.planner/"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-mini"
          >
            Ver Galería Completa
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-feed">


      <div className="insta-grid">
        {posts.map(post => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="insta-post"
            aria-label="Ver publicación en Instagram"
          >
            <div className="insta-media-wrapper">
              <img
                src={post.media_url}
                alt={post.caption ? post.caption.slice(0, 100) : 'Publicación de Instagram de ArchiPlanner'}
                loading="lazy"
              />
              <div className="insta-hover-overlay">
                <span>Ver en Instagram</span>
              </div>
            </div>
            <p className="insta-caption-v4">
              {post.caption ? post.caption.slice(0, 60) + (post.caption.length > 60 ? '...' : '') : 'Momento ArchiPlanner'}
            </p>
          </a>
        ))}
      </div>
      <h4 style={{ paddingTop: '10px' }}>@archi.planner</h4>
    </div>
  );
};

export default InstagramFeed;