import React, { useState, useEffect } from 'react';
import { 
    Users, Briefcase, TrendingUp, Package, 
    Calendar, ArrowUpRight, ArrowDownRight,
    Search, Plus, Filter, FileText, UserPlus,
    Activity, DollarSign, Wallet, Truck, RefreshCw
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../style/Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        clientes: 0, 
        cotizaciones: 0, 
        facturacion: 0, 
        servicios: 0, 
        pendientes: 0,
        proveedores: 0,
        egresos: { total: 0, actual: 0, anterior: 0 },
        utilidad: { total: 0, actual: 0, anterior: 0 }
    });
    const [charts, setCharts] = useState({
        ingresos: [],
        gastos: [],
        distribucion: [],
        team: [],
        actividad: []
    });
    const [loading, setLoading] = useState(true);
    const [arriendosDetalle, setArriendosDetalle] = useState([]);

    const userRol = user?.rol?.toLowerCase() || '';
    const isAdmin = ['admin', 'superadmin'].includes(userRol);
    const isAsesorArriendos = userRol === 'asesor_arriendos';

    useEffect(() => {
        if (userRol === 'cliente') {
            navigate('/client');
            return;
        }
        
        const fetchData = async () => {
            if (!user) return; // Wait for auth
            
            try {
                // SEGURIDAD: Solo administradores ven datos globales.
                // Si no hay ID de usuario (caso raro), enviamos -1 para devolver 0 datos por seguridad.
                const currentId = user?.id || -1;
                const isAdminStrict = (userRol === 'admin' || userRol === 'superadmin');
                const queryParams = isAdminStrict ? '' : `?u_id=${currentId}`;

                const [sRes, cRes] = await Promise.all([
                    api.get(`/dashboard/stats${queryParams}`),
                    api.get(`/dashboard/charts${queryParams}`)
                ]);
                
                // Blindaje de datos estadísticos
                const saferCharts = {
                    ingresos: Array.isArray(cRes.data?.ingresos) ? cRes.data.ingresos : [],
                    gastos: Array.isArray(cRes.data?.gastos) ? cRes.data.gastos : [],
                    distribucion: Array.isArray(cRes.data?.distribucion) ? cRes.data.distribucion : [],
                    team: Array.isArray(cRes.data?.team) ? cRes.data.team : [],
                    actividad: Array.isArray(cRes.data?.actividad) ? cRes.data.actividad : []
                };

                if (isAsesorArriendos) {
                    const aRes = await api.get('/cotizaciones?clase=arriendo');
                    setArriendosDetalle(Array.isArray(aRes.data) ? aRes.data : []);
                }

                setStats(sRes.data || { 
                    clientes: 0, cotizaciones: 0, facturacion: 0, servicios: 0, 
                    pendientes: 0, proveedores: 0,
                    egresos: { total: 0, actual: 0, anterior: 0 },
                    utilidad: { total: 0, actual: 0, anterior: 0 }
                });
                setCharts(saferCharts);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userRol, isAdmin, user]);

    // Combinar ingresos y gastos por mes para el gráfico de área
    const combinedData = charts.ingresos.map(inc => {
        const exp = charts.gastos.find(g => g.mes === inc.mes);
        return {
            mes: inc.mes,
            ingresos: Number(inc.valor),
            gastos: Number(exp ? exp.valor : 0)
        };
    });

    const COLORS = ['#B76E79', '#74B9FF', '#5FDC7F', '#FF9F43', '#A29BFE'];

    if (loading) {
        return (
            <div className="admin-page-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    // --- SEGURIDAD: BARRERA DE ROL ---
    if (!userRol) {
        return (
            <div className="admin-page-container fade-in" style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                height: '80vh', textAlign: 'center', gap: '20px' 
            }}>
                <div style={{ background: 'rgba(255,132,132,0.1)', padding: '30px', borderRadius: '50%', color: 'var(--color-primary)' }}>
                    <Users size={48} />
                </div>
                <h1 className="admin-title" style={{ fontSize: '24px' }}>Acceso en Revisión</h1>
                <p className="admin-subtitle" style={{ maxWidth: '400px' }}>
                    Tu cuenta ha sido creada exitosamente, pero aún no tiene un rol administrativo asignado. 
                    Contacta al administrador para habilitar tu acceso al sistema.
                </p>
                <button className="btn-v4 primary" onClick={() => window.location.reload()}>
                    <RefreshCw size={18} /> Verificar Estado
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* HEADER SECCIÓN V4 PREMIUM */}
            <div className="admin-header-flex" style={{ marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 className="admin-title" style={{ margin: 0, fontSize: '24px' }}>Dashboard Operativo</h1>
                        {isAsesorArriendos && (
                            <span className="badge-premium" style={{ 
                                background: 'rgba(183, 110, 121, 0.1)', 
                                color: '#B76E79', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '10px', 
                                fontWeight: '800',
                                letterSpacing: '1px',
                                border: '1px solid rgba(183, 110, 121, 0.2)'
                            }}>
                                RENTAL ADVISOR
                            </span>
                        )}
                    </div>
                    <p className="admin-subtitle" style={{ marginTop: '2px', fontSize: '12px' }}>
                        {isAsesorArriendos 
                            ? `Operaciones de arriendo: ${user?.nombre || 'Luz Marina'}` 
                            : isAdmin ? 'Resumen estratégico y analítica global' : `Panel de gestión, ${user?.nombre}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-v4 primary" onClick={() => navigate(isAsesorArriendos ? '/admin/arriendos/nuevo' : '/admin/cotizaciones/nueva')} style={{ padding: '8px 16px', fontSize: '12px' }}>
                        <Plus size={16} /> Arriendo
                    </button>
                </div>
            </div>

            {/* QUICK ACTIONS & ALERT ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: isAsesorArriendos && stats.devoluciones_tardias > 0 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '15px' }}>
                {isAsesorArriendos && (
                    <div className="glass-panel" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '3px solid #B76E79' }}>
                        <div style={{ background: 'rgba(183, 110, 121, 0.1)', padding: '8px', borderRadius: '10px', color: '#B76E79' }}>
                            <Truck size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>Control de Salidas</h4>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.5 }}>Gestión de inventario externo</p>
                        </div>
                        <button className="btn-v4" onClick={() => navigate('/admin/servicios')} style={{ fontSize: '11px', padding: '6px 12px' }}>Inventario</button>
                    </div>
                )}

                {isAsesorArriendos && stats.devoluciones_tardias > 0 && (
                    <div className="glass-panel" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '3px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div style={{ background: '#ef4444', padding: '8px', borderRadius: '10px', color: 'white' }}>
                            <Activity size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>Retrasos ({stats.devoluciones_tardias})</h4>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>Pendientes de recibo</p>
                        </div>
                        <button className="btn-v4" onClick={() => navigate('/admin/arriendos')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', fontSize: '11px' }}>Ver</button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT GRID (KPIs + Chart + Entregas) */}
            {isAdmin && !isAsesorArriendos ? (
                <div className="dashboard-main-grid-admin">
                    {/* KPI ROW 1: FINANCIALS & UTILITY */}
                    <div className="bento-col-2">
                        <KPICard 
                            icon={<DollarSign size={22} strokeWidth={2.5} />} 
                            value={`$${Number(stats.facturacion).toLocaleString()}`} 
                            label="Ingresos" 
                            trend="+15%" 
                            isUp={true} 
                            className="success-light"
                            subValue={`${stats.cotizaciones || 0} Coti.`}
                        />
                    </div>
                    <div className="bento-col-2">
                        <KPICard 
                            icon={<Wallet size={22} strokeWidth={2.5} />} 
                            value={`$${Number(stats.egresos?.total || 0).toLocaleString()}`} 
                            label="Egresos" 
                            trend={
                                stats.egresos?.anterior > 0 
                                ? `${(((stats.egresos?.actual - stats.egresos?.anterior) / stats.egresos.anterior) * 100).toFixed(1)}%`
                                : (stats.egresos?.actual > 0 ? '+100%' : '0%')
                            } 
                            isUp={stats.egresos?.actual <= stats.egresos?.anterior} 
                            className="danger-light" 
                            subValue={`Mes: $${Number(stats.egresos?.actual || 0).toLocaleString()}`}
                        />
                    </div>
                    <div className="bento-col-4">
                        <KPICard 
                            icon={<TrendingUp size={24} strokeWidth={3} />} 
                            value={`$${Number(stats.utilidad?.total || 0).toLocaleString()}`} 
                            label="Utilidad Neta (Balance)" 
                            trend={
                                (stats.utilidad?.anterior !== 0)
                                ? `${(((stats.utilidad?.actual - stats.utilidad?.anterior) / Math.abs(stats.utilidad?.anterior || 1)) * 100).toFixed(1)}%`
                                : (stats.utilidad?.actual !== 0 ? '+100%' : '0%')
                            } 
                            isUp={stats.utilidad?.actual >= stats.utilidad?.anterior} 
                            className="info-light highlighted"
                            subValue={`Balance Mes: $${Number(stats.utilidad?.actual || 0).toLocaleString()}`}
                        />
                    </div>
                    <div className="bento-col-2">
                        <KPICard 
                            icon={<FileText size={22} strokeWidth={2.5} />} 
                            value={stats.pendientes || 0} 
                            label="Eventos" 
                            trend="Próx. 30d" 
                            isUp={true} 
                            subValue="Aprobados"
                        />
                    </div>
                    <div className="bento-col-2">
                        <KPICard 
                            icon={<Briefcase size={22} strokeWidth={2.5} />} 
                            value={stats.proveedores || 0} 
                            label="Proveedores" 
                            trend="Ecosistema" 
                            isUp={true} 
                            subValue={`${stats.servicios || 0} Prod.`}
                        />
                    </div>

                    {/* ROW 2: TEAM PERFORMANCE & CASH FLOW */}
                    <div className="bento-col-8">
                        <div className="chart-panel-admin" style={{ height: '380px', minHeight: '380px' }}>
                            <div className="panel-header">
                                <div>
                                    <h3 className="panel-title" style={{ fontSize: '18px' }}>Rendimiento del Equipo</h3>
                                    <p style={{ fontSize: '11px', opacity: 0.5 }}>Crecimiento por Asesores y Vendedores</p>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', opacity: 0.6 }}>
                                        <div style={{ width: '8px', height: '8px', background: '#B76E79', borderRadius: '2px' }} /> Monto Generado
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', opacity: 0.6 }}>
                                        <div style={{ width: '8px', height: '8px', background: '#74B9FF', borderRadius: '2px' }} /> Contratos Cerrados
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '280px', width: '100%', marginTop: '10px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={charts.team} layout="vertical" margin={{ left: 40, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} width={80} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '11px' }} />
                                        <Bar dataKey="monto" barSize={12} fill="#B76E79" radius={[0, 4, 4, 0]} animationDuration={2000} />
                                        <Bar dataKey="closed" barSize={8} fill="#74B9FF" radius={[0, 4, 4, 0]} animationDuration={2500} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-4">
                        <div className="chart-panel-admin" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
                            <div className="panel-header">
                                <h3 className="panel-title" style={{ fontSize: '16px' }}>Distribución Unidades</h3>
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={charts.distribucion} innerRadius={65} outerRadius={85} paddingAngle={10} dataKey="value" animationDuration={1500}>
                                            {charts.distribucion.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.cotizaciones}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px' }}>TOTALES</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '9px', opacity: 0.5 }}>CLIENTES</div>
                                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{stats.clientes}</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '9px', opacity: 0.5 }}>PRODUCTOS</div>
                                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{stats.servicios}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3: FINANCIAL TREND */}
                    <div className="bento-col-12" style={{ gridColumn: 'span 12' }}>
                        <div className="chart-panel-admin" style={{ height: '280px' }}>
                            <div className="panel-header">
                                <h3 className="panel-title">Flujo de Caja Global (Ingresos vs Egresos)</h3>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#B76E79' }} /> Ingresos
                                    </div>
                                    <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Egresos
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '180px', width: '100%', marginTop: '10px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedData}>
                                        <defs>
                                            <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B76E79" stopOpacity={0.4}/><stop offset="95%" stopColor="#B76E79" stopOpacity={0}/></linearGradient>
                                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                        <XAxis dataKey="mes" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="ingresos" stroke="#B76E79" strokeWidth={3} fillOpacity={1} fill="url(#colorIng)" animationDuration={3000} />
                                        <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExp)" animationDuration={3500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={isAsesorArriendos ? "dashboard-main-grid-asesor" : "dashboard-main-grid"} >
                    {isAsesorArriendos ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', height: 'fit-content' }}>
                            <KPICard icon={<DollarSign size={20} strokeWidth={2.5} />} value={`$${Number(stats.facturacion).toLocaleString()}`} label="Ingresos" trend="Personal" isUp={true} />
                            <KPICard icon={<Truck size={20} strokeWidth={2.5} />} value={stats.arriendos_fuera} label="Activos" trend="En campo" isUp={true} />
                            <KPICard icon={<Users size={20} strokeWidth={2.5} />} value={stats.clientes || 0} label="Prospectos" trend="+2" isUp={true} />
                            <KPICard icon={<Package size={20} strokeWidth={2.5} />} value={stats.servicios || 0} label="Inventario" trend="Optimo" isUp={true} />
                        </div>
                    ) : (
                        <div className="stats-grid" style={{ marginBottom: '0' }}>
                            <KPICard icon={<DollarSign size={22} />} value={`$${Number(stats.facturacion).toLocaleString()}`} label="Facturación Global" trend="+12%" isUp={true} />
                            <KPICard icon={<FileText size={22} />} value={stats.cotizaciones || 0} label="Cotizaciones" trend="+4 hoy" isUp={true} />
                            <KPICard icon={<Users size={22} />} value={stats.clientes || 0} label="Prospectos" trend="+2" isUp={true} />
                            <KPICard icon={<Package size={22} />} value={stats.servicios || 0} label="Catálogo" trend="Optimo" isUp={true} />
                        </div>
                    )}

                    <div className="chart-panel" style={{ 
                        minHeight: isAsesorArriendos ? '250px' : '350px', 
                        padding: isAsesorArriendos ? '18px' : '24px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div className="panel-header" style={{ marginBottom: isAsesorArriendos ? '12px' : '25px' }}>
                            <h3 className="panel-title" style={{ fontSize: isAsesorArriendos ? '16px' : '18px', letterSpacing: '0.5px' }}>{isAsesorArriendos ? 'Proyección Mensual' : 'Crecimiento de Ingresos'}</h3>
                            <div className="trend-up" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                 <Activity size={12} className="pulse-slow" /> Balance Positivo
                            </div>
                        </div>
                        {combinedData.length > 0 && combinedData.some(d => d.ingresos > 0) ? (
                            <div className="chart-container" style={{ height: isAsesorArriendos ? '190px' : '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedData}>
                                        <defs>
                                            <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B76E79" stopOpacity={0.4}/><stop offset="95%" stopColor="#B76E79" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        <XAxis dataKey="mes" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
                                        <Area type="monotone" dataKey="ingresos" stroke="#B76E79" strokeWidth={3} fillOpacity={1} fill="url(#colorIng)" animationDuration={2500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="empty-chart-state" style={{ height: isAsesorArriendos ? '190px' : '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                <TrendingUp size={30} strokeWidth={1} style={{ marginBottom: '10px' }} />
                                <p style={{ fontSize: '11px', fontWeight: '500' }}>Sin actividad comercial actual</p>
                            </div>
                        )}
                    </div>

                    {isAdmin ? (
                        <div className="chart-panel">
                            <div className="panel-header"><h3 className="panel-title">Distribución de Mercado</h3></div>
                            <div className="chart-container"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.distribucion} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" animationBegin={200} animationDuration={1500}>{charts.distribucion.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}/><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer></div>
                        </div>
                    ) : isAsesorArriendos && (
                        <div className="chart-panel" style={{ padding: '18px', background: 'rgba(255,255,255,0.015)' }}>
                            <div className="panel-header" style={{ marginBottom: '15px' }}><h3 className="panel-title" style={{ fontSize: '16px' }}>Salidas y Retornos</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                 <div className="glass-panel" style={{ padding: '14px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.1)', transition: 'all 0.3s ease' }}>
                                    <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: '700', letterSpacing: '0.5px' }}>ENTREGAS PENDIENTES</div>
                                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80', marginTop: '4px' }}>{stats.pendientes || 0}</div>
                                 </div>
                                 <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: '700', letterSpacing: '0.5px' }}>CONTRATOS CERRADOS</div>
                                    <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>{stats.cotizaciones || 0}</div>
                                 </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* BOTTOM ROW (Activity + Inventory) */}
            <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="chart-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Actividad Reciente</h3>
                        <Activity size={16} style={{ opacity: 0.3 }} />
                    </div>
                    <div className="activity-list">
                        {charts.actividad.map((act, i) => (
                            <div key={i} className="activity-item">
                                <div className={`activity-icon icon-${act.tipo}`}>
                                    {act.tipo === 'cliente' ? <UserPlus size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">{act.titulo}</div>
                                    <div className="activity-sub">{act.subtitulo}</div>
                                </div>
                                <div className="activity-time">
                                    {new Date(act.fecha).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-panel" style={{ background: 'linear-gradient(135deg, rgba(183,110,121,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
                    <div className="panel-header">
                        <h3 className="panel-title">Resumen Catálogo</h3>
                        <Package size={16} style={{ opacity: 0.3 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
                        <InventoryMetric label="Catálogo Total" value={stats.servicios} sub="Artículos" color="#B76E79" />
                        <InventoryMetric label="Proveedores Activos" value={stats.proveedores} sub="Plataforma" color="#74B9FF" />
                        <div style={{ marginTop: '10px', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '11px', opacity: 0.5 }}>NOTA DEL SISTEMA</div>
                            <div style={{ fontSize: '13px', marginTop: '5px' }}>Inventario saludable. Última auditoría hace 2h.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OPERATIONAL CONTROL (Only for Rental Advisor) */}
            {isAsesorArriendos && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                    <div className="chart-panel" style={{ borderLeft: '3px solid #ef4444' }}>
                        <div className="panel-header">
                            <h3 className="panel-title" style={{ color: '#ef4444' }}>Alertas de Devolución</h3>
                            <Activity size={16} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="admin-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="admin-table mini">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Cliente</th>
                                        <th>Venció</th>
                                        <th style={{ textAlign: 'right' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arriendosDetalle.filter(a => a.estado === 'contratada' && new Date(a.fevent_fin) < new Date()).length > 0 ? (
                                        arriendosDetalle.filter(a => a.estado === 'contratada' && new Date(a.fevent_fin) < new Date()).map(a => (
                                            <tr key={a.id}>
                                                <td className="text-bold">#{a.num}</td>
                                                <td>{a.cliente_nombre}</td>
                                                <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{new Date(a.fevent_fin).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="action-btn" onClick={() => navigate(`/admin/arriendos/editar/${a.id}`)}><Search size={14} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Sin retrasos pendientes</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="chart-panel" style={{ borderLeft: '3px solid #B76E79' }}>
                        <div className="panel-header">
                            <h3 className="panel-title">Arriendos por Fuera</h3>
                            <Truck size={16} />
                        </div>
                        <div className="admin-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="admin-table mini">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Cliente</th>
                                        <th>Fin</th>
                                        <th style={{ textAlign: 'right' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arriendosDetalle.filter(a => a.estado === 'contratada' && new Date(a.fevent_fin) >= new Date()).length > 0 ? (
                                        arriendosDetalle.filter(a => a.estado === 'contratada' && new Date(a.fevent_fin) >= new Date()).map(a => (
                                            <tr key={a.id}>
                                                <td className="text-bold">#{a.num}</td>
                                                <td>{a.cliente_nombre}</td>
                                                <td>{new Date(a.fevent_fin).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="action-btn" onClick={() => navigate(`/admin/arriendos/editar/${a.id}`)}><Search size={14} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Sin arriendos activos</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ icon, value, label, trend, isUp, className = "", subValue }) => (
    <div className={`kpi-card horizontal ${className}`}>
        <div className="kpi-icon-container">
            {icon}
        </div>
        <div className="kpi-content-box">
            <span className="kpi-label-new">{label}</span>
            {subValue && <span className="kpi-subvalue-new">{subValue}</span>}
        </div>
        <div className="kpi-stats-box">
            <div className="kpi-value-main" style={{ fontSize: value.length > 8 ? '16px' : '20px' }}>{value}</div>
            <div className={`kpi-trend-pill ${isUp ? 'up' : 'down'}`}>
                {trend}
            </div>
        </div>
    </div>
);

const InventoryMetric = ({ label, value, sub, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '4px', height: '30px', background: color, borderRadius: '2px' }} />
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>{label}</div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{value} <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.3 }}>{sub}</span></div>
        </div>
    </div>
);

export default AdminDashboard;
