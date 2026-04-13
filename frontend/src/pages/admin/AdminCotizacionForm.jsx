import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
    Save, X, Plus, Trash2, Search, Package,
    MapPin, Users, Calendar, Clock, History,
    Palette, Building2, Info, ChevronRight,
    Eye, EyeOff, FileText, Layout, ExternalLink, CreditCard,
    GripVertical, ChevronDown, ChevronUp, CheckCircle2, Calculator,
    Upload, PieChart, BarChart3 as BarChart, Activity, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import SearchableDropdown from '../../components/common/SearchableDropdown';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UPLOADS_URL } from '../../config';
import QuotationHistoryPanel from '../../components/admin/QuotationHistoryPanel';
import { History as HistoryIcon } from 'lucide-react';

const smartFormat = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const val = Number(num);
    return val.toLocaleString('es-CO', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    });
};

const toAccounting = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return Number(num).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

const fromAccounting = (str) => {
    if (typeof str !== 'string') return str || 0;
    const normalized = str.replace(/\./g, '').replace(',', '.');
    return normalized === '' ? 0 : parseFloat(normalized);
};

// Internal component for smart numeric entry
const SmartNumericInput = ({ value, onChange, onBlur, className, style, disabled, placeholder, inputRef }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState('');

    useEffect(() => {
        if (!isFocused) {
            setLocalValue(toAccounting(value));
        }
    }, [value, isFocused]);

    const handleFocus = (e) => {
        setIsFocused(true);
        // Clean display for editing (no dots, comma for decimal)
        const raw = String(value || '0').replace('.', ',');
        setLocalValue(raw === '0' ? '' : raw);
        setTimeout(() => e.target.select(), 10);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        const parsed = fromAccounting(localValue);
        if (onBlur) onBlur(parsed);
    };

    const handleChange = (e) => {
        let val = e.target.value.replace(/\./g, ','); // Live dot to comma
        // Allow only numbers and one comma
        if (/^[0-9]*[,]?[0-9]*$/.test(val.replace(/\./g, ''))) {
            setLocalValue(val);
            const parsed = fromAccounting(val);
            if (!isNaN(parsed)) onChange(parsed);
        }
    };

    return (
        <input 
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className={className}
            style={style}
            disabled={disabled}
            placeholder={placeholder}
            value={localValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete="off"
        />
    );
};

// Sortable Quotation Row Component
const SortableItem = ({ 
    det, 
    idx, 
    showCosts, 
    totalPAX, 
    updateDetail, 
    removeDetail, 
    itemRefs, 
    searchInputRef 
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `qitem-${idx}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        display: 'grid',
        gridTemplateColumns: `30px 40px 1fr 80px ${showCosts ? '80px' : ''} 90px 110px 40px`,
        alignItems: 'center',
        gap: '12px',
        padding: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
    };

    return (
        <div ref={setNodeRef} style={style} className="item-row">
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', opacity: 0.3 }}>
                <GripVertical size={16} />
            </div>
            <img src={det.foto ? `${UPLOADS_URL}${det.foto}` : '/placeholder.png'} className="item-thumb" alt="" />
            <div style={{ flex: 2 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {det.nombre}
                    <div
                        className={`pax-toggle-modern ${det.por_persona ? 'active' : ''}`}
                        onClick={() => {
                            const newMode = !det.por_persona;
                            updateDetail(idx, 'por_persona', newMode);
                            if (newMode) updateDetail(idx, 'cantidad', totalPAX);
                        }}
                        title="Modo PAX (Sincronizado con invitados)"
                    >
                        PAX
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', minHeight: '24px' }}>
                    <input
                        type="text"
                        placeholder="Observaciones..."
                        value={det.notas}
                        onChange={(e) => updateDetail(idx, 'notas', e.target.value)}
                        className="dense-input"
                        style={{ fontSize: '10px', padding: '4px 8px', width: '60%', height: '22px' }}
                    />
                    <span style={{ 
                        fontSize: '10px', 
                        fontWeight: '700',
                        color: (det.nombre_proveedor || 'ArchiPlanner').toLowerCase() === 'archiplanner' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                        background: (det.nombre_proveedor || 'ArchiPlanner').toLowerCase() === 'archiplanner' ? 'var(--color-primary-dim)' : 'rgba(255,255,255,0.05)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: (det.nombre_proveedor || 'ArchiPlanner').toLowerCase() === 'archiplanner' ? '1px solid var(--color-primary-dim)' : '1px solid rgba(255,255,255,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '20px',
                        lineHeight: '1'
                    }}>
                        {det.nombre_proveedor || 'ArchiPlanner'}
                    </span>
                </div>
            </div>
            <SmartNumericInput
                inputRef={el => itemRefs.current[idx] = el}
                value={det.cantidad}
                onChange={(val) => updateDetail(idx, 'cantidad', val)}
                onBlur={(val) => {
                    if (isNaN(val) || val === 0) {
                        updateDetail(idx, 'por_persona', true);
                        updateDetail(idx, 'cantidad', totalPAX);
                    }
                }}
                className="dense-input numeric-input"
                style={{ width: '85px', textAlign: 'center' }}
                disabled={det.por_persona}
            />
            {showCosts && (
                <SmartNumericInput
                    value={det.costo_u}
                    onChange={(val) => updateDetail(idx, 'costo_u', val)}
                    className="dense-input numeric-input"
                    style={{ width: '90px', textAlign: 'center' }}
                />
            )}
            <SmartNumericInput
                value={det.precio_u}
                onChange={(val) => updateDetail(idx, 'precio_u', val)}
                className="dense-input numeric-input"
                style={{ width: '100px', color: 'var(--color-tertiary)', fontWeight: '600', textAlign: 'center' }}
            />
            <div style={{ fontWeight: '700', textAlign: 'center', fontSize: '13px' }}>
                ${smartFormat(det.cantidad * det.precio_u)}
            </div>
            <button type="button" className="action-btn delete" onClick={() => removeDetail(idx)}>
                <Trash2 size={14} />
            </button>
        </div>
    );
};

const AdminCotizacionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedColor, setSelectedColor] = useState('#ff8484'); // Default brand primary

    const addColor = () => {
        if (!selectedColor) return;
        const currentPallete = (formData.paleta_colores || '').split(',').map(c => c.trim()).filter(Boolean);
        if (!currentPallete.includes(selectedColor)) {
            const newPallete = [...currentPallete, selectedColor].join(', ');
            setFormData(prev => ({ ...prev, paleta_colores: newPallete }));
        }
    };

    const removeColor = (colorToRemove) => {
        const currentPallete = (formData.paleta_colores || '').split(',').map(c => c.trim()).filter(Boolean);
        const newPallete = currentPallete.filter(c => c !== colorToRemove).join(', ');
        setFormData(prev => ({ ...prev, paleta_colores: newPallete }));
    };

    // Data States
    const [clientes, setClientes] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchIndex, setSearchIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // --- ESTADOS DE PAGOS (v4) ---
    const [pagos, setPagos] = useState([]);
    const [pagosLoading, setPagosLoading] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [nuevoPago, setNuevoPago] = useState({ monto: '', metodo: 'Transferencia', nota: '' });
    const [comprobante, setComprobante] = useState(null);
    const [comprobantePreview, setComprobantePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('presupuesto'); // 'presupuesto' | 'financiero'

    // --- ESTADOS DE GASTOS (v4) ---
    const [gastos, setGastos] = useState([]);
    const [gastosLoading, setGastosLoading] = useState(false);
    const [showGastoModal, setShowGastoModal] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '', responsable: '', pagado_a: '', metodo: 'Efectivo' });

    const fetchGastos = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/gastos/cotizacion/${id}`);
            setGastos(res.data || []);
        } catch (err) {
            console.error('Error fetching gastos:', err);
        }
    };

    const handleSubirGasto = async () => {
        if (!nuevoGasto.monto || !nuevoGasto.concepto) return;
        setGastosLoading(true);
        try {
            const fData = new FormData();
            fData.append('cotizacion_id', id);
            fData.append('concepto', nuevoGasto.concepto);
            fData.append('monto', nuevoGasto.monto.replace(/\./g, '').replace(/,/g, '.'));
            fData.append('responsable', nuevoGasto.responsable);
            fData.append('pagado_a', nuevoGasto.pagado_a);
            fData.append('metodo', nuevoGasto.metodo);
            fData.append('categoria', nuevoGasto.categoria || 'General');
            if (comprobante) fData.append('comprobante', comprobante);

            await api.post('/gastos', fData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowGastoModal(false);
            setNuevoGasto({ concepto: '', monto: '', responsable: '', pagado_a: '', metodo: 'Efectivo', categoria: 'General' });
            setComprobante(null);
            setComprobantePreview(null);
            fetchGastos();
        } catch (err) {
            console.error('Error subiendo gasto:', err);
        } finally {
            setGastosLoading(false);
        }
    };

    const handleEliminarGasto = async (gastoId) => {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            await api.delete(`/gastos/${gastoId}`);
            fetchGastos();
        } catch (err) {
            console.error('Error eliminando gasto:', err);
        }
    };

    const handleToggleGastoEstado = async (gastoId, currentEstado) => {
        const nuevoEstado = currentEstado === 'pagado' ? 'pendiente' : 'pagado';
        try {
            await api.patch(`/gastos/${gastoId}/estado`, { estado: nuevoEstado });
            fetchGastos();
        } catch (err) {
            console.error('Error toggling gasto estado:', err);
        }
    };

    const handleSyncBudgetToGastos = async () => {
        if (!id) {
            Swal.fire({
                icon: 'warning',
                title: 'Guardar primero',
                text: 'Guarda la cotización antes de sincronizar los costos.',
                background: '#1a1a1a',
                color: '#fff'
            });
            return;
        }

        const itemsWithCost = formData.detalles.filter(d => Number(d.costo_u) > 0);
        if (itemsWithCost.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin costos',
                text: 'No hay elementos con costo unitario en el presupuesto.',
                background: '#1a1a1a',
                color: '#fff'
            });
            return;
        }

        setGastosLoading(true);
        try {
            // Sincronizamos cada item que tiene costo
            // Para simplicidad, solo agregamos los que NO están ya vinculados por item_id
            for (const item of itemsWithCost) {
                const alreadySynced = gastos.some(g => g.item_id === item.art_id || g.concepto === item.nombre);
                if (!alreadySynced) {
                    await api.post('/gastos', {
                        cotizacion_id: id,
                        concepto: item.nombre,
                        monto: item.costo_u * item.cantidad,
                        responsable: 'Sistema (Auto)',
                        pagado_a: item.nombre_proveedor || 'Proveedor Presupuestado',
                        metodo: 'Efectivo',
                        estado: 'pendiente',
                        item_id: item.art_id || 999,
                        categoria: item.categoria || 'General'
                    });
                }
            }
            fetchGastos();
            Swal.fire({
                icon: 'success',
                title: 'Sincronización completa',
                text: 'Los costos del presupuesto se han importado como gastos pendientes.',
                background: '#1a1a1a',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error syncing budget to gastos:', err);
        } finally {
            setGastosLoading(false);
        }
    };

    const fetchPagos = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/pagos/cotizacion/${id}`);
            setPagos(res.data || []);
        } catch (err) {
            console.error('Error fetching pagos:', err);
        }
    };


    const handleSubirPago = async (e) => {
        e.preventDefault();
        setPagosLoading(true);
        const formDataPayload = new FormData();
        formDataPayload.append('cotizacion_id', id);
        formDataPayload.append('monto', nuevoPago.monto);
        formDataPayload.append('metodo', nuevoPago.metodo);
        formDataPayload.append('nota', nuevoPago.nota);
        if (comprobante) formDataPayload.append('comprobante', comprobante);

        try {
            await api.post('/pagos', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowPagoModal(false);
            setNuevoPago({ monto: '', metodo: 'Transferencia', nota: '' });
            setComprobante(null);
            setComprobantePreview(null);
            fetchPagos();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al subir el pago',
                text: err.message,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: 'var(--color-primary)'
            });
        } finally {
            setPagosLoading(false);
        }
    };

    const handleAprobarPago = async (pagoId) => {
        const result = await Swal.fire({
            title: '¿Confirmar pago?',
            text: '¿Estás seguro de completar este pago?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, completar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: 'var(--color-primary)',
            cancelButtonColor: '#333'
        });

        if (!result.isConfirmed) return;
        
        try {
            await api.put(`/pagos/${pagoId}/aprobar`, { usuario_id: user?.id || 1 });
            fetchPagos();
            Swal.fire({
                icon: 'success',
                title: 'Pago completado',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al aprobar',
                text: err.message,
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };

    const totalPagado = Number(pagos
        .filter(p => p.estado === 'completado')
        .reduce((acc, p) => acc + Number(p.monto), 0));
    
    // ----------------------------
    const [collapsedCats, setCollapsedCats] = useState({});
    
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const itemRefs = React.useRef([]);
    const searchInputRef = React.useRef(null);
    const searchContainerRef = React.useRef(null);
    const [showCosts, setShowCosts] = useState(true);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientLoading, setNewClientLoading] = useState(false);
    const [newClient, setNewClient] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        empresa: '',
        cedula: ''
    });

    const [showHistory, setShowHistory] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        conf_id: user?.conf_id || 1,
        num: '',
        cli_id: '',
        u_id: user?.id || 1,
        fcoti: new Date().toISOString().split('T')[0],
        fevent: '',
        fevent_fin: '',
        num_adultos: 0,
        num_ninos: 0,
        hora_inicio: '18:00',
        hora_fin: '02:00',
        lugar: '',
        loc_id: null,
        tematica: '',
        tipo_evento: 'Boda',
        paleta_colores: '',
        aplica_iva: false,
        total_tipo: 'calculado',
        monto_final: 0,
        estado: 'borrador',
        notas: '',
        mostrar_precios: true,
        detalles: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, eRes, rRes, pRes] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/configuraciones'),
                    api.get('/recursos-unificados'),
                    api.get('/plantillas')
                ]);

                const fetchedEmpresas = eRes.data;
                const activeEmpresa = fetchedEmpresas.find(e => e.es_activa) || fetchedEmpresas[0];

                setClientes(cRes.data);
                setEmpresas(fetchedEmpresas);
                setRecursos(rRes.data);
                setPlantillas(pRes.data);
                
                // Cargar pagos y gastos si estamos editando
                if (id) {
                    fetchPagos();
                    fetchGastos();
                }

                if (id) {
                    const cotiRes = await api.get(`/cotizaciones/${id}`);
                    const coti = cotiRes.data;
                    // Format dates and times for inputs
                    setFormData({
                        ...coti,
                        fcoti: coti.fcoti ? coti.fcoti.split('T')[0] : '',
                        fevent: coti.fevent ? coti.fevent.split('T')[0] : '',
                        fevent_fin: coti.fevent_fin ? coti.fevent_fin.split('T')[0] : '',
                        aplica_iva: !!coti.aplica_iva,
                        monto_final: Number(coti.monto_final || coti.total || 0),
                        total_tipo: coti.total_tipo || 'calculado',
                        paleta_colores: coti.paleta_colores || '',
                        detalles: (coti.detalles || []).map(d => {
                            const master = rRes.data.find(r => 
                                (d.art_id && String(r.art_id) === String(d.art_id)) || 
                                (d.loc_id && String(r.loc_id) === String(d.loc_id))
                            );
                            return {
                                ...d,
                                nombre_proveedor: master?.nombre_proveedor || d.nombre_proveedor || d.proveedor || d.prov_name || 'ArchiPlanner'
                            };
                        })
                    });
                } else {
                    // Generate a temporary number if new
                    setFormData(prev => ({
                        ...prev,
                        num: Math.floor(1000 + Math.random() * 9000).toString(),
                        conf_id: activeEmpresa?.id || user?.conf_id || 1,
                        mostrar_precios: true
                    }));
                }
            } catch (err) {
                console.error('Error loading form data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    // --- KEYBOARD SHORTCUTS (Alt + Key) ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey) {
                const key = e.key.toLowerCase();
                if (key === 's') { e.preventDefault(); handleSubmit(e); }
                if (key === 'a') { 
                    e.preventDefault(); 
                    if(activeTab === 'presupuesto') setShowPagoModal(true); 
                    else setShowGastoModal(true); 
                }
                if (key === 'v' && id) { e.preventDefault(); window.open(`/admin/cotizaciones/${id}/view`, '_blank'); }
                if (key === 'h') { e.preventDefault(); setShowHistory(true); }
                if (key === 'c') { e.preventDefault(); setShowCosts(!showCosts); }
                if (key === 'x') { e.preventDefault(); navigate('/admin/cotizaciones'); }
                if (key === 'p') { e.preventDefault(); searchInputRef.current?.focus(); }
                if (key === 'b') { e.preventDefault(); setActiveTab('presupuesto'); }
                if (key === 'f') { e.preventDefault(); setActiveTab('financiero'); }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [id, showCosts, formData, activeTab, navigate]);

    // Proactive Dropdown Positioning
    const updateDropdownPos = () => {
        if (searchContainerRef.current) {
            const rect = searchContainerRef.current.getBoundingClientRect();
            const dropdownWidth = 500;
            const margin = 20;

            // Calculate left position to keep it in viewport
            let left = rect.right - dropdownWidth;
            if (left + dropdownWidth > window.innerWidth - margin) {
                left = window.innerWidth - dropdownWidth - margin;
            }
            if (left < margin) {
                left = margin;
            }

            setDropdownPos({
                top: rect.bottom + 8,
                left: left,
                width: dropdownWidth
            });
        }
    };

    useEffect(() => {
        if (isSearchFocused) {
            updateDropdownPos();
            window.addEventListener('scroll', updateDropdownPos, true);
            window.addEventListener('resize', updateDropdownPos);
        }
        return () => {
            window.removeEventListener('scroll', updateDropdownPos, true);
            window.removeEventListener('resize', updateDropdownPos);
        };
    }, [isSearchFocused, searchTerm]);

    // Calculations
    const [showHelp, setShowHelp] = useState(false);
    
    // Profitability Stats by Category
    const categoryStats = useMemo(() => {
        const stats = {};
        
        // Revenue by category (from details)
        formData.detalles.forEach(d => {
            const cat = d.categoria || 'General';
            if (!stats[cat]) stats[cat] = { revenue: 0, cost: 0, actual: 0 };
            stats[cat].revenue += (Number(d.precio_u || 0) * Number(d.cantidad || 0));
            stats[cat].cost += (Number(d.costo_u || 0) * Number(d.cantidad || 0));
        });
        
        // Actual expenses by category
        gastos.forEach(g => {
            let cat = g.categoria || 'General';
            if (!stats[cat]) stats[cat] = { revenue: 0, cost: 0, actual: 0 };
            stats[cat].actual += Number(g.monto || 0);
        });
        
        return stats;
    }, [formData.detalles, gastos]);

    // --- COMPONENTE DE GRÁFICO DE OLAS (NEW) ---
    // --- COMPONENTE DE ANILLOS DE GASTO POR PROVEEDOR (NUEVO) ---
    const ProviderExpenseRings = () => {
        // Obtenemos gastos estimados (costos del presupuesto) agrupados por proveedor
        const providerData = useMemo(() => {
            const map = {};
            formData.detalles.forEach(d => {
                const prov = d.nombre_proveedor || 'ArchiPlanner';
                if (!map[prov]) map[prov] = 0;
                map[prov] += (Number(d.costo_u || 0) * Number(d.cantidad || 0));
            });
            // Convertir a array y ordenar por monto descendente
            return Object.entries(map)
                .map(([name, total]) => ({ name, total }))
                .filter(p => p.total > 0)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5); // Tomamos los top 5
        }, [formData.detalles]);

        const totalExternalCost = providerData.reduce((acc, p) => acc + p.total, 0);
        const colors = ['var(--color-primary)', 'var(--color-tertiary)', '#a78bfa', '#facc15', '#60a5fa'];

        if (providerData.length === 0) return null;

        return (
            <div className="provider-expense-rings-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        {providerData.map((p, i) => {
                            const radius = 45 - (i * 8);
                            const circumference = 2 * Math.PI * radius;
                            const percentage = (p.total / totalExternalCost) * 100;
                            const offset = circumference - (percentage * circumference) / 100;
                            
                            return (
                                <g key={i}>
                                    <circle 
                                        cx="50" cy="50" r={radius} 
                                        fill="none" 
                                        stroke="rgba(255,255,255,0.05)" 
                                        strokeWidth="5" 
                                    />
                                    <circle 
                                        cx="50" cy="50" r={radius} 
                                        fill="none" 
                                        stroke={colors[i % colors.length]} 
                                        strokeWidth="5" 
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        style={{ 
                                            strokeDashoffset: offset,
                                            transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)',
                                            filter: `drop-shadow(0 0 3px ${colors[i % colors.length]}44)`
                                        }}
                                        className="report-circle-anim"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%', pointerEvents: 'none' }}>
                        <div style={{ fontSize: '9px', opacity: 0.5, fontWeight: '800' }}>TOTAL COSTOS</div>
                        <div style={{ fontSize: '12px', fontWeight: '900' }}>$ {smartFormat(totalExternalCost)}</div>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h5 style={{ margin: '0 0 5px 0', fontSize: '10px', opacity: 0.6, letterSpacing: '1px' }}>GASTOS POR PROVEEDOR</h5>
                    {providerData.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[i % colors.length], flexShrink: 0 }}></div>
                                <span style={{ fontWeight: '600', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </div>
                            <div style={{ fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>$ {smartFormat(p.total)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const ProfitabilityWaveChart = () => {
        const stats = Object.entries(categoryStats);
        const [hoverData, setHoverData] = useState(null);
        if (stats.length === 0) return <div style={{ opacity: 0.3, padding: '40px', textAlign: 'center' }}>No hay datos suficientes para generar el gráfico</div>;

        const width = 400;
        const height = 150;
        const padding = 20;
        
        const maxVal = Math.max(...Object.values(categoryStats).map(s => Math.max(s.revenue, s.cost, s.actual)), 1000);
        const stepX = (width - padding * 2) / (stats.length - 1 || 1);
        
        const getPoints = (type) => {
            return stats.map(([_, s], i) => {
                const val = type === 'revenue' ? s.revenue : Math.max(s.cost, s.actual);
                const x = padding + i * stepX;
                const y = height - padding - (val / maxVal) * (height - padding * 2);
                return { x, y, val, category: _ };
            });
        };

        const revenuePoints = getPoints('revenue');
        const costPoints = getPoints('cost');

        const generatePath = (points) => {
            if (points.length < 2) return "";
            let d = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                const midX = (curr.x + next.x) / 2;
                d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
            }
            return d;
        };

        const revPath = generatePath(revenuePoints);
        const costPath = generatePath(costPoints);
        const closedRev = `${revPath} V ${height - padding} H ${padding} Z`;
        const closedCost = `${costPath} V ${height - padding} H ${padding} Z`;

        return (
            <div className="wave-chart-container" style={{ position: 'relative', marginTop: '20px' }}>
                {/* Tooltip */}
                {hoverData && (
                    <div className="glass-panel" style={{ 
                        position: 'absolute', 
                        top: hoverData.y - 45, 
                        left: hoverData.x - 50, 
                        zIndex: 10, 
                        padding: '6px 10px', 
                        fontSize: '10px', 
                        width: '100px', 
                        textAlign: 'center',
                        pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ opacity: 0.6, fontSize: '8px', textTransform: 'uppercase' }}>{hoverData.category}</div>
                        <div style={{ fontWeight: '900', color: hoverData.type === 'revenue' ? 'var(--color-primary)' : 'var(--color-tertiary)' }}>
                            $ {smartFormat(hoverData.val)}
                        </div>
                    </div>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-tertiary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--color-tertiary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Area path for Revenue */}
                    <path d={closedRev} fill="url(#gradRev)" />
                    <path d={revPath} fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" className="wave-anim" />

                    {/* Area path for Cost */}
                    <path d={closedCost} fill="url(#gradCost)" />
                    <path d={costPath} fill="none" stroke="var(--color-tertiary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" className="wave-anim-delay" />

                    {/* Interaction Points */}
                    {revenuePoints.map((p, i) => (
                        <circle 
                            key={`r-${i}`} 
                            cx={p.x} cy={p.y} r="5" 
                            fill="var(--color-primary)" 
                            stroke="#000" strokeWidth="2"
                            onMouseEnter={() => setHoverData({...p, type: 'revenue'})}
                            onMouseLeave={() => setHoverData(null)}
                            style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                        />
                    ))}
                    {costPoints.map((p, i) => (
                        <circle 
                            key={`c-${i}`} 
                            cx={p.x} cy={p.y} r="5" 
                            fill="var(--color-tertiary)" 
                            stroke="#000" strokeWidth="2"
                            onMouseEnter={() => setHoverData({...p, type: 'cost'})}
                            onMouseLeave={() => setHoverData(null)}
                            style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                        />
                    ))}
                </svg>
                
                {/* Labels */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${stats.length}, 1fr)`, 
                    padding: `0 ${padding}px`, 
                    marginTop: '8px',
                    gap: '4px'
                }}>
                    {stats.map(([cat], i) => (
                        <div key={i} style={{ 
                            fontSize: '7px', 
                            opacity: 0.6, 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            lineHeight: '1.2',
                            minWidth: 0
                        }}>
                            {cat}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const subtotals = useMemo(() => {
        const costTotal = formData.detalles.reduce((acc, d) => acc + (Number(d.costo_u || 0) * Number(d.cantidad || 0)), 0);
        const saleTotal = formData.detalles.reduce((acc, d) => acc + (Number(d.precio_u || 0) * Number(d.cantidad || 0)), 0);
        const ivaValue = formData.aplica_iva ? saleTotal * 0.19 : 0;
        const grandTotal = saleTotal + ivaValue;
        return { costTotal, saleTotal, ivaValue, grandTotal };
    }, [formData.detalles, formData.aplica_iva]);

    // Sincronizar monto_final si es calculado
    useEffect(() => {
        if (formData.total_tipo === 'calculado') {
            setFormData(prev => ({ ...prev, monto_final: subtotals.grandTotal }));
        }
    }, [subtotals.grandTotal, formData.total_tipo]);

    // Sincronizar branding (conf_id) según el cliente seleccionado
    useEffect(() => {
        if (formData.cli_id && clientes.length > 0) {
            const client = clientes.find(c => String(c.id) === String(formData.cli_id));
            if (client && client.conf_id && Number(client.conf_id) !== Number(formData.conf_id)) {
                setFormData(prev => ({ ...prev, conf_id: client.conf_id }));
            }
        }
    }, [formData.cli_id, clientes]);

    const totalPAX = Number(formData.num_adultos || 0) + Number(formData.num_ninos || 0);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-sync "Por Persona" quantities
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            detalles: prev.detalles.map(d =>
                d.por_persona ? { ...d, cantidad: totalPAX, subtotal: totalPAX * d.precio_u } : d
            )
        }));
    }, [totalPAX]);

    const groupedDetalles = useMemo(() => {
        return formData.detalles.reduce((acc, det) => {
            const cat = det.categoria || 'Otros';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(det);
            return acc;
        }, {});
    }, [formData.detalles]);

    const addResource = (res) => {
        const exists = formData.detalles.find(d =>
            (res.tipo === 'articulo' && d.art_id === res.art_id) ||
            (res.tipo === 'locacion' && d.loc_id === res.loc_id)
        );

        if (exists) {
            Swal.fire({
                icon: 'warning',
                title: 'Elemento duplicado',
                text: 'Este elemento ya está en la cotización',
                background: '#1a1a1a',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }

        const isPerPersona = ['Catering', 'Alimentos', 'Bebidas', 'Platos', 'Menú'].includes(res.categoria) ||
            res.nombre.toLowerCase().includes('plato') ||
            res.nombre.toLowerCase().includes('menú');

        const masterRes = recursos.find(r => 
            (res.art_id && String(r.art_id) === String(res.art_id)) || 
            (res.loc_id && String(r.loc_id) === String(res.loc_id))
        );
        
        const newDetail = {
            art_id: res.art_id,
            loc_id: res.loc_id,
            nombre: res.nombre,
            categoria: res.categoria || 'Otros',
            nombre_proveedor: masterRes?.nombre_proveedor || res.nombre_proveedor || res.proveedor || res.prov_name || 'ArchiPlanner',
            foto: res.foto,
            cantidad: isPerPersona ? totalPAX : 1,
            costo_u: res.costo_u || 0,
            precio_u: res.precio_u || 0,
            subtotal: (isPerPersona ? totalPAX : 1) * (res.precio_u || 0),
            por_persona: isPerPersona,
            notas: ''
        };

        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, newDetail]
        }));

        setSearchTerm('');
        setIsSearchFocused(false);
        setSearchIndex(-1);

        // Autofocus on quantity input of the new item
        setTimeout(() => {
            const lastIdx = formData.detalles.length;
            if (itemRefs.current[lastIdx]) {
                itemRefs.current[lastIdx].focus();
                itemRefs.current[lastIdx].select();
            }
        }, 100);
    };

    const handleDragEnd = (event, category) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = formData.detalles.findIndex((_, idx) => `qitem-${idx}` === active.id);
        const newIndex = formData.detalles.findIndex((_, idx) => `qitem-${idx}` === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setFormData(prev => ({
                ...prev,
                detalles: arrayMove(prev.detalles, oldIndex, newIndex)
            }));
        }
    };

    const toggleCategory = (cat) => {
        setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const updateDetail = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            [field]: value
        };

        // Recalculate detail subtotal
        if (field === 'cantidad' || field === 'precio_u') {
            newDetalles[index].subtotal = Number(newDetalles[index].cantidad) * Number(newDetalles[index].precio_u);
        }

        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    const removeDetail = (index) => {
        setFormData(prev => ({
            ...prev,
            detalles: prev.detalles.filter((_, i) => i !== index)
        }));
    };

    const applyTemplate = async (templateId) => {
        if (!templateId) return;
        try {
            const res = await api.get(`/plantillas/${templateId}`);
            const t = res.data;

            const templateDetails = (t.detalles || []).map(td => {
                const cant = td.por_persona ? totalPAX : Number(td.cantidad || 0);
                const precio = Number(td.precio_u || td.loc_precio || 0);
                const master = recursos.find(r => 
                    (td.art_id && String(r.art_id) === String(td.art_id)) || 
                    (td.loc_id && String(r.loc_id) === String(td.loc_id))
                );

                return {
                    art_id: td.art_id,
                    loc_id: td.loc_id,
                    nombre: td.nombre || td.loc_nombre || 'Item sin nombre',
                    categoria: td.categoria || 'Otros',
                    nombre_proveedor: master?.nombre_proveedor || td.nombre_proveedor || td.proveedor || td.prov_name || 'ArchiPlanner',
                    cantidad: cant,
                    costo_u: Number(td.costo_u || 0),
                    precio_u: precio,
                    subtotal: cant * precio,
                    notas: td.notas || ''
                };
            });

            setFormData(prev => ({
                ...prev,
                tipo_evento: t.tipo_evento || prev.tipo_evento,
                detalles: [...prev.detalles, ...templateDetails]
            }));
        } catch (err) {
            console.error('Error applying template:', err);
        }
    };

    const handleQuickClientSubmit = async (e) => {
        e.preventDefault();
        setNewClientLoading(true);
        try {
            const res = await api.post('/clientes', {
                ...newClient,
                conf_id: formData.conf_id
            });
            if (res.data.id) {
                // Refresh client list
                const cRes = await api.get('/clientes');
                setClientes(cRes.data);
                // Select the new client
                setFormData(prev => ({ ...prev, cli_id: res.data.id }));
                setShowNewClientModal(false);
                setNewClient({ nombre: '', apellido: '', telefono: '', correo: '', empresa: '', cedula: '' });
            }
        } catch (err) {
            console.error("Error creating quick client:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear cliente',
                text: 'No se pudo registrar el cliente rápido.',
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setNewClientLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            subt: subtotals.saleTotal,
            iva: subtotals.ivaValue,
            total: subtotals.grandTotal,
            monto_final: formData.monto_final
        };

        try {
            if (id) {
                await api.put(`/cotizaciones/${id}`, payload);
            } else {
                await api.post('/cotizaciones', payload);
            }
            Swal.fire({
                icon: 'success',
                title: 'Cotización guardada',
                showConfirmButton: false,
                timer: 1500,
                background: '#1a1a1a',
                color: '#fff'
            });
            navigate('/admin/cotizaciones');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: 'No se pudo guardar la cotización.',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Save: Alt + S or Ctrl + S
            if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSubmit(e);
            }
            // Abono: Alt + A
            if (e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setShowPagoModal(true);
            }
            // Financial Report: Alt + G (Gasto/Ganancia/General)
            if (e.altKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                setShowReport(true);
            }
            // Search: Alt + P
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setIsSearchFocused(true);
            }
            // Budget Tab: Alt + B
            if (e.altKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setActiveTab('presupuesto');
            }
            // Financial Tab: Alt + F
            if (e.altKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                setActiveTab('financiero');
            }
            // View Preview: Alt + V
            if (e.altKey && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                if (id) window.open(`/admin/cotizaciones/${id}/view`, '_blank');
            }
            // Toggle Costs: Alt + C
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                setShowCosts(prev => !prev);
            }
            // Close / Cancel: Alt + X
            if (e.altKey && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                navigate('/admin/cotizaciones');
            }
            // History: Alt + H
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setShowHistory(true);
            }
            // Help: Alt + I (Info)
            if (e.altKey && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                setShowHelp(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [id, showCosts, navigate]);

    if (loading) return <div className="admin-loader-container"><div className="loader"></div></div>;

    const filteredRecursos = (recursos || []).filter(r => {
        const nombre = (r.nombre || '').toLowerCase();
        const categoria = (r.categoria || '').toLowerCase();
        const search = (searchTerm || '').toLowerCase();
        return nombre.includes(search) || categoria.includes(search);
    });

    return (
        <form
            className="admin-page-container fade-in"
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
                // Prevent Enter from submitting unless on the submit button itself
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                    // But allow Enter in search input for selection (handled there)
                    if (e.target !== searchInputRef.current && !e.target.classList.contains('dense-input')) {
                        // If it's a generic input, prevent
                        // (Quantity inputs already handled individually)
                    }
                }
            }}
        >
            <div className="admin-header-flex" style={{ marginBottom: '8px', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
                    {id ? <FileText size={20} style={{ color: 'var(--color-primary)' }} /> : <FilePlus size={20} style={{ color: 'var(--color-primary)' }} />}
                    <h1 className="admin-title" style={{ fontSize: '18px', margin: 0, whiteSpace: 'nowrap' }}>
                        Cotización #{formData.num || 'Nueva'}
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* TABS INTEGRATED - ARCHIPLANNER STYLE */}
                    <div className="financial-tabs-modern" style={{ marginRight: '15px' }}>
                        <button 
                            type="button" 
                            className={`tab-btn ${activeTab === 'presupuesto' ? 'active' : ''}`}
                            onClick={() => setActiveTab('presupuesto')}
                        >
                            <Layout size={14} /> PRESUPUESTO
                        </button>
                        <button 
                            type="button" 
                            className={`tab-btn ${activeTab === 'financiero' ? 'active' : ''}`}
                            onClick={() => setActiveTab('financiero')}
                        >
                            <Calculator size={14} /> ESTADO FINANCIERO
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" className="btn-icon-tooltip" onClick={() => setShowHelp(true)} title="Ayuda (Alt + I)">
                            <Info size={16} />
                        </button>
                        <button type="button" className="btn-icon-tooltip" onClick={() => setShowCosts(!showCosts)} title={`Costos (Alt + C)`}>
                            {showCosts ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button type="button" className="btn-icon-tooltip" onClick={() => setShowHistory(true)} title="Historial (Alt + H)">
                            <History size={16} />
                        </button>
                        <button type="button" className="btn-icon-tooltip" onClick={() => navigate('/admin/cotizaciones')} title="Salir (Alt + X)">
                            <X size={16} />
                        </button>
                        
                        {id && (
                            <>
                                <button 
                                    type="button" 
                                    className="btn-icon-tooltip" 
                                    style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }} 
                                    onClick={() => setShowPagoModal(true)}
                                    title="Abono (Alt + A)"
                                >
                                    <CreditCard size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-icon-tooltip" 
                                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-dim)' }} 
                                    onClick={() => window.open(`/admin/cotizaciones/${id}/view`, '_blank')}
                                    title="Vista (Alt + V)"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </>
                        )}
                        
                        <button type="submit" className="btn-icon-tooltip primary" title={id ? 'Actualizar (Alt + S)' : 'Guardar (Alt + S)'}>
                            <Save size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'presupuesto' ? (
                <div className="quotation-grid" style={{ marginTop: '8px' }}>

                {/* Left Panel: Event Data */}
                <div className="glass-panel dense-grid" style={{ position: 'sticky', top: '24px', alignSelf: 'start', height: 'fit-content', zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <h3 className="section-title-sm" style={{ margin: 0, whiteSpace: 'nowrap' }}><Info size={14} /> Evento</h3>
                        <div className="status-select-wrapper">
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleInputChange}
                                className={`status-badge-select ${formData.estado}`}
                            >
                                <option value="borrador">Borrador</option>
                                <option value="enviada">Enviada</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="contratada">Contratada</option>
                                <option value="rechazada">Rechazada</option>
                            </select>
                        </div>
                    </div>

                    {user?.rol === 'Super' && (
                        <div className="form-field">
                            <label>Empresa Emisora</label>
                            <select name="conf_id" value={formData.conf_id} onChange={handleInputChange} className="dense-input">
                                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre_empresa}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="form-field">
                        <label>Cliente</label>
                        <SearchableDropdown
                            options={clientes}
                            value={formData.cli_id}
                            onChange={(val) => setFormData(prev => ({ ...prev, cli_id: val }))}
                            placeholder="Buscar por nombre, empresa, tel o correo..."
                            valueKey="id"
                            searchFields={["nombre", "apellido", "nombre_empresa", "telefono", "correo"]}
                            renderOption={(c) => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{c.nombre} {c.apellido}</span>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '10px', opacity: 0.6 }}>
                                        <span style={{ color: 'var(--color-primary)' }}>{c.nombre_empresa || 'Particular'}</span>
                                        {c.telefono && <span>• {c.telefono}</span>}
                                        {c.correo && <span>• {c.correo}</span>}
                                    </div>
                                </div>
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewClientModal(true)}
                            className="action-btn"
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: '22px', height: '22px', borderRadius: '4px', background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                            title="Nuevo Cliente Rápido"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="compact-grid-2">
                        <div className="form-field">
                            <label>Fecha Inicio</label>
                            <input type="date" name="fevent" value={formData.fevent} onChange={handleInputChange} className="dense-input" />
                        </div>
                        <div className="form-field">
                            <label>Fecha Fin</label>
                            <input type="date" name="fevent_fin" value={formData.fevent_fin} onChange={handleInputChange} className="dense-input" />
                        </div>
                    </div>

                    <div className="compact-grid-2">
                        <div className="form-field">
                            <label>Hora Inicio</label>
                            <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleInputChange} className="dense-input" />
                        </div>
                        <div className="form-field">
                            <label>Hora Fin</label>
                            <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleInputChange} className="dense-input" />
                        </div>
                    </div>

                    <div className="compact-grid-2">
                        <div className="form-field">
                            <label>Tipo Evento</label>
                            <select name="tipo_evento" value={formData.tipo_evento} onChange={handleInputChange} className="dense-input">
                                <option value="Boda">Boda</option>
                                <option value="Quinceaños">Quinceaños</option>
                                <option value="Corporativo">Corporativo</option>
                                <option value="Baby shower">Baby shower</option>
                                <option value="Cumpleaños">Cumpleaños</option>
                                <option value="Prom">Prom</option>
                                <option value="Aniversario">Aniversario</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Lugar / Locación</label>
                            <input type="text" name="lugar" value={formData.lugar} onChange={handleInputChange} placeholder="Nombre del salón" className="dense-input" />
                        </div>
                    </div>

                    <div className="compact-grid-3">
                        <div className="form-field">
                            <label>PAX Adultos</label>
                            <input type="number" name="num_adultos" value={formData.num_adultos} onChange={handleInputChange} className="dense-input" />
                        </div>
                        <div className="form-field">
                            <label>PAX Niños</label>
                            <input type="number" name="num_ninos" value={formData.num_ninos} onChange={handleInputChange} className="dense-input" />
                        </div>
                        <div className="form-field">
                            <label style={{ color: 'var(--color-primary)' }}>PAX Total</label>
                            <div className="dense-input total-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{totalPAX}</div>
                        </div>
                    </div>

                    <div className="form-field" style={{ marginBottom: '5px' }}>
                        <label>Temática del Evento</label>
                        <input type="text" name="tematica" value={formData.tematica} onChange={handleInputChange} placeholder="Ej: Vintage, Rosas pastel" className="dense-input" />
                    </div>

                    <div style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Paleta</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        left: '-5px',
                                        width: '150%',
                                        height: '150%',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addColor}
                                className="palette-circle"
                                title="Añadir color"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--color-bg-light)',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    color: 'var(--color-text-dim)',
                                    width: '24px',
                                    height: '24px'
                                }}
                            >
                                <Plus size={14} />
                            </button>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(formData.paleta_colores || '').split(',').map((c, i) => {
                                    const color = c.trim();
                                    if (!color.startsWith('#')) return null;
                                    return (
                                        <div 
                                            key={i} 
                                            className="palette-circle"
                                            style={{ background: color, width: '24px', height: '24px' }}
                                            title={color.toUpperCase()}
                                        >
                                            <button 
                                                type="button" 
                                                className="remove"
                                                onClick={() => removeColor(color)}
                                            >
                                                <X size={8} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Cargar Plantilla</label>
                        <SearchableDropdown
                            options={plantillas}
                            value=""
                            onChange={(val) => applyTemplate(val)}
                            placeholder="Seleccionar plantilla base..."
                            valueKey="id"
                            labelKey="nombre"
                            searchFields={["nombre", "tipo_evento"]}
                            renderOption={(p) => (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span style={{ fontWeight: '600' }}>{p.nombre}</span>
                                    <span style={{ fontSize: '10px', opacity: 0.6, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {p.tipo_evento}
                                    </span>
                                </div>
                            )}
                        />
                    </div>

                    {/* Totals Summary Mini */}
                    <div className="totals-panel" style={{ marginTop: '12px' }}>
                        <div className="total-row"><span>Subtotal:</span> <span>${smartFormat(subtotals.saleTotal)}</span></div>
                        <div className="total-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                IVA 19%:
                                <input type="checkbox" name="aplica_iva" checked={formData.aplica_iva} onChange={handleInputChange} />
                            </span>
                            <span>${smartFormat(subtotals.ivaValue)}</span>
                        </div>
                        <div className="total-row grand-total" style={{ marginBottom: '4px' }}>
                            <span>TOTAL:</span>
                            <span>${smartFormat(subtotals.grandTotal)}</span>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '2px' }}>
                            <div className="form-field" style={{ width: '100%', border: '1px solid var(--color-primary)', background: 'var(--color-primary-dim)', borderRadius: '8px', padding: '1px 8px 8px' }}>
                                <label style={{ color: 'var(--color-primary)', background: '#1a1a1a', padding: '0 6px', fontSize: '9px', fontWeight: '800' }}>MONTO FINAL ACORDADO</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>$</span>
                                    <SmartNumericInput
                                        value={formData.monto_final}
                                        onChange={(val) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                monto_final: val,
                                                total_tipo: 'manual'
                                            }));
                                        }}
                                        className="dense-input"
                                        style={{ flex: 1, textAlign: 'right', fontWeight: '900', fontSize: '16px', background: 'transparent', border: 'none', color: '#fff', padding: '0' }}
                                    />
                                    {formData.total_tipo === 'manual' && (
                                        <button
                                            type="button"
                                            className="action-btn"
                                            title="Reset"
                                            onClick={() => setFormData(prev => ({ ...prev, total_tipo: 'calculado' }))}
                                            style={{ color: 'var(--color-primary)', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="total-row" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                <input
                                    type="checkbox"
                                    name="mostrar_precios"
                                    checked={formData.mostrar_precios}
                                    onChange={handleInputChange}
                                />
                                Mostrar precio a cliente
                            </label>
                        </div>
                        {showCosts && (
                            <div className="total-row" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                                <span>Costo Total:</span> <span>${smartFormat(subtotals.costTotal)}</span>
                            </div>
                        )}
                    </div>

                    {/* --- DASHBOARD FINANCIERO INTEGRADO (v4) --- */}
                    {id && (
                        <div className="financial-dashboard-sidebar glass-panel" style={{ marginTop: '12px', padding: '12px', border: '1px solid rgba(255, 132, 132, 0.2)', background: 'rgba(0,0,0,0.2)' }}>
                            <h4 style={{ fontSize: '10px', color: 'var(--color-primary)', letterSpacing: '1px', marginBottom: '8px' }}>ESTADO FINANCIERO</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '11px', opacity: 0.6 }}>Pagado:</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>$ {smartFormat(totalPagado)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                    <span style={{ fontSize: '11px', opacity: 0.6 }}>Saldo:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ff8484' }}>$ {smartFormat(Number(formData.monto_final) - totalPagado)}</span>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-admin-primary" 
                                    style={{ marginTop: '10px', fontSize: '11px', padding: '10px', justifyContent: 'center', background: 'linear-gradient(90deg, #d4af37, #c19b2e)', color: '#000', fontWeight: '800' }}
                                    onClick={() => setShowPagoModal(true)}
                                >
                                    <Plus size={14} /> Registrar Abono
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-admin-secondary" 
                                    style={{ fontSize: '11px', padding: '10px', justifyContent: 'center', borderColor: '#d4af37', color: '#d4af37' }}
                                    onClick={() => window.open(`/admin/cotizaciones/${id}/contrato`, '_blank')}
                                >
                                    <FileText size={14} /> Contrato Legal
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Items & Details */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '10px 15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <h3 className="section-title-sm" style={{ margin: 0 }}><Package size={14} /> Elementos de la Cotización</h3>
                    </div>

                    <div className="items-container" style={{ flex: 1, overflowY: 'auto' }}>
                        {/* Header */}
                        {/* Header */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: `30px 40px 1fr 80px ${showCosts ? '80px' : ''} 90px 110px 40px`, 
                            gap: '12px', 
                            padding: '8px 10px', 
                            alignItems: 'center',
                            opacity: 1, 
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--color-primary)'
                        }}>
                            <div ref={searchContainerRef} className="inline-resource-selector" style={{ position: 'relative', width: '100%', marginBottom: 0, gridColumn: 'span 3' }}>
                                <div className="search-input-wrapper" style={{ margin: 0 }}>
                                    <Search size={14} className="search-icon" style={{ opacity: 0.5 }} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar producto... (Alt + P)"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsSearchFocused(true);
                                            setSearchIndex(-1);
                                        }}
                                        onFocus={() => {
                                            setIsSearchFocused(true);
                                            updateDropdownPos();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                setSearchIndex(prev => Math.min(prev + 1, filteredRecursos.length - 1));
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                setSearchIndex(prev => Math.max(prev - 1, 0));
                                            } else if (e.key === 'Enter' && searchIndex >= 0) {
                                                e.preventDefault();
                                                addResource(filteredRecursos[searchIndex]);
                                            } else if (e.key === 'Escape') {
                                                setIsSearchFocused(false);
                                            }
                                        }}
                                        className="dense-input"
                                        style={{ paddingLeft: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: '28px', fontSize: '11px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', opacity: 0.6 }}>CANT</div>
                            {showCosts && <div style={{ textAlign: 'center', opacity: 0.6 }}>COSTO</div>}
                            <div style={{ textAlign: 'center', opacity: 0.6 }}>VENTA U.</div>
                            <div style={{ textAlign: 'center', opacity: 0.6 }}>SUBTOTAL</div>
                            <div />
                        </div>

                        {formData.detalles.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)' }}>
                                <Package size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <p>No hay elementos agregados. Usa el botón superior para añadir productos o locaciones.</p>
                            </div>
                        )}

                        {Object.entries(groupedDetalles).map(([cat, items]) => (
                            <div key={cat} style={{ marginBottom: '16px' }}>
                                <div 
                                    onClick={() => toggleCategory(cat)}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '6px',
                                        borderLeft: '3px solid var(--color-primary)'
                                    }}
                                >
                                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>{cat.toUpperCase()} ({items.length})</span>
                                    {collapsedCats[cat] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                
                                {!collapsedCats[cat] && (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(e) => handleDragEnd(e, cat)}
                                    >
                                        <SortableContext
                                            items={items.map((_, i) => `qitem-${formData.detalles.indexOf(items[i])}`)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {items.map((det) => {
                                                const actualIdx = formData.detalles.indexOf(det);
                                                return (
                                                    <SortableItem
                                                        key={`qitem-${actualIdx}`}
                                                        det={det}
                                                        idx={actualIdx}
                                                        showCosts={showCosts}
                                                        totalPAX={totalPAX}
                                                        updateDetail={updateDetail}
                                                        removeDetail={removeDetail}
                                                        itemRefs={itemRefs}
                                                        searchInputRef={searchInputRef}
                                                    />
                                                );
                                            })}
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label className="label-sm">Observaciones Generales</label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleInputChange}
                            className="dense-input"
                            style={{ width: '100%', height: '80px', marginTop: '8px' }}
                            placeholder="Términos y condiciones, notas especiales..."
                        ></textarea>
                    </div>
                </div>
            </div>
        ) : (
            <div className="financial-dashboard-full fade-in" style={{ marginTop: '12px' }}>
                    {/* 1. TOP SUMMARY CARDS - EDITORIAL STYLE */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '800', letterSpacing: '1px' }}>TOTAL CONTRATO</span>
                                <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '8px' }}>$ {smartFormat(formData.monto_final)}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '800', letterSpacing: '1px' }}>TOTAL PAGADO</span>
                                <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '8px', color: '#10b981' }}>$ {smartFormat(totalPagado)}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #ff8484' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '800', letterSpacing: '1px' }}>TOTAL COSTOS / GASTOS</span>
                                <TrendingDown size={14} style={{ color: '#ff8484' }} />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '8px', color: '#ff8484' }}>
                                $ {smartFormat(Math.max(subtotals.costTotal, gastos.reduce((acc, g) => acc + Number(g.monto), 0)))}
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
                                Proyectado: $ {smartFormat(subtotals.costTotal)} | Real: $ {smartFormat(gastos.reduce((acc, g) => acc + Number(g.monto), 0))}
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-tertiary)', background: 'rgba(95, 220, 199, 0.05)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setShowReport(true)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '800', letterSpacing: '1px' }}>UTILIDAD NETA</span>
                                <Activity size={14} style={{ color: 'var(--color-tertiary)' }} />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '8px', color: 'var(--color-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                $ {smartFormat(Number(formData.monto_final) - gastos.reduce((acc, g) => acc + Number(g.monto), 0))}
                                <span style={{ fontSize: '10px', background: 'var(--color-tertiary)', color: '#000', padding: '2px 4px', borderRadius: '4px' }}>VER REPORTE</span>
                            </div>
                        </div>
                    </div>

                    <div className="quotation-grid" style={{ gap: '20px' }}>
                        {/* LEFT: INCOME & PAYMENTS */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '1px', fontWeight: '800' }}><CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> INGRESOS Y ABONOS</h3>
                                <button type="button" className="btn-admin-primary" style={{ fontSize: '10px', height: '32px', minWidth: '90px', padding: '0 12px' }} onClick={() => setShowPagoModal(true)}>+ Abono</button>
                            </div>
                            
                            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px 5px' }}>FECHA</th>
                                        <th>MÉTODO</th>
                                        <th>MONTO</th>
                                        <th style={{ textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', opacity: 0.3 }}>No hay abonos registrados</td></tr>
                                    ) : pagos.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '12px 5px' }}>{p.fpago ? p.fpago.split('T')[0] : '-'}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{p.metodo}</td>
                                            <td style={{ fontWeight: '700', color: p.estado === 'completado' ? '#10b981' : 'var(--color-primary)' }}>
                                                $ {smartFormat(p.monto)} 
                                                {p.estado !== 'completado' && <span style={{ fontSize: '8px', marginLeft: '5px', opacity: 0.6 }}>(PENDIENTE)</span>}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    {p.foto_comprobante && (
                                                        <button type="button" className="action-btn" title="Ver Comprobante" onClick={() => window.open(`${UPLOADS_URL}${p.foto_comprobante}`, '_blank')}>
                                                            <Eye size={14} />
                                                        </button>
                                                    )}
                                                    {p.estado !== 'completado' && (
                                                        <button type="button" className="action-btn" style={{ color: '#10b981' }} onClick={() => handleAprobarPago(p.id)} title="Aprobar Pago">
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* RIGHT: EXPENSES */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '1px', fontWeight: '800' }}><TrendingDown size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> GASTOS Y PAGOS</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-admin-secondary" 
                                        style={{ fontSize: '10px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', height: '32px', padding: '0 12px' }} 
                                        onClick={handleSyncBudgetToGastos}
                                        disabled={gastosLoading}
                                    >
                                        <RefreshCw size={12} style={{ marginRight: '5px' }} /> {gastosLoading ? 'Sync...' : 'Sincronizar'}
                                    </button>
                                    <button type="button" className="btn-admin-primary" style={{ fontSize: '10px', background: '#ff8484', height: '32px', minWidth: '90px', padding: '0 12px' }} onClick={() => setShowGastoModal(true)}>+ Gasto</button>
                                </div>
                            </div>

                            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px 5px' }}>CONCEPTO</th>
                                        <th>RESPONSABLE</th>
                                        <th style={{ textAlign: 'center' }}>ESTADO</th>
                                        <th style={{ textAlign: 'right' }}>MONTO</th>
                                        <th style={{ textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(gastos.length === 0 ? formData.detalles.filter(d => (Number(d.costo_u || 0) * Number(d.cantidad || 1)) > 0) : gastos).map((item, idx) => {
                                        const isBudgetedOnly = gastos.length === 0;
                                        const displayConcept = isBudgetedOnly ? (item.nombre || 'Sin Nombre') : item.concepto;
                                        const displayMonto = isBudgetedOnly ? (Number(item.costo_u || 0) * Number(item.cantidad || 1)) : item.monto;
                                        const displayCat = isBudgetedOnly ? item.categoria : item.categoria;
                                        
                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: isBudgetedOnly ? 0.7 : 1 }}>
                                                <td style={{ padding: '12px 5px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>{displayConcept}</div>
                                                    <div style={{ fontSize: '9px', opacity: 0.5, display: 'flex', gap: '8px' }}>
                                                        <span style={{ color: 'var(--color-tertiary)', fontWeight: '800' }}>{displayCat || 'General'}</span>
                                                        {isBudgetedOnly && (
                                                            <span style={{ color: 'var(--color-primary)', opacity: 0.8 }}>[ PROYECTADO ]</span>
                                                        )}
                                                        {!isBudgetedOnly && item.pagado_a && <span>a {item.pagado_a}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ opacity: 0.7 }}>{isBudgetedOnly ? 'Sistema' : (item.responsable || '-')}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => isBudgetedOnly ? handleSyncBudgetToGastos() : handleToggleGastoEstado(item.id, item.estado)}
                                                                style={{ 
                                                                    background: item.estado === 'pagado' ? 'rgba(16, 185, 129, 0.1)' : (isBudgetedOnly ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 132, 132, 0.1)'),
                                                                    color: item.estado === 'pagado' ? '#10b981' : (isBudgetedOnly ? 'var(--color-primary)' : '#ff8484'),
                                                                    border: 'none',
                                                                    padding: '3px 10px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '9px',
                                                                    fontWeight: '900',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {isBudgetedOnly ? 'REPORTAR PAGO' : (item.estado ? item.estado.toUpperCase() : 'PENDIENTE')}
                                                            </button>
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: '800', color: isBudgetedOnly ? 'var(--color-primary)' : (item.estado === 'pagado' ? '#fff' : '#ff8484') }}>$ {smartFormat(displayMonto)}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                {isBudgetedOnly ? (
                                                                    <button type="button" className="action-btn" title="Convertir a Gasto Real" onClick={() => handleSyncBudgetToGastos()} style={{ color: 'var(--color-primary)' }}>
                                                                        <CheckCircle2 size={14} />
                                                                    </button>
                                                        ) : (
                                                            <>
                                                                {(item.foto_comprobante || item.comprobante_path) && (
                                                                    <button type="button" className="action-btn" title="Ver Comprobante" onClick={() => window.open(`${UPLOADS_URL}${item.foto_comprobante || item.comprobante_path}`, '_blank')}>
                                                                        <Eye size={14} />
                                                                    </button>
                                                                )}
                                                                <button type="button" className="action-btn" style={{ color: '#ff4444', opacity: 0.6 }} onClick={() => handleEliminarGasto(item.id)} title="Eliminar">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING SEARCH RESULTS - Rendered at form root for zero clipping */}
            {isSearchFocused && (
                <div className="inline-results-dropdown floating-portal glass-panel fade-in-up" style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    zIndex: 99999,
                    maxHeight: 'min(600px, 80vh)',
                    overflowY: 'auto',
                    padding: '12px',
                    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 132, 132, 0.4)',
                    background: '#1a1a1c',
                    borderRadius: '14px',
                    backdropFilter: 'blur(15px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '2px' }}>CATÁLOGO DE PRODUCTOS</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', opacity: 0.4 }}>{filteredRecursos.length} resultados</span>
                            <button type="button" onClick={() => setIsSearchFocused(false)} className="action-btn"><X size={16} /></button>
                        </div>
                    </div>
                    <div className="results-list">
                        {filteredRecursos.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-dim)' }}>
                                <Search size={24} style={{ opacity: 0.2, marginBottom: '8px' }} />
                                <p style={{ fontSize: '12px' }}>No hay coincidencias para "{searchTerm}"</p>
                            </div>
                        ) : (
                            filteredRecursos.map((r, idx) => (
                                <div
                                    key={idx}
                                    className={`result-item-horizontal ${searchIndex === idx ? 'active' : ''}`}
                                    onClick={() => addResource(r)}
                                    onMouseEnter={() => setSearchIndex(idx)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        marginBottom: '6px',
                                        background: searchIndex === idx ? 'rgba(255, 132, 132, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        border: searchIndex === idx ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <img
                                        src={r.foto ? (r.foto.startsWith('http') ? r.foto : `${UPLOADS_URL}/${r.foto}`) : '/placeholder.png'}
                                        style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                                        alt=""
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: searchIndex === idx ? 'var(--color-primary)' : '#fff' }}>{r.nombre}</div>
                                            <span style={{ 
                                                fontSize: '10px', 
                                                fontWeight: '700',
                                                color: r.nombre_proveedor === 'ArchiPlanner' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                                                background: r.nombre_proveedor === 'ArchiPlanner' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {r.nombre_proveedor}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{r.categoria} • <span style={{ color: 'var(--color-tertiary)', fontWeight: '600' }}>${Number(r.precio_u).toLocaleString('es-CO')}</span></div>
                                    </div>
                                    <ChevronRight size={20} style={{ opacity: searchIndex === idx ? 1 : 0.1 }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Quick Client Modal */}
            {showNewClientModal && (
                <div className="admin-modal-overlay" onClick={() => setShowNewClientModal(false)}>
                    <div className="admin-modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-search-bar" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>Nuevo Cliente Rápido</h3>
                                <button type="button" className="action-btn" onClick={() => setShowNewClientModal(false)}><X size={18} /></button>
                            </div>
                            <div className="dense-grid">
                                <div className="dense-form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={newClient.nombre}
                                        onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="dense-form-group">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={newClient.apellido}
                                        onChange={(e) => setNewClient({ ...newClient, apellido: e.target.value })}
                                    />
                                </div>
                                <div className="dense-form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={newClient.telefono}
                                        onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="dense-form-group">
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        className="dense-input"
                                        value={newClient.correo}
                                        onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })}
                                    />
                                </div>
                                <div className="dense-form-group">
                                    <label>Empresa / NIT</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={newClient.empresa}
                                        onChange={(e) => setNewClient({ ...newClient, empresa: e.target.value })}
                                    />
                                </div>
                                <div className="dense-form-group">
                                    <label>Cédula *</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={newClient.cedula}
                                        onChange={(e) => setNewClient({ ...newClient, cedula: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn-admin-primary"
                                    style={{ marginTop: '12px', justifyContent: 'center' }}
                                    onClick={handleQuickClientSubmit}
                                    disabled={newClientLoading || !newClient.nombre}
                                >
                                    {newClientLoading ? 'Guardando...' : 'Crear y Seleccionar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Styles for new components */}
            <style>{`
                .inline-resource-selector .dense-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px var(--color-primary-dim);
                }
                .result-item-horizontal:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateX(4px);
                }
                .pax-toggle-modern {
                    font-size: 9px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                }
                .qty-mode-indicator input {
                    cursor: pointer;
                    width: 12px;
                    height: 12px;
                    accent-color: var(--color-primary);
                }
                .qty-mode-indicator label {
                    font-size: 9px;
                    font-weight: 700;
                    color: var(--color-text-dim);
                    cursor: pointer;
                    user-select: none;
                }
                .qty-mode-indicator:hover {
                    background: rgba(255, 132, 132, 0.05);
                    border-color: var(--color-primary-dim);
                }
                .qty-mode-indicator:has(input:checked) label {
                    color: var(--color-primary);
                }
                .inline-results-dropdown::-webkit-scrollbar {
                    width: 4px;
                }
                .result-item-horizontal.active {
                    background: rgba(255, 132, 132, 0.1);
                    box-shadow: inset 0 0 0 1px var(--color-primary-dim);
                }
                .fade-in-up {
                    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {/* History Panel */}
            {id && (
                <QuotationHistoryPanel 
                    cotId={id} 
                    isOpen={showHistory} 
                    onClose={() => setShowHistory(false)} 
                />
            )}
            {/* Modal de Registro de Abono Premium V2 (v4) */}
            {showPagoModal && (
                <div className="admin-modal-overlay" style={{ zIndex: 10000 }}>
                    <div className="v2-modal-container" style={{ maxWidth: '450px', width: '90%', margin: 'auto', background: '#1a1a1c', borderRadius: '14px', border: '1px solid #333' }}>
                        <div className="v2-modal-header" style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--color-primary)' }}>REGISTRAR ABONO</h3>
                                <button type="button" onClick={() => { setShowPagoModal(false); setComprobantePreview(null); }} className="action-btn"><X size={18} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="form-field">
                                <label>Monto del Abono</label>
                                <input 
                                    type="number" 
                                    value={nuevoPago.monto} 
                                    onChange={(e) => setNuevoPago({...nuevoPago, monto: e.target.value})}
                                    className="dense-input"
                                    style={{ padding: '10px', fontSize: '1.2rem', height: 'auto' }}
                                />
                            </div>
                            <div className="compact-grid-2">
                                <div className="form-field">
                                    <label>Método de Pago</label>
                                    <select 
                                        value={nuevoPago.metodo}
                                        onChange={(e) => setNuevoPago({...nuevoPago, metodo: e.target.value})}
                                        className="dense-input"
                                    >
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Efectivo">Efectivo</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Comprobante de Pago</label>
                                    <div 
                                        className="premium-upload-box" 
                                        style={{ 
                                            position: 'relative',
                                            height: '90px', 
                                            border: '2px dashed rgba(255, 132, 132, 0.2)', 
                                            borderRadius: '10px', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            background: comprobantePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => document.getElementById('comprobante_input').click()}
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'; }}
                                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255, 132, 132, 0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                setComprobante(file);
                                                setComprobantePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    >
                                        {comprobantePreview ? (
                                            <img src={comprobantePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <>
                                                <Upload size={20} style={{ color: 'var(--color-primary)', marginBottom: '4px' }} />
                                                <span style={{ fontSize: '10px', opacity: 0.6 }}>Arrastra o haz click</span>
                                            </>
                                        )}
                                        <input 
                                            id="comprobante_input"
                                            type="file" 
                                            hidden
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setComprobante(file);
                                                    setComprobantePreview(URL.createObjectURL(file));
                                                }
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Notas / Referencia</label>
                                <textarea 
                                    value={nuevoPago.nota}
                                    onChange={(e) => setNuevoPago({...nuevoPago, nota: e.target.value})}
                                    placeholder="N° de operación, banco, etc..."
                                    className="dense-input"
                                    style={{ minHeight: '60px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => { setShowPagoModal(false); setComprobantePreview(null); }} className="btn-admin-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button 
                                    type="button" 
                                    className="btn-admin-primary" 
                                    style={{ flex: 2, justifyContent: 'center' }} 
                                    disabled={pagosLoading || !nuevoPago.monto}
                                    onClick={handleSubirPago}
                                >
                                    {pagosLoading ? 'Guardando...' : 'Confirmar Abono'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Gasto Modal (v4) */}
            {showGastoModal && (
                <div className="admin-modal-overlay" onClick={() => { setShowGastoModal(false); setComprobantePreview(null); }}>
                    <div className="admin-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header-premium">
                            <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>REGISTRAR GASTO / PAGO</h2>
                            <button type="button" className="action-btn" onClick={() => { setShowGastoModal(false); setComprobantePreview(null); }}><X size={20} /></button>
                        </div>
                        <div className="modal-body-premium" style={{ padding: '20px' }}>
                            <div className="dense-grid">
                                <div className="form-field">
                                    <label>Concepto / Detalle *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoGasto.concepto}
                                        onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                                        placeholder="Ej: Pago Mesoneros, Compra Flores..."
                                        className="dense-input"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-field">
                                        <label>Monto *</label>
                                        <input 
                                            type="text" 
                                            value={nuevoGasto.monto}
                                            onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                                            onBlur={(e) => setNuevoGasto({...nuevoGasto, monto: smartFormat(e.target.value)})}
                                            placeholder="0"
                                            className="dense-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Método</label>
                                        <select 
                                            value={nuevoGasto.metodo}
                                            onChange={(e) => setNuevoGasto({...nuevoGasto, metodo: e.target.value})}
                                            className="dense-input"
                                        >
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Transferencia">Transferencia</option>
                                            <option value="Tarjeta">Tarjeta</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-field">
                                        <label>Pagado a</label>
                                        <input 
                                            type="text" 
                                            value={nuevoGasto.pagado_a}
                                            onChange={(e) => setNuevoGasto({...nuevoGasto, pagado_a: e.target.value})}
                                            placeholder="Nombre del proveedor"
                                            className="dense-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Categoría / Área</label>
                                        <select 
                                            value={nuevoGasto.categoria}
                                            onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                                            className="dense-input"
                                        >
                                            <option value="General">General</option>
                                            <option value="Catering">Catering / Alimentos</option>
                                            <option value="Bebidas">Bebidas / Bar</option>
                                            <option value="Decoración">Decoración / Flores</option>
                                            <option value="Logística">Logística / Mobiliario</option>
                                            <option value="Personal">Personal / Staff</option>
                                            <option value="AudioVisual">Audio / Video / Luces</option>
                                            <option value="Locación">Locación / Espacio</option>
                                            <option value="Otros">Otros / Varios</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Responsable</label>
                                    <input 
                                        type="text" 
                                        value={nuevoGasto.responsable}
                                        onChange={(e) => setNuevoGasto({...nuevoGasto, responsable: e.target.value})}
                                        placeholder="Quién hizo el gasto"
                                        className="dense-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Comprobante de Gasto</label>
                                    <div 
                                        className="premium-upload-box" 
                                        style={{ 
                                            height: '90px', 
                                            border: '2px dashed rgba(255, 132, 132, 0.2)', 
                                            borderRadius: '10px', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            background: comprobantePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.3s ease',
                                            overflow: 'hidden'
                                        }}
                                        onClick={() => document.getElementById('gasto_comprobante_input').click()}
                                    >
                                        {comprobantePreview ? (
                                            <img src={comprobantePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <>
                                                <Upload size={20} style={{ color: 'var(--color-primary)', marginBottom: '4px' }} />
                                                <span style={{ fontSize: '10px', opacity: 0.6 }}>Opcional: Subir recibo</span>
                                            </>
                                        )}
                                        <input 
                                            id="gasto_comprobante_input"
                                            type="file" 
                                            hidden
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setComprobante(file);
                                                    setComprobantePreview(URL.createObjectURL(file));
                                                }
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => { setShowGastoModal(false); setComprobantePreview(null); }} className="btn-admin-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button 
                                    type="button" 
                                    className="btn-admin-primary" 
                                    style={{ flex: 2, justifyContent: 'center', background: '#ff8484' }} 
                                    disabled={gastosLoading || !nuevoGasto.monto || !nuevoGasto.concepto}
                                    onClick={handleSubirGasto}
                                >
                                    {gastosLoading ? 'Guardando...' : 'Registrar Gasto'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Animated Industrial Financial Report Modal (v1) */}
            {showReport && (
                <div className="admin-modal-overlay report-overlay" onClick={() => setShowReport(false)} style={{ zIndex: 20000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                    <div className="report-modal-content fade-in-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%', background: '#0a0a0b', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>INTELIGENCIA DEL EVENTO</h2>
                                    <p style={{ opacity: 0.5, fontSize: '12px', margin: '4px 0 0' }}>REPORTE FINANCIERO DETALLADO • COT #{formData.num}</p>
                                </div>
                                <button type="button" className="action-btn" onClick={() => setShowReport(false)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '10px' }}><X size={24} /></button>
                            </div>

                            <div className="report-grid-system">
                                {/* Left: Financial Health & Expenses */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px' }}>
                                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-tertiary)" strokeWidth="3" 
                                                strokeDasharray={`${Math.max(0, Math.min(100, (Number(formData.monto_final) - gastos.reduce((acc, g) => acc + Number(g.monto), 0)) / Number(formData.monto_final) * 100))}, 100`}
                                                className="report-circle-anim"
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '32px', fontWeight: '900' }}>{Math.round((Number(formData.monto_final) - gastos.reduce((acc, g) => acc + Number(g.monto), 0)) / Number(formData.monto_final) * 100)}%</div>
                                            <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: '700' }}>MARGEN ROI</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>COSTOS</div>
                                            <div style={{ fontWeight: '800', color: '#ff8484' }}>$ {smartFormat(gastos.reduce((acc, g) => acc + Number(g.monto), 0))}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>UTILIDAD</div>
                                            <div style={{ fontWeight: '800', color: 'var(--color-tertiary)' }}>$ {smartFormat(Number(formData.monto_final) - gastos.reduce((acc, g) => acc + Number(g.monto), 0))}</div>
                                        </div>
                                    </div>

                                    {/* Gastos por Proveedor moved here for balance */}
                                    <ProviderExpenseRings />
                                </div>

                                {/* Right: Cashflow & AI Analysis */}
                                <div>
                                    <h4 style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '20px' }}>DISTRIBUCIÓN DE CUMPLIMIENTO</h4>
                                    
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '700' }}>RECOLECCIÓN DE ABONOS</span>
                                            <span style={{ opacity: 0.6 }}>{Math.round((totalPagado / Number(formData.monto_final)) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (totalPagado / Number(formData.monto_final)) * 100)}%`, background: '#10b981', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '700' }}>EJECUCIÓN DE GASTOS (PAGADOS)</span>
                                            <span style={{ opacity: 0.6 }}>{Math.round((gastos.filter(g => g.estado === 'pagado').reduce((acc, g) => acc + Number(g.monto), 0) / gastos.reduce((acc, g) => acc + Number(g.monto), 1)) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (gastos.filter(g => g.estado === 'pagado').reduce((acc, g) => acc + Number(g.monto), 0) / gastos.reduce((acc, g) => acc + Number(g.monto), 1)) * 100)}%`, background: '#ff8484', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                                        </div>
                                    </div>

                                    {/* Profitability Wave moved here to full right width */}
                                    <div style={{ marginTop: '30px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '1px', fontWeight: '900' }}>FLUJO DE RENTABILIDAD</div>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '9px', fontWeight: '800' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <div style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%' }}></div> COBRADO
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <div style={{ width: '8px', height: '8px', background: 'var(--color-tertiary)', borderRadius: '50%' }}></div> COSTOS
                                                </div>
                                            </div>
                                        </div>
                                        <ProfitabilityWaveChart />
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginTop: '30px' }}>
                                        <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '10px' }}>NOTA DEL ANALISTA AI</div>
                                        <p style={{ fontSize: '12px', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                                            {totalPagado >= Number(formData.monto_final) * 0.5 
                                                ? "El flujo de caja está saludable. Se han recolectado abonos suficientes para cubrir la mayoría de los gastos operativos."
                                                : "Se recomienda aumentar la recolección de abonos para mitigar riesgos en la ejecución de gastos fijos."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        .report-grid-system {
                            display: grid;
                            grid-template-columns: 1.1fr 1.2fr;
                            gap: 40px;
                        }
                        @media (max-width: 768px) {
                            .report-grid-system {
                                grid-template-columns: 1fr;
                                gap: 30px;
                            }
                            .report-modal-content {
                                padding: 20px !important;
                                margin: 10px !important;
                                width: calc(100% - 20px) !important;
                            }
                        }
                        .report-circle-anim {
                            animation: dash 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .wave-anim {
                            stroke-dasharray: 1000;
                            stroke-dashoffset: 1000;
                            animation: dashWave 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .wave-anim-delay {
                            stroke-dasharray: 1000;
                            stroke-dashoffset: 1000;
                            animation: dashWave 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
                        }
                        @keyframes dash {
                            from { stroke-dasharray: 0, 100; }
                        }
                        @keyframes dashWave {
                            to { stroke-dashoffset: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Help & Shortcuts Modal */}
            {showHelp && (
                <div className="admin-modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowHelp(false)}>
                    <div className="admin-modal-content glass-panel" style={{ maxWidth: '500px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Info size={24} style={{ color: 'var(--color-primary)' }} /> GUÍA DE ATAJOS Y USO
                        </h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { key: 'Alt + S / Ctrl + S', desc: 'Guardar Cotización' },
                                { key: 'Alt + P', desc: 'Foco en Buscar Productos' },
                                { key: 'Alt + B', desc: 'Pestaña Presupuesto' },
                                { key: 'Alt + F', desc: 'Tablero Financiero' },
                                { key: 'Alt + A', desc: 'Registrar Abono o Gasto' },
                                { key: 'Alt + G', desc: 'Reporte de Inteligencia (Animado)' },
                                { key: 'Alt + C', desc: 'Ver/Ocultar Costos' },
                                { key: 'Alt + V', desc: 'Ver Vista de Cliente' },
                                { key: 'Alt + H', desc: 'Historial de Versiones' },
                                { key: 'Alt + I', desc: 'Esta Guía de Ayuda' },
                                { key: 'Alt + X', desc: 'Salir / Cancelar' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '13px' }}>{item.key}</span>
                                    <span style={{ opacity: 0.7, fontSize: '13px' }}>{item.desc}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6', borderLeft: '4px solid var(--color-primary)' }}>
                            <strong>TIP PROFESIONAL:</strong> El tablero financiero unifica lo proyectado vs lo real. Si el tablero de gastos está vacío, el sistema usa los <strong>Costos del Presupuesto</strong> como referencia de inversión.
                        </div>
                        <button type="button" onClick={() => setShowHelp(false)} className="btn-admin-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center', padding: '12px' }}>ENTENDIDO</button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default AdminCotizacionForm;
