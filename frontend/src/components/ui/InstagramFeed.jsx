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

        // Filtrar solo imágenes (no videos) y tomar las primeras 3
        const filtered = data
          .filter(post => post.media_type !== 'VIDEO')
          .slice(0, 3);

        setPosts(filtered);
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
        <h4>@archi.planner</h4>
        <div className="insta-grid">
            <div className="insta-post" style={{ background: 'var(--color-bg)', height: '80px' }}></div>
            <div className="insta-post" style={{ background: 'var(--color-bg)', height: '80px' }}></div>
            <div className="insta-post" style={{ background: 'var(--color-bg)', height: '80px' }}></div>
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="instagram-feed">
        <h4>@archi.planner</h4>
        <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '10px' }}>
            {error || 'Sigue nuestro proceso en redes.'}
        </p>
        <a
          href="https://www.instagram.com/archi.planner/"
          target="_blank"
          rel="noopener noreferrer"
          className="tag"
          style={{ fontSize: '10px', textDecoration: 'underline' }}
        >
          Ver perfil en Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="instagram-feed">
      <h4>@archi.planner</h4>

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
            <img
              src={post.media_url}
              alt={post.caption ? post.caption.slice(0, 100) : 'Publicación de Instagram de ArchiPlanner'}
              loading="lazy"
            />
            <div className="insta-hover">
              <span>Ver</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default InstagramFeed;