import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUploadUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, Star, CheckSquare } from 'lucide-react';
import DynamicTableManager from '../../components/ui/DynamicTableManager';

const AdminProveedoresTable = () => {
    const { user } = useAuth();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);

    const isSuperuser = user?.rol?.toLowerCase() === 'admin' || user?.rol?.toLowerCase() === 'superuser';

    useEffect(() => {
        fetchProveedores();
    }, [user]);

    const fetchProveedores = async () => {
        setLoading(true);
        try {
            const res = await api.get('/proveedores');
            // Filter by conf_id for V4 architecture
            const myProviders = isSuperuser 
                ? res.data 
                : res.data.filter(p => parseInt(p.conf_id) === parseInt(user?.conf_id));
            setProveedores(myProviders);
        } catch (err) {
            console.error("Error cargando proveedores:", err);
        } finally {
            setLoading(false);
        }
    };

    const SERVICE_OPTIONS = [
        'Decoración', 'Salón', 'Catering', 'Fotografía', 'Video',
        'DJ / Música', 'Iluminación', 'Sonido', 'Mobiliario', 'Flores',
        'Pastelería', 'Bar / Bebidas', 'Transporte', 'Animación',
        'Vestuario', 'Maquillaje', 'Otros'
    ];

    const columns = [
        {
            key: 'nombre',
            label: 'Aliado / Empresa',
            render: (row) => (
                <div className="td-flex-img">
                    <div className="td-img" style={{ 
                        background: 'rgba(183, 110, 121, 0.1)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(183, 110, 121, 0.2)'
                    }}>
                        {row.foto ? (
                            <img src={getUploadUrl(row.foto)} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <User size={20} color="var(--color-primary)" />}
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', color: '#FFF' }}>{row.nombre}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                            <MapPin size={10} /> {row.direccion || 'Sin dirección'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'contacto',
            label: 'Contacto Directo',
            render: (row) => (
                <div style={{ fontSize: '13px' }}>
                    <span style={{ display: 'block', fontWeight: '500', color: '#fff' }}>{row.contacto}</span>
                    <div style={{ color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <Phone size={12} /> {row.telefono}
                    </div>
                </div>
            )
        },
        {
            key: 'servicios',
            label: 'Servicios',
            render: (row) => {
                let srv = [];
                try { srv = typeof row.servicios === 'string' ? JSON.parse(row.servicios) : (row.servicios || []); } catch(e) { srv = []; }
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {srv.slice(0, 3).map((s, i) => (
                            <span key={i} className="tag" style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(255,255,255,0.05)' }}>{s}</span>
                        ))}
                        {srv.length > 3 && <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>+{srv.length - 3}</span>}
                    </div>
                );
            }
        },
        {
            key: 'califica',
            label: 'Calidad',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700' }}>
                    <Star size={14} fill="#FFD700" />
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#FFF' }}>{row.califica}</span>
                </div>
            )
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row) => {
                const isActive = row.estado === 'Activo' || row.estado === 1 || row.estado === '1';
                return (
                    <span className={`table-status ${isActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot"></span>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                );
            }
        }
    ];

    const formFields = [
        { name: 'foto', label: 'Logotipo Comercial', type: 'image', fullWidth: true },
        { name: 'nombre', label: 'Nombre de la Empresa / Marca', type: 'text', required: true },
        { name: 'contacto', label: 'Persona de Contacto', type: 'text', required: true },
        { name: 'telefono', label: 'Teléfono Directo', type: 'text', required: true },
        { name: 'correo', label: 'Correo Electrónico Corporativo', type: 'email' },
        { name: 'direccion', label: 'Dirección / Ubicación Física', type: 'text', fullWidth: true },
        { 
            name: 'califica', 
            label: 'Evaluación (1.0 - 5.0)', 
            type: 'number', 
            rest: { step: '0.1', min: '0', max: '5' } 
        },
        { 
            name: 'estado', 
            label: 'Estado', 
            type: 'select', 
            options: [
                { value: 1, label: 'Activo' },
                { value: 0, label: 'Inactivo' }
            ] 
        },
        {
            name: 'servicios',
            label: 'Servicios que Ofrece',
            fullWidth: true,
            render: (formData, setFormData) => {
                let selected = [];
                try {
                    selected = typeof formData.servicios === 'string' ? JSON.parse(formData.servicios) : (formData.servicios || []);
                } catch(e) { selected = []; }

                const toggle = (srv) => {
                    const newSrv = selected.includes(srv) 
                        ? selected.filter(s => s !== srv)
                        : [...selected, srv];
                    setFormData(prev => ({ ...prev, servicios: JSON.stringify(newSrv) }));
                };

                return (
                    <div className="v4-services-picker" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-primary)' }}>
                            <CheckSquare size={16} /> 
                            <span style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Seleccionar Servicios</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                            {SERVICE_OPTIONS.map(s => (
                                <div 
                                    key={s} 
                                    onClick={() => toggle(s)}
                                    style={{
                                        padding: '8px 12px',
                                        background: selected.includes(s) ? 'rgba(183, 110, 121, 0.15)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${selected.includes(s) ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        color: selected.includes(s) ? '#fff' : 'rgba(255,255,255,0.6)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <div style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '3px', 
                                        border: '1px solid currentColor',
                                        background: selected.includes(s) ? 'var(--color-primary)' : 'transparent'
                                    }}></div>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        }
    ];

    const handleAdd = async (formData) => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'foto' && formData.foto instanceof File) {
                data.append('foto', formData.foto);
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });
        // Ensure conf_id is sent
        if (!formData.conf_id) data.append('conf_id', user?.conf_id || 1);

        try {
            await api.post('/proveedores', data);
            fetchProveedores();
        } catch (err) {
            console.error(err);
            alert('Error al crear el proveedor.');
        }
    };

    const handleEdit = async (item, formData) => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'foto' && formData.foto instanceof File) {
                data.append('foto', formData.foto);
            } else if (key === 'foto' && typeof formData.foto === 'string') {
                data.append('foto_path', item.foto);
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.put(`/proveedores/${item.id}`, data);
            fetchProveedores();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el proveedor.');
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`¿Seguro que deseas eliminar a "${item.nombre}"?`)) {
            try {
                await api.delete(`/proveedores/${item.id}`);
                fetchProveedores();
            } catch (err) {
                console.error(err);
                alert('No se pudo borrar el proveedor.');
            }
        }
    };

    return (
        <div className="admin-page-v4 fade-in">
            <DynamicTableManager
                title="Directorio de Proveedores"
                data={proveedores}
                columns={columns}
                formFields={formFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                defaultValues={{ califica: 5.0, estado: 1, conf_id: user?.conf_id }}
            />
        </div>
    );
};

export default AdminProveedoresTable;
