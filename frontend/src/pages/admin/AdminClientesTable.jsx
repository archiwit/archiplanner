import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { getUploadUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, Smartphone, Mail, Shield } from 'lucide-react';

const AdminClientesTable = () => {
    const { user } = useAuth();
    const [clientes, setClientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    const isSuperuser = user?.rol?.toLowerCase() === 'admin' || user?.rol?.toLowerCase() === 'superuser';

    useEffect(() => {
        fetchClientes();
        fetchUsuarios();
        if (isSuperuser) fetchEmpresas();
    }, [user]);

    const fetchEmpresas = async () => {
        try {
            const res = await api.get('/configuraciones');
            setEmpresas(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/clientes');
            // Filter by responsibility for non-superusers
            const myClients = isSuperuser 
                ? res.data 
                : res.data.filter(c => String(c.u_id) === String(user?.id));
            setClientes(myClients);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) { console.error(err); }
    };

    const columns = [
        {
            key: 'nombre',
            label: 'Cliente / Perfil',
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
                        <span style={{ fontWeight: '600', display: 'block', color: '#FFF' }}>{row.nombre} {row.apellido}</span>
                        <div style={{ fontSize: '10px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={10} />
                            <span>{row.nombre_empresa || 'Cliente V4'}</span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: 'correo', 
            label: 'Contacto',
            render: (row) => (
                <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                        <Mail size={12} opacity={0.6} /> {row.correo}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                        <Smartphone size={12} opacity={0.6} /> {row.telefono}
                    </div>
                </div>
            )
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row) => {
                const statusColors = {
                    'prospecto': 'status-pending',
                    'contactado': 'status-info',
                    'contratado': 'status-active',
                    'cancelado': 'status-inactive'
                };
                return (
                    <span className={`table-status ${statusColors[row.estado] || 'status-info'}`}>
                        <span className="status-dot"></span>
                        {row.estado}
                    </span>
                );
            }
        },
        { 
            key: 'nombre_usuario', 
            label: 'Asesor',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                   <Shield size={12} color="var(--color-primary)" />
                   {row.nombre_usuario || 'Sin asignar'}
                </div>
            )
        }
    ];

    const formFields = [
        { name: 'foto', label: 'Foto del Cliente', type: 'image', fullWidth: true },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', required: true },
        { name: 'telefono', label: 'Teléfono / WhatsApp', type: 'text' },
        
        { 
            name: 'header_docs', 
            type: 'custom', 
            fullWidth: true, 
            render: () => <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0', margin: '15px 0 5px 0', color: 'var(--color-primary)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Datos para Contrato</div>
        },
        { name: 'documento', label: 'Cédula / NIT', type: 'text', width: '50%' },
        { name: 'ciudad_cedula', label: 'Ciudad de Expedición', type: 'text', width: '50%' },
        { name: 'direccion', label: 'Dirección de Residencia', type: 'text', fullWidth: true },

        { 
            name: 'header_acceso', 
            type: 'custom', 
            fullWidth: true, 
            render: () => <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0', margin: '15px 0 5px 0', color: 'var(--color-primary)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Credenciales de Acceso (V4)</div>
        },
        { name: 'nick', label: 'Usuario (Login)', type: 'text' },
        { name: 'clave', label: 'Contraseña Provisional', type: 'password' },
        
        { 
            name: 'estado', 
            label: 'Estado', 
            type: 'select', 
            options: [
                { value: 'prospecto', label: 'Prospecto' },
                { value: 'contactado', label: 'Contactado' },
                { value: 'contratado', label: 'Contratado' },
                { value: 'completado', label: 'Completado' },
                { value: 'cancelado', label: 'Cancelado' }
            ],
            required: true
        },
        {
            name: 'u_id',
            label: 'Asignar a Asesor',
            type: 'select',
            options: usuarios.map(u => ({ value: u.id, label: u.nombre })),
            disabled: !isSuperuser
        },
        { name: 'notas', label: 'Notas / Perfil', type: 'textarea', fullWidth: true }
    ];

    const handleAdd = async (formData) => {
        // Auto-generate credentials if not provided
        const finalData = { ...formData };
        if (!finalData.nick || !finalData.clave) {
            const firstLetter = (finalData.nombre || '').charAt(0).toUpperCase();
            const phonePart = (finalData.telefono || '').replace(/\D/g, ''); // Solo números
            const generated = `${firstLetter}${phonePart}`;
            if (!finalData.nick) finalData.nick = generated;
            if (!finalData.clave) finalData.clave = generated;
        }

        const data = new FormData();
        Object.keys(finalData).forEach(key => {
            if (key === 'foto' && finalData.foto instanceof File) data.append('foto', finalData.foto);
            else if (finalData[key] !== undefined) data.append(key, finalData[key]);
        });
        
        // Ensure default assignment
        if (!finalData.u_id) data.append('u_id', user?.id);
        if (!finalData.conf_id) data.append('conf_id', user?.conf_id || 1);

        try {
            await api.post('/clientes', data);
            fetchClientes();
        } catch (err) { alert('Error al crear el cliente.'); }
    };

    const handleEdit = async (item, formData) => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'foto' && formData.foto instanceof File) data.append('foto', formData.foto);
            else if (key === 'foto' && typeof formData.foto === 'string') data.append('foto_path', item.foto);
            else if (formData[key] !== undefined) data.append(key, formData[key]);
        });

        try {
            await api.put(`/clientes/${item.id}`, data);
            fetchClientes();
        } catch (err) { alert('Error al actualizar el cliente.'); }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`¿Seguro que deseas eliminar a ${item.nombre}?`)) {
            try {
                await api.delete(`/clientes/${item.id}`);
                fetchClientes();
            } catch (err) { alert('No se pudo eliminar.'); }
        }
    };

    return (
        <div className="admin-page-v4 fade-in">
            <DynamicTableManager
                title="Clientes"
                data={clientes}
                columns={columns}
                formFields={formFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                defaultValues={{ u_id: user?.id, estado: 'prospecto' }}
            />
        </div>
    );
};

export default AdminClientesTable;
