import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Save,
    X,
    Upload,
    ExternalLink,
    Layers,
    Filter,
    ArrowRight,
    Search,
    Calendar,
    Heart,
    ChevronRight,
    MoreHorizontal,
    Play
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import { UPLOADS_URL } from '../../config';

import { getImageUrl } from '../../utils/imageUtils';

// Define sensors outside to prevent re-creation and modal crashes on tab switch
const dndSensors = [
    { sensor: PointerSensor, options: { activationConstraint: { distance: 8 } } },
    { sensor: KeyboardSensor, options: { coordinateGetter: sortableKeyboardCoordinates } }
];

const SortableMediaItem = ({ m, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: m.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="media-preview-item">
            <div className="drag-handle" {...attributes} {...listeners}>
                {m.tipo === 'video' ? <Play size={14} /> : <ImageIcon size={14} />}
            </div>
            {m.tipo === 'video' ? (
                <div className="video-placeholder">
                    <Play size={24} opacity={0.3} />
                    <span>Video</span>
                </div>
            ) : (
                <img src={getImageUrl(m.url)} alt="" />
            )}
            <button type="button" onClick={() => onRemove(m.id)} className="remove-media">
                <X size={14} />
            </button>
        </div>
    );
};

const AdminGallery = () => {
    const [eventos, setEventos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('eventos');
    const [uploading, setUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        narrativa: '',
        categoria_id: '',
        activo: 1,
        portada: null,
        portada_url_path: '',
        media: [],
        en_hero: 0,
        metadata: { paleta: ['#D4AF37', '#F5E6E8'], mensaje_novios: '', portada_focal: '50% 50%' },
        _tab: 'info'
    });

    // Stable sensors definition using the dndSensors config
    const sensors = useSensors(
        useSensor(PointerSensor, dndSensors[0].options),
        useSensor(KeyboardSensor, dndSensors[1].options)
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [evRes, catRes] = await Promise.all([
                api.get('/galeria/eventos'),
                api.get('/galeria/categorias')
            ]);
            setEventos(evRes.data);
            setCategorias(catRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFocalPointClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calcular porcentaje relativo al contenedor
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
        const focalValue = `${x}% ${y}%`;
        
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, portada_focal: focalValue }
        }));
    };

    const handleOpenEventModal = async (evento = null) => {
        if (evento) {
            try {
                // Fetch full event details including media
                const res = await api.get(`/galeria/eventos/${evento.id}`);
                const fullEvent = res.data;

                // Parse metadata if it's a string
                if (fullEvent.metadata && typeof fullEvent.metadata === 'string') {
                    fullEvent.metadata = JSON.parse(fullEvent.metadata);
                }

                setEditingItem(fullEvent);
                const sortedMedia = fullEvent.media ? [...fullEvent.media].sort((a, b) => (a.orden || 0) - (b.orden || 0)) : [];

                setFormData({
                    ...fullEvent,
                    portada: null,
                    portada_url_path: fullEvent.portada_url || fullEvent.portada || '',
                    media: sortedMedia,
                    en_hero: fullEvent.en_hero || 0,
                    metadata: fullEvent.metadata || { paleta: ['#D4AF37', '#F5E6E8'], mensaje_novios: '' },
                    _tab: 'info'
                });
            } catch (err) {
                console.error('Error fetching event details', err);
            }
        } else {
            setEditingItem(null);
            setFormData({
                titulo: '',
                descripcion: '',
                narrativa: '',
                categoria_id: categorias[0]?.id || '',
                activo: 1,
                portada: null,
                portada_url_path: '',
                media: [],
                en_hero: 0,
                metadata: { paleta: ['#D4AF37', '#F5E6E8'], mensaje_novios: '' },
                _tab: 'info'
            });
        }
        setIsEventModalOpen(true);
    };

    const handleOpenCatModal = (cat = null) => {
        if (cat) {
            setEditingItem(cat);
            setFormData({ ...cat });
        } else {
            setEditingItem(null);
            setFormData({ nombre: '', slug: '' });
        }
        setIsCatModalOpen(true);
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'portada' && formData[key]) {
                    data.append('portada', formData[key]);
                } else if (key === 'metadata') {
                    data.append('metadata', JSON.stringify(formData[key]));
                } else if (key === 'portada_url_path') {
                    // Solo enviar la ruta existente si no es un nuevo blob de preview
                    if (formData[key] && !formData[key].startsWith('blob:')) {
                        data.append('portada_url_path', formData[key]);
                    }
                } else if (key !== 'media' && key !== '_tab' && key !== 'portada') {
                    data.append(key, formData[key]);
                }
            });

            let res;
            if (editingItem) {
                res = await api.put(`/galeria/eventos/${editingItem.id}`, data);
            } else {
                res = await api.post('/galeria/eventos', data);
                // Si es nuevo, capturamos el ID para permitir subir multimedia sin cerrar
                if (res.data.success && res.data.id) {
                    setEditingItem({ ...formData, id: res.data.id });
                    setFormData(prev => ({ ...prev, id: res.data.id, _tab: 'media' }));
                }
            }
            fetchData();
            if (editingItem) setIsEventModalOpen(false);
        } catch (err) {
            console.error('Error saving evento', err);
            alert('Error al guardar: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/galeria/categorias/${editingItem.id}`, formData);
            } else {
                await api.post('/galeria/categorias', formData);
            }
            fetchData();
            setIsCatModalOpen(false);
        } catch (err) {
            console.error('Error saving categoria', err);
        }
    };

    const handleBulkUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let targetId = editingItem?.id;

        if (!targetId) {
            if (!formData.titulo?.trim()) {
                return alert('Por favor, ingresa un TÍTULO para el evento antes de subir contenido multimedia.');
            }
            if (window.confirm('Para subir contenido multimedia, debemos crear un registro primero con el título "' + formData.titulo + '". ¿Guardar borrador ahora?')) {
                try {
                    const data = new FormData();
                    Object.keys(formData).forEach(key => {
                        if (key === 'portada' && formData[key]) {
                            // Si es un archivo, enviarlo como file; si es string, enviarlo como portada_url_path
                            if (formData[key] instanceof File) {
                                data.append('portada', formData[key]);
                            } else {
                                data.append('portada_url_path', formData[key]);
                            }
                        }
                        else if (key === 'metadata') data.append('metadata', JSON.stringify(formData[key]));
                        else if (key !== 'media' && key !== '_tab' && key !== 'portada') data.append(key, formData[key] === null ? '' : formData[key]);
                    });
                    
                    const res = await api.post('/galeria/eventos', data);
                    if (res.data.success) {
                        targetId = res.data.id;
                        const newEvent = { ...formData, id: targetId };
                        setEditingItem(newEvent);
                        setFormData(prev => ({ ...prev, id: targetId, _tab: 'media' }));
                        fetchData();
                    } else {
                        return alert('No se pudo crear el evento: ' + (res.data.error || 'Respuesta inesperada'));
                    }
                } catch (err) {
                    console.error('Auto-save failed', err);
                    return alert('Error al guardar. Verifica los campos requeridos.');
                }
            } else {
                return;
            }
        }

        setUploading(true);
        try {
            const data = new FormData();
            files.forEach(file => data.append('files', file));
            
            const res = await api.post(`/galeria/eventos/${targetId}/media/bulk`, data);

            if (res.data.success && res.data.media) {
                setFormData(prev => ({
                    ...prev,
                    media: [...(prev.media || []), ...res.data.media].sort((a, b) => a.orden - b.orden)
                }));
                // Success feedback
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                alert('Error al subir: ' + (res.data.error || 'Respuesta inesperada del servidor'));
            }
        } catch (err) {
            console.error('Bulk upload failed', err);
            const errMsg = err.response?.data?.error || err.message || 'Error desconocido';
            alert('Falló la carga de archivos: ' + errMsg);
        } finally {
            setUploading(false);
            // Reset input so it can be used again for same files
            e.target.value = '';
        }
    };

    const handleAddEmbed = async (url) => {
        if (!editingItem) return;
        try {
            const res = await api.post(`/galeria/eventos/${editingItem.id}/media/embed`, { url });
            setFormData(prev => ({
                ...prev,
                media: [...prev.media, res.data.media].sort((a, b) => a.orden - b.orden)
            }));
        } catch (err) {
            console.error('Embed failed', err);
        }
    };

    const handleDeleteMedia = async (id) => {
        try {
            await api.delete(`/galeria/media/${id}`);
            setFormData(prev => ({
                ...prev,
                media: prev.media.filter(m => m.id !== id)
            }));
        } catch (err) {
            console.error('Delete media failed', err);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = formData.media.findIndex(m => m.id === active.id);
        const newIndex = formData.media.findIndex(m => m.id === over.id);

        const newMedia = arrayMove(formData.media, oldIndex, newIndex);
        setFormData({ ...formData, media: newMedia });

        setSaveStatus('saving');
        try {
            const orderData = newMedia.map((m, index) => ({ id: m.id, orden: index }));
            await api.put(`/galeria/eventos/${editingItem.id}/media/reorder`, { orderData });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (err) {
            console.error('Reorder failed', err);
            setSaveStatus('error');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta historia?')) {
            try {
                await api.delete(`/galeria/eventos/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting event', err);
            }
        }
    };

    const handlePaletteChange = (index, color) => {
        const newPaleta = [...formData.metadata.paleta];
        newPaleta[index] = color;
        setFormData({ ...formData, metadata: { ...formData.metadata, paleta: newPaleta } });
    };

    const addPaletteColor = () => {
        if (formData.metadata.paleta.length < 5) {
            setFormData({
                ...formData,
                metadata: {
                    ...formData.metadata,
                    paleta: [...formData.metadata.paleta, '#ffffff']
                }
            });
        }
    };

    const removePaletteColor = (index) => {
        const newPaleta = formData.metadata.paleta.filter((_, i) => i !== index);
        setFormData({ ...formData, metadata: { ...formData.metadata, paleta: newPaleta } });
    };

    if (loading) return <div className="admin-loader">Gestionando Experiencias...</div>;

    return (
        <div className="admin-page-container fade-in">
            <div className="admin-header-flex">
                <div>
                    <h1 className="admin-title">Galería de Experiencias</h1>
                    <p className="admin-subtitle">Crea historias visuales y organiza eventos por categorías</p>
                </div>
                <div className="admin-tab-nav">
                    <button className={`admin-tab-btn ${activeTab === 'eventos' ? 'active' : ''}`} onClick={() => setActiveTab('eventos')}>
                        <Layers size={16} /> Eventos
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'categorias' ? 'active' : ''}`} onClick={() => setActiveTab('categorias')}>
                        <Filter size={16} /> Categorías
                    </button>
                </div>
            </div>

            <div className="admin-content-card mt-24">
                {activeTab === 'eventos' && (
                    <div className="eventos-list glass-panel" style={{ padding: '24px' }}>
                        <div className="tab-header-actions">
                            <h3 className="editorial-title">Proyectos y Eventos</h3>
                            <button className="btn-admin-primary" onClick={() => handleOpenEventModal()}>
                                <Plus size={18} /> Nueva Historia
                            </button>
                        </div>

                        <div className="admin-gallery-list">
                            {eventos.map((e) => (
                                <div key={e.id} className="admin-gallery-item">
                                    <div className="editorial-thumb">
                                        {e.portada_url || e.portada ? (
                                            <img src={getImageUrl(e.portada_url || e.portada)} alt="" />
                                        ) : (
                                            <div className="thumb-placeholder"><ImageIcon size={20} /></div>
                                        )}
                                    </div>
                                    <div className="editorial-info">
                                        <span className="editorial-event-title" style={{ fontWeight: '600', fontSize: '15px', color: '#fff' }}>{e.titulo}</span>
                                        <span className="editorial-category-tag" style={{ fontSize: '11px', opacity: '0.6', textTransform: 'uppercase', letterSpacing: '1px' }}>{e.categoria_nombre}</span>
                                    </div>
                                    <div className="flex-center gap-12" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                                        <span className={`status-badge ${e.activo ? 'public' : 'draft'}`}>
                                            {e.activo ? 'Público' : 'Borrador'}
                                        </span>
                                        <div className="block-actions" style={{ border: 'none', background: 'none', display: 'flex', gap: '8px' }}>
                                            {e.en_hero === 1 && <Heart size={14} fill="currentColor" className="text-primary" />}
                                            <button className="action-btn" onClick={() => handleOpenEventModal(e)}><Edit2 size={14} /></button>
                                            <button className="action-btn delete" onClick={() => handleDeleteEvent(e.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'categorias' && (
                    <div className="categorias-list glass-panel" style={{ padding: '24px' }}>
                        <div className="tab-header-actions">
                            <h3>Gestión de Categorías</h3>
                            <button className="btn-admin-primary" onClick={() => handleOpenCatModal()}>
                                <Plus size={18} /> Nueva Categoría
                            </button>
                        </div>
                        <div className="admin-table-container mt-24">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Slug (Link)</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorias.map(cat => (
                                        <tr key={cat.id}>
                                            <td style={{ fontWeight: '600' }}>{cat.nombre}</td>
                                            <td><code>{cat.slug}</code></td>
                                            <td>
                                                <div className="actions-flex-end">
                                                    <button className="action-btn" onClick={() => handleOpenCatModal(cat)}><Edit2 size={14} /></button>
                                                    <button className="action-btn delete" onClick={() => {
                                                        if (window.confirm('¿Borrar categoría?')) api.delete(`/galeria/categorias/${cat.id}`).then(fetchData);
                                                    }}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Event Modal */}
            {isEventModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ width: '1000px', maxWidth: '95vw', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-search-bar" style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div className="flex-center gap-24">
                                <h3 className="m-0 editorial-title" style={{ fontSize: '18px' }}>{editingItem ? 'Editar Historia de Evento' : 'Nueva Experiencia'}</h3>
                                <div className="flex-center gap-8">
                                    {['info', 'historia', 'media'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`tab-btn-modern ${formData._tab === t || (!formData._tab && t === 'info') ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, _tab: t })}
                                        >
                                            {t === 'info' && 'Información'}
                                            {t === 'historia' && 'Historia & Romance'}
                                            {t === 'media' && 'Multimedia'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button className="action-btn" type="button" onClick={() => setIsEventModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="modal-body-scroll" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                            <form onSubmit={handleEventSubmit} id="event-form">
                                {(formData._tab === 'info' || !formData._tab) && (
                                    <div className="fade-in grid-2 gap-32">
                                        <div className="dense-grid">
                                            <div className="dense-form-group mb-20">
                                                <label>Título del Evento</label>
                                                <input type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required className="dense-input" />
                                            </div>
                                            <div className="compact-grid-2 mb-20">
                                                <div className="dense-form-group">
                                                    <label>Categoría</label>
                                                    <select value={formData.categoria_id} onChange={e => setFormData({ ...formData, categoria_id: e.target.value })} className="dense-input">
                                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                    </select>
                                                </div>
                                                <div className="dense-form-group">
                                                    <label>Estado</label>
                                                    <select value={formData.activo} onChange={e => setFormData({ ...formData, activo: parseInt(e.target.value) })} className="dense-input">
                                                        <option value={1}>Publicado</option>
                                                        <option value={0}>Borrador</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="dense-form-group mt-12 glass-panel" style={{ padding: '12px', border: formData.en_hero ? '1px solid var(--color-primary-dim)' : '1px solid transparent' }}>
                                                <label className="flex-center gap-12" style={{ cursor: 'pointer', justifyContent: 'flex-start' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.en_hero === 1}
                                                        onChange={e => setFormData({ ...formData, en_hero: e.target.checked ? 1 : 0 })}
                                                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                                    />
                                                    <div>
                                                        <span style={{ fontWeight: '600', fontSize: '13px', display: 'block' }}>Destacar en Hero Moderno</span>
                                                        <span style={{ fontSize: '11px', opacity: '0.6' }}>Permite que esta historia aparezca en el carrusel de la página de inicio.</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="preview-side">
                                            <label className="section-label">Imagen de Portada (Hero)</label>
                                            <label className="premium-image-uploader glass-panel h-auto">
                                                <input
                                                    type="file"
                                                    onChange={e => setFormData({ ...formData, portada: e.target.files[0], portada_url_path: URL.createObjectURL(e.target.files[0]) })}
                                                    style={{ display: 'none' }}
                                                />
                                                {formData.portada_url_path ? (
                                                    <>
                                                        <img
                                                            src={formData.portada_url_path.startsWith('blob:') ? formData.portada_url_path : getImageUrl(formData.portada_url_path)}
                                                            alt="Preview"
                                                            style={{ objectPosition: formData.metadata?.portada_focal || 'center' }}
                                                        />
                                                        <div className="uploader-overlay">
                                                            <div className="uploader-icon"><Upload size={24} /></div>
                                                            <span className="font-semibold">Cambiar Imagen</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="empty-uploader-state">
                                                        <Plus size={48} opacity={0.2} />
                                                        <span>Subir Foto de Portada</span>
                                                    </div>
                                                )}
                                            </label>
                                            <p className="text-xs opacity-40 mt-12 text-center">Dimensiones recomendadas: 1920x1080px (Horizontal)</p>

                                            {/* Focal Point Selector */}
                                            <div className="mt-24 glass-panel" style={{ padding: '16px' }}>
                                                <label className="section-label mb-8 block" style={{ fontSize: '11px' }}>Corte / Punto de Enfoque</label>
                                                <div 
                                                   className="focal-point-selector-wrapper glass-panel"
                                                   onClick={handleFocalPointClick}
                                                   style={{ 
                                                       position: 'relative', 
                                                       cursor: 'crosshair', 
                                                       overflow: 'hidden', 
                                                       borderRadius: '12px',
                                                       background: '#1a1a1a'
                                                   }}
                                                >
                                                   {formData.portada_url_path ? (
                                                       <div style={{ position: 'relative' }}>
                                                           <img 
                                                               src={formData.portada_url_path.startsWith('blob:') ? formData.portada_url_path : getImageUrl(formData.portada_url_path)}
                                                               alt="Focal adjust"
                                                               style={{ width: '100%', height: 'auto', display: 'block' }}
                                                           />
                                                           <div className="focal-marker" style={{
                                                               left: formData.metadata?.portada_focal?.includes('%') ? formData.metadata.portada_focal.split(' ')[0] : '50%',
                                                               top: (formData.metadata?.portada_focal?.includes('%') && formData.metadata.portada_focal.split(' ').length > 1) ? formData.metadata.portada_focal.split(' ')[1] : '50%'
                                                           }}>
                                                               <div className="focal-marker-inner"></div>
                                                           </div>
                                                       </div>
                                                   ) : (
                                                       <div className="empty-focal-state" style={{ padding: '60px', textAlign: 'center', opacity: 0.2 }}>
                                                           <Plus size={40} />
                                                           <p className="mt-12">Sube una portada primero</p>
                                                       </div>
                                                   )}
                                                </div>
                                                <p className="text-xs opacity-30 mt-12">Define qué parte de la foto se priorizará en la grilla pública.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData._tab === 'historia' && (
                                    <div className="fade-in grid-2 gap-32">
                                        <div className="dense-form-group">
                                            <label>Narrativa Editorial (Storytelling)</label>
                                            <textarea
                                                rows={12}
                                                value={formData.narrativa}
                                                onChange={e => setFormData({ ...formData, narrativa: e.target.value })}
                                                className="dense-input font-serif"
                                                placeholder="Comienza el relato de esta historia de amor..."
                                            />
                                        </div>
                                        <div className="editorial-meta-box property-sidebar glass-panel" style={{ padding: '20px' }}>
                                            <h4 className="text-primary mb-20 flex-center gap-8" style={{ fontSize: '12px', textTransform: 'uppercase' }}><Layers size={14} /> Estética Romántica</h4>

                                            <div className="dense-form-group mb-20">
                                                <label>Mensaje de los Novios (Personalizado)</label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.metadata?.mensaje_novios || ''}
                                                    onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, mensaje_novios: e.target.value } })}
                                                    className="dense-input"
                                                    placeholder="Un pequeño mensaje de la pareja..."
                                                />
                                            </div>

                                            <div className="dense-form-group">
                                                <label>Paleta de Colores (Estética)</label>
                                                <div className="flex-center gap-12 flex-wrap mt-8" style={{ display: 'flex', flexDirection: 'row' }}>
                                                    {(formData.metadata?.paleta || []).map((c, i) => (
                                                        <div key={i} className="admin-color-swatch-wrapper">
                                                            <div className="admin-color-swatch-picker">
                                                                <input
                                                                    type="color"
                                                                    value={c}
                                                                    onChange={e => handlePaletteChange(i, e.target.value)}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-color-btn"
                                                                onClick={() => removePaletteColor(i)}
                                                            >
                                                                <X size={8} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={addPaletteColor} className="btn-admin-outline" style={{ padding: '0', borderRadius: '50%', height: '38px', width: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs opacity-40 mt-12">Selecciona los colores característicos de este evento para el diseño editorial.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData._tab === 'media' && formData.media && (
                                    <div className="fade-in gallery-media-manager">
                                        <div className="tab-header-actions mb-24 glass-panel" style={{ padding: '16px 24px', borderRadius: '12px' }}>
                                            <div className="flex-center gap-16">
                                                <h4 className="m-0 editorial-title">Contenido Multimedia</h4>
                                                {saveStatus === 'saving' && <span className="text-xs opacity-50 italic">Sincronizando...</span>}
                                                {saveStatus === 'saved' && <span className="text-xs text-primary italic">Guardado</span>}
                                            </div>
                                            <div className="flex-center gap-12">
                                                <label className="btn-admin-primary" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '12px' }}>
                                                    <Upload size={14} /> Subir Fotos
                                                    <input type="file" multiple onChange={handleBulkUpload} style={{ display: 'none' }} />
                                                </label>
                                                <button type="button" onClick={() => {
                                                    const url = prompt('URL del video (YouTube/Vimeo):');
                                                    if (url) handleAddEmbed(url);
                                                }} className="btn-admin-outline" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                    <Play size={14} /> Añadir Video
                                                </button>
                                            </div>
                                        </div>
                                        {uploading && <div className="upload-progress-overlay">Subiendo contenido...</div>}

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={(formData.media || []).map(m => m.id).filter(id => id !== undefined)}
                                                strategy={rectSortingStrategy}
                                            >
                                                <div className="media-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                                                    {formData.media?.map(m => (
                                                        <SortableMediaItem key={m.id} m={m} onRemove={handleDeleteMedia} />
                                                    ))}
                                                    <label className="media-add-placeholder">
                                                        <Plus size={30} opacity={0.2} />
                                                        <input type="file" multiple onChange={handleBulkUpload} style={{ display: 'none' }} />
                                                    </label>
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="modal-footer-sticky" style={{ flexShrink: 0, padding: '20px 32px', background: 'rgba(13,13,14,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" form="event-form" className="btn-admin-primary" style={{ padding: '12px 30px' }}>
                                <Save size={18} /> Guardar Todos los Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCatModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ width: '400px' }}>
                        <div className="modal-search-bar">
                            <h3>{editingItem ? 'Editar' : 'Nueva'} Categoría</h3>
                            <button className="action-btn" onClick={() => setIsCatModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCatSubmit} className="modal-body-scroll dense-grid" style={{ padding: '24px' }}>
                            <div className="dense-form-group">
                                <label>Nombre</label>
                                <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} required className="dense-input" />
                            </div>
                            <div className="dense-form-group">
                                <label>Slug (URL)</label>
                                <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required className="dense-input" />
                            </div>
                            <button type="submit" className="btn-admin-primary mt-12 w-full"><Save size={18} /> Guardar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
