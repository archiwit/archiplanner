import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../config';
import { 
    DollarSign, 
    Calendar as CalendarIcon, 
    Tag, 
    FileText, 
    TrendingUp, 
    AlertCircle,
    Download,
    PieChart,
    BarChart3
} from 'lucide-react';

const AdminGastosEmpresa = () => {
    const { user } = useAuth();
    const [gastos, setGastos] = useState([]);
    const [reportes, setReportes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'reports'

    useEffect(() => {
        fetchGastos();
        if (user?.rol === 'admin') {
            fetchReportes();
        }
    }, [user]);

    const fetchGastos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gastos-empresa');
            setGastos(res.data);
        } catch (err) {
            console.error("Error cargando gastos:", err);
        }
        setLoading(false);
    };

    const fetchReportes = async () => {
        try {
            const res = await api.get('/gastos-empresa/reportes');
            setReportes(res.data);
        } catch (err) {
            console.error("Error cargando reportes:", err);
        }
    };

    const columns = [
        { 
            key: 'concepto', 
            label: 'Concepto / Motivo',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="icon-circle" style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>
                        <DollarSign size={16} />
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', display: 'block' }}>{row.concepto}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>ID: #{row.id}</span>
                    </div>
                </div>
            )
        },
        { 
            key: 'categoria', 
            label: 'Categoría',
            render: (row) => (
                <span className="tag" style={{ textTransform: 'capitalize' }}>
                    {row.categoria}
                </span>
            )
        },
        { 
            key: 'monto', 
            label: 'Monto',
            render: (row) => (
                <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                    ${Number(row.monto).toLocaleString()}
                </span>
            )
        },
        { 
            key: 'fecha', 
            label: 'Fecha',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <CalendarIcon size={14} className="text-dim" />
                    {new Date(row.fecha).toLocaleDateString()}
                </div>
            )
        },
        { 
            key: 'comprobante_path', 
            label: 'Comprobante',
            render: (row) => row.comprobante_path ? (
                <a 
                    href={getUploadUrl(row.comprobante_path)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-link"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-primary)' }}
                >
                    <Download size={14} /> Ver Archivo
                </a>
            ) : (
                <span style={{ opacity: 0.4, fontSize: '12px' }}>Sin archivo</span>
            )
        },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (row) => (
                <span className={`table-status ${row.estado === 'pagado' ? 'status-active' : 'status-inactive'}`}>
                    <span className="status-dot"></span>
                    {row.estado}
                </span>
            )
        }
    ];

    const formFields = [
        { name: 'concepto', label: 'Concepto / Motivo de Gasto', type: 'text', required: true, fullWidth: true },
        { 
            name: 'categoria', 
            label: 'Categoría', 
            type: 'select', 
            options: [
                { value: 'servicios', label: 'Servicios (Luz, Agua, Internet, etc.)' },
                { value: 'arriendo', label: 'Arriendo / Local' },
                { value: 'sueldos', label: 'Sueldos / Nómina' },
                { value: 'marketing', label: 'Publicidad y Marketing' },
                { value: 'otros', label: 'Otros Gastos' }
            ],
            required: true 
        },
        { name: 'monto', label: 'Valor del Gasto', type: 'number', required: true },
        { name: 'fecha', label: 'Fecha del Gasto', type: 'date', required: true },
        { 
            name: 'estado', 
            label: 'Estado', 
            type: 'select', 
            options: [
                { value: 'pagado', label: 'Pagado' },
                { value: 'pendiente', label: 'Pendiente por Pagar' }
            ], 
            required: true 
        },
        { name: 'comprobante', label: 'Subir Comprobante (PDF/Imagen)', type: 'file', fullWidth: true },
        { name: 'notas', label: 'Notas Adicionales', type: 'textarea', fullWidth: true },
        { name: 'u_id', type: 'hidden', initialValue: user?.id }
    ];

    const handleAdd = async (formData) => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'comprobante') {
                    if (formData[key] instanceof File) data.append('comprobante', formData[key]);
                } else if (formData[key] !== undefined && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });
            if (!formData.u_id) data.append('u_id', user.id);

            await api.post('/gastos-empresa', data);
            await fetchGastos();
            if (user?.rol === 'admin') fetchReportes();
        } catch (err) {
            console.error(err);
            alert('Error al guardar el gasto');
        }
        setLoading(false);
    };

    const handleEdit = async (original, formData) => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'comprobante') {
                    if (formData[key] instanceof File) data.append('comprobante', formData[key]);
                } else if (key !== 'creado_por' && formData[key] !== undefined && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await api.put(`/gastos-empresa/${original.id}`, data);
            await fetchGastos();
            if (user?.rol === 'admin') fetchReportes();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el gasto');
        }
        setLoading(false);
    };

    const handleDelete = async (item) => {
        if (window.confirm("¿Estás seguro de eliminar este registro de gasto?")) {
            try {
                await api.delete(`/gastos-empresa/${item.id}`);
                setGastos(gastos.filter(g => g.id !== item.id));
                if (user?.rol === 'admin') fetchReportes();
            } catch (err) {
                console.error(err);
                alert('No se pudo eliminar');
            }
        }
    };

    // Reporting components
    const StatsSummary = () => {
        const total = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
        const pendientes = gastos.filter(g => g.estado === 'pendiente').length;
        const esteMes = gastos.filter(g => {
            const d = new Date(g.fecha);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((acc, g) => acc + Number(g.monto), 0);

        return (
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div className="glass-panel stat-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Gasto Total Histórico</span>
                            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px' }}>${total.toLocaleString()}</div>
                        </div>
                        <div className="icon-circle large" style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
                <div className="glass-panel stat-card" style={{ padding: '20px', borderLeft: '4px solid #60a5fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Gastos este Mes</span>
                            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px' }}>${esteMes.toLocaleString()}</div>
                        </div>
                        <div className="icon-circle large" style={{ background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                            <CalendarIcon size={24} />
                        </div>
                    </div>
                </div>
                <div className="glass-panel stat-card" style={{ padding: '20px', borderLeft: '4px solid #f87171' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pagos Pendientes</span>
                            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px' }}>{pendientes} <span style={{ fontSize: '14px', fontWeight: '400', opacity: 0.6 }}>registros</span></div>
                        </div>
                        <div className="icon-circle large" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ReportsView = () => {
        if (!reportes) return <div className="loading">Generando reportes...</div>;

        return (
            <div className="reports-container fade-in">
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <PieChart size={20} className="text-primary" />
                            <h4 style={{ margin: 0 }}>Distribución por Categoría</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {reportes.byCategory.map(item => {
                                const total = reportes.byCategory.reduce((acc, c) => acc + Number(c.total), 0);
                                const percentage = (Number(item.total) / total * 100).toFixed(1);
                                return (
                                    <div key={item.categoria}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{item.categoria}</span>
                                            <span style={{ fontWeight: '700' }}>${Number(item.total).toLocaleString()} ({percentage}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-primary)' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <BarChart3 size={20} className="text-primary" />
                            <h4 style={{ margin: 0 }}>Histórico últimos 6 Meses</h4>
                        </div>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '10px 0' }}>
                            {reportes.byMonth.map(item => {
                                const max = Math.max(...reportes.byMonth.map(m => Number(m.total)));
                                const height = (Number(item.total) / max * 100);
                                return (
                                    <div key={item.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '100%', height: `${height}%`, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0', position: 'relative' }} className="bar-hover">
                                            <div className="bar-tooltip">${Number(item.total).toLocaleString()}</div>
                                        </div>
                                        <span style={{ fontSize: '10px', opacity: 0.6 }}>{item.mes}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page-content">
            <div className="page-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Módulo de Pagos y Gastos</h2>
                    <p className="text-dim">Control financiero interno de la empresa y reportes.</p>
                </div>
                
                {user?.rol === 'admin' && (
                    <div className="toggle-group-minimal" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className={`btn-icon-tooltip ${viewMode === 'list' ? 'primary' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Ver Listado"
                        >
                            <FileText size={20} />
                        </button>
                        <button 
                            className={`btn-icon-tooltip ${viewMode === 'reports' ? 'primary' : ''}`}
                            onClick={() => setViewMode('reports')}
                            title="Ver Reportes"
                        >
                            <PieChart size={20} />
                        </button>
                    </div>
                )}
            </div>

            <StatsSummary />

            {viewMode === 'list' ? (
                <DynamicTableManager
                    title="Registros de Gastos"
                    data={gastos.map(g => ({...g, fecha: g.fecha ? g.fecha.split('T')[0] : ''}))}
                    columns={columns}
                    formFields={formFields}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />
            ) : (
                <ReportsView />
            )}

            <style>{`
                .bar-hover:hover .bar-tooltip {
                    display: block;
                }
                .bar-tooltip {
                    display: none;
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--color-bg-dark);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.1);
                    z-index: 10;
                }
                .icon-circle.large {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default AdminGastosEmpresa;
