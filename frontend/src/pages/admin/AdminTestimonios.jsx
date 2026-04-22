import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon, 
    Star, MessageSquare, PieChart, Play, User, Calendar, Utensils, 
    Palette, Users, Award, ShieldCheck, Zap, Headphones
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { API_BASE_URL, getUploadUrl } from '../../config';
import { AdminInput, AdminTextarea, AdminIconButton } from '../../components/ui/AdminFormFields';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const AdminTestimonios = () => {
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | '360'
    const [testimonials, setTestimonials] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        event_title: '',
        message: '',
        es_visible: 1,
        image: null
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'manual') {
                const res = await fetch(`${API_BASE_URL}/admin/testimonials`);
                const data = await res.json();
                setTestimonials(data);
            } else {
                const res = await fetch(`${API_BASE_URL}/admin/encuestas`);
                const data = await res.json();
                setSurveys(data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null, type = 'manual') => {
        if (type === '360') {
            setEditingItem({ ...item, isSurvey: true });
            setFormData({
                name: item.nombre_cliente,
                event_title: item.titulo_evento || '',
                message: item.testimonio,
                es_visible: item.es_visible,
                image: item.foto_path
            });
            setPreviewImage(item.foto_path ? getUploadUrl(item.foto_path) : null);
        } else if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                event_title: item.event_title,
                message: item.message,
                es_visible: item.es_visible,
                image: item.image
            });
            setPreviewImage(item.image ? getUploadUrl(item.image) : null);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                event_title: '',
                message: '',
                es_visible: 1,
                image: null
            });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const handleViewAnalysis = (survey) => {
        setSelectedSurvey(survey);
        setIsAnalysisModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        
        if (editingItem?.isSurvey) {
            data.append('testimonio', formData.message);
            data.append('titulo_evento', formData.event_title);
            data.append('es_visible', formData.es_visible);
            data.append('foto_path', formData.image);
            if (formData.image instanceof File) {
                data.append('foto', formData.image);
            }
            
            try {
                const res = await fetch(`${API_BASE_URL}/admin/encuestas/${editingItem.id}`, {
                    method: 'PUT',
                    body: data
                });
                if (res.ok) {
                    setIsModalOpen(false);
                    fetchData();
                    Swal.fire({ title: '¡Actualizado!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                }
            } catch (err) { console.error(err); }
            return;
        }

        // Manual Testimonial logic (Original)
        data.append('name', formData.name);
        data.append('event_title', formData.event_title);
        data.append('message', formData.message);
        data.append('es_visible', formData.es_visible);
        if (formData.image instanceof File) {
            data.append('image', formData.image);
        } else if (editingItem) {
            data.append('image_path', editingItem.image);
        }

        try {
            const url = editingItem 
                ? `${API_BASE_URL}/testimonials/${editingItem.id}` 
                : `${API_BASE_URL}/testimonials`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: data });
            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                Swal.fire({ title: '¡Guardado!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            }
        } catch (err) { console.error(err); }
    };

    const toggleVisibility = async (item, type = 'manual') => {
        const newVisible = item.es_visible ? 0 : 1;
        try {
            if (type === '360') {
                const data = new FormData();
                data.append('es_visible', newVisible);
                data.append('testimonio', item.testimonio);
                data.append('titulo_evento', item.titulo_evento || '');
                data.append('foto_path', item.foto_path);
                
                await fetch(`${API_BASE_URL}/admin/encuestas/${item.id}`, {
                    method: 'PUT',
                    body: data
                });
            } else {
                const data = new FormData();
                data.append('name', item.name);
                data.append('es_visible', newVisible);
                data.append('event_title', item.event_title);
                data.append('message', item.message);
                data.append('image_path', item.image);

                await fetch(`${API_BASE_URL}/testimonials/${item.id}`, {
                    method: 'PUT',
                    body: data
                });
            }
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar testimonio?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff8484',
            confirmButtonText: 'Sí, eliminar'
        });
        if (!result.isConfirmed) return;

        try {
            await fetch(`${API_BASE_URL}/testimonials/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="admin-page-content admin-testimonio-page">
            <header className="admin-header-actions">
                <div className="header-info">
                    <h1>Testimonios y Feedback</h1>
                    <p>Gestiona las historias de tus clientes y analiza el éxito de tus eventos con 360°.</p>
                </div>
                {activeTab === 'manual' && (
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="btn-icon-tooltip primary"
                        title="Nuevo Testimonio"
                    >
                        <Plus size={22} />
                    </button>
                )}
            </header>

            <div className="tabs-container-premium">
                <button 
                    className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                >
                    <MessageSquare size={18} /> Testimonios Manuales
                </button>
                <button 
                    className={`tab-btn ${activeTab === '360' ? 'active' : ''}`}
                    onClick={() => setActiveTab('360')}
                >
                    <PieChart size={18} /> Experiencia 360
                    <span className="badge-new">NEW</span>
                </button>
            </div>

            {loading ? (
                <div className="admin-loading-luxe">
                    <div className="spinner-luxe"></div>
                    <span>Cargando datos especializados...</span>
                </div>
            ) : (
                <div className="admin-card-glass">
                    <table className="admin-table-premium">
                        <thead>
                            {activeTab === 'manual' ? (
                                <tr>
                                    <th>Imagen</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Testimonio</th>
                                    <th>Visibilidad</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Imagen</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Rating Gen.</th>
                                    <th>Análisis</th>
                                    <th>Visibilidad</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'manual' ? (
                                testimonials.map((item) => (
                                    <tr key={item.id}>
                                        <td className="td-image">
                                            {item.image ? (
                                                <img src={getUploadUrl(item.image)} alt={item.name} className="table-thumb" />
                                            ) : (
                                                <div className="table-thumb-placeholder"><ImageIcon size={16} /></div>
                                            )}
                                        </td>
                                        <td><strong>{item.name}</strong></td>
                                        <td>{item.event_title}</td>
                                        <td className="td-message"><p>{item.message.substring(0, 60)}...</p></td>
                                        <td>
                                            <AdminIconButton 
                                                variant={item.es_visible ? 'primary' : 'secondary'}
                                                onClick={() => toggleVisibility(item)}
                                                icon={item.es_visible ? Eye : EyeOff}
                                            />
                                        </td>
                                        <td className="table-actions">
                                            <div className="actions-flex-end">
                                                <AdminIconButton icon={Edit2} onClick={() => handleOpenModal(item)} variant="edit" size={16} />
                                                <AdminIconButton icon={Trash2} onClick={() => handleDelete(item.id)} variant="delete" size={16} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                surveys.map((item) => (
                                    <tr key={item.id}>
                                        <td className="td-image">
                                            {item.foto_path ? (
                                                <img src={getUploadUrl(item.foto_path)} alt={item.nombre_cliente} className="table-thumb" />
                                            ) : (
                                                <div className="table-thumb-placeholder"><ImageIcon size={16} /></div>
                                            )}
                                        </td>
                                        <td><strong>{item.nombre_cliente}</strong><br/><small>{new Date(item.fecha).toLocaleDateString()}</small></td>
                                        <td>{item.titulo_evento || 'Evento ArchiPlanner'}</td>
                                        <td>
                                            <div className="rating-mini">
                                                <Star className="filled" size={14} fill="#D4AF37" color="#D4AF37" />
                                                <span>{item.rating_general}/5</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-view-analysis" onClick={() => handleViewAnalysis(item)}>
                                                <PieChart size={14} /> Ver 360°
                                            </button>
                                        </td>
                                        <td>
                                            <AdminIconButton 
                                                variant={item.es_visible ? 'primary' : 'secondary'}
                                                onClick={() => toggleVisibility(item, '360')}
                                                icon={item.es_visible ? Eye : EyeOff}
                                            />
                                        </td>
                                        <td className="table-actions">
                                            <div className="actions-flex-end">
                                                <AdminIconButton icon={Edit2} onClick={() => handleOpenModal(item, '360')} variant="edit" size={16} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL: EDITAR (Manual / 360) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="admin-modal-overlay-premium">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="admin-modal-premium"
                        >
                            <div className="modal-header-premium">
                                <h2>{editingItem ? 'Editar Fuente de Testimonio' : 'Nuevo Testimonio'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="btn-close-modal"><X /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="admin-form">
                                <div className="form-group flex gap-4">
                                    <div className="form-group flex-2">
                                        <AdminInput 
                                            label="Nombre del Cliente"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            disabled={editingItem?.isSurvey}
                                            required
                                        />
                                    </div>
                                    <div className="form-group flex-3">
                                        <AdminInput 
                                            label="Título del Evento"
                                            value={formData.event_title}
                                            onChange={(e) => setFormData({...formData, event_title: e.target.value})}
                                            placeholder="Ej: Boda Editorial de Ensueño"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <AdminTextarea 
                                        label="Cita / Testimonio del Cliente"
                                        rows="4"
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        required
                                    />
                                    {editingItem?.isSurvey && <small className="hint-text">Este texto fue extraído automáticamente de la encuesta.</small>}
                                </div>

                                <div className="form-group">
                                    <label className="c-label">Imagen Destacada</label>
                                    <div className="image-upload-wrapper-premium" onClick={() => document.getElementById('file-input').click()}>
                                        {previewImage ? <img src={previewImage} alt="Preview" className="img-full-preview" /> : <div className="up-pl"><ImageIcon size={32}/><span>Subir Foto Profesional</span></div>}
                                        <input id="file-input" type="file" hidden onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData({...formData, image: file});
                                                setPreviewImage(URL.createObjectURL(file));
                                            }
                                        }} accept="image/*" />
                                    </div>
                                </div>

                                <label className="premium-checkbox-group">
                                    <input type="checkbox" checked={formData.es_visible === 1} onChange={(e) => setFormData({...formData, es_visible: e.target.checked ? 1 : 0})} />
                                    <span>Visible en el panel de testimonios de la web</span>
                                </label>

                                <div className="admin-form-footer">
                                    <Button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cerrar</Button>
                                    <Button type="submit" className="btn-primary"><Save size={18} /> Guardar Cambios</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: ANÁLISIS 360 DETALLADO */}
            <AnimatePresence>
                {isAnalysisModalOpen && selectedSurvey && (
                    <div className="admin-modal-overlay-premium">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="admin-modal-premium analysis-modal"
                        >
                            <div className="modal-header-premium luxe">
                                <div className="header-with-icon">
                                    <PieChart size={24} className="icon-luxe" />
                                    <div>
                                        <h2>Análisis de Experiencia 360°</h2>
                                        <p>Resultados detallados de <strong>{selectedSurvey.nombre_cliente}</strong></p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAnalysisModalOpen(false)} className="btn-close-modal"><X /></button>
                            </div>

                            <div className="analysis-content-grid">
                                {/* Columna Izquierda: Métricas */}
                                <div className="analysis-metrics">
                                    <MetricItem label="Profesionalismo" value={selectedSurvey.rating_profesionalismo} icon={Award} />
                                    <MetricItem label="Calidad de Materiales" value={selectedSurvey.rating_calidad} icon={ShieldCheck} />
                                    <MetricItem label="Comida / Catering" value={selectedSurvey.rating_comida} icon={Utensils} />
                                    <MetricItem label="Decoración / Amb." value={selectedSurvey.rating_decoracion} icon={Palette} />
                                    <MetricItem label="Atención Personal" value={selectedSurvey.rating_personal} icon={Users} />
                                    
                                    <div className="global-satisfaction">
                                        <span>Satisfacción Global</span>
                                        <div className="big-rating">{selectedSurvey.rating_general}/5</div>
                                        <div className="stars-row">
                                            {[1,2,3,4,5].map(s => <Star key={s} size={20} fill={s <= selectedSurvey.rating_general ? '#D4AF37' : 'transparent'} color={s <= selectedSurvey.rating_general ? '#D4AF37' : '#333'} />)}
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Multimedia & Testimonio */}
                                <div className="analysis-multimedia">
                                    <div className="media-section">
                                        <h3><MessageSquare size={16} /> Testimonio Original</h3>
                                        <p className="analysis-quote">"{selectedSurvey.testimonio}"</p>
                                    </div>

                                    {selectedSurvey.audio_path && (
                                        <div className="media-section">
                                            <h3><Headphones size={16} /> Evidencia de Voz</h3>
                                            <div className="audio-player-luxe">
                                                <audio src={getUploadUrl(selectedSurvey.audio_path)} controls />
                                            </div>
                                        </div>
                                    )}

                                    {selectedSurvey.foto_path && (
                                        <div className="media-section">
                                            <h3><ImageIcon size={16} /> Captura del Evento</h3>
                                            <div className="foto-evidence">
                                                <img src={getUploadUrl(selectedSurvey.foto_path)} alt="Evidencia" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="admin-form-footer border-top">
                                <Button onClick={() => setIsAnalysisModalOpen(false)} className="btn-primary">Entendido</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .tabs-container-premium { display: flex; gap: 10px; margin-bottom: 20px; }
                .tab-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 12px 20px; border-radius: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; }
                .tab-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
                .tab-btn.active { background: #ff8484; color: #000; border-color: #ff8484; box-shadow: 0 10px 20px rgba(255, 132, 132, 0.2); }
                .badge-new { font-size: 8px; background: #fff; color: #ff8484; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
                
                .admin-loading-luxe { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; gap: 20px; color: #888; }
                .spinner-luxe { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #ff8484; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .rating-mini { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #D4AF37; }
                .btn-view-analysis { background: rgba(212, 175, 55, 0.1); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.2); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
                .btn-view-analysis:hover { background: rgba(212, 175, 55, 0.2); transform: scale(1.05); }

                .analysis-modal { max-width: 900px !important; }
                .modal-header-premium.luxe { background: linear-gradient(135deg, #1a1a1c 0%, #111 100%); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .header-with-icon { display: flex; align-items: center; gap: 15px; }
                .icon-luxe { color: #ff8484; }

                .analysis-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 30px; }
                .analysis-metrics { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 25px; border: 1px solid rgba(255,255,255,0.05); }
                .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .m-info { display: flex; align-items: center; gap: 12px; color: #aaa; font-size: 14px; }
                .m-val { display: flex; gap: 4px; }
                .global-satisfaction { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed rgba(255,255,255,0.05); }
                .global-satisfaction span { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
                .big-rating { font-size: 48px; font-weight: 800; color: #fff; line-height: 1; margin: 10px 0; }
                .stars-row { display: flex; justify-content: center; gap: 6px; }

                .analysis-multimedia { display: flex; flex-direction: column; gap: 25px; }
                .media-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #ff8484; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .analysis-quote { font-style: italic; color: #ccc; line-height: 1.6; font-size: 15px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 16px; }
                .audio-player-luxe audio { width: 100%; height: 40px; }
                .foto-evidence { width: 100%; height: 200px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
                .foto-evidence img { width: 100%; height: 100%; object-fit: cover; }

                .image-upload-wrapper-premium { border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; height: 160px; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; }
                .image-upload-wrapper-premium:hover { border-color: #ff8484; background: rgba(255, 132, 132, 0.03); }
                .up-pl { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #666; }
                .img-full-preview { width: 100%; height: 100%; object-fit: cover; }
                
                @media (max-width: 800px) {
                    .analysis-content-grid { grid-template-columns: 1fr; }
                    .analysis-modal { height: 90vh; overflow-y: auto; }
                }
            `}</style>
        </div>
    );
};

const MetricItem = ({ label, value, icon: Icon }) => (
    <div className="metric-row">
        <div className="m-info"><Icon size={16}/><span>{label}</span></div>
        <div className="m-val">
            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= value ? '#ff8484' : 'transparent'} color={s <= value ? '#ff8484' : '#333'} />)}
        </div>
    </div>
);

export default AdminTestimonios;
