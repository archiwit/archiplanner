import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DynamicForm from '../../components/ui/DynamicForm/DynamicForm';
import { 
    User, Mail, Phone, Edit, Calendar, 
    Users, FileText, CheckCircle, Clock 
} from 'lucide-react';
import { UPLOADS_URL } from '../../config';

const AdminPerfil = () => {
    const { user: authUser, updateAuthUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState({ clientes: 0, cotizaciones: 0, eventosActivos: 0 });
    const [ultimosClientes, setUltimosClientes] = useState([]);
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authUser) {
            fetchProfileData();
        }
    }, [authUser]);

    const fetchProfileData = async () => {
        try {
            const res = await api.get(`/usuarios/${authUser.id}/perfil-stats`);
            setProfileData(res.data.user);
            setStats(res.data.stats);
            setUltimosClientes(res.data.ultimosClientes);
        } catch (err) {
            console.error("Error fetching profile", err);
        }
    };

    const formFields = [
        {
            name: 'foto',
            type: 'file',
            render: (field, value, onChange) => {
                const previewUrl = value instanceof File 
                    ? URL.createObjectURL(value) 
                    : (value ? `${UPLOADS_URL}${value}` : '');
                return (
                    <div className="logo-upload-section mb-5" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="logo-preview-admin" style={{ 
                            width: '80px', height: '80px', borderRadius: '50%', 
                            border: '2px dashed rgba(255,132,132,0.3)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', background: 'var(--color-bg)'
                        }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={30} color="var(--color-text-dim)" />
                            )}
                        </div>
                        <div className="logo-controls">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Foto de Perfil</label>
                            <input 
                                type="file" accept="image/*" name={field.name} onChange={onChange} 
                                style={{ fontSize: '12px', background: 'transparent', border: 'none', padding: 0 }}
                            />
                        </div>
                    </div>
                );
            }
        },
        { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true, placeholder: ' ' },
        { name: 'nick', label: 'Nick de Usuario', type: 'text', required: true, placeholder: ' ' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', required: true, placeholder: ' ' },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: ' ' },
        { name: 'clave', label: 'Nueva Contraseña (Opcional)', type: 'password', placeholder: ' ' }
    ];

    const handleSubmitEdit = async (formData) => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'foto' && key !== 'foto_path' && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });
            if (formData.foto instanceof File) {
                data.append('foto', formData.foto);
            } else if (profileData && profileData.foto && typeof formData.foto === 'string') {
                data.append('foto_path', profileData.foto);
            }

            const resApi = await api.put(`/usuarios/${profileData.id}/perfil`, data);
            await fetchProfileData();
            
            if (resApi.data.success && resApi.data.foto) {
                updateAuthUser({
                    nombre: formData.nombre,
                    foto: resApi.data.foto
                });
            } else {
                updateAuthUser({ nombre: formData.nombre });
            }

            setShowEditModal(false);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (!profileData) return <div style={{ color: 'var(--color-text-dim)', padding: '40px' }}>Cargando perfil...</div>;

    return (
        <div className="profile-dashboard">
            {/* Left Main Pane */}
            <div className="profile-content-left">
                
                {/* 1. Main Profile Card */}
                <div className="profile-main-card">
                    <div className="profile-avatar-large">
                        {profileData.foto ? (
                            <img src={`${UPLOADS_URL}${profileData.foto}`} alt={profileData.nombre} />
                        ) : (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-primary-dim)', color:'var(--color-primary)', fontSize:'64px'}}>
                                {profileData.nombre.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1>{profileData.nombre}</h1>
                                <span className="profile-role">{profileData.rol}</span>
                            </div>
                            <button onClick={() => setShowEditModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}>
                                <Edit size={20} />
                            </button>
                        </div>
                        
                        <div className="profile-badges">
                            {profileData.rol === 'admin' ? <span className="badge badge-coral">Super Admin</span> : <span className="badge badge-blue">Colaborador</span>}
                            <span className="badge badge-gold">{profileData.nombre_empresa || 'Empresa No Asignada'}</span>
                            <span className="badge badge-blue">Verificado</span>
                        </div>
                        
                        <div style={{ color: 'var(--color-text-dim)', fontSize: '13px', lineHeight: '2' }}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Mail size={14}/> {profileData.correo}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Phone size={14}/> {profileData.telefono || 'Sin registrar'}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Row (4 Cards) */}
                <div className="stats-grid-4">
                    <div className="stat-box">
                        <div className="stat-box-icon"><Users size={20}/></div>
                        <h4>Total Clientes</h4>
                        <div className="value">{stats.clientes}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-icon"><FileText size={20}/></div>
                        <h4>Cotizaciones Emitidas</h4>
                        <div className="value">{stats.cotizaciones}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-icon" style={{color: 'var(--color-tertiary)'}}><CheckCircle size={20}/></div>
                        <h4>Eventos Éxito</h4>
                        <div className="value">{stats.eventosActivos}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-icon" style={{color: '#EBDA7E'}}><Clock size={20}/></div>
                        <h4>Horas de Asesoría</h4>
                        <div className="value">120</div> {/* Stat simulado por ahora */}
                    </div>
                </div>

                {/* 3. Latest Patients / Clients Table */}
                <div className="mini-table-card">
                    <h3>Últimos Clientes Asignados</h3>
                    <div className="dynamic-table-wrapper" style={{ boxShadow: 'none' }}>
                        <table className="dynamic-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Nombre</th>
                                    <th>Tipo Evento</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimosClientes.length > 0 ? ultimosClientes.map(c => (
                                    <tr key={c.id}>
                                        <td>{new Date(c.fevento || Date.now()).toLocaleDateString()}</td>
                                        <td style={{fontWeight: '500'}}>{c.nombre} {c.apellido}</td>
                                        <td style={{color: 'var(--color-text-dim)'}}>{c.tipo_evento}</td>
                                        <td>
                                            <span className={`table-status ${c.estado === 'prospecto' ? 'status-inactive' : 'status-active'}`}>
                                                <span className="status-dot"></span>
                                                {c.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'var(--color-text-dim)'}}>No hay clientes recientes</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Right Pane */}
            <div className="profile-sidebar-right">
                
                {/* Simulated Widget */}
                <div className="right-panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px' }}>
                    <Calendar size={48} color="var(--color-primary)" style={{marginBottom: '16px'}} />
                    <h3 style={{marginBottom: '8px', color: 'var(--color-white)'}}>Mi Agenda Mes Actual</h3>
                    <p style={{fontSize: '13px', color: 'var(--color-text-dim)', textAlign: 'center'}}>Consulta tus eventos más cercanos.</p>
                </div>

                <div className="right-panel-card">
                    <h3>Próximos Eventos</h3>
                    
                    {ultimosClientes.map((c, i) => (
                        <div className="event-list-item" key={i}>
                            <div className="event-list-item-icon">
                                {c.nombre.charAt(0)}
                            </div>
                            <div style={{flex: 1}}>
                                <h4 style={{fontSize: '14px', marginBottom: '2px'}}>{c.tipo_evento}</h4>
                                <p style={{fontSize: '11px', color: 'var(--color-text-dim)'}}>
                                    10:00 - 11:30 <br/> {c.nombre} {c.apellido}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {ultimosClientes.length === 0 && <p style={{fontSize:'13px', color:'var(--color-text-dim)'}}>Vacío</p>}
                </div>

            </div>

            {/* Edit Modal Wrapper */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Editar Perfil</h3>
                            <button className="btn-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <DynamicForm
                                fields={formFields}
                                initialValues={{
                                    nombre: profileData.nombre,
                                    nick: profileData.nick,
                                    correo: profileData.correo,
                                    telefono: profileData.telefono,
                                    foto: profileData.foto
                                }}
                                onSubmit={handleSubmitEdit}
                                submitText="Guardar Cambios"
                                isLoading={loading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPerfil;
