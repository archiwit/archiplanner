import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UPLOADS_URL } from '../../config';
import { Plus, Edit2, Trash2, X, Star, MapPin, Phone, User, Info, CheckSquare, Upload, Save, Loader2 } from 'lucide-react';
import { AdminInput, AdminSelect, AdminImageUpload } from '../../components/ui/AdminFormFields';

const AdminProveedoresTable = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        contacto: '',
        telefono: '',
        correo: '',
        servicios: [],
        direccion: '',
        califica: 5.0,
        estado: 1, 
        foto: null,
        foto_preview: null
    });

    const SERVICE_OPTIONS = [
        'Decoración', 'Salón', 'Catering', 'Fotografía', 'Video',
        'DJ / Música', 'Iluminación', 'Sonido', 'Mobiliario', 'Flores',
        'Pastelería', 'Bar / Bebidas', 'Transporte', 'Animación',
        'Vestuario', 'Maquillaje', 'Otros'
    ];

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        setLoading(true);
        try {
            const res = await api.get('/proveedores');
            setProveedores(res.data);
        } catch (err) {
            console.error("Error cargando proveedores:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            let parsedServicios = [];
            try {
                parsedServicios = typeof item.servicios === 'string' ? JSON.parse(item.servicios) : (item.servicios || []);
            } catch (e) {
                parsedServicios = String(item.servicios || '').split(',').map(s => s.trim());
            }

            setFormData({
                nombre: item.nombre || '',
                contacto: item.contacto || '',
                telefono: item.telefono || '',
                correo: item.correo || '',
                servicios: parsedServicios,
                direccion: item.direccion || '',
                califica: parseFloat(item.califica) || 5.0,
                estado: item.estado === 'Activo' || item.estado === 1 ? 1 : 0,
                foto: null,
                foto_preview: item.foto ? `${UPLOADS_URL}${item.foto}` : null
            });
        } else {
            setEditingItem(null);
            setFormData({
                nombre: '',
                contacto: '',
                telefono: '',
                correo: '',
                servicios: [],
                direccion: '',
                califica: 5.0,
                estado: 1,
                foto: null,
                foto_preview: null
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => {
            const current = [...prev.servicios];
            if (current.includes(service)) {
                return { ...prev, servicios: current.filter(s => s !== service) };
            } else {
                return { ...prev, servicios: [...current, service] };
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                foto: file,
                foto_preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'foto') {
                if (formData.foto) data.append('foto', formData.foto);
                else if (editingItem?.foto) data.append('foto_path', editingItem.foto);
            } else if (key === 'servicios') {
                data.append('servicios', JSON.stringify(formData.servicios));
            } else if (key === 'califica') {
                data.append('califica', formData.califica);
            } else if (key === 'telefono') {
                data.append('telefono', String(formData.telefono).replace(/\s/g, ''));
            } else if (key !== 'foto_preview') {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingItem) {
                await api.put(`/proveedores/${editingItem.id}`, data);
            } else {
                await api.post('/proveedores', data);
            }
            await fetchProveedores();
            handleCloseModal();
        } catch (err) {
            console.error('API Error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
            alert(`Error al procesar la solicitud: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmMsg = `¿Seguro que deseas eliminar a "${item.nombre}"? Sus productos asociados no se borrarán, pero dejarán de estar vinculados a este proveedor.`;
        if (window.confirm(confirmMsg)) {
            try {
                await api.delete(`/proveedores/${item.id}`);
                setProveedores(prev => prev.filter(p => p.id !== item.id));
            } catch (err) {
                console.error(err);
                alert('No se pudo eliminar el proveedor.');
            }
        }
    };

    // --- Componente: InteractiveStarRating ---
    const InteractiveStarRating = ({ value, onChange }) => {
        const [hoverValue, setHoverValue] = useState(null);

        const handleMouseMove = (e, index) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            setHoverValue(index + (isHalf ? 0.5 : 1));
        };

        const handleClick = (e, index) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            onChange(index + (isHalf ? 0.5 : 1));
        };

        const displayValue = hoverValue !== null ? hoverValue : value;

        return (
            <div 
                style={{ display: 'flex', gap: '4px', cursor: 'pointer', padding: '10px 0' }}
                onMouseLeave={() => setHoverValue(null)}
            >
                {[0, 1, 2, 3, 4].map((index) => {
                    const starVal = index + 1;
                    const isFull = displayValue >= starVal;
                    const isHalf = displayValue >= starVal - 0.5 && displayValue < starVal;
                    
                    return (
                        <div 
                            key={index}
                            className="star-wrapper"
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            onClick={(e) => handleClick(e, index)}
                            style={{ position: 'relative', transition: 'transform 0.2s' }}
                        >
                            <Star 
                                size={32} 
                                color={isFull || isHalf ? '#FFD700' : 'rgba(255,255,255,0.1)'} 
                                fill={isFull ? '#FFD700' : 'none'}
                                strokeWidth={1.5}
                            />
                            {isHalf && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '50%', 
                                    overflow: 'hidden',
                                    pointerEvents: 'none'
                                }}>
                                    <Star size={32} color="#FFD700" fill="#FFD700" />
                                </div>
                            )}
                        </div>
                    );
                })}
                <span style={{ 
                    marginLeft: '12px', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: displayValue > 0 ? '#FFD700' : 'var(--color-text-dim)',
                    alignSelf: 'center'
                }}>
                    {displayValue.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className="admin-proveedores-module">
            <div className="dynamic-table-toolbar">
                <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--color-primary)' }}>Directorio de Proveedores</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginTop: '4px' }}>Gestiona los aliados estratégicos para tus eventos.</p>
                </div>
                <button className="btn-admin-primary" onClick={() => handleOpenModal()} style={{ padding: '12px 28px' }}>
                    <Plus size={20} />
                    Alta de Proveedor
                </button>
            </div>

            <div className="admin-card mb-0" style={{ padding: '0', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="dynamic-table-wrapper">
                    <table className="dynamic-table">
                        <thead>
                            <tr>
                                <th>Aliado / Empresa</th>
                                <th>Contacto Directo</th>
                                <th>Servicios</th>
                                <th>Calidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>Cargando proveedores...</td></tr>
                            ) : proveedores.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>No hay proveedores registrados.</td></tr>
                            ) : (
                                proveedores.map(item => {
                                    let srv = [];
                                    try { srv = typeof item.servicios === 'string' ? JSON.parse(item.servicios) : (item.servicios || []); } catch(e) { srv = []; }
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="td-flex-img">
                                                    <div className="td-img" style={{ background: 'rgba(255,132,132,0.1)', borderRadius: '12px' }}>
                                                        {item.foto ? (
                                                            <img src={`${UPLOADS_URL}${item.foto}`} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : <User size={20} color="var(--color-primary)" />}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: '600', color: '#FFF' }}>{item.nombre}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                                                            <MapPin size={10} /> {item.direccion || 'Sin dirección'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>
                                                    <span style={{ display: 'block', fontWeight: '500' }}>{item.contacto}</span>
                                                    <div style={{ color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                        <Phone size={12} /> {item.telefono}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '200px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {srv.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="tag" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                                                    ))}
                                                    {srv.length > 3 && <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>+{srv.length - 3}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700' }}>
                                                    <Star size={14} fill="#FFD700" />
                                                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#FFF' }}>{item.califica}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`table-status ${item.estado === 'Activo' || item.estado === 1 ? 'status-active' : 'status-inactive'}`}>
                                                    <span className="status-dot"></span>
                                                    {item.estado === 'Activo' || item.estado === 1 ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <button onClick={() => handleOpenModal(item)} className="btn-icon" title="Editar">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item)} className="btn-icon delete" title="Eliminar" style={{ color: 'rgba(255,132,132,0.8)' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content" style={{ 
                        maxWidth: '1100px', 
                        width: '95%', 
                        maxHeight: '95vh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#1a1b1e', 
                        border: '1px solid #333' 
                    }} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #333', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--color-primary-dim)', padding: '10px', borderRadius: '12px' }}>
                                        {editingItem ? <Edit2 size={24} color="var(--color-primary)" /> : <Plus size={24} color="var(--color-primary)" />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#fff' }}>{editingItem ? 'Actualizar Ficha de Proveedor' : 'Alta de Nuevo Proveedor'}</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-dim)' }}>Completa el perfil profesional del aliado.</p>
                                    </div>
                                </div>
                                <button type="button" className="btn-close" onClick={handleCloseModal}><X size={24} /></button>
                            </div>
                            
                            <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                                <div className="modal-grid-layout" style={{ gap: '24px' }}>
                                    <div className="modal-grid-left dense-grid">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-primary)' }}>
                                            <Info size={16} /> 
                                            <span style={{ fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Información Básica</span>
                                        </div>
                                        
                                        <AdminInput label="Nombre de la Empresa / Marca" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
 
                                        <div className="compact-grid-2">
                                            <AdminInput label="Persona de Contacto" name="contacto" value={formData.contacto} onChange={handleInputChange} required />
                                            <AdminInput label="Teléfono Directo" name="telefono" value={formData.telefono} onChange={handleInputChange} required />
                                        </div>
 
                                        <AdminInput label="Correo Electrónico Corporativo" name="correo" value={formData.correo} onChange={handleInputChange} type="email" />
                                        <AdminInput label="Dirección / Ubicación Física" name="direccion" value={formData.direccion} onChange={handleInputChange} />
 
                                        <div className="form-field">
                                            <InteractiveStarRating value={formData.califica} onChange={(val) => setFormData(prev => ({ ...prev, califica: val }))} />
                                            <label>Evaluación de Calidad</label>
                                        </div>
 
                                        <AdminSelect 
                                            label="Estado de la Alianza" 
                                            name="estado" 
                                            value={formData.estado} 
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 1, label: 'Activo (Visible en directorio)' },
                                                { value: 0, label: 'Inactivo (Oculto temporalmente)' }
                                            ]}
                                        />
 
                                        <AdminImageUpload 
                                            label="Logotipo Comercial" 
                                            name="foto" 
                                            value={formData.foto || formData.foto_preview} 
                                            onChange={handleFileChange} 
                                        />
                                    </div>

                                    <div className="modal-grid-right">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-tertiary)' }}>
                                            <CheckSquare size={16} /> 
                                            <span style={{ fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Servicios que Ofrece</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', margin: '0 0 12px 0' }}>Selecciona todas las soluciones que este aliado puede proveer.</p>

                                        <div className="services-checkbox-grid" style={{ gap: '6px' }}>
                                            {SERVICE_OPTIONS.map(service => (
                                                <div 
                                                    key={service} 
                                                    className={`checkbox-item ${formData.servicios.includes(service) ? 'active' : ''}`}
                                                    onClick={() => handleServiceToggle(service)}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.servicios.includes(service)} 
                                                        readOnly
                                                        style={{ pointerEvents: 'none' }}
                                                    />
                                                    <span>{service}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ 
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between', 
                                gap: '16px', 
                                padding: '16px 24px', 
                                borderTop: '1px solid #333', 
                                background: '#0a0b0d',
                                flexShrink: 0
                            }}>
                                <button 
                                    type="button" 
                                    className="btn-admin-secondary" 
                                    onClick={handleCloseModal} 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', fontWeight: 'bold' }}
                                >
                                    CANCELAR
                                </button>
                                <button type="submit" className="btn-admin-primary" disabled={isSubmitting} style={{ minWidth: '220px', height: '48px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} style={{ marginRight: '10px' }} />}
                                    {editingItem ? 'Guardar Cambios' : 'Crear Perfil de Aliado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-proveedores-module {
                    animation: fadeIn 0.5s ease;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                .star-wrapper:hover {
                    transform: scale(1.1);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-icon {
                    background: transparent;
                    border: none;
                    color: var(--color-text-dim);
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-icon:hover {
                    color: var(--color-primary);
                    transform: scale(1.1);
                }
                .btn-icon.delete:hover {
                    color: #FF8484;
                }
            `}</style>
        </div>
    );
};

export default AdminProveedoresTable;
