import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Plus, Edit2, Trash2, X, Search, 
    Video, MousePointer, Layers, Save, Eye,
    Type, Image as ImageIcon, Code, Quote, Briefcase,
    Layout, ArrowUp, ArrowDown, ExternalLink, Filter
} from 'lucide-react';
import { API_BASE_URL, UPLOADS_URL } from '../../config';
import AdminBlockEditor from './AdminBlockEditor';

const AdminCmsWeb = () => {
    const [activeTab, setActiveTab] = useState('builder');
    const [ctas, setCtas] = useState([]);
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('cta'); // 'cta' or 'story'
    const [editingItem, setEditingItem] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, hRes] = await Promise.all([
                api.get('/ctas'),
                api.get('/historias')
            ]);
            setCtas(cRes.data || cRes);
            setHistorias(hRes.data || hRes);
        } catch (err) {
            console.error('Error fetching CMS data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCtaModal = (cta = null) => {
        setModalType('cta');
        setEditingItem(cta);
        setFormData({
            slug: cta ? cta.slug : '',
            tag: cta ? cta.tag : '',
            titulo: cta ? cta.titulo : '',
            descripcion: cta ? cta.descripcion : '',
            texto_boton: cta ? cta.texto_boton : '',
            enlace: cta ? cta.enlace : '',
            imagen_path: cta ? cta.imagen : ''
        });
        setPreviewImage(cta?.imagen ? `${UPLOADS_URL}${cta.imagen}` : null);
        setShowModal(true);
    };

    const handleOpenStoryModal = (story = null) => {
        setModalType('story');
        setEditingItem(story);
        setFormData({
            titulo: story ? story.titulo : '',
            url_path: story ? story.url : '',
            activo: story ? story.activo : 1,
            orden: story ? story.orden : historias.length + 1
        });
        setPreviewImage(null);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [modalType === 'cta' ? 'imagen' : 'video']: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            const baseUrl = modalType === 'cta' ? `${API_BASE_URL}/ctas` : `${API_BASE_URL}/historias`;
            const url = editingItem ? `${baseUrl}/${editingItem.id}` : baseUrl;
            const method = editingItem ? 'PUT' : 'POST';
            
            await fetch(url, { method, body: data });
            fetchData();
            setShowModal(false);
        } catch (err) {
            console.error('Error saving item:', err);
            alert('Error al guardar cambios');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('¿Confirmar eliminación?')) return;
        try {
            const endpoint = type === 'cta' ? `/ctas/${id}` : `/historias/${id}`;
            await api.delete(endpoint);
            fetchData();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    if (loading) return (
        <div className="admin-loader-container">
            <div className="loader"></div>
            <p>Sincronizando constructor...</p>
        </div>
    );

    return (
        <div className="admin-page-container fade-in">
            <div className="admin-header-flex">
                <div className="header-main">
                    <h1 className="admin-title">ArchiPlanner <span className="text-primary">CMS Builder</span></h1>
                    <p className="admin-subtitle">Arquitectura modular para experiencias web premium</p>
                </div>
                
                <div className="admin-tabs-minimal">
                    <button 
                        className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('builder')}
                    >
                        <Layers size={14} /> Page Builder
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('stories')}
                    >
                        <Video size={14} /> Historias
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'ctas' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('ctas')}
                    >
                        <MousePointer size={14} /> CTAs Globales
                    </button>
                </div>
            </div>

            <div className="admin-builder-wrapper" style={{ marginTop: '20px' }}>
                {activeTab === 'builder' && (
                    <div className="fade-in">
                        <AdminBlockEditor />
                    </div>
                )}

                {activeTab === 'stories' && (
                    <div className="fade-in">
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <div className="tab-header-actions" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="section-title-sm">Galería Editorial de Historias</h3>
                                <button className="btn-admin-primary" onClick={() => handleOpenStoryModal()}>
                                    <Plus size={16} /> Agregar Historia
                                </button>
                            </div>
                            
                            <div className="admin-grid-cards">
                                {historias.map(h => (
                                    <div key={h.id} className="story-admin-card glass-panel h-auto">
                                        <div className="story-preview-container" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '220px', background: '#000' }}>
                                            <video src={h.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                                            {!h.activo && <div className="inactive-badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.4)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>OCULTO</div>}
                                            <div className="story-card-overlay" style={{ position: 'absolute', bottom: 0, left: 0, padding: '15px' }}>
                                                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{h.titulo}</h4>
                                            </div>
                                        </div>
                                        <div className="story-card-footer" style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div className="block-actions">
                                                <button className="action-btn" onClick={() => handleOpenStoryModal(h)}><Edit2 size={12} /></button>
                                                <button className="action-btn delete" onClick={() => handleDelete('story', h.id)}><Trash2 size={12} /></button>
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>ORDEN: {h.orden}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ctas' && (
                    <div className="fade-in">
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <div className="tab-header-actions" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="section-title-sm">Llamados a la Acción Globales</h3>
                                <button className="btn-admin-primary" onClick={() => handleOpenCtaModal()}>
                                    <Plus size={16} /> Nuevo CTA
                                </button>
                            </div>
                            
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Slug / ID</th>
                                            <th>Tag Editoral</th>
                                            <th>Título</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ctas.map(cta => (
                                            <tr key={cta.id}>
                                                <td><code className="text-primary">{cta.slug}</code></td>
                                                <td><span className="tag-sm">{cta.tag}</span></td>
                                                <td>{cta.titulo}</td>
                                                <td>
                                                    <div className="actions-flex-end">
                                                        <button className="action-btn" onClick={() => handleOpenCtaModal(cta)} title="Editar"><Edit2 size={12} /></button>
                                                        <button className="action-btn delete" onClick={() => handleDelete('cta', cta.id)} title="Eliminar"><Trash2 size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals for CTAs & Stories */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ maxWidth: '480px' }}>
                        <div className="modal-search-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>{editingItem ? 'Actualizar' : 'Crear'} {modalType === 'cta' ? 'CTA' : 'Historia'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="dense-grid" style={{ padding: '0 20px 20px 20px' }}>
                            {modalType === 'cta' ? (
                                <>
                                    <div className="dense-form-group">
                                        <label>Slug Único (Ref. en código/bloques)</label>
                                        <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required className="dense-input" placeholder="ej: bento_main_cta" />
                                    </div>
                                    <div className="dense-form-group">
                                        <label>Etiqueta Tagline</label>
                                        <input type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="dense-input" />
                                    </div>
                                    <div className="dense-form-group">
                                        <label>Título del CTA</label>
                                        <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="dense-input" />
                                    </div>
                                    <div className="dense-form-group">
                                        <label>Texto Botón</label>
                                        <input type="text" value={formData.texto_boton} onChange={e => setFormData({...formData, texto_boton: e.target.value})} className="dense-input" />
                                    </div>
                                    <div className="dense-form-group">
                                        <label>Enlace / Ruta</label>
                                        <input type="text" value={formData.enlace} onChange={e => setFormData({...formData, enlace: e.target.value})} className="dense-input" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="dense-form-group">
                                        <label>Título de la Historia</label>
                                        <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required className="dense-input" />
                                    </div>
                                    <div className="display-flex gap-12">
                                        <div className="dense-form-group" style={{ flex: 1 }}>
                                            <label>Visibilidad</label>
                                            <select 
                                                value={formData.activo} 
                                                onChange={e => setFormData({...formData, activo: parseInt(e.target.value)})} 
                                                className="dense-input"
                                            >
                                                <option value={1}>Publicado</option>
                                                <option value={0}>Borrador</option>
                                            </select>
                                        </div>
                                        <div className="dense-form-group" style={{ flex: 1 }}>
                                            <label>Orden</label>
                                            <input 
                                                type="number" 
                                                value={formData.orden} 
                                                onChange={e => setFormData({...formData, orden: parseInt(e.target.value)})} 
                                                className="dense-input" 
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="dense-form-group">
                                <label>Cargar {modalType === 'cta' ? 'Imagen de Fondo' : 'Video Vertical (MP4)'}</label>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="dense-input" 
                                    accept={modalType === 'cta' ? "image/*" : "video/*"} 
                                />
                                {previewImage && <img src={previewImage} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
                            </div>

                            <button type="submit" className="btn-admin-primary" style={{ width: '100%', marginTop: '10px' }}>
                                <Save size={16} /> {editingItem ? 'Guardar Cambios' : 'Crear Recurso'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCmsWeb;
