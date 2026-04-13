import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { API_BASE_URL, UPLOADS_URL } from '../../config';
import { AdminInput, AdminTextarea, AdminIconButton } from '../../components/ui/AdminFormFields';

const AdminTestimonios = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
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
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/testimonials`);
            const data = await res.json();
            setTestimonials(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching testimonials:', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                event_title: item.event_title,
                message: item.message,
                es_visible: item.es_visible,
                image: null
            });
            setPreviewImage(item.image ? `${UPLOADS_URL}${item.image}` : null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('event_title', formData.event_title);
        data.append('message', formData.message);
        data.append('es_visible', formData.es_visible);
        if (formData.image) {
            data.append('image', formData.image);
        } else if (editingItem) {
            data.append('image_path', editingItem.image);
        }

        try {
            const url = editingItem 
                ? `${API_BASE_URL}/testimonials/${editingItem.id}` 
                : `${API_BASE_URL}/testimonials`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: data
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchTestimonials();
            }
        } catch (err) {
            console.error('Error saving testimonial:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) return;
        try {
            await fetch(`${API_BASE_URL}/testimonials/${id}`, { method: 'DELETE' });
            fetchTestimonials();
        } catch (err) {
            console.error('Error deleting testimonial:', err);
        }
    };

    const toggleVisibility = async (item) => {
        const newVisible = item.es_visible ? 0 : 1;
        const data = new FormData();
        data.append('name', item.name);
        data.append('event_title', item.event_title);
        data.append('message', item.message);
        data.append('es_visible', newVisible);
        data.append('image_path', item.image);

        try {
            await fetch(`${API_BASE_URL}/testimonials/${item.id}`, {
                method: 'PUT',
                body: data
            });
            fetchTestimonials();
        } catch (err) {
            console.error('Error toggling visibility:', err);
        }
    };

    if (loading) return <div className="admin-loading">Cargando testimonios...</div>;

    return (
        <div className="admin-page-content admin-testimonio-page">
            <header className="admin-header-actions">
                <div className="header-info">
                    <h1>Testimonios</h1>
                    <p>Gestiona las historias y experiencias de tus clientes en la web.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus size={18} /> Nuevo Testimonio
                </Button>
            </header>

            <div className="admin-card-glass">
                <table className="admin-table-premium">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Cliente</th>
                            <th>Evento</th>
                            <th>Testimonio</th>
                            <th>Visibilidad</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testimonials.map((item) => (
                            <tr key={item.id}>
                                <td className="td-image">
                                    {item.image ? (
                                        <img src={`${UPLOADS_URL}${item.image}`} alt={item.name} className="table-thumb" />
                                    ) : (
                                        <div className="table-thumb-placeholder"><ImageIcon size={16} /></div>
                                    )}
                                </td>
                                <td><strong>{item.name}</strong></td>
                                <td>{item.event_title}</td>
                                <td className="td-message"><p title={item.message}>{item.message.substring(0, 60)}...</p></td>
                                <td>
                                    <AdminIconButton 
                                        variant={item.es_visible ? 'primary' : 'secondary'}
                                        onClick={() => toggleVisibility(item)}
                                        title={item.es_visible ? 'Visible en la web' : 'Oculto en la web'}
                                        icon={item.es_visible ? Eye : EyeOff}
                                    />
                                </td>
                                <td className="table-actions">
                                    <div className="actions-flex-end">
                                        <AdminIconButton icon={Edit2} onClick={() => handleOpenModal(item)} variant="edit" title="Editar" size={16} />
                                        <AdminIconButton icon={Trash2} onClick={() => handleDelete(item.id)} variant="delete" title="Eliminar" size={16} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay-premium">
                    <div className="admin-modal-premium">
                        <div className="modal-header-premium">
                            <h2>{editingItem ? 'Editar Testimonio' : 'Nuevo Testimonio'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                                <div className="form-group flex gap-4">
                                    <div className="form-group flex-1">
                                        <AdminInput 
                                            label="Nombre del Cliente"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <AdminInput 
                                            label="Título del Evento / Rol"
                                            name="event_title"
                                            value={formData.event_title}
                                            onChange={(e) => setFormData({...formData, event_title: e.target.value})}
                                            placeholder="Ej: Boda Editorial, Quinceañera"
                                            required
                                        />
                                    </div>
                                </div>

                            <div className="form-group">
                                <AdminTextarea 
                                    label="Testimonio (Cita)"
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="c-label">Imagen de Perfil</label>
                                <div className="image-upload-wrapper-premium">
                                    {previewImage ? (
                                        <div className="preview-container">
                                            <img src={previewImage} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <ImageIcon size={32} />
                                            <span>Haz clic o arrastra una imagen</span>
                                            <small>(Recomendado: 400x400px)</small>
                                        </div>
                                    )}
                                    <input type="file" onChange={handleFileChange} accept="image/*" />
                                </div>
                            </div>

                            <label className="premium-checkbox-group">
                                <input 
                                    type="checkbox" 
                                    checked={formData.es_visible === 1}
                                    onChange={(e) => setFormData({...formData, es_visible: e.target.checked ? 1 : 0})}
                                />
                                <span>Visible en la página web</span>
                            </label>

                            <div className="admin-form-footer">
                                <Button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</Button>
                                <Button type="submit" className="btn-primary"><Save size={18} /> Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .admin-testimonio-page {
                    animation: fadeIn 0.5s ease;
                }
                .td-image {
                    width: 80px;
                }
                .table-thumb {
                    width: 64px;
                    height: 64px;
                    object-fit: cover;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    transition: transform 0.2s ease;
                }
                .table-thumb:hover {
                    transform: scale(1.1);
                }
                .table-thumb-placeholder {
                    width: 64px;
                    height: 64px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-dim);
                }
                .td-message p {
                    max-width: 400px;
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                    opacity: 0.8;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .image-upload-wrapper-premium {
                    position: relative;
                    border: 2px dashed rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    min-height: 160px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .image-upload-wrapper-premium:hover {
                    border-color: var(--color-primary);
                    background: rgba(255, 132, 132, 0.05);
                }
                .preview-container {
                    width: 120px;
                    height: 120px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 2px solid var(--color-primary);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                }
                .preview-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: var(--color-text-dim);
                    text-align: center;
                }
                .upload-placeholder span {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                }
                .admin-modal-overlay-premium {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .admin-modal-premium {
                    background: #1a1a1c;
                    width: 100%;
                    max-width: 650px;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes modalScaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AdminTestimonios;
