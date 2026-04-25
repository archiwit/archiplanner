import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import actividadService from '../../services/actividadService';
import clienteService from '../../services/clienteService';
import cotizacionService from '../../services/cotizacionService';
import alertasService from '../../services/alertasService';
import googleService from '../../services/googleService';
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Clock, 
    MapPin, 
    Users, 
    Filter, 
    Trash2, 
    Edit2, 
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Search,
    Save,
    X as CloseIcon,
    Phone,
    Star,
    Heart,
    Crown,
    Briefcase,
    AlertCircle,
    DollarSign,
    Bell
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminCalendar = () => {
    const { companyConfig, user } = useAuth();
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('list'); // 'list' o 'google'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [focusedField, setFocusedField] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [clientCotizaciones, setClientCotizaciones] = useState([]); 
    const [alertas, setAlertas] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);

    useEffect(() => {
        // Verificar conexión inicial
        if (user?.google_access_token) {
            setIsGoogleConnected(true);
        }
    }, [user]);

    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                const code = event.data.code;
                try {
                    await googleService.exchangeToken(code, user.id);
                    setIsGoogleConnected(true);
                    Swal.fire({
                        icon: 'success',
                        title: '¡Google Calendar Conectado!',
                        text: 'Tus actividades ahora se sincronizarán automáticamente.',
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    fetchActividades();
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'Error al conectar', text: err.message, background: '#1a1a1a', color: '#fff' });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [user]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Form states
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        tipo: 'cita',
        fecha_inicio: '',
        fecha_fin: '',
        ubicacion: '',
        color: '#B76E79',
        cli_id: '',
        cot_id: '',
        resumen: '',
        is_public: true
    });

    const renderField = (label, name, type = 'text', options = null) => {
        const val = formData[name];
        const isFloating = focusedField === name || (val && val.toString().length > 0) || type === 'datetime-local' || type === 'select';
        
        return (
            <div className={`form-field ${isFloating ? 'is-floating' : ''}`}>
                {type === 'select' ? (
                    <select 
                        value={val} 
                        onChange={e => setFormData({...formData, [name]: e.target.value})}
                        onFocus={() => setFocusedField(name)}
                        onBlur={() => setFocusedField(null)}
                    >
                        {options}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea 
                        rows="3"
                        value={val}
                        onChange={e => setFormData({...formData, [name]: e.target.value})}
                        onFocus={() => setFocusedField(name)}
                        onBlur={() => setFocusedField(null)}
                    ></textarea>
                ) : (
                    <input 
                        type={type}
                        value={type === 'datetime-local' && val ? val.slice(0, 16) : val}
                        onChange={e => setFormData({...formData, [name]: e.target.value})}
                        onFocus={() => setFocusedField(name)}
                        onBlur={() => setFocusedField(null)}
                        required={name === 'titulo' || name === 'fecha_inicio'}
                    />
                )}
                <label>{label}</label>
            </div>
        );
    };

    // Helper para formato YYmmdd (similar a PDFs)
    const getYYmmdd = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            const yy = d.getFullYear().toString().slice(-2);
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const dd = d.getDate().toString().padStart(2, '0');
            return `${yy}${mm}${dd}`;
        } catch (e) {
            return '';
        }
    };

    const filteredCotizaciones = useMemo(() => {
        if (!cotizaciones) return [];
        return cotizaciones.filter(c => 
            !['finalizado', 'cancelado', 'rechazado', 'suspendido'].includes(c.estado?.toLowerCase())
        );
    }, [cotizaciones]);

    // Combinar Actividades Reales + Alertas de BD + Vencimientos Calculados
    const combinedAgenda = useMemo(() => {
        const items = actividades.map(a => ({ ...a, agendaType: 'activity' }));
        
        // 1. Integrar Alertas de la DB
        const alertItems = alertas.map(al => ({
            id: `alert-${al.id}`,
            titulo: al.titulo,
            descripcion: al.mensaje,
            tipo: al.tipo,
            fecha_inicio: al.fecha_creacion,
            color: al.tipo === 'pago_vencido' ? '#ff5252' : '#ffc107',
            agendaType: 'alert',
            realId: al.id,
            leida: al.leida
        }));

        // 2. Calcular Vencimientos de Cotizaciones (15 días post-fcoti si no están aprobadas)
        const expirationItems = cotizaciones
            .filter(c => c.estado === 'enviada' && c.fcoti)
            .map(c => {
                const created = new Date(c.fcoti);
                const expiry = new Date(created);
                expiry.setDate(created.getDate() + 15);
                
                return {
                    id: `expiry-${c.id}`,
                    titulo: `⚠️ Expira Cotización: ${c.num}`,
                    descripcion: `La cotización para ${c.cliente_nombre} vence hoy.`,
                    tipo: 'expiracion',
                    fecha_inicio: expiry.toISOString(),
                    color: '#ff9800',
                    agendaType: 'virtual_alert',
                    link: `/admin/cotizaciones?search=${c.num}`
                };
            });

        // 3. Saldos Pendientes (Eventos en < 10 días con deuda)
        const debtItems = cotizaciones
            .filter(c => (c.estado === 'aprobado' || c.estado === 'contratado') && c.fevent)
            .filter(c => {
                const eventDate = new Date(c.fevent);
                const diff = (eventDate - new Date()) / (1000 * 60 * 60 * 24);
                return diff > 0 && diff <= 10 && c.monto_final > 0; // Simplificado: asumiendo que monto_final es deuda o total
            })
            .map(c => ({
                id: `debt-${c.id}`,
                titulo: `💰 Saldo Pendiente: ${c.cliente_nombre}`,
                descripcion: `Evento el ${new Date(c.fevent).toLocaleDateString()}. Revisar pagos.`,
                tipo: 'deuda',
                fecha_inicio: new Date(c.fevent).toISOString(),
                color: '#f44336',
                agendaType: 'virtual_alert'
            }));

        const combined = [...items, ...alertItems, ...expirationItems, ...debtItems];
        
        // Ordenar por fecha cronológica (más reciente/futuro primero en lista)
        return combined.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
    }, [actividades, alertas, cotizaciones]);

    const filteredAgenda = filterType === 'all' 
        ? combinedAgenda 
        : combinedAgenda.filter(a => a.tipo === filterType || a.agendaType === 'alert');

    // Items críticos para el panel lateral
    const criticalItems = useMemo(() => {
        return combinedAgenda.filter(item => 
            (item.agendaType === 'alert' && !item.leida) || 
            item.agendaType === 'virtual_alert'
        ).slice(0, 5);
    }, [combinedAgenda]);

    useEffect(() => {
        fetchActividades();
        fetchClientes();
        fetchAllCotizaciones();
        fetchAlertas();
    }, []);

    const fetchAlertas = async () => {
        try {
            const data = await alertasService.getAll();
            setAlertas(data);
        } catch (err) {
            console.error("Error fetching alerts for calendar:", err);
        }
    };

    const fetchAllCotizaciones = async () => {
        try {
            const data = await cotizacionService.getAll();
            setCotizaciones(data);
        } catch (err) {
            console.error("Error fetching cotizaciones:", err);
        }
    };

    const fetchClientes = async () => {
        try {
            const data = await clienteService.getAll();
            setClientes(data);
        } catch (err) {
            console.error("Error fetching clients for calendar:", err);
        }
    };

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const data = await actividadService.getAll({ conf_id: companyConfig?.id });
            setActividades(data);
        } catch (err) {
            console.error("Error fetching activities:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const files = e.target.fotos?.files;
        
        try {
            let result;
            if (currentEdit) {
                result = await actividadService.update(currentEdit.id, formData);
                Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Actividad actualizada correctamente.', background: '#1a1a1a', color: '#fff' });
            } else {
                const payload = { 
                    ...formData, 
                    conf_id: companyConfig?.id || 1, 
                    u_id: user?.id,
                    cli_id: formData.cli_id || (formData.cot_id ? cotizaciones.find(c => c.id == formData.cot_id)?.cli_id : null)
                };
                result = await actividadService.create(payload);
                Swal.fire({ icon: 'success', title: '¡Agendado!', text: 'Nueva actividad creada.', background: '#1a1a1a', color: '#fff' });
            }

            // Upload photos if any
            if (files && files.length > 0) {
                const activityId = currentEdit ? currentEdit.id : result.insertId;
                if (activityId) {
                    const fd = new FormData();
                    for (let file of files) {
                        fd.append('fotos', file);
                    }
                    await actividadService.uploadPhotos(activityId, fd);
                }
            }

            setIsModalOpen(false);
            setCurrentEdit(null);
            setFormData({ titulo: '', descripcion: '', resumen: '', tipo: 'cita', fecha_inicio: '', fecha_fin: '', ubicacion: '', color: '#B76E79', cli_id: '', cot_id: '', is_public: true });
            setClientCotizaciones([]);
            fetchActividades();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1a1a1a', color: '#fff' });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar actividad?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B76E79',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await actividadService.delete(id);
                fetchActividades();
                Swal.fire({ icon: 'success', title: 'Eliminado', text: 'La actividad ha sido borrada.', background: '#1a1a1a', color: '#fff' });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const getActivityIcon = (act) => {
        if (act.agendaType === 'alert' || act.agendaType === 'virtual_alert') {
            if (act.tipo === 'pago_vencido' || act.tipo === 'deuda') return <DollarSign size={14} />;
            if (act.tipo === 'expiracion' || act.tipo === 'recordatorio') return <AlertCircle size={14} />;
            return <Bell size={14} />;
        }

        switch (act.tipo) {
            case 'cita': return <Clock size={14} />;
            case 'visita': return <MapPin size={14} />;
            case 'reunion': return <Users size={14} />;
            case 'llamada': return <Phone size={14} />;
            case 'evento': 
                if (act.tipo_evento === 'Boda') return <Heart size={14} />;
                if (act.tipo_evento?.includes('XV')) return <Crown size={14} />;
                if (act.tipo_evento === 'Corporativo') return <Briefcase size={14} />;
                return <Star size={14} />;
            default: return <CalendarIcon size={14} />;
        }
    };

    const filteredActividades = filterType === 'all' 
        ? actividades 
        : actividades.filter(a => a.tipo === filterType);

    const getGoogleCalendarUrl = () => {
        let cid = "b9aa0ac458568f24df2c6a991ed1990b697b331fc7e719ca486d51c596c802a9@group.calendar.google.com";
        return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(cid)}&ctz=America%2FBogota`;
    };

    const handleConnectGoogle = async () => {
        try {
            const { url } = await googleService.getAuthUrl();
            const width = 600, height = 700;
            const left = (window.innerWidth / 2) - (width / 2);
            const top = (window.innerHeight / 2) - (height / 2);
            window.open(url, 'Google OAuth', `width=${width},height=${height},left=${left},top=${top}`);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener la URL de conexión.', background: '#1a1a1a', color: '#fff' });
        }
    };

    return (
        <div className="admin-page-container fade-in">
            <header className="admin-header-flex minimal">
                <div className="header-brand">
                     <span className="editorial-tag">Gestión de Tiempos / V4.6</span>
                     <h2>Calendario ArchiPlanner</h2>
                </div>
                
                <div className="admin-header-actions-premium">
                    {/* Indicador de Google Status (Discreto) */}
                    <div className={`google-status-pill ${isGoogleConnected ? 'online' : 'offline'}`} title={isGoogleConnected ? 'Sincronizado con Google' : 'Google Desconectado'}>
                        <div className="status-dot"></div>
                        <span>GOOGLE</span>
                        {!isGoogleConnected && <button className="btn-sync-tiny" onClick={handleConnectGoogle} title="Conectar"><CalendarIcon size={10} /></button>}
                    </div>

                    <div className="actions-divider"></div>

                    <button 
                        className={`btn-icon-premium ${view === 'list' ? 'active' : ''}`}
                        onClick={() => setView('list')}
                        title="Ver Lista"
                    >
                        <CalendarIcon size={18} />
                    </button>
                    <button 
                        className={`btn-icon-premium ${view === 'google' ? 'active' : ''}`}
                        onClick={() => setView('google')}
                        title="Google Calendar"
                    >
                        <Search size={18} />
                    </button>
                    <button className="btn-icon-premium action-plus" onClick={() => { setCurrentEdit(null); setIsModalOpen(true); }} title="Nueva Actividad">
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            <div className="calendar-minimal-container">
                {/* Herramientas de Filtrado Horizontal */}
                <div className="calendar-toolbar-minimal">
                    <div className="filter-group-premium">
                        {['all', 'evento', 'cita', 'visita', 'reunion'].map(t => (
                            <button 
                                key={t}
                                className={`filter-chip-premium ${filterType === t ? 'active' : ''}`}
                                onClick={() => setFilterType(t)}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Área Principal - Minimalist Grid */}
                <main className="calendar-main-fluid">
                    {view === 'list' ? (
                        <>
                            {loading ? (
                                <div className="empty-state">
                                    <div className="loader" style={{ width: '30px', height: '30px' }}></div>
                                    <p style={{ marginTop: '15px', fontSize: '12px', opacity: 0.5 }}>Actualizando agenda inteligente...</p>
                                </div>
                            ) : filteredAgenda.length === 0 ? (
                                <div className="empty-state glass-panel">
                                    <CalendarIcon size={32} opacity={0.1} />
                                    <p style={{ fontSize: '13px', opacity: 0.5, margin: '15px 0' }}>No hay actividades programadas.</p>
                                    <button className="btn-v4 btn-v4-primary btn-mini" onClick={() => setIsModalOpen(true)}>
                                        <Plus size={14} /> Nueva
                                    </button>
                                </div>
                            ) : (
                                <div className="activities-grid-premium">
                                    {filteredAgenda.map(act => (
                                        <div key={act.id} className={`activity-card-ultra glass-panel ${act.agendaType}`}>
                                            <div className="card-accent" style={{ background: act.color }}></div>
                                            <div className="card-body">
                                                <div className="card-top">
                                                    <span className="card-type">{getActivityIcon(act)} {act.tipo}</span>
                                                    <span className="card-time">{new Date(act.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <h4 className="card-title">{act.titulo}</h4>
                                                <div className="card-meta">
                                                    {act.ubicacion && <span><MapPin size={10} /> {act.ubicacion}</span>}
                                                    {act.cliente_nombre && <span><Users size={10} /> {act.cliente_nombre}</span>}
                                                </div>
                                            </div>
                                            <div className="card-actions-hover">
                                                <button onClick={() => { setCurrentEdit(act); setFormData(act); setIsModalOpen(true); }}><Edit2 size={14} /></button>
                                                <button className="del" onClick={() => handleDelete(act.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="google-calendar-fullscreen glass-panel">
                            <iframe 
                                src={getGoogleCalendarUrl()}
                                style={{ border: 0, width: '100%', height: '100%', filter: 'invert(90%) hue-rotate(180deg)' }} 
                                frameBorder="0" 
                                scrolling="no"
                                title="Google Calendar"
                            ></iframe>
                        </div>
                    )}
                </main>
            </div>

             {/* Modal para Crear/Editar */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="admin-modal-premium fade-in">
                        <div className="modal-header-premium">
                            <h2>{currentEdit ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
                            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSave} className="admin-form-premium">
                            <div className="p-20">
                                {renderField('Título de la Actividad', 'titulo', 'text')}
                                
                                    <div className="modal-form-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px' }}>
                                        {renderField('Tipo', 'tipo', 'select', (
                                            <>
                                                <option value=""></option>
                                                <option value="cita">Cita</option>
                                                <option value="visita">Visita</option>
                                                <option value="reunion">Reunión</option>
                                                <option value="llamada">Llamada</option>
                                                <option value="evento">Evento</option>
                                                <option value="otro">Otro</option>
                                            </>
                                        ))}
                                        
                                        <div className={`form-field ${(focusedField === 'cot_id' || formData.cot_id) ? 'is-floating' : ''}`}>
                                            <select 
                                                value={formData.cot_id} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const cot = filteredCotizaciones.find(c => c.id == val);
                                                    setFormData({
                                                        ...formData, 
                                                        cot_id: val, 
                                                        cli_id: cot ? cot.cli_id : ''
                                                    });
                                                }}
                                                onFocus={() => setFocusedField('cot_id')}
                                                onBlur={() => setFocusedField(null)}
                                            >
                                                <option value=""></option>
                                                {filteredCotizaciones.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {getYYmmdd(c.fevent)} - {c.tipo_evento || 'Evento'} ({c.cliente_nombre || 'S/C'})
                                                    </option>
                                                ))}
                                            </select>
                                            <label>Evento / Cotización</label>
                                        </div>
                                        
                                        <div className={`form-field ${(focusedField === 'cli_id' || formData.cli_id) ? 'is-floating' : ''}`}>
                                            <select 
                                                value={formData.cli_id} 
                                                onChange={e => {
                                                    setFormData({...formData, cli_id: e.target.value, cot_id: ''});
                                                }}
                                                onFocus={() => setFocusedField('cli_id')}
                                                onBlur={() => setFocusedField(null)}
                                                disabled={!!formData.cot_id}
                                            >
                                                <option value=""></option>
                                                {clientes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                                                ))}
                                            </select>
                                            <label>Cliente vinculado</label>
                                        </div>
                                    </div>

                                    <div className="form-field is-floating">
                                        <div className="color-preview-input">
                                            <div className="color-circle" style={{ background: formData.color }}></div>
                                            <input 
                                                type="color" 
                                                value={formData.color} 
                                                onChange={e => setFormData({...formData, color: e.target.value})} 
                                                style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%' }}
                                            />
                                            <span className="color-code">{formData.color.toUpperCase()}</span>
                                        </div>
                                        <label>Etiqueta de Color</label>
                                    </div>

                                <div className="modal-form-grid">
                                    {renderField('Inicio', 'fecha_inicio', 'datetime-local')}
                                    {renderField('Fin (Estimado)', 'fecha_fin', 'datetime-local')}
                                </div>

                                {renderField('Ubicación / Link Virtual', 'ubicacion', 'text')}
                                {renderField('Notas Internas', 'descripcion', 'textarea')}
                                {renderField('Resumen de la Reunión (Visible para el Cliente)', 'resumen', 'textarea')}
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="is_public" 
                                        checked={formData.is_public}
                                        onChange={e => setFormData({...formData, is_public: e.target.checked})}
                                    />
                                    <label htmlFor="is_public" style={{ position: 'static', transform: 'none', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                        Visible en el portal del cliente
                                    </label>
                                </div>

                                <div className="form-field">
                                    <label style={{ position: 'static', display: 'block', marginBottom: '10px' }}>Fotos de la Reunión / Galería</label>
                                    <input 
                                        type="file" 
                                        name="fotos" 
                                        multiple 
                                        accept="image/*"
                                        style={{ padding: '8px' }}
                                    />
                                    <p style={{ fontSize: '10px', opacity: 0.5, marginTop: '5px' }}>Puedes seleccionar varias imágenes a la vez.</p>
                                </div>

                                <div className="admin-form-footer">
                                    <button type="button" className="btn-v4 btn-v4-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn-v4 btn-v4-primary">
                                        <Save size={16} /> {currentEdit ? 'Actualizar Cambios' : 'Confirmar Agenda'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .calendar-content-grid {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 30px;
                    margin-top: 25px;
                }
                .calendar-sidebar {
                    position: sticky;
                    top: 20px;
                }
                .filter-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .filter-btn {
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 8px;
                    color: rgba(255,255,255,0.5);
                    font-size: 10px;
                    font-weight: 700;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.5px;
                }
                .filter-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .filter-btn.active {
                    color: var(--color-primary);
                }
                
                .critical-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .critical-item-mini {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .critical-item-mini:hover { background: rgba(255,255,255,0.05); }
                .critical-icon {
                    width: 28px; height: 28px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.03);
                    border-radius: 6px;
                }
                .critical-info { display: flex; flex-direction: column; min-width: 0; }
                .critical-title { font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .critical-date { font-size: 9px; opacity: 0.5; }

                .alert-dot {
                    display: inline-block;
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    margin-left: 8px;
                    vertical-align: middle;
                    box-shadow: 0 0 10px currentColor;
                }

                .activity-item-wrapper.alert .activity-card-compact,
                .activity-item-wrapper.virtual_alert .activity-card-compact {
                    background: rgba(0,0,0,0.2);
                }

                .activity-card-compact.is-read { opacity: 0.6; }

                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .activity-item-wrapper { width: 100%; }
                .activity-card-compact {
                    display: flex;
                    gap: 15px;
                    padding: 12px 16px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255,132,132,0.05);
                }
                .activity-card-compact:hover { 
                    transform: translateX(5px);
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,132,132,0.15);
                }
                .activity-accent-bar {
                    width: 3px;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    opacity: 0.4;
                }
                .activity-main { flex: 1; min-width: 0; }
                .activity-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .activity-type-tag {
                    font-size: 8px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    background: rgba(255,255,255,0.04);
                    padding: 1px 6px;
                    border-radius: 3px;
                    color: var(--color-text-dim);
                }
                .activity-time-compact {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--color-primary);
                }
                .activity-title-compact { 
                    font-size: 14px; 
                    margin: 0 0 3px 0; 
                    color: #fff; 
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .activity-meta-compact { display: flex; gap: 12px; font-size: 10px; color: var(--color-text-dim); }
                .activity-meta-compact span { display: flex; align-items: center; gap: 3px; }
                .activity-desc-mini {
                    font-size: 11px;
                    color: rgba(255,255,255,0.3);
                    margin-top: 6px;
                    padding-top: 6px;
                    border-top: 1px solid rgba(255,255,255,0.03);
                    line-height: 1.4;
                }
                .activity-actions-compact { display: flex; gap: 4px; align-items: center; }
                .btn-icon-tiny {
                    width: 26px; height: 26px; border-radius: 6px; border: none; background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-tiny:hover { background: rgba(255,255,255,0.08); color: #fff; }
                .btn-icon-tiny.delete:hover { color: #ff5252; background: rgba(255,82,82,0.1); }

                .google-calendar-embed {
                    height: 550px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: #000;
                }

                /* Premium Modal Overrides */
                .admin-modal-premium {
                    background: #141414;
                    border: 1px solid rgba(255,132,132,0.15);
                    border-radius: 20px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .admin-form-premium {
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .admin-form-premium::-webkit-scrollbar { width: 5px; }
                .admin-form-premium::-webkit-scrollbar-thumb { background: rgba(255,132,132,0.2); border-radius: 5px; }
                
                .modal-form-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                .p-20 { padding: 20px; }

                .color-preview-input {
                    position: relative;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px;
                }
                .color-circle {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,255,255,0.2);
                    position: absolute;
                    left: 10px;
                    z-index: 1;
                }
                .color-code { font-size: 12px; margin-left: 36px; opacity: 0.6; font-family: monospace; }
                
                @media (max-width: 768px) {
                    .calendar-content-grid { grid-template-columns: 1fr; }
                    .calendar-sidebar { display: none; }
                    .modal-form-grid { grid-template-columns: 1fr; }
                    .admin-modal-premium { width: 95%; height: auto; max-height: 90vh; }
                }

                .btn-close-modal {
                    background: rgba(255,255,255,0.03);
                    border: none;
                    color: rgba(255,255,255,0.4);
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .btn-close-modal:hover { background: rgba(255,82,82,0.1); color: #ff5252; transform: rotate(90deg); }
                
                /* Global V4 Field Support if missing */
                .form-field {
                    position: relative;
                    margin-bottom: 20px;
                    width: 100%;
                }
                .form-field label {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.3);
                    font-size: 14px;
                    transition: all 0.3s ease;
                    pointer-events: none;
                    background: transparent;
                    padding: 0 5px;
                    border-radius: 4px;
                }
                .form-field.is-floating label {
                    top: 0;
                    font-size: 11px;
                    color: var(--color-primary);
                    background: #141414;
                    opacity: 1;
                }
                .form-field input, .form-field select, .form-field textarea {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 14px;
                    transition: all 0.3s;
                    appearance: none;
                }
                .form-field select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                    padding-right: 40px;
                }
                .form-field select option {
                    background-color: #1a1a1a;
                    color: #fff;
                    padding: 10px;
                }
                .admin-header-flex.minimal {
                    padding-bottom: 25px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    margin-bottom: 20px;
                }

                .admin-header-actions-premium {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-icon-premium {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.5);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .btn-icon-premium:hover {
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    transform: translateY(-2px);
                    border-color: rgba(255,132,132,0.3);
                }
                .btn-icon-premium.active {
                    background: var(--color-primary);
                    color: #000;
                    border-color: var(--color-primary);
                    box-shadow: 0 8px 20px rgba(255,132,132,0.3);
                }
                .btn-icon-premium.action-plus {
                    background: #fff;
                    color: #000;
                }

                .google-status-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }
                .google-status-pill.online .status-dot { background: #5FDC7F; box-shadow: 0 0 10px #5FDC7F; }
                .google-status-pill.offline .status-dot { background: #ff5252; }
                .btn-sync-tiny {
                    background: none; border: none; color: var(--color-primary); cursor: pointer;
                    padding: 2px; margin-left: 5px; opacity: 0.7; transition: 0.3s;
                }
                .btn-sync-tiny:hover { opacity: 1; transform: rotate(15deg); }

                .actions-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); margin: 0 8px; }

                /* Toolbar Minimalista */
                .calendar-toolbar-minimal {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 15px;
                }
                .filter-group-premium {
                    display: flex;
                    gap: 10px;
                    background: rgba(255,255,255,0.02);
                    padding: 6px;
                    border-radius: 50px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .filter-chip-premium {
                    padding: 6px 18px;
                    border-radius: 50px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.4);
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .filter-chip-premium:hover { color: #fff; }
                .filter-chip-premium.active {
                    background: rgba(255,132,132,0.1);
                    color: var(--color-primary);
                }

                /* Grid de Actividades Premium */
                .activities-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }
                .activity-card-ultra {
                    position: relative;
                    padding: 0;
                    border-radius: 0 20px 20px 0 !important;
                    transition: 0.3s;
                    border: 1px solid rgba(255,255,255,0.05);
                    cursor: default;
                    overflow: hidden;
                }
                .activity-card-ultra:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,132,132,0.2);
                }
                .card-accent {
                    position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
                    opacity: 0.8;
                }
                .card-body {
                    padding: 10px 15px 10px 18px;
                }
                .card-top { display: flex; justify-content: space-between; margin-bottom: 6px; opacity: 0.5; }
                .card-type { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 4px; }
                .card-time { font-size: 9px; font-weight: 700; }
                .card-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 5px; line-height: 1.3; }
                .card-meta { display: flex; flex-direction: column; gap: 3px; font-size: 10px; color: rgba(255,255,255,0.4); }
                .card-meta span { display: flex; align-items: center; gap: 6px; }

                .card-actions-hover {
                    position: absolute; right: 15px; top: 50%; transform: translateY(-50%) translateX(10px);
                    display: flex; flex-direction: column; gap: 8px; opacity: 0; transition: 0.3s;
                }
                .activity-card-ultra:hover .card-actions-hover { opacity: 1; transform: translateY(-50%) translateX(0); }
                .card-actions-hover button {
                    width: 32px; height: 32px; border-radius: 50%; border: none;
                    background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .card-actions-hover button:hover { background: rgba(255,255,255,0.1); }
                .card-actions-hover button.del:hover { background: rgba(255,82,82,0.1); color: #ff5252; }

                .google-calendar-fullscreen { height: 700px; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }

                @media (max-width: 768px) {
                    .activities-grid-premium { grid-template-columns: 1fr; }
                    .calendar-toolbar-minimal { overflow-x: auto; justify-content: flex-start; padding-bottom: 10px; }
                }
            `}</style>
        </div>
    );
};

export default AdminCalendar;
