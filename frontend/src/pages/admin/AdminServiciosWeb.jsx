import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Layout, Eye, EyeOff } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import Button from '../../components/ui/Button';
import { API_BASE_URL, UPLOADS_URL } from '../../config';
import { AdminInput, AdminIconButton, AdminImageUpload } from '../../components/ui/AdminFormFields';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Editor theme

const AdminServiciosWeb = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        tag: '',
        icono_svg: '',
        descripcion: '',
        link: '/contacto',
        seccion: 'principales',
        visible: 1,
        orden: 0,
        imagen: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/servicios`);
            const data = await res.json();
            setServicios(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching servicios:', err);
            setLoading(false);
        }
    };



    const handleOpenModal = (servicio = null) => {

        if (servicio) {
            setFormData({
                titulo: servicio.titulo,
                tag: servicio.tag,
                icono_svg: servicio.icono_svg || '',
                descripcion: servicio.descripcion,
                link: servicio.link,
                seccion: servicio.seccion,
                visible: servicio.visible,
                orden: servicio.orden,
                imagen: null,
                imagen_path: servicio.imagen
            });
            setPreviewImage(servicio.imagen ? getImageUrl(servicio.imagen) : null);
            setEditingId(servicio.id);
        } else {
            setFormData({
                titulo: '',
                tag: '',
                icono_svg: '',
                descripcion: '',
                link: '/contacto',
                seccion: 'principales',
                visible: 1,
                orden: servicios.length + 1,
                imagen: null
            });
            setPreviewImage(null);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imagen: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            const url = editingId 
                ? `${API_BASE_URL}/servicios/${editingId}` 
                : `${API_BASE_URL}/servicios`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: data
            });

            if (res.ok) {
                fetchServicios();
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error('Error saving servicio:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este área?')) return;
        try {
            await fetch(`${API_BASE_URL}/servicios/${id}`, { method: 'DELETE' });
            fetchServicios();
        } catch (err) {
            console.error('Error deleting servicio:', err);
        }
    };

    const toggleVisibility = async (servicio) => {
        try {
            await fetch(`${API_BASE_URL}/servicios/${servicio.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...servicio, visible: servicio.visible === 1 ? 0 : 1, imagen_path: servicio.imagen })
            });
            fetchServicios();
        } catch (err) {
            console.error('Error toggling visibility:', err);
        }
    };

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    if (loading) return <div className="admin-loading">Cargando gestión de áreas...</div>;

    return (
        <div className="admin-page-container">
            <header className="admin-header-premium">
                <div className="header-info">
                    <h1>Gestión de Áreas y Servicios</h1>
                    <p>Configura las experiencias que se muestran en la página principal.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="btn-icon-tooltip primary"
                    title="Nueva Área"
                >
                    <Plus size={22} />
                </button>
            </header>

            <div className="admin-grid-premium">
                {['principales', 'sociales'].map(section => (
                    <div key={section} className="admin-card-glass section-group">
                        <header className="section-header-compact">
                            <h3>{section === 'principales' ? 'Servicios Destacados' : 'Sociales y Familiares'}</h3>
                            <span className="count-tag">{servicios.filter(s => s.seccion === section).length} items</span>
                        </header>

                        <div className="admin-table-wrapper">
                            <table className="admin-table-premium">
                                <thead>
                                    <tr>
                                        <th>Imagen</th>
                                        <th>Título / Tag</th>
                                        <th>Estado</th>
                                        <th>Orden</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {servicios.filter(s => s.seccion === section).map((s) => (
                                        <tr key={s.id} className={s.visible === 0 ? 'row-dimmed' : ''}>
                                            <td className="td-image">
                                                {s.icono_svg ? (
                                                    <div className="table-thumb" dangerouslySetInnerHTML={{ __html: s.icono_svg }} />
                                                ) : s.imagen ? (
                                                    <img src={getImageUrl(s.imagen)} alt={s.titulo} className="table-thumb" />
                                                ) : (
                                                    <div className="table-thumb-placeholder">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="td-info">
                                                    <strong>{s.titulo}</strong>
                                                    <span>{s.tag}</span>
                                                </div>
                                            </td>
                                            <td>
                                                    <AdminIconButton 
                                                        variant={s.visible === 1 ? 'primary' : 'secondary'}
                                                        onClick={() => toggleVisibility(s)}
                                                        title={s.visible === 1 ? 'Visible en la web' : 'Oculto en la web'}
                                                        icon={s.visible === 1 ? Eye : EyeOff}
                                                        size={14}
                                                    />
                                            </td>
                                            <td>
                                                <span className="order-badge">#{s.orden}</span>
                                            </td>
                                            <td className="text-right">
                                                <div className="actions-flex-end">
                                                    <AdminIconButton 
                                                        icon={Edit2} 
                                                        onClick={() => handleOpenModal(s)} 
                                                        variant="edit" 
                                                        title="Editar" 
                                                        size={16} 
                                                    />
                                                    <AdminIconButton 
                                                        icon={Trash2} 
                                                        onClick={() => handleDelete(s.id)} 
                                                        variant="delete" 
                                                        title="Eliminar" 
                                                        size={16} 
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-premium">
                        <header className="modal-header-premium">
                            <h2>{editingId ? 'Editar Área' : 'Nueva Área'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal"><X size={20} /></button>
                        </header>

                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="modal-form-cols">
                                {/* Columna Izquierda: Imagen */}
                                <div className="modal-col-left">
                                    <AdminImageUpload 
                                        label="Imagen de Portada"
                                        name="imagen"
                                        value={formData.imagen || formData.imagen_path}
                                        onChange={(e) => {
                                            const file = e.target.value;
                                            setFormData({...formData, imagen: file});
                                            if (file instanceof File) {
                                                setPreviewImage(URL.createObjectURL(file));
                                            }
                                        }}
                                        required
                                    />
                                    
                                    <div className="form-group" style={{ marginTop: '20px' }}>
                                        <label className="c-label-premium">Sección</label>
                                        <select 
                                            className="input-globo"
                                            value={formData.seccion}
                                            onChange={(e) => setFormData({...formData, seccion: e.target.value})}
                                        >
                                            <option value="principales">Destacados (Con Imagen)</option>
                                            <option value="sociales">Sociales (Tarjetas de Texto)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Columna Derecha: Datos */}
                                <div className="modal-col-right">
                                    <div className="form-grid-2">
                                        <AdminInput 
                                            label="Título de la Área"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                            required
                                        />
                                        <AdminInput 
                                            label="Etiqueta / Rol"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <label className="c-label-premium">Descripción del Servicio (Editor Visual)</label>
                                        <div className="quill-premium-wrapper">
                                            <ReactQuill 
                                                theme="snow"
                                                value={formData.descripcion}
                                                onChange={(content) => setFormData({...formData, descripcion: content})}
                                                modules={quillModules}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-2" style={{ marginTop: '16px' }}>
                                        <AdminInput 
                                            label="Orden"
                                            type="number"
                                            value={formData.orden}
                                            onChange={(e) => setFormData({...formData, orden: e.target.value})}
                                        />
                                        <AdminInput 
                                            label="Link Interno"
                                            value={formData.link}
                                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <label className="c-label-premium">Script SVG Animado (Opcional)</label>
                                        <textarea 
                                            className="input-globo"
                                            style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '12px' }}
                                            value={formData.icono_svg}
                                            onChange={(e) => setFormData({...formData, icono_svg: e.target.value})}
                                            placeholder="<svg>...</svg>"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-form-footer">
                                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline">Cancelar</Button>
                                <Button type="submit" className="btn-primary"><Save size={18} /> Guardar Cambios</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
};

export default AdminServiciosWeb;
