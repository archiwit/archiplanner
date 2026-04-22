import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Plus, Search, FileText, Calendar, User, X,
    MoreVertical, Edit2, Trash2, ExternalLink, 
    CheckCircle2, Clock, FileWarning, Building2, Truck, Briefcase, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../config';
import { formatDateSafe } from '../../utils/dateUtils';

const AdminArriendos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [arriendos, setArriendos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFecha, setFilterFecha] = useState('');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchArriendos();
    }, []);

    const fetchArriendos = async () => {
        try {
            // v5.3: Filtrado estricto por clase 'arriendo'
            const res = await api.get('/cotizaciones?clase=arriendo');
            setArriendos(res.data);
        } catch (err) {
            console.error('Error fetching arriendos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este arriendo?')) return;
        try {
            await api.delete(`/cotizaciones/${id}`);
            setArriendos(arriendos.filter(c => c.id !== id));
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

    const filtered = (arriendos || []).filter(c => {
        const sTerm = (listSearchTerm || '').toLowerCase();
        const matchesSearch = !sTerm || 
            (c.num_arriendo || '').toLowerCase().includes(sTerm) || 
            (c.num || '').toString().toLowerCase().includes(sTerm) || 
            `${c.cliente_nombre || ''} ${c.cliente_apellido || ''}`.toLowerCase().includes(sTerm) ||
            (c.nombre_empresa || '').toLowerCase().includes(sTerm) ||
            (c.usuario_nombre || '').toLowerCase().includes(sTerm);
        
        const matchesStatus = filterStatus === 'all' || (c.estado || '').toLowerCase() === filterStatus.toLowerCase();
        const matchesFecha = !filterFecha || (c.fevent && c.fevent.toString().startsWith(filterFecha));

        return matchesSearch && matchesStatus && matchesFecha;
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontWeight: '900', color: 'var(--color-primary)', fontSize: '13px', opacity: 0.8 }}>{c.num_arriendo || `ARR-${c.num || c.id}`}</span>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div className="user-avatar-sm" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {c.logo_empresa ? (
                                        <img src={getUploadUrl(c.logo_empresa)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : <Building2 size={16} style={{ opacity: 0.3 }} />}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '800', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cliente_nombre} {c.cliente_apellido}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.5, display: 'flex', gap: '8px' }}>
                                        <span>{c.nombre_empresa || 'ArchiPlanner'}</span>
                                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>• {c.usuario_nombre || 'Admin'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                            <span className={`status-badge ${c.estado?.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 8px', marginRight: '-4px' }}>
                                {c.estado || 'Borrador'}
                            </span>
                            
                            <div className="actions-flex-end" style={{ gap: '6px', marginRight: '-6px' }}>
                                <button className="action-btn" onClick={() => window.open(`/admin/cotizaciones/${c.id}/view`, '_blank')} title="Ver Recibo" style={{ padding: '6px' }}>
                                    <ExternalLink size={16} />
                                </button>
                                
                                {((user?.rol || '').toLowerCase().includes('admin') || 
                                  (user?.rol || '').toLowerCase().includes('super') ||
                                  Number(c.u_id) === Number(user?.id)) && (
                                    <>
                                        <button className="action-btn" onClick={() => navigate(`/admin/arriendos/editar/${c.id}`)} title="Editar" style={{ padding: '6px' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(c.id)} title="Eliminar" style={{ padding: '6px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', opacity: 0.7, fontSize: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></div>
                                    <span>Salida: {formatDateSafe(c.fevent)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }}></div>
                                    <span>Vuelta: {formatDateSafe(c.fevent_fin)}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: '800', marginRight: '8px' }}>TOTAL</span>
                                <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '14px' }}>${Number(c.monto_final || c.total).toLocaleString('es-CO')}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No se encontraron arriendos.</div>
            )}
        </div>
    );

    return (
        <div className="admin-page-container fade-in">
            <div className={`admin-header-flex ${isMobile ? 'mobile-stack' : ''}`} style={{ marginBottom: isMobile ? '10px' : '30px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={28} className="text-primary" />
                        <h1 className="admin-title">Arriendos</h1>
                    </div>
                    {!isMobile && <p className="admin-subtitle">Gestión de alquiler de mobiliario y equipos</p>}
                </div>
                
                {isMobile && (
                    <button className="admin-mobile-add-trigger" onClick={() => navigate('/admin/arriendos/nuevo')}>
                        <Plus size={22} />
                    </button>
                )}

                {!isMobile && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-v4 primary" onClick={() => navigate('/admin/arriendos/nuevo')}>
                            <Plus size={18} /> Nuevo Arriendo
                        </button>
                    </div>
                )}
            </div>

            <div className={`compact-grid-3`} style={{ marginBottom: '20px', gap: '15px' }}>
                {/* Reutilizando la estructura de KPICard para consistencia */}
                <div className="kpi-card horizontal">
                    <div className="kpi-icon-container">
                        <FileText size={20} />
                    </div>
                    <div className="kpi-content-box">
                        <span className="kpi-label-new">Total Arriendos</span>
                        <span className="kpi-subvalue-new">Historial global</span>
                    </div>
                    <div className="kpi-stats-box">
                        <div className="kpi-value-main">{arriendos.length}</div>
                        <div className="kpi-trend-pill up">Resumen</div>
                    </div>
                </div>

                <div className="kpi-card horizontal">
                    <div className="kpi-icon-container" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.05)' }}>
                        <Truck size={20} />
                    </div>
                    <div className="kpi-content-box">
                        <span className="kpi-label-new">En Proceso</span>
                        <span className="kpi-subvalue-new">Pendientes entrega</span>
                    </div>
                    <div className="kpi-stats-box">
                        <div className="kpi-value-main" style={{ color: '#4ade80' }}>
                            {arriendos.filter(a => (a.estado || '').toLowerCase() === 'borrador' || (a.estado || '').toLowerCase() === 'aprobado').length}
                        </div>
                        <div className="kpi-trend-pill up" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>Activos</div>
                    </div>
                </div>

                <div className="kpi-card horizontal">
                    <div className="kpi-icon-container" style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.05)' }}>
                        <DollarSign size={20} />
                    </div>
                    <div className="kpi-content-box">
                        <span className="kpi-label-new">Ingresos Propios</span>
                        <span className="kpi-subvalue-new">Mis comisiones</span>
                    </div>
                    <div className="kpi-stats-box">
                        <div className="kpi-value-main">
                            ${(arriendos || [])
                                .filter(a => Number(a.u_id) === Number(user?.id))
                                .reduce((acc, a) => acc + Number(a.monto_final || a.total), 0)
                                .toLocaleString('es-CO')}
                        </div>
                        <div className="kpi-trend-pill up">Total</div>
                    </div>
                </div>
            </div>

            <div className={`admin-filters-grid ${isMobile ? 'mobile-filters' : ''}`} style={{ marginBottom: '20px' }}>
                <div className={`filter-item ${isMobile ? 'mobile-full-width' : ''}`}>
                    {!isMobile && <label>Buscar</label>}
                    <div className={isMobile ? 'search-input-wrapper-v4' : ''} style={{ position: 'relative' }}>
                        <Search size={isMobile ? 18 : 14} style={!isMobile ? { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' } : {}} />
                        <input 
                            type="text" 
                            className="dense-input" 
                            placeholder="Buscar por cliente o serie ARR..." 
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
                            <label>Fecha Salida</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                                <input type="date" className="admin-select-sm" style={{ paddingLeft: '32px', width: '100%' }} value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} />
                            </div>
                        </div>

                        <button className="action-btn" onClick={() => { setListSearchTerm(''); setFilterStatus('all'); setFilterFecha(''); }} title="Limpiar" style={{ height: '34px', background: 'rgba(255,132,132,0.1)', color: 'var(--color-primary)' }}>
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
                                        <th>SERIE ARR</th>
                                        <th>CLIENTE</th>
                                        <th>ASESOR</th>
                                        <th>ESTADO</th>
                                        <th>SALIDA</th>
                                        <th>REGRESO</th>
                                        <th>MONTO</th>
                                        <th style={{ textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map(c => (
                                            <tr key={c.id}>
                                                <td className="text-bold text-primary">{c.num_arriendo || `ARR-${c.num || c.id}`}</td>
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
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                                        <div className="user-avatar-sm" style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', fontSize: '10px' }}>
                                                            <User size={12} />
                                                        </div>
                                                        <span style={{ opacity: 0.8 }}>{c.usuario_nombre || 'Admin'}</span>
                                                    </div>
                                                </td>
                                                <td><span className={`status-badge ${(c.estado || 'Borrador').toLowerCase()}`}>{getStatusIcon(c.estado)}{c.estado || 'Borrador'}</span></td>
                                                <td><div className="date-cell"><Calendar size={12} /><span>{formatDateSafe(c.fevent)}</span></div></td>
                                                <td><div className="date-cell"><Calendar size={12} /><span>{formatDateSafe(c.fevent_fin)}</span></div></td>
                                                <td className="text-primary text-bold">${Number(c.monto_final || c.total).toLocaleString('es-CO')}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="actions-flex-end">
                                                        <button className="action-btn" title="Ver Recibo" onClick={() => window.open(`/admin/cotizaciones/${c.id}/view`, '_blank')}>
                                                            <ExternalLink size={16} />
                                                        </button>
                                                        
                                                        {((user?.rol || '').toLowerCase().includes('admin') || 
                                                          (user?.rol || '').toLowerCase().includes('super') ||
                                                          Number(c.u_id) === Number(user?.id)) && (
                                                            <>
                                                                <button className="action-btn" title="Editar" onClick={() => navigate(`/admin/arriendos/editar/${c.id}`)}>
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(c.id)}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)' }}>No se encontraron arriendos.</td></tr>
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

export default AdminArriendos;
