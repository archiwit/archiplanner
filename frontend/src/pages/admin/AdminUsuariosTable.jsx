import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { UPLOADS_URL, getUploadUrl } from '../../config';

const AdminUsuariosTable = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsuarios();
        fetchEmpresas();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const res = await api.get('/configuraciones');
            setEmpresas(res.data);
        } catch (err) {
            console.error("Error cargando empresas:", err);
        }
    };

    const columns = [
        { key: 'id', label: 'Id' },
        { 
            key: 'nombre', 
            label: 'Empleado',
            render: (row) => (
                <div className="td-flex-img">
                    <div className="td-img" style={{ background: 'var(--color-tertiary-dim)' }}>
                        {row.foto ? (
                            <img src={getUploadUrl(row.foto)} alt="Foto" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                        ) : (
                            <span style={{ fontWeight: 'bold', color: 'var(--color-tertiary)', textTransform: 'uppercase' }}>
                                {row.nombre ? row.nombre[0] : 'U'}
                            </span>
                        )}
                    </div>
                    <div>
                        <span style={{ fontWeight: '500', display: 'block' }}>{row.nombre}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{row.nick}</span>
                    </div>
                </div>
            )
        },
        { key: 'correo', label: 'Email' },
        { 
            key: 'u_ultima_sesion', 
            label: 'Último Acceso',
            render: (row) => row.u_ultima_sesion ? new Date(row.u_ultima_sesion).toLocaleDateString() : 'Nunca'
        },
        { 
            key: 'rol', 
            label: 'Rol',
            render: (row) => (
                <span className="tag" style={{ textTransform: 'capitalize' }}>{row.rol}</span>
            )
        },
        { key: 'nombre_empresa', label: 'Empresa Asignada' },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (row) => (
                <span className={`table-status ${row.estado ? 'status-active' : 'status-inactive'}`}>
                    <span className="status-dot"></span>
                    {row.estado ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    const formFields = [
        { name: 'foto', label: 'Foto de Perfil', type: 'image' },
        { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true, placeholder: ' ' },
        { name: 'nick', label: 'Nombre de Usuario (Nick)', type: 'text', required: true, placeholder: ' ' },
        { name: 'clave', label: 'Contraseña (Déjala vacía si no cambias)', type: 'password', placeholder: ' ' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', required: true, placeholder: ' ' },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: ' ' },
        { name: 'direccion', label: 'Dirección Completa', type: 'text', placeholder: ' ' },
        { 
            name: 'conf_id', 
            label: 'Empresa', 
            type: 'select', 
            options: empresas.map(e => ({ value: e.id, label: e.nombre_empresa })), 
            required: true 
        },
        { 
            name: 'rol', 
            label: 'Rol de Permisos', 
            type: 'select', 
            options: [
                { value: 'admin', label: 'Administrador (CEO)' },
                { value: 'coordinador', label: 'Coordinador' },
                { value: 'asesor', label: 'Asesor Comercial' },
                { value: 'asesor_arriendos', label: 'Asesor de Arriendos' }
            ], 
            required: true 
        },
        { 
            name: 'estado', 
            label: 'Estado de Cuenta', 
            type: 'select', 
            options: [
                { value: 'Activo', label: 'Activo (Permitir Acceso)' },
                { value: 'Inactivo', label: 'Inactivo (Bloqueado)' }
            ], 
            required: true 
        },
        {
            name: 'permisos',
            label: 'Permisos de Acceso',
            type: 'custom',
            fullWidth: true,
            render: (formData, setFormData) => {
                const availablePermissions = [
                    { key: 'cotizaciones', label: 'Cotizaciones', category: 'Operaciones' },
                    { key: 'arriendos', label: 'Arriendos', category: 'Operaciones' },
                    { key: 'planeador', label: 'Planeador 360°', category: 'Operaciones' },
                    { key: 'calendario', label: 'Calendario', category: 'Operaciones' },
                    { key: 'inventario', label: 'Manejo de Inventario', category: 'Logística' },
                    { key: 'proveedores', label: 'Manejo de Proveedores', category: 'Logística' },
                    { key: 'gastos_empresa', label: 'Gastos de Empresa', category: 'Finanzas' },
                    { key: 'plantillas', label: 'Plantillas de Cotización', category: 'Configuración' },
                    { key: 'usuarios', label: 'Registro de Usuarios / Equipo', category: 'Configuración' },
                    { key: 'empresa', label: 'Configuración de Empresa', category: 'Configuración' },
                    { key: 'web_editor', label: 'Editor Sitio Web (CMS)', category: 'Gestión Web' }
                ];

                const currentPerms = Array.isArray(formData.permisos) 
                    ? formData.permisos 
                    : (formData.permisos ? JSON.parse(formData.permisos) : []);

                const togglePermission = (key) => {
                    let newPerms = [...currentPerms];
                    if (newPerms.includes(key)) {
                        newPerms = newPerms.filter(p => p !== key);
                    } else {
                        newPerms.push(key);
                    }
                    setFormData({ ...formData, permisos: JSON.stringify(newPerms) });
                };

                // Group by category
                const groups = availablePermissions.reduce((acc, p) => {
                    if (!acc[p.category]) acc[p.category] = [];
                    acc[p.category].push(p);
                    return acc;
                }, {});

                return (
                    <div className="permissions-selector glass-panel" style={{ padding: '20px', marginTop: '10px' }}>
                        <div style={{ fontWeight: '800', marginBottom: '15px', color: 'var(--color-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Módulos y Áreas de Vista
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {Object.entries(groups).map(([category, items]) => (
                                <div key={category} className="perm-group">
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-dim)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                        {category}
                                    </div>
                                    {items.map(p => (
                                        <div 
                                            key={p.key} 
                                            onClick={() => togglePermission(p.key)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                padding: '6px 0', 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '4px',
                                                border: `2px solid ${currentPerms.includes(p.key) ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)'}`,
                                                background: currentPerms.includes(p.key) ? 'var(--color-primary)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {currentPerms.includes(p.key) && '✓'}
                                            </div>
                                            <span style={{ fontSize: '13px', color: currentPerms.includes(p.key) ? 'white' : 'var(--color-text-dim)' }}>
                                                {p.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '11px', color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
                            * El Súper Administrador siempre tiene acceso total, independientemente de estos permisos.
                        </div>
                    </div>
                );
            }
        }
    ];

    const generateFormData = (formData, originalItem) => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'foto' && key !== 'foto_path' && formData[key] !== null && formData[key] !== undefined) {
                let val = formData[key];
                if (key === 'telefono' && typeof val === 'string') {
                    val = val.replace(/\s/g, '');
                }
                data.append(key, val);
            }
        });
        
        if (formData.foto instanceof File) {
            data.append('foto', formData.foto);
        } else if (originalItem && typeof formData.foto === 'string') {
            data.append('foto_path', originalItem.foto);
        }
        return data;
    };

    const handleAdd = async (formData) => {
        setLoading(true);
        try {
            // 1. Validar disponibilidad cruzada de Nick y Email
            const checkRes = await api.get(`/auth/check-availability?nick=${formData.nick}&email=${formData.correo}`);
            if (checkRes.data.nickExists) {
                alert(`El Nick "${formData.nick}" ya está en uso en el sistema (Usuarios o Clientes). Elige otro.`);
                setLoading(false);
                return;
            }
            if (checkRes.data.emailExists) {
                alert(`El correo "${formData.correo}" ya está registrado en el sistema. Elige otro.`);
                setLoading(false);
                return;
            }

            const data = generateFormData(formData, null);
            // Default "Activo" format for DB
            data.set('estado', formData.estado === 'Activo' ? 1 : 0);
            
            await api.post('/usuarios', data);
            await fetchUsuarios();
        } catch (err) {
            console.error(err);
            alert('Error al crear el usuario.');
        }
        setLoading(false);
    };

    const handleEdit = async (originalItem, formData) => {
        setLoading(true);
        try {
            // 1. Validar disponibilidad si el nick o correo cambiaron
            if (formData.nick !== originalItem.nick || formData.correo !== originalItem.correo) {
                let query = '';
                if (formData.nick !== originalItem.nick) query += `nick=${formData.nick}&`;
                if (formData.correo !== originalItem.correo) query += `email=${formData.correo}&`;
                
                const checkRes = await api.get(`/auth/check-availability?${query}`);
                if (formData.nick !== originalItem.nick && checkRes.data.nickExists) {
                    alert(`El Nick "${formData.nick}" ya está en uso.`);
                    setLoading(false);
                    return;
                }
                if (formData.correo !== originalItem.correo && checkRes.data.emailExists) {
                    alert(`El correo "${formData.correo}" ya está registrado.`);
                    setLoading(false);
                    return;
                }
            }

            const data = generateFormData(formData, originalItem);
            data.set('estado', formData.estado === 'Activo' || formData.estado === 1 ? 1 : 0);
            
            await api.put(`/usuarios/${originalItem.id}`, data);
            await fetchUsuarios();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el usuario.');
        }
        setLoading(false);
    };

    const handleDelete = async (item) => {
        const conf = window.confirm(`¿Seguro que deseas eliminar el acceso a ${item.nombre}?`);
        if (conf) {
            try {
                await api.delete(`/usuarios/${item.id}`);
                setUsuarios(usuarios.filter(u => u.id !== item.id));
            } catch (err) {
                console.error(err);
                alert('No se pudo borrar. Puede tener registros asignados.');
            }
        }
    };

    return (
        <div>
            <DynamicTableManager
                title="Súper Admin: Gestión de Accesos"
                data={usuarios.map(u => ({...u, estado: u.estado ? 'Activo' : 'Inactivo', clave: ''}))} 
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

export default AdminUsuariosTable;
