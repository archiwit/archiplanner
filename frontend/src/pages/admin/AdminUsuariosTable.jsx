import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { UPLOADS_URL } from '../../config';

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
                            <img src={`${UPLOADS_URL}${row.foto}`} alt="Foto" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
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
                { value: 'asesor', label: 'Asesor Comercial' }
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
