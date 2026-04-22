import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DynamicForm from '../../components/ui/DynamicForm/DynamicForm';
import { 
    User, Mail, Phone, Edit, Calendar, 
    Users, FileText, CheckCircle, Clock, MapPin, Hash, Lock, Globe
} from 'lucide-react';
import { AdminInput, AdminImageUpload, AdminButton } from '../../components/ui/AdminFormFields';
import { getUploadUrl } from '../../config';
import Swal from 'sweetalert2';

const AdminPerfil = () => {
    const { user: authUser, updateAuthUser } = useAuth();
    const isClient = authUser?.rol === 'cliente';
    
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState({ clientes: 0, cotizaciones: 0, eventosActivos: 0 });
    const [ultimosClientes, setUltimosClientes] = useState([]);
    const [clientSummary, setClientSummary] = useState(null);
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        if (authUser) {
            fetchProfileData();
        }
    }, [authUser]);

    // Update form values when profileData changes
    useEffect(() => {
        if (profileData) {
            console.log('[DEBUG-FORM] Setting form values from profileData:', profileData);
            setFormValues({
                nombre: profileData.nombre || '',
                apellido: profileData.apellido || '',
                nick: profileData.nick || '',
                correo: profileData.correo || profileData.email || '',
                telefono: profileData.telefono || '',
                documento: profileData.documento || '',
                ciudad_cedula: profileData.ciudad_cedula || '',
                nacimiento: profileData.nacimiento ? String(profileData.nacimiento).substring(0, 10) : '',
                direccion: profileData.direccion || '',
                foto: profileData.foto,
                clave: ''
            });
        }
    }, [profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const fetchProfileData = async () => {
        const isClientRole = authUser.rol === 'cliente' || authUser.origen === 'clientes';
        const targetId = authUser.id;
        
        console.log(`[PROFILE-RBAC] Fetching for ID: ${targetId}, Role: ${authUser.rol}`);

        try {
            if (isClientRole) {

                // Fetch basic client data and financial stats concurrently
                const [resClient, resStats] = await Promise.all([
                    api.get(`/clientes/${targetId}`).catch(() => ({ data: null })),
                    api.get(`/client-finance/${targetId}`).catch(() => ({ data: { summary: {} } }))
                ]);
                
                const clientData = resClient?.data;
                const mergedData = {
                    ...authUser,
                    ...clientData,
                    id: authUser.id,
                    cli_id: targetId,
                    // Campos clave con prioridad absoluta de API
                    nombre: clientData?.nombre || authUser.nombre || '',
                    apellido: clientData?.apellido || authUser.apellido || '',
                    nick: clientData?.nick || authUser.nick || '',
                    correo: clientData?.correo || clientData?.email || authUser.email || '',
                    telefono: clientData?.telefono || authUser.telefono || '',
                    documento: clientData?.documento || clientData?.cedula || '',
                    ciudad_cedula: clientData?.ciudad_cedula || clientData?.expedicion || '',
                    direccion: clientData?.direccion || authUser.direccion || '',
                    foto: clientData?.foto || authUser.foto || null
                };
                
                setProfileData(mergedData);
                setClientSummary(resStats.data?.summary || {});

            } else {
                const res = await api.get(`/usuarios/${authUser.id}/perfil-stats`);
                setProfileData(res.data.user);
                setStats(res.data.stats);
                setUltimosClientes(res.data.ultimosClientes);
            }
        } catch (err) {
            console.error("Error fetching profile", err);
            setProfileData(authUser); // Emergency fallback
        }
    };

    const handleSubmitEdit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            // Append all common fields
            fieldsToAppend.forEach(key => {
                if (formValues[key] !== undefined && formValues[key] !== null) {
                    // Format dates if needed
                    let val = formValues[key];
                    if (key === 'nacimiento' && val) val = val.substring(0, 10);
                    data.append(key, val);
                }
            });

            if (formValues.foto instanceof File) {
                data.append('foto', formValues.foto);
            } else if (profileData?.foto && typeof formValues.foto === 'string') {
                data.append('foto_path', profileData.foto);
            }

            const endpoint = isClient ? `/clientes/${profileData.id}/perfil` : `/usuarios/${profileData.id}/perfil`;
            const resApi = await api.put(endpoint, data);
            
            if (resApi.data.success) {
                updateAuthUser({
                    ...authUser,
                    nombre: formValues.nombre,
                    foto: resApi.data.foto || authUser.foto,
                    correo: formValues.correo,
                    telefono: formValues.telefono
                });
                await fetchProfileData();
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil Actualizado',
                    background: '#1a1a1a',
                    color: '#fff',
                    timer: 2000
                });
                setShowEditModal(false);
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: err.response?.data?.error || err.message,
                background: '#1a1a1a',
                color: '#fff'
            });
        }
        setLoading(false);
    };

    const fieldsToAppend = [
        'nombre', 'apellido', 'nick', 'correo', 'telefono', 
        'nacimiento', 'direccion', 'documento', 'ciudad_cedula', 'clave'
    ];

    if (!profileData) return <div style={{ color: 'var(--color-text-dim)', padding: '40px' }}>Cargando perfil...</div>;

    return (
        <div className="profile-dashboard">
            {/* Left Main Pane */}
            <div className="profile-content-left">
                
                <div className="profile-main-card">
                    <div className="profile-avatar-large">
                        {profileData.foto ? (
                            <img src={getUploadUrl(profileData.foto)} alt={profileData.nombre} />
                        ) : (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-primary-dim)', color:'var(--color-primary)', fontSize:'64px'}}>
                                {profileData.nombre?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1>{profileData.nombre}</h1>
                                <span className="profile-role">{profileData.rol || 'Cliente'}</span>
                            </div>
                            <button onClick={() => setShowEditModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}>
                                <Edit size={20} />
                            </button>
                        </div>
                        
                        <div className="profile-badges">
                            {isClient ? (
                                <span className="badge badge-gold">Cliente VIP</span>
                            ) : (
                                <>
                                    {profileData.rol === 'admin' ? <span className="badge badge-coral">Super Admin</span> : <span className="badge badge-blue">Equipo ArchiPlanner</span>}
                                    <span className="badge badge-gold">{profileData.nombre_empresa || 'Sede Principal'}</span>
                                </>
                            )}
                            <span className="badge badge-blue">Activo</span>
                        </div>
                        
                        <div style={{ color: 'var(--color-text-dim)', fontSize: '13px', lineHeight: '2' }}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Mail size={14}/> {profileData.correo}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Phone size={14}/> {profileData.telefono || 'Sin registrar'}</div>
                            {profileData.direccion && <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}><Edit size={14}/> {profileData.direccion}</div>}
                        </div>
                    </div>
                </div>

                {isClient ? (
                    <div className="stats-grid-4">
                        <div className="stat-box">
                            <div className="stat-box-icon"><Calendar size={20}/></div>
                            <h4>Inversión Total</h4>
                            <div className="value">${clientSummary?.total?.toLocaleString() || '0'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-box-icon" style={{color: 'var(--color-tertiary)'}}><CheckCircle size={20}/></div>
                            <h4>Pagado</h4>
                            <div className="value">${clientSummary?.paid?.toLocaleString() || '0'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-box-icon" style={{color: '#EBDA7E'}}><Clock size={20}/></div>
                            <h4>Progreso</h4>
                            <div className="value">{Math.round(clientSummary?.completionPercentage || 0)}%</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-box-icon"><Users size={20}/></div>
                            <h4>Atención</h4>
                            <div className="value">VIP</div>
                        </div>
                    </div>
                ) : (
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
                            <div className="value">120</div>
                        </div>
                    </div>
                )}

                {/* Latest Items / Table */}
                {!isClient && (
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
                                    {ultimosClientes.length > 0 ? ultimosClientes.map(c => {
                                        const date = c.fevento ? new Date(c.fevento) : null;
                                        const isInvalidDate = !date || isNaN(date.getTime()) || date.getFullYear() < 1920;
                                        const displayDate = isInvalidDate ? 'Por definir' : date.toLocaleDateString();
                                        
                                        // Mapeo de colores para estados
                                        const getStatusClass = (status) => {
                                            const s = status?.toLowerCase();
                                            if (s === 'prospecto') return 'status-inactive';
                                            if (s === 'contratado' || s === 'aprobado' || s === 'completado') return 'status-success';
                                            if (s === 'cotizando' || s === 'en proceso' || s === 'revisión') return 'status-warning';
                                            return 'status-active';
                                        };

                                        return (
                                            <tr key={c.id}>
                                                <td style={{ opacity: isInvalidDate ? 0.5 : 1, fontSize: '12px' }}>{displayDate}</td>
                                                <td style={{fontWeight: '600'}}>{c.nombre} {c.apellido}</td>
                                                <td style={{color: 'var(--color-text-dim)', fontSize: '13px'}}>{c.tipo_evento}</td>
                                                <td>
                                                    <span className={`table-status ${getStatusClass(c.estado)}`}>
                                                        <span className="status-dot"></span>
                                                        {c.estado || 'prospecto'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'var(--color-text-dim)'}}>No hay clientes recientes</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Edit Modal Wrapper */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
                        <div className="modal-header">
                            <h3>Edición de Perfil Premium</h3>
                            <button className="btn-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmitEdit} className="profile-edit-manual-form">
                                <div className="profile-layout-split">
                                    {/* Left: Image */}
                                    <div className="profile-split-left">
                                        <AdminImageUpload
                                            label="Imagen de Perfil"
                                            name="foto"
                                            value={formValues.foto}
                                            onChange={handleInputChange}
                                        />
                                        <p className="upload-hint">Sube una foto profesional para que tus clientes te reconozcan instantáneamente.</p>
                                    </div>

                                    {/* Right: Inputs */}
                                    <div className="profile-split-right">
                                        <div className="manual-grid-2">
                                            <AdminInput label="Primer Nombre" name="nombre" value={formValues.nombre} onChange={handleInputChange} required icon={User} />
                                            <AdminInput label="Apellidos" name="apellido" value={formValues.apellido} onChange={handleInputChange} required icon={User} />
                                            <AdminInput label="Usuario (Nick)" name="nick" value={formValues.nick} onChange={handleInputChange} required icon={Hash} />
                                            <AdminInput label="Correo" name="correo" type="email" value={formValues.correo} onChange={handleInputChange} required icon={Mail} />
                                            
                                            <AdminInput label="Documento / Cédula" name="documento" value={formValues.documento} onChange={handleInputChange} icon={Globe} />
                                            <AdminInput label="Ciudad Expedición" name="ciudad_cedula" value={formValues.ciudad_cedula} onChange={handleInputChange} icon={MapPin} />
                                            
                                            <AdminInput label="Fecha Nacimiento" name="nacimiento" type="date" value={formValues.nacimiento} onChange={handleInputChange} icon={Calendar} />
                                            <AdminInput label="Teléfono / WhatsApp" name="telefono" value={formValues.telefono} onChange={handleInputChange} icon={Phone} />
                                            
                                            <AdminInput label="Dirección de Residencia" name="direccion" value={formValues.direccion} onChange={handleInputChange} width="100%" icon={MapPin} style={{ gridColumn: 'span 2' }} />
                                            <AdminInput label="Nueva Contraseña" name="clave" type="password" value={formValues.clave} onChange={handleInputChange} width="100%" placeholder="Dejar vacío para conservar" icon={Lock} style={{ gridColumn: 'span 2' }} />
                                        </div>

                                        <div className="manual-form-footer">
                                            <AdminButton type="submit" isLoading={loading} width="100%">
                                                Guardar Cambios
                                            </AdminButton>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .profile-edit-manual-form { padding: 10px; }
                .profile-layout-split { display: flex; gap: 30px; }
                .profile-split-left { flex: 0 0 280px; }
                .profile-split-right { flex: 1; }
                
                .manual-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .manual-form-footer { margin-top: 30px; }
                
                .upload-hint { font-size: 11px; color: var(--color-text-dim); opacity: 0.5; margin-top: 15px; line-height: 1.5; padding: 0 10px; }

                 .status-success { background: rgba(95, 220, 199, 0.1); color: #5fdcc7; }
                 .status-warning { background: rgba(235, 218, 126, 0.1); color: #EBDA7E; }
                 .status-active { background: rgba(183, 110, 121, 0.1); color: var(--color-primary); }

                /* Responsividad */
                @media (max-width: 768px) {
                    .profile-layout-split { flex-direction: column; gap: 20px; }
                    .profile-split-left { flex: none; width: 100%; }
                    .manual-grid-2 { grid-template-columns: 1fr; }
                    .profile-avatar-large { width: 100px; height: 100px; }
                    .profile-info h1 { font-size: 24px; }
                    .stats-grid-4 { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AdminPerfil;
