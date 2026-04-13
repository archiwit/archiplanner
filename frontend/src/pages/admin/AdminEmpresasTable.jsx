import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { UPLOADS_URL } from '../../config';
import { useBranding } from '../../context/BrandingContext';
import { CheckCircle, Circle, Palette, Layout, Square, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminInput, AdminImageUpload, AdminColorPicker } from '../../components/ui/AdminFormFields';

const AdminEmpresasTable = () => {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const { refreshBranding } = useBranding();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const res = await api.get('/configuraciones');
            setEmpresas(res.data);
        } catch (err) {
            console.error("Error cargando empresas:", err);
        }
    };

    const handleActivar = async (id) => {
        setLoading(true);
        try {
            await api.put(`/configuraciones/${id}/activar`);
            await fetchEmpresas();
            refreshBranding();
        } catch (err) {
            console.error("Error activando empresa:", err);
            alert("No se pudo activar la empresa");
        }
        setLoading(false);
    };

    const columns = [
        { key: 'id', label: 'Id' },
        { 
            key: 'nombre_empresa', 
            label: 'Empresa',
            render: (row) => (
                <div className="td-flex-img">
                    <div className="td-img" style={{ background: row.color_primario || 'var(--color-primary-dim)' }}>
                        {row.logo_cuadrado_path ? (
                            <img src={`${UPLOADS_URL}${row.logo_cuadrado_path}`} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                        ) : (
                            <span style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
                                {row.nombre_empresa ? row.nombre_empresa[0] : 'E'}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>{row.nombre_empresa}</span>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: row.color_primario, border: '1px solid rgba(255,255,255,0.1)' }} title="Primario"></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: row.color_secundario, border: '1px solid rgba(255,255,255,0.1)' }} title="Secundario"></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: row.color_terciario, border: '1px solid rgba(255,255,255,0.1)' }} title="Terciario"></div>
                        </div>
                    </div>
                </div>
            )
        },
        { key: 'email_contacto', label: 'Email' },
        { 
            key: 'es_activa', 
            label: 'Estado',
            render: (row) => (
                <button 
                    onClick={() => !row.es_activa && handleActivar(row.id)}
                    className={`status-pill ${row.es_activa ? 'active' : 'inactive'}`}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '700', cursor: row.es_activa ? 'default' : 'pointer',
                        border: 'none', background: row.es_activa ? 'rgba(95, 220, 199, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: row.es_activa ? '#5fdcc7' : '#999'
                    }}
                >
                    {row.es_activa ? <CheckCircle size={12} /> : <Circle size={12} />}
                    {row.es_activa ? 'ACTIVA' : 'ACTIVAR'}
                </button>
            )
        },
        { key: 'city', label: 'Ciudad' },
        {
            key: 'acciones_extra',
            label: 'Detalle',
            render: (row) => (
                <button 
                    onClick={() => navigate(`/admin/empresa/editar/${row.id}`)}
                    style={{ 
                        background: 'rgba(255, 132, 132, 0.1)', 
                        color: 'var(--color-primary)', 
                        border: '1px solid rgba(255, 132, 132, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <ExternalLink size={12} /> EDITAR
                </button>
            )
        }
    ];

    const formFields = [
        {
            name: 'branding_layout',
            type: 'custom',
            fullWidth: true,
            render: (formData, setFormData) => {
                const handleFieldChange = (e) => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                };

                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.8fr) 1.2fr', gap: '24px', alignItems: 'start' }}>
                        {/* LEFT PANEL: BRANDING (High Density) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <AdminImageUpload 
                                label="Logo Principal (Cuadrado)" 
                                name="logo_cuadrado" 
                                value={formData.logo_cuadrado || formData.logo_cuadrado_path} 
                                onChange={handleFieldChange} 
                            />
                            <AdminImageUpload 
                                label="Logo Horizontal" 
                                name="logo_horizontal" 
                                value={formData.logo_horizontal || formData.logo_horizontal_path} 
                                onChange={handleFieldChange} 
                            />
                            
                            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,132,132,0.03)', border: '1px solid rgba(255,132,132,0.1)' }}>
                                <span style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--color-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Paleta de Identidad</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <AdminColorPicker label="Primario" name="color_primario" value={formData.color_primario} onChange={handleFieldChange} />
                                    <AdminColorPicker label="Secundario" name="color_secundario" value={formData.color_secundario} onChange={handleFieldChange} />
                                    <AdminColorPicker label="Terciario" name="color_terciario" value={formData.color_terciario} onChange={handleFieldChange} />
                                    <AdminColorPicker label="Fondo" name="color_fondo" value={formData.color_fondo} onChange={handleFieldChange} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: CORPORATE INFO */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <AdminInput label="Nombre de Empresa" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleFieldChange} fullWidth />
                            <AdminInput label="Email de Contacto" name="email_contacto" type="email" value={formData.email_contacto} onChange={handleFieldChange} />
                            <AdminInput label="CEO / Responsable" name="ceo" value={formData.ceo} onChange={handleFieldChange} />
                            <AdminInput label="Teléfono" name="telefono" value={formData.telefono} onChange={handleFieldChange} />
                            <AdminInput label="Cédula / NIT" name="cedula" value={formData.cedula} onChange={handleFieldChange} />
                            <AdminInput label="Ciudad de Expedición" name="ciudad_expedicion" value={formData.ciudad_expedicion} onChange={handleFieldChange} />
                            <AdminInput label="Dirección / Ciudad" name="city" value={formData.city} onChange={handleFieldChange} fullWidth />
                        </div>
                    </div>
                );
            }
        },
        { name: 'ig_url', label: 'Instagram', type: 'url', width: '20%' },
        { name: 'fb_url', label: 'Facebook', type: 'url', width: '20%' },
        { name: 'tt_url', label: 'TikTok', type: 'url', width: '20%' },
        { name: 'li_url', label: 'LinkedIn', type: 'url', width: '20%' },
        { name: 'x_url', label: 'X (Twitter)', type: 'url', width: '20%' },
        { name: 'politicas_cotizacion', label: 'Políticas de Cotización', type: 'textarea', fullWidth: true, rows: 3 },
        { name: 'intro_cotizacion', label: 'Introducción de Cotización', type: 'textarea', fullWidth: true, rows: 3 },
    ];

    const generateFormData = (formData, originalItem = {}) => {
        const data = new FormData();
        
        // Campos a saltar de la iteración automática
        const skip = [
            'id', 'created_at', 'updated_at', 'es_activa', 
            'logo_cuadrado', 'logo_horizontal', 
            'logo_cuadrado_path', 'logo_horizontal_path', 
            'branding_setup'
        ];

        Object.keys(formData).forEach(key => {
            // Solo agregar si no está en la lista de salto y el valor no es nulo/undefined
            if (!skip.includes(key) && formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        
        // Manejo específico de logos (archivos vs rutas existentes)
        if (formData.logo_cuadrado instanceof File) {
            data.append('logo_cuadrado', formData.logo_cuadrado);
        } else if (originalItem.logo_cuadrado_path) {
            data.append('logo_cuadrado_path', originalItem.logo_cuadrado_path);
        }

        if (formData.logo_horizontal instanceof File) {
            data.append('logo_horizontal', formData.logo_horizontal);
        } else if (originalItem.logo_horizontal_path) {
            data.append('logo_horizontal_path', originalItem.logo_horizontal_path);
        }

        return data;
    };

    const handleAdd = async (formData) => {
        setLoading(true);
        try {
            const data = generateFormData(formData);
            await api.post('/configuraciones', data);
            await fetchEmpresas();
        } catch (err) {
            console.error(err);
            alert('Error al crear la configuración.');
        }
        setLoading(false);
    };

    const handleEdit = async (originalItem, formData) => {
        setLoading(true);
        try {
            const data = generateFormData(formData, originalItem);
            await api.put(`/configuraciones/${originalItem.id}`, data);
            await fetchEmpresas();
            if (originalItem.es_activa) refreshBranding();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar la configuración.');
        }
        setLoading(false);
    };

    const handleDelete = async (item) => {
        if (item.es_activa) return alert('No puedes eliminar la empresa activa');
        const conf = window.confirm(`¿Seguro que deseas eliminar permanentemente a ${item.nombre_empresa}?`);
        if (conf) {
            try {
                await api.delete(`/configuraciones/${item.id}`);
                setEmpresas(empresas.filter(emp => emp.id !== item.id));
            } catch (err) {
                console.error(err);
                alert('No se pudo borrar.');
            }
        }
    };

    return (
        <div>
            <DynamicTableManager
                title="Sedes y Branding Empresarial"
                data={empresas}
                columns={columns}
                formFields={formFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />
        </div>
    );
};

export default AdminEmpresasTable;
