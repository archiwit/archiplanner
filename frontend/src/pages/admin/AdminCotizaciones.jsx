import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Plus, Search, FileText, Calendar, User, X,
    MoreVertical, Edit2, Trash2, ExternalLink, 
    CheckCircle2, Clock, FileWarning, Building2, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../config';
import { formatDateSafe } from '../../utils/dateUtils';

const AdminCotizaciones = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterEvento, setFilterEvento] = useState('all');
    const [filterFecha, setFilterFecha] = useState('');

    const isSuperuser = user?.rol?.toLowerCase() === 'admin' || user?.rol?.toLowerCase() === 'superuser';
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    // Alt + N for New Quotation
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                navigate('/admin/cotizaciones/nueva');
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [navigate]);

    const fetchCotizaciones = async () => {
        try {
            const res = await api.get('/cotizaciones?clase=evento');
            setCotizaciones(res.data);
        } catch (err) {
            console.error('Error fetching cotizaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta cotización?')) return;
        try {
            await api.delete(`/cotizaciones/${id}`);
            setCotizaciones(cotizaciones.filter(c => c.id !== id));
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'aprobado': return <CheckCircle2 size={14} className="text-success" />;
            case 'borrador': return <Clock size={14} className="text-warning" />;
            case 'rechazado': return <FileWarning size={14} className="text-danger" />;
            default: return <FileText size={14} />;
        }
    };

    const filtered = (cotizaciones || []).filter(c => {
        const userRol = (user?.rol || '').toLowerCase();
        const isAdmin = userRol.includes('admin') || userRol.includes('super');

        if (!isAdmin && Number(c.u_id) !== Number(user?.id)) return false;

        const sTerm = (listSearchTerm || '').toLowerCase();
        const matchesSearch = !sTerm || 
            (c.num || '').toString().toLowerCase().includes(sTerm) || 
            `${c.cliente_nombre || ''} ${c.cliente_apellido || ''}`.toLowerCase().includes(sTerm) ||
            (c.nombre_empresa || '').toLowerCase().includes(sTerm);
        
        const matchesStatus = filterStatus === 'all' || (c.estado || '').toLowerCase() === filterStatus.toLowerCase();
        const matchesEvento = filterEvento === 'all' || c.tipo_evento === filterEvento;
        const matchesFecha = !filterFecha || (c.fevent && c.fevent.toString().startsWith(filterFecha));

        return matchesSearch && matchesStatus && matchesEvento && matchesFecha;
    });

    const renderMobileCards = () => (
        <div className="mobile-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filtered.length > 0 ? (
                filtered.map(c => (
                    <div key={c.id} className="glass-panel" style={{ 
                        padding: '12px 15px', 
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: '6px 15px',
                        alignItems: 'start'
                    }}>
                        {/* LEFT: ID & Profile Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontWeight: '900', color: 'var(--color-primary)', fontSize: '13px', opacity: 0.8 }}>#{c.num || c.id}</span>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div className="user-avatar-sm" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {c.logo_empresa ? (
                                        <img src={getUploadUrl(c.logo_empresa)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : <Building2 size={16} style={{ opacity: 0.3 }} />}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '800', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cliente_nombre} {c.cliente_apellido}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.5 }}>{c.nombre_empresa || 'ArchiPlanner'}</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Status & Top Actions Group (Yellow Annotation Area) */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                            <span className={`status-badge ${c.estado?.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 8px', marginRight: '-4px' }}>
                                {c.estado || 'Borrador'}
                            </span>
                            
                            <div className="actions-flex-end" style={{ gap: '6px', marginRight: '-6px' }}>
                                <button className="action-btn" onClick={() => window.open(`/admin/cotizaciones/${c.id}/view`, '_blank')} title="Ver" style={{ padding: '6px' }}>
                                    <ExternalLink size={16} />
                                </button>
                                <button className="action-btn" onClick={() => navigate(`/admin/cotizaciones/editar/${c.id}`)} title="Editar" style={{ padding: '6px' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="action-btn" onClick={() => navigate(`/admin/planeador?cot_id=${c.id}`)} title="Planeador 360" style={{ padding: '6px', color: 'var(--color-primary)' }}>
                                    <Briefcase size={16} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(c.id)} title="Eliminar" style={{ padding: '6px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* FULL WIDTH BOTTOM: Date & Total */}
                        <div style={{ 
                            gridColumn: 'span 2', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '10px 12px', 
                            background: 'rgba(255,255,255,0.02)', 
                            borderRadius: '8px', 
                            marginTop: '4px' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, fontSize: '11px' }}>
                                <Calendar size={12} />
                                <span style={{ fontWeight: '600' }}>{formatDateSafe(c.fevent)}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: '800', marginRight: '8px' }}>TOTAL</span>
                                <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '14px' }}>${Number(c.monto_final || c.total).toLocaleString('es-CO')}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No se encontraron registros.</div>
            )}
        </div>
    );

    return (
        <div className="admin-page-container fade-in">
            <div className={`admin-header-flex ${isMobile ? 'mobile-stack' : ''}`} style={{ marginBottom: isMobile ? '10px' : '30px' }}>
                <div>
                    <h1 className="admin-title">Cotizaciones</h1>
                    {!isMobile && <p className="admin-subtitle">Gestión de presupuestos y propuestas</p>}
                </div>
                
                {/* Floating Triggers for Mobile V4 */}
                {isMobile && (
                    <>
                        <button className="admin-mobile-templates-trigger" onClick={() => navigate('/admin/plantillas')}>
                            <FileText size={22} />
                        </button>
                        <button className="admin-mobile-add-trigger" onClick={() => navigate('/admin/cotizaciones/nueva')}>
                            <Plus size={22} />
                        </button>
                    </>
                )}

                {!isMobile && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon-tooltip" onClick={() => navigate('/admin/plantillas')} title="Plantillas">
                            <FileText size={18} />
                        </button>
                        <button className="btn-icon-tooltip primary" onClick={() => navigate('/admin/cotizaciones/nueva')} title="Nueva Cotización">
                            <Plus size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className={`admin-filters-grid ${isMobile ? 'mobile-filters' : ''}`} style={{ marginBottom: '20px' }}>
                <div className={`filter-item ${isMobile ? 'mobile-full-width' : ''}`}>
                    {!isMobile && <label>Buscar</label>}
                    <div className={isMobile ? 'search-input-wrapper-v4' : ''} style={{ position: 'relative' }}>
                        <Search size={isMobile ? 18 : 14} style={!isMobile ? { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' } : {}} />
                        <input 
                            type="text" 
                            className="dense-input" 
                            placeholder="Buscar por cliente o empresa..." 
                            style={isMobile ? { width: '100%' } : { paddingLeft: '32px', width: '300px' }} 
                            value={listSearchTerm} 
                            onChange={(e) => setListSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                {!isMobile && (
                    <>
                        <div className="filter-item">
                            <label>Estado</label>
                            <select className="admin-select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
                                <option value="all">Todos</option>
                                <option value="Borrador">Borrador</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Tipo Evento</label>
                            <select className="admin-select-sm" value={filterEvento} onChange={(e) => setFilterEvento(e.target.value)} style={{ width: '100%' }}>
                                <option value="all">Tipos</option>
                                <option value="Boda">Boda</option>
                                <option value="XV Años">XV Años</option>
                                <option value="Corporativo">Corporativo</option>
                                <option value="Cumpleaños">Cumpleaños</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Fecha</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                                <input type="date" className="admin-select-sm" style={{ paddingLeft: '32px', width: '100%' }} value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} />
                            </div>
                        </div>

                        <button className="action-btn" onClick={() => { setListSearchTerm(''); setFilterStatus('all'); setFilterEvento('all'); setFilterFecha(''); }} title="Limpiar" style={{ height: '34px', background: 'rgba(255,132,132,0.1)', color: 'var(--color-primary)' }}>
                            <X size={16} />
                        </button>
                    </>
                )}
            </div>

            {loading ? (
                <div className="admin-loader-container"><div className="loader"></div></div>
            ) : (
                <>
                    {isMobile ? renderMobileCards() : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>NÚM</th>
                                        <th>CLIENTE</th>
                                        <th>EVENTO</th>
                                        <th>FECHA</th>
                                        <th>TOTAL</th>
                                        <th>ESTADO</th>
                                        <th style={{ textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map(c => (
                                            <tr key={c.id}>
                                                <td className="text-bold">#{c.num || c.id}</td>
                                                <td>
                                                    <div className="user-info-cell">
                                                        <div className="user-avatar-sm" style={{ background: 'var(--color-primary-dim)', border: '1px solid var(--color-primary-dim)', overflow: 'hidden' }}>
                                                            {c.logo_empresa ? <img src={getUploadUrl(c.logo_empresa)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={12} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: 'var(--color-text-bright)' }}>{c.cliente_nombre} {c.cliente_apellido}</div>
                                                            <div style={{ fontSize: '10px', opacity: 0.6 }}><span style={{ color: 'var(--color-primary)' }}>{c.nombre_empresa || 'ArchiPlanner'}</span></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="event-type-badge">{c.tipo_evento || 'Evento'}</span></td>
                                                <td><div className="date-cell"><Calendar size={14} /><span>{formatDateSafe(c.fevent)}</span></div></td>
                                                <td className="text-primary text-bold">${Number(c.monto_final || c.total).toLocaleString('es-CO')}</td>
                                                <td><span className={`status-badge ${c.estado?.toLowerCase()}`}>{getStatusIcon(c.estado)}{c.estado || 'Borrador'}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="actions-flex-end">
                                                        <button className="action-btn" title="Planeador 360" onClick={() => navigate(`/admin/planeador?cot_id=${c.id}`)} style={{ color: 'var(--color-primary)' }}>
                                                            <Briefcase size={16} />
                                                        </button>
                                                        <button className="action-btn" title="Ver" onClick={() => window.open(`/admin/cotizaciones/${c.id}/view`, '_blank')}><ExternalLink size={16} /></button>
                                                        <button className="action-btn" title="Editar" onClick={() => navigate(`/admin/cotizaciones/editar/${c.id}`)}><Edit2 size={16} /></button>
                                                        <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)' }}>No se encontraron cotizaciones.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminCotizaciones;
