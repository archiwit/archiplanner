import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus, Edit2, Trash2, X, Search, Copy,
    Save, Package, Users, Info, FileText, ChevronRight,
    GripVertical, ChevronDown, ChevronUp
} from 'lucide-react';
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

// Sortable Row Component
const SortableItem = ({ det, idx, totalDetalles, updateDetail, removeDetail, itemRefs, searchInputRef }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `item-${idx}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        gridTemplateColumns: '30px 40px 1.5fr 1fr 60px 100px 40px',
        gap: '15px'
    };

    return (
        <div ref={setNodeRef} style={style} className="item-row">
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', opacity: 0.3 }}>
                <GripVertical size={16} />
            </div>
            <img src={det.foto ? `${UPLOADS_URL}${det.foto}` : '/placeholder.png'} className="item-thumb" style={{ width: '30px', height: '30px' }} />
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{det.nombre}</div>
            <div style={{ 
                fontSize: '11px', 
                color: det.nombre_proveedor === 'ArchiPlanner' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                background: det.nombre_proveedor === 'ArchiPlanner' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                padding: det.nombre_proveedor === 'ArchiPlanner' ? '2px 6px' : '0',
                borderRadius: '4px',
                border: det.nombre_proveedor === 'ArchiPlanner' ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                textAlign: 'center',
                justifySelf: 'center'
            }}>
                {det.nombre_proveedor}
            </div>
            <input
                ref={el => itemRefs.current[idx] = el}
                type="number"
                value={det.cantidad}
                onChange={(e) => updateDetail(idx, 'cantidad', e.target.value)}
                className="dense-input"
                disabled={det.por_persona}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        searchInputRef.current?.focus();
                    }
                }}
            />
            <div className="dense-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <input
                    type="checkbox"
                    checked={det.por_persona}
                    onChange={(e) => updateDetail(idx, 'por_persona', e.target.checked)}
                />
                <label style={{ margin: 0, textTransform: 'none', fontSize: '11px' }}>Pax</label>
            </div>
            <button type="button" className="action-btn delete" onClick={() => removeDetail(idx)}>
                <Trash2 size={14} />
            </button>
        </div>
    );
};

const AdminPlantillas = () => {
    const [plantillas, setPlantillas] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchIndex, setSearchIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [collapsedCats, setCollapsedCats] = useState({});
    
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const searchInputRef = React.useRef(null);
    const searchContainerRef = React.useRef(null);
    const itemRefs = React.useRef([]);

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        tipo_evento: 'Boda',
        detalles: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, rRes] = await Promise.all([
                    api.get('/plantillas'),
                    api.get('/recursos-unificados')
                ]);
                setPlantillas(pRes.data);
                setRecursos(rRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Alt + N for New Template 
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleNew();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    // Dropdown positioning logic
    const updateDropdownPos = () => {
        if (searchContainerRef.current) {
            const rect = searchContainerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.left,
                width: 500 // Fixed width for better visibility
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

    const handleEdit = async (p) => {
        try {
            const res = await api.get(`/plantillas/${p.id}`);
            const t = res.data;
            setFormData({
                id: t.id,
                nombre: t.nombre || '',
                tipo_evento: t.tipo_evento || 'Boda',
                detalles: t.detalles || []
            });
            setShowModal(true);
        } catch (err) {
            alert('Error al cargar detalles de la plantilla');
        }
    };

    const handleNew = () => {
        setFormData({
            id: null,
            nombre: '',
            tipo_evento: 'Boda',
            detalles: []
        });
        setShowModal(true);
    };

    const addResource = (res) => {
        const exists = formData.detalles.find(d =>
            (res.art_id && d.art_id === res.art_id) ||
            (res.loc_id && d.loc_id === res.loc_id)
        );

        if (exists) {
            alert('Este elemento ya está en la plantilla');
            return;
        }

        const newDetail = {
            art_id: res.art_id,
            loc_id: res.loc_id,
            nombre: res.nombre,
            categoria: res.categoria,
            nombre_proveedor: res.nombre_proveedor || 'ArchiPlanner',
            foto: res.foto,
            cantidad: 1,
            por_persona: false,
            precio_u: res.precio_u || 0
        };
        
        setFormData(prev => ({ ...prev, detalles: [...prev.detalles, newDetail] }));
        setSearchTerm('');
        setIsSearchFocused(false);
        setSearchIndex(-1);

        // Autofocus on quantity input
        setTimeout(() => {
            const lastIdx = formData.detalles.length;
            if (itemRefs.current[lastIdx]) {
                itemRefs.current[lastIdx].focus();
                itemRefs.current[lastIdx].select();
            }
        }, 100);
    };

    const updateDetail = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index] = { ...newDetalles[index], [field]: value };
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    const removeDetail = (index) => {
        setFormData(prev => ({ ...prev, detalles: prev.detalles.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/plantillas/${formData.id}`, formData);
            } else {
                await api.post('/plantillas', formData);
            }
            // Refresh list
            const res = await api.get('/plantillas');
            setPlantillas(res.data);
            setShowModal(false);
        } catch (err) {
            alert('Error al guardar reporte');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta plantilla?')) return;
        try {
            await api.delete(`/plantillas/${id}`);
            setPlantillas(plantillas.filter(p => p.id !== id));
        } catch (err) {
            alert('Error al eliminar');
        }
    };
    
    const handleDuplicate = async (p) => {
        try {
            setLoading(true);
            const res = await api.get(`/plantillas/${p.id}`);
            const t = res.data;
            
            const duplicateData = {
                nombre: `${t.nombre} (Copia)`,
                tipo_evento: t.tipo_evento,
                detalles: t.detalles.map(d => ({
                    art_id: d.art_id,
                    loc_id: d.loc_id,
                    cantidad: d.cantidad,
                    por_persona: d.por_persona
                }))
            };
            
            await api.post('/plantillas', duplicateData);
            
            // Refresh list
            const refreshRes = await api.get('/plantillas');
            setPlantillas(refreshRes.data);
            alert('Plantilla duplicada correctamente');
        } catch (err) {
            console.error('Error duplicando plantilla:', err);
            alert('Error al duplicar la plantilla');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecursos = (recursos || []).filter(r => {
        const nombre = (r.nombre || '').toLowerCase();
        const categoria = (r.categoria || '').toLowerCase();
        const search = (searchTerm || '').toLowerCase();
        return nombre.includes(search) || categoria.includes(search);
    });

    // Grouping logic
    const groupedDetalles = formData.detalles.reduce((acc, det) => {
        const cat = det.categoria || 'Otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(det);
        return acc;
    }, {});

    const handleDragEnd = (event, category) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = formData.detalles.findIndex((_, idx) => `item-${idx}` === active.id);
        const newIndex = formData.detalles.findIndex((_, idx) => `item-${idx}` === over.id);

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

    if (loading) return <div className="admin-loader-container"><div className="loader"></div></div>;

    return (
        <div className="admin-page-container fade-in">
            <div className="admin-header-flex">
                <div>
                    <h1 className="admin-title">Plantillas de Cotización</h1>
                    <p className="admin-subtitle">Modelos base para agilizar la creación de propuestas</p>
                </div>
                <button 
                    className="btn-icon-tooltip primary" 
                    onClick={handleNew}
                    title="Nueva Plantilla"
                >
                    <Plus size={22} />
                </button>
            </div>

            <div className="admin-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
                {plantillas.map(p => (
                    <div key={p.id} className="admin-card glass-panel" style={{ position: 'relative' }}>
                        <div className="tag">{p.tipo_evento}</div>
                        <h4 style={{ margin: '12px 0 8px 0', fontSize: '18px' }}>{p.nombre}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '20px' }}>
                            <Package size={12} /> {p.detalles?.length || 0} items incluidos
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-admin-secondary" style={{ flex: 1 }} onClick={() => handleEdit(p)} title="Editar">
                                <Edit2 size={14} />
                            </button>
                            <button className="action-btn" title="Duplicar" onClick={() => handleDuplicate(p)}>
                                <Copy size={16} />
                            </button>
                            <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(p.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ maxWidth: '1000px', height: '90vh' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="modal-search-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{formData.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>
                                <button type="button" className="action-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>

                            <div className="modal-body-scroll" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
                                {/* Left Side: Basic Info */}
                                <div className="dense-grid">
                                    <div className="dense-form-group">
                                        <label>Nombre de la Plantilla</label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="dense-input"
                                            placeholder="Ej: Boda Standard 100 PAX"
                                            required
                                        />
                                    </div>
                                    <div className="dense-form-group">
                                        <label>Tipo de Evento Sugerido</label>
                                        <select
                                            value={formData.tipo_evento}
                                            onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                                            className="dense-input"
                                        >
                                            <option value="Boda">Boda</option>
                                            <option value="Quinceaños">Quinceaños</option>
                                            <option value="Cumpleaños">Cumpleaños</option>
                                            <option value="Baby shower">Baby shower</option>
                                            <option value="Corporativo">Corporativo</option>
                                            <option value="Prom">Prom</option>
                                            <option value="Aniversario">Aniversario</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="totals-panel" style={{ marginTop: '20px' }}>
                                        <div style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <Info size={16} className="text-primary" />
                                            <p style={{ margin: 0 }}>Marca como <b>"Por Persona"</b> los items que deben multiplicarse automáticamente por la cantidad de invitados.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Detalle de Items */}
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4 className="section-title-sm">Items Pre-ajustados</h4>
                                        <div ref={searchContainerRef} style={{ position: 'relative', width: '300px' }}>
                                            <div className="search-input-wrapper" style={{ margin: 0 }}>
                                                <Search size={16} className="search-icon" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    placeholder="Buscar item... (Alt + P)"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setIsSearchFocused(true);
                                                        setSearchIndex(-1);
                                                    }}
                                                    onFocus={() => setIsSearchFocused(true)}
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
                                                    style={{ paddingLeft: '32px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="items-container" style={{ flex: 1, maxHeight: 'calc(90vh - 250px)', overflowY: 'auto', padding: '10px' }}>
                                        {Object.entries(groupedDetalles).length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)', fontSize: '13px' }}>
                                                No hay items en esta plantilla. Comienza buscando recursos.
                                            </div>
                                        ) : (
                                            Object.entries(groupedDetalles).map(([cat, items]) => (
                                                <div key={cat} style={{ marginBottom: '20px' }}>
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
                                                            marginBottom: '8px',
                                                            borderLeft: '3px solid var(--color-primary)'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: 'var(--color-text)' }}>{cat.toUpperCase()} ({items.length})</span>
                                                        {collapsedCats[cat] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </div>
                                                    
                                                    {!collapsedCats[cat] && (
                                                        <DndContext
                                                            sensors={sensors}
                                                            collisionDetection={closestCenter}
                                                            onDragEnd={(e) => handleDragEnd(e, cat)}
                                                        >
                                                            <SortableContext
                                                                items={items.map((_, i) => `item-${formData.detalles.indexOf(items[i])}`)}
                                                                strategy={verticalListSortingStrategy}
                                                            >
                                                                {items.map((det) => {
                                                                    const actualIdx = formData.detalles.indexOf(det);
                                                                    return (
                                                                        <SortableItem
                                                                            key={`item-${actualIdx}`}
                                                                            det={det}
                                                                            idx={actualIdx}
                                                                            totalDetalles={formData.detalles.length}
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
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-search-bar" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-admin-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-admin-primary"><Save size={18} /> Guardar Plantilla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Search Results for Templates */}
            {isSearchFocused && (
                <div className="inline-results-dropdown floating-portal glass-panel fade-in-up" style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    zIndex: 99999,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '12px',
                    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: '#1a1a1c',
                    borderRadius: '14px',
                    backdropFilter: 'blur(15px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '1px' }}>CATÁLOGO DE PRODUCTOS</span>
                        <button type="button" onClick={() => setIsSearchFocused(false)} className="action-btn"><X size={14} /></button>
                    </div>
                    <div className="results-list">
                        {filteredRecursos.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-dim)' }}>
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
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '4px',
                                        background: searchIndex === idx ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                        border: searchIndex === idx ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent'
                                    }}
                                >
                                    <img
                                        src={r.foto ? `${UPLOADS_URL}${r.foto}` : '/placeholder.png'}
                                        style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                                        alt=""
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: searchIndex === idx ? 'var(--color-primary)' : '#fff' }}>{r.nombre}</div>
                                            <span style={{ 
                                                fontSize: '9px', 
                                                fontWeight: '700',
                                                color: r.nombre_proveedor === 'ArchiPlanner' ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                                                background: r.nombre_proveedor === 'ArchiPlanner' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)',
                                                padding: '1px 5px',
                                                borderRadius: '3px'
                                            }}>
                                                {r.nombre_proveedor}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.5 }}>{r.categoria} • ${Number(r.precio_u).toLocaleString('es-CO')}</div>
                                    </div>
                                    <ChevronRight size={16} style={{ opacity: searchIndex === idx ? 1 : 0.2 }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlantillas;
