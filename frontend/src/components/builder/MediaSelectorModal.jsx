import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Film, Play, Plus, RefreshCcw } from 'lucide-react';
import paginasV4Service from '../../services/paginasV4Service';
import { API_BASE_URL } from '../../config';
import Swal from 'sweetalert2';

const MediaSelectorModal = ({ isOpen, onClose, onSelect, type = 'all' }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('todas');
    const [activeType, setActiveType] = useState('todos'); // 'todos', 'imagen', 'video'
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const LIMIT = 24;

    const categories = [
        { id: 'todas', label: 'Todas', icon: '✨' },
        { id: 'productos', label: 'Productos', icon: '📦' },
        { id: 'eventos', label: 'Eventos', icon: '🎭' },
        { id: 'galeria', label: 'Mi Galería', icon: '🖼️' },
        { id: 'sistema', label: 'Sistema', icon: '⚙️' }
    ];

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ensure backend uploads are reached
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        // Usually API_BASE_URL is something like http://localhost:5000/api
        const baseUrl = API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');
        return `${baseUrl}${cleanUrl}`;
    };
    
    useEffect(() => {
        if (isOpen) {
            setMedia([]);
            setOffset(0);
            setHasMore(true);
            fetchMedia(0, true);
            
            // Auto-sync if system tab is empty or on first open
            if (activeTab === 'sistema') {
                handleSync();
            }
        }
    }, [isOpen, activeTab, activeType]);

    const handleSync = async () => {
        try {
            setLoading(true);
            const response = await paginasV4Service.syncMedia();
            fetchMedia(0, true);
            Swal.fire({
                title: 'Sincronización Exitosa',
                text: response.message || 'La galería ha sido actualizada con los recursos del sistema.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err) {
            console.error("Sync error:", err);
            Swal.fire('Error', 'No se pudo sincronizar con el sistema.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMedia = async (currentOffset, reset = false) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);
        
        try {
            const data = await paginasV4Service.getMedia({ 
                categoria: activeTab, 
                tipo: activeType,
                limit: LIMIT, 
                offset: currentOffset 
            });
            
            if (reset) {
                setMedia(data);
            } else {
                setMedia(prev => [...prev, ...data]);
            }
            
            setHasMore(data.length === LIMIT);
        } catch (err) {
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextOffset = offset + LIMIT;
        setOffset(nextOffset);
        fetchMedia(nextOffset);
    };

    const filteredMedia = media.filter(m => {
        const matchesSearch = (m.url || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (m.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay builder-media-modal">
            <div className="modal-content animate-pop">
                <div className="modal-header">
                    <div>
                        <h2>Seleccionar Multimedia</h2>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Gestiona y organiza tus recursos visuales</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>
                
                <div className="modal-tools">
                    <div className="category-tabs">
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                className={`tab-item ${activeTab === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(cat.id)}
                            >
                                <span className="tab-icon">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                        <div className="type-filters" style={{ display: 'flex', gap: '5px', background: '#111', padding: '4px', borderRadius: '8px', border: '1px solid #222' }}>
                            <button className={`type-btn ${activeType === 'todos' ? 'active' : ''}`} onClick={() => setActiveType('todos')}>Todos</button>
                            <button className={`type-btn ${activeType === 'imagen' ? 'active' : ''}`} onClick={() => setActiveType('imagen')}><ImageIcon size={12} /> Imágenes</button>
                            <button className={`type-btn ${activeType === 'video' ? 'active' : ''}`} onClick={() => setActiveType('video')}><Film size={12} /> Videos</button>
                        </div>

                        <div className="search-box" style={{ flex: 1 }}>
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar en esta categoría..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <button className="btn-v4-outline" onClick={handleSync} title="Sincronizar con el sistema" style={{ padding: '0 10px', height: '40px' }}>
                            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <label className="btn-upload">
                            <Plus size={14} /> Subir
                            <input 
                                type="file" 
                                hidden 
                                accept="image/*,video/*" 
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('categoria', activeTab === 'todas' ? 'galeria' : activeTab);
                                    
                                    try {
                                        setLoading(true);
                                        const response = await paginasV4Service.uploadMedia(formData);
                                        if (response.success) {
                                            Swal.fire({
                                                title: '¡Subida Exitosa!',
                                                text: 'El archivo ya está disponible en tu galería.',
                                                icon: 'success',
                                                timer: 2000,
                                                showConfirmButton: false,
                                                toast: true,
                                                position: 'top-end'
                                            });
                                            setActiveTab(activeTab === 'todas' ? 'galeria' : activeTab);
                                            fetchMedia(0, true);
                                        }
                                    } catch (err) {
                                        console.error("Upload error:", err);
                                        Swal.fire('Error', 'No se pudo subir el archivo. Verifica el tamaño y formato.', 'error');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} 
                            />
                        </label>
                    </div>
                </div>

                <div className="modal-media-grid">
                    {loading ? (
                        <div className="p-40 text-center">
                            <div className="loader-spinner"></div>
                            <p className="mt-10 opacity-50">Cargando biblioteca...</p>
                        </div>
                    ) : (
                        <>
                            {filteredMedia.map(m => (
                                <div key={m.id} className="media-item" onClick={() => { onSelect(m.url); onClose(); }}>
                                    {m.tipo === 'video' ? (
                                        <div className="video-thumb">
                                            <video 
                                                src={getFullUrl(m.url)} 
                                                muted 
                                                loop 
                                                onMouseOver={(e) => e.target.play()} 
                                                onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                            />
                                            <div className="video-badge"><Play size={12} /> Video</div>
                                        </div>
                                    ) : (
                                        <img 
                                            src={getFullUrl(m.url)} 
                                            alt={m.name} 
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150?text=No+Foto';
                                            }}
                                        />
                                    )}
                                    <div className="media-info">
                                        <span className="media-name">{m.name || m.url.split('/').pop()}</span>
                                        <span className="media-tag">{m.categoria || 'galeria'}</span>
                                    </div>
                                </div>
                            ))}
                            
                            {hasMore && !searchTerm && (
                                <div className="load-more-container" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                                    <button 
                                        className="btn-load-more" 
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Cargando...' : 'Cargar más imágenes'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    
                    {!loading && filteredMedia.length === 0 && (
                        <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', opacity: 0.3 }}>
                            <ImageIcon size={48} style={{ marginBottom: '15px' }} />
                            <p>No se encontraron archivos en esta categoría.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .builder-media-modal .modal-content {
                    width: 1000px;
                    max-width: 95vw;
                    height: 85vh;
                    display: flex;
                    flex-direction: column;
                    background: #0a0a0a;
                    border: 1px solid #222;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.8);
                }

                .builder-media-modal .modal-header { padding: 25px 30px; border-bottom: 1px solid #1a1a1a; }
                .builder-media-modal .modal-tools { padding: 20px 30px; background: #0f0f0f; }
                
                .category-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
                .tab-item {
                    background: #1a1a1a;
                    border: 1px solid #222;
                    color: #888;
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .tab-item:hover { background: #222; color: #fff; }
                .tab-item.active { background: #ff4d4d; color: white; border-color: #ff4d4d; }
                .tab-icon { font-size: 14px; }

                .tab-icon { font-size: 14px; }

                .type-filters .type-btn {
                    background: transparent;
                    border: none;
                    color: #666;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .type-filters .type-btn:hover { color: #fff; background: #1a1a1a; }
                .type-filters .type-btn.active { background: #222; color: #ff4d4d; }

                .builder-media-modal .search-box { background: #151515; display: flex; align-items: center; padding: 0 15px; border-radius: 12px; border: 1px solid #222; }
                .builder-media-modal .search-box input { border: none; background: transparent; padding: 12px; color: white; flex: 1; font-size: 14px; }

                .builder-media-modal .modal-media-grid {
                    flex: 1;
                    padding: 30px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 25px;
                    overflow-y: auto;
                    align-content: start;
                }
                
                .builder-media-modal .media-item {
                    background: #151515;
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 250px;
                    position: relative;
                    border: 1px solid #222;
                    display: flex;
                    flex-direction: column;
                }
                .builder-media-modal .media-item:hover { 
                    transform: translateY(-8px); 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6); 
                    border-color: #ff4d4d; 
                    z-index: 10;
                }
                .builder-media-modal .media-item img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover;
                    display: block; 
                }
                
                .builder-media-modal .video-thumb {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    position: relative;
                    overflow: hidden;
                    flex: 1;
                }
                .builder-media-modal .video-thumb video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.6;
                    transition: all 0.5s ease;
                }
                .builder-media-modal .media-item:hover .video-thumb video {
                    opacity: 1;
                    transform: scale(1.05);
                }
                .builder-media-modal .video-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(232, 124, 124, 0.95);
                    backdrop-filter: blur(8px);
                    color: white;
                    padding: 5px 12px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    z-index: 5;
                    text-transform: uppercase;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .builder-media-modal .media-info {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.9));
                    padding: 30px 15px 15px;
                }
                .media-name { display: block; color: #fff; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
                .media-tag { font-size: 9px; color: #ff4d4d; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; opacity: 0.8; }

                .btn-upload {
                    background: #ff4d4d;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-upload:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255,77,77,0.3); background: #ff6666; }

                .btn-load-more {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-load-more:hover:not(:disabled) { background: #222; border-color: #444; transform: scale(1.05); }
                .btn-load-more:disabled { opacity: 0.5; cursor: not-allowed; }

                .loader-spinner {
                    width: 40px; height: 40px; border: 4px solid #222; border-top: 4px solid #ff4d4d;
                    border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default MediaSelectorModal;
