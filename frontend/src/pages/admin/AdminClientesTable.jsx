import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { UPLOADS_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Calendar, Building2, User } from 'lucide-react';

const AdminClientesTable = () => {
    const { user } = useAuth();
    const [clientes, setClientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('all');

    const isSuperuser = user?.rol?.toLowerCase() === 'admin' || user?.rol?.toLowerCase() === 'superuser';

    useEffect(() => {
        fetchClientes();
        fetchUsuarios();
        if (user?.rol === 'admin') {
            fetchEmpresas();
        }
    }, [user]);

    const fetchEmpresas = async () => {
        try {
            const res = await api.get('/configuraciones');
            setEmpresas(res.data);
        } catch (err) {
            console.error("Error cargando empresas:", err);
        }
    };

    const fetchClientes = async () => {
        try {
            const res = await api.get('/clientes');
            setClientes(res.data);
        } catch (err) {
            console.error("Error cargando clientes:", err);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
        }
    };

    const columns = [
        { key: 'id', label: 'Id' },
        {
            key: 'nombre',
            label: 'Cliente / Empresa',
            render: (row) => (
                <div className="td-flex-img">
                    <div className="td-img" style={{
                        background: 'var(--color-tertiary-dim)',
                        position: 'relative'
                    }}>
                        {row.foto ? (
                            <img src={`${UPLOADS_URL}${row.foto}`} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} style={{ color: 'var(--color-tertiary)' }} />
                        )}
                        {/* Company Mini-Logo Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            background: 'var(--color-bg-light)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {row.logo_empresa ? (
                                <img src={`${UPLOADS_URL}${row.logo_empresa}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : <Building2 size={8} />}
                        </div>
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', display: 'block', color: 'var(--color-text-bright)' }}>{row.nombre} {row.apellido}</span>
                        <div style={{ fontSize: '10px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={10} />
                            <span>{row.nombre_empresa || 'ArchiPlanner'}</span>
                        </div>
                    </div>
                </div>
            )
        },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'documento', label: 'Documento' },
        {
            key: 'ciudad_cedula',
            label: 'Expedición',
            render: (row) => row.ciudad_cedula || '---'
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row) => {
                const estadoColors = {
                    'prospecto': 'status-pending',
                    'contactado': 'status-info',
                    'propuesta': 'status-warning',
                    'contratado': 'status-active',
                    'completado': 'status-success',
                    'cancelado': 'status-inactive'
                };
                return (
                    <span className={`tag ${estadoColors[row.estado] || ''}`} style={{ textTransform: 'capitalize' }}>
                        {row.estado}
                    </span>
                );
            }
        },
        { key: 'nombre_usuario', label: 'Asignado a', hidden: !isSuperuser }
    ];

    const filtered = clientes.filter(c => {
        // 1. Role Check
        if (!isSuperuser && String(c.u_id) !== String(user?.id)) return false;

        // 2. Search Term
        const matchesSearch =
            `${c.nombre} ${c.apellido} ${c.correo} ${c.documento}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase());

        // 3. Status
        const matchesStatus = filterEstado === 'all' || c.estado === filterEstado;

        return matchesSearch && matchesStatus;
    });

    const formFields = [
        {
            name: 'foto',
            label: 'Foto del Cliente',
            type: 'image',
            fullWidth: true
        },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: ' ' },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: ' ' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: ' ' },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: ' ' },
        { name: 'documento', label: 'Documento de Identidad', type: 'text', placeholder: ' ' },
        { name: 'ciudad_cedula', label: 'Ciudad de Expedición', type: 'text', placeholder: ' ' },
        { name: 'nacimiento', label: 'Fecha de Nacimiento', type: 'date', placeholder: ' ' },
        {
            name: 'estado',
            label: 'Estado del Cliente',
            type: 'select',
            options: [
                { value: 'prospecto', label: 'Prospecto' },
                { value: 'contactado', label: 'Contactado' },
                { value: 'propuesta', label: 'En Propuesta' },
                { value: 'contratado', label: 'Contratado' },
                { value: 'completado', label: 'Completado' },
                { value: 'cancelado', label: 'Cancelado' }
            ],
            required: true
        },
        { name: 'direccion', label: 'Dirección', type: 'text', placeholder: ' ', fullWidth: true },
        {
            name: 'u_id',
            label: 'Asignado a (Usuario)',
            type: 'select',
            options: [
                { value: '', label: 'Sin asignar' },
                ...usuarios.map(u => ({ value: u.id, label: u.nombre }))
            ]
        },
        ...(user?.rol === 'admin' ? [{
            name: 'conf_id',
            label: 'Empresa Gestora',
            type: 'select',
            options: empresas.map(e => ({ value: e.id, label: e.nombre_empresa })),
            required: true
        }] : []),
        { name: 'notas', label: 'Notas Adicionales', type: 'textarea', placeholder: ' ', rows: 3, fullWidth: true },
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
            await api.post('/clientes', data);
            await fetchClientes();
        } catch (err) {
            console.error(err);
            alert('Error al crear el cliente.');
        }
        setLoading(false);
    };

    const handleEdit = async (originalItem, formData) => {
        setLoading(true);
        try {
            const data = generateFormData(formData, originalItem);
            await api.put(`/clientes/${originalItem.id}`, data);
            await fetchClientes();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el cliente.');
        }
        setLoading(false);
    };

    const handleDelete = async (item) => {
        const conf = window.confirm(`¿Seguro que deseas eliminar a ${item.nombre} ${item.apellido}?`);
        if (conf) {
            try {
                await api.delete(`/clientes/${item.id}`);
                setClientes(clientes.filter(c => c.id !== item.id));
            } catch (err) {
                console.error(err);
                alert('No se pudo borrar. Puede tener registros asociados.');
            }
        }
    };

    return (
        <div className="admin-page-container fade-in">
            {/* Advanced Filters Bar */}
            <div className="admin-filters-bar" style={{
                marginBottom: '20px',
                background: 'rgba(255,255,255,0.03)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '12px',
                alignItems: 'end'
            }}>
                <div className="filter-item">
                    <label style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '5px', display: 'block' }}>Buscar Cliente / Documento / Empresa</label>
                    <div className="search-input-wrapper" style={{ width: '100%', margin: 0 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nombre, correo, empresa, teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-item">
                    <label style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '5px', display: 'block' }}>Estado</label>
                    <select
                        className="admin-select-sm"
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="prospecto">Prospecto</option>
                        <option value="contactado">Contactado</option>
                        <option value="propuesta">Propuesta</option>
                        <option value="contratado">Contratado</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                <button
                    className="btn-admin-secondary"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterEstado('all');
                    }}
                    style={{ height: '40px', padding: '0 15px' }}
                >
                    Limpiar
                </button>
            </div>

            <DynamicTableManager
                title="Directorio de Clientes"
                data={filtered}
                columns={columns.filter(c => !c.hidden)}
                formFields={formFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />
        </div>
    );
};

export default AdminClientesTable;
