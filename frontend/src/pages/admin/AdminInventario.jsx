import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Search, Package, DollarSign, Filter, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DynamicForm from '../../components/ui/DynamicForm/DynamicForm';
import { getUploadUrl } from '../../config';
import '../style/AdminInventario.css';

// Categorías simplificadas (6)
const CATEGORIAS = [
    { value: 'menaje', label: 'Menaje', gradient: 'linear-gradient(135deg, #5FDC7F 0%, #00B894 100%)', icon: '🍽️' },
    { value: 'salon', label: 'Locación', gradient: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)', icon: '🏛️' },
    { value: 'decoracion', label: 'Decoración', gradient: 'linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)', icon: '🎨' },
    { value: 'ceremonia', label: 'Ceremonia', gradient: 'linear-gradient(135deg, #FDECF0 0%, #FAB1A0 100%)', icon: '🕯️' },
    { value: 'entretenimiento', label: 'Entretenimiento', gradient: 'linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 100%)', icon: '🎭' },
    { value: 'catering', label: 'Catering', gradient: 'linear-gradient(135deg, #FF7675 0%, #D63031 100%)', icon: '🥂' },
    { value: 'personal', label: 'Personal', gradient: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)', icon: '👥' },
    { value: 'otros', label: 'Otros', gradient: 'linear-gradient(135deg, #B2BEC3 0%, #636E72 100%)', icon: '📦' }
];

const ABREV_UNIDADES = {
    'unidad': 'C/U',
    'hora': '/H',
    'dia': '/D',
    'evento': '/EV'
};

const AdminInventario = () => {
    const { user } = useAuth();
    const [articulos, setArticulos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filtroActivo, setFiltroActivo] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [formData, setFormData] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showFilters, setShowFilters] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchArticulos = async () => {
        try {
            const res = await api.get('/articulos');
            setArticulos(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProveedores = async () => {
        try {
            const res = await api.get('/proveedores');
            setProveedores(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchArticulos();
        fetchProveedores();
    }, []);

    // Filtrar artículos
    const articulosFiltrados = articulos.filter(art => {
        const catNormalizada = (art.categoria || 'otros').toLowerCase().trim();
        const porCategoria = filtroActivo === 'todas' || catNormalizada === filtroActivo.toLowerCase().trim();
        const porBusqueda = (art.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                           (art.nombre_proveedor && art.nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()));
        return porCategoria && porBusqueda;
    });

    // Agrupar por categorías
    const porCategoriaUnificada = CATEGORIAS.reduce((acc, cat) => {
        acc[cat.value] = articulosFiltrados.filter(art => (art.categoria || 'otros').toLowerCase().trim() === cat.value);
        return acc;
    }, {});

    // Catch-all: items with categories NOT in the standard list
    const categoriasExtra = [...new Set(articulosFiltrados.map(art => (art.categoria || 'otros').toLowerCase().trim()))]
        .filter(cat => !CATEGORIAS.find(c => c.value === cat));

    categoriasExtra.forEach(cat => {
        porCategoriaUnificada[cat] = articulosFiltrados.filter(art => (art.categoria || 'otros').toLowerCase().trim() === cat);
    });

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({
                nombre: item.nombre || '',
                categoria: (item.categoria || 'otros').toLowerCase().trim(),
                precio_u: item.precio_u || '',
                costo_u: item.costo_u || '',
                uni_medida: item.uni_medida || 'unidad',
                nota: item.nota || '',
                pro_id: item.pro_id || '',
                foto: item.foto || null
            });
        } else {
            setFormData({
                nombre: '',
                categoria: 'menaje',
                precio_u: '',
                costo_u: '',
                uni_medida: 'unidad',
                nota: '',
                pro_id: '',
                foto: null
            });
        }
        setShowModal(true);
    };

    const handleAddNew = () => {
        handleOpenModal(null);
    };

    // Alt + N for New Record (Common for all tables)
    React.useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleAddNew();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData(null);
    };

    const handleSubmit = async (data) => {
        const formDataToSend = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined && key !== 'foto') {
                let value = data[key];
                if (key === 'categoria') {
                    value = String(value || '').toLowerCase().trim();
                    if (!value) value = 'menaje';
                }
                if ((key === 'precio_u' || key === 'costo_u') && typeof value === 'string') {
                    value = value.replace(',', '.');
                }
                formDataToSend.append(key, value);
            }
        });
        if (data.foto instanceof File) {
            formDataToSend.append('foto', data.foto);
        } else if (data.foto && typeof data.foto === 'string') {
            formDataToSend.append('foto_path', data.foto);
        }

        try {
            if (editingItem) {
                await api.put(`/articulos/${editingItem.id}`, formDataToSend);
            } else {
                await api.post('/articulos', formDataToSend);
            }
            handleCloseModal();
            fetchArticulos();
        } catch (err) {
            console.error(err);
            alert('Error al guardar artículo');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este artículo?')) {
            await api.delete(`/articulos/${id}`);
            fetchArticulos();
        }
    };

    const totalArticulos = articulos.length;
    const totalProveedores = proveedores.length;

    // Alt + N for New Article
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleOpenModal(null);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    const userRol = user?.rol?.toLowerCase() || '';
    const isReadOnly = userRol === 'asesor_arriendos';

    return (
        <div className="admin-page-container fade-in">
            {/* Standard Header (V4.7 Unification) */}
            <div className={`admin-header-flex ${isMobile ? 'mobile-stack' : ''}`} style={{ marginBottom: isMobile ? '10px' : '30px' }}>
                <div>
                    <h1 className="admin-title">Inventario</h1>
                    {!isMobile && <p className="admin-subtitle">{totalArticulos} artículos • {totalProveedores} proveedores</p>}
                </div>
                
                {isMobile && (
                    <>
                        <button 
                            className={`admin-mobile-templates-trigger ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Filtros"
                        >
                            <Filter size={22} />
                        </button>
                        {!isReadOnly && (
                            <button 
                                className="admin-mobile-add-trigger" 
                                onClick={() => handleOpenModal(null)}
                                title="Nuevo Artículo"
                            >
                                <Plus size={22} />
                            </button>
                        )}
                    </>
                )}

                {!isMobile && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className={`btn-icon-tooltip ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Filtros"
                        >
                            <Filter size={18} />
                        </button>
                        {!isReadOnly && (
                            <button 
                                className="btn-icon-tooltip primary" 
                                onClick={() => handleOpenModal(null)}
                                title="Nuevo Artículo"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>


            {/* Búsqueda */}
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o proveedor..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Filtros Colapsables (Oculto control duplicado) */}
            {/* El control de filtros ahora está en la cabecera */}

            <div className={`filters-grid ${showFilters ? 'show' : ''}`}>
                <div 
                    className={`filter-chip ${filtroActivo === 'todas' ? 'active' : ''}`}
                    onClick={() => { setFiltroActivo('todas'); if(isMobile) setShowFilters(false); }}
                >
                    Todos ({totalArticulos})
                </div>
                {CATEGORIAS.map(cat => {
                    const count = porCategoriaUnificada[cat.value]?.length || 0;
                    return (
                        <div
                            key={cat.value}
                            className={`filter-chip ${filtroActivo === cat.value ? 'active' : ''}`}
                            onClick={() => { setFiltroActivo(cat.value); if(isMobile) setShowFilters(false); }}
                        >
                            {cat.label} ({count})
                        </div>
                    );
                })}
                {categoriasExtra.map(cat => (
                    <div
                        key={cat}
                        className={`filter-chip ${filtroActivo === cat ? 'active' : ''}`}
                        onClick={() => { setFiltroActivo(cat); if(isMobile) setShowFilters(false); }}
                    >
                        {cat.toUpperCase()} ({porCategoriaUnificada[cat]?.length || 0})
                    </div>
                ))}
            </div>

            {/* Grid de artículos */}
            {loading ? (
                <p style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: '40px' }}>
                    Cargando...
                </p>
            ) : filtroActivo === 'todas' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Render standard categories first */}
                    {CATEGORIAS.map(cat => {
                        const items = porCategoriaUnificada[cat.value] || [];
                        if (items.length === 0) return null;
                        return (
                            <div key={cat.value}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    marginBottom: '16px', paddingBottom: '8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{cat.label}</h3>
                                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                                        {items.length}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                    {items.map(art => renderCard(art))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Render extra categories that were not expected but are present */}
                    {categoriasExtra.map(catKey => {
                        const items = porCategoriaUnificada[catKey] || [];
                        if (items.length === 0) return null;
                        return (
                            <div key={catKey}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    marginBottom: '16px', paddingBottom: '8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <span style={{ fontSize: '18px' }}>📦</span>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{catKey.toUpperCase()}</h3>
                                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-primary)' }}>
                                        {items.length}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                    {items.map(art => renderCard(art))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '16px'
                    }}>
                        <span style={{ fontSize: '18px' }}>
                            {CATEGORIAS.find(c => c.value === filtroActivo)?.icon || '📦'}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                            {CATEGORIAS.find(c => c.value === filtroActivo)?.label || filtroActivo.toUpperCase()}
                        </h3>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px'
                    }}>
                        {porCategoriaUnificada[filtroActivo]?.map(art => renderCard(art))}
                    </div>
                    {(!porCategoriaUnificada[filtroActivo] || porCategoriaUnificada[filtroActivo].length === 0) && (
                        <p style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: '40px' }}>
                            No hay artículos en esta categoría
                        </p>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && formData && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="modal-content modal-wide" style={{
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                             <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', fontFamily: 'var(--font-serif)' }}>
                                {editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: 'var(--color-text-dim)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '24px 24px 12px 24px' }}>
                            <DynamicForm
                                key={editingItem ? `edit-${editingItem.id}` : 'new'}
                                fields={[
                                    {
                                        name: 'foto',
                                        type: 'image',
                                        label: 'Imagen del Artículo',
                                        fullWidth: true
                                    },
                                    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: ' ', required: true },
                                    {
                                        name: 'categoria',
                                        label: 'Categoría',
                                        type: 'select',
                                        options: CATEGORIAS.map(c => ({ value: c.value, label: c.label })),
                                        required: true
                                    },
                                    {
                                        name: 'pro_id',
                                        label: 'Proveedor',
                                        type: 'select',
                                        options: [
                                            { value: '', label: 'Sin proveedor (interno)' },
                                            ...proveedores.map(p => ({ value: p.id, label: p.nombre }))
                                        ]
                                    },
                                    { name: 'costo_u', label: 'Costo Interno (COP)', type: 'number', placeholder: ' ', required: true },
                                    { name: 'precio_u', label: 'Precio de Venta (COP)', type: 'number', placeholder: ' ', required: true },
                                    {
                                        name: 'uni_medida',
                                        label: 'Unidad',
                                        type: 'select',
                                        options: [
                                            { value: 'unidad', label: 'Unidad' },
                                            { value: 'hora', label: 'Hora' },
                                            { value: 'dia', label: 'Día / Jornada' },
                                            { value: 'evento', label: 'Evento completo' }
                                        ],
                                        required: true
                                    },
                                    { name: 'nota', label: 'Notas', type: 'textarea', placeholder: ' ', rows: 2, fullWidth: true }
                                ]}
                                initialValues={formData}
                                onSubmit={handleSubmit}
                                submitText={editingItem ? 'Guardar Cambios' : 'Agregar'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Card minimalista
    function renderCard(art) {
        const catInfo = CATEGORIAS.find(c => c.value === art.categoria) || CATEGORIAS[5];
        return (
            <div key={art.id} className="art-card">
                <div className="art-card-image">
                    {art.foto ? (
                        <img src={getUploadUrl(art.foto)} alt={art.nombre} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.1)' }}>
                            <Package size={32} />
                        </div>
                    )}
                    
                    {/* Floating Actions */}
                    {!isReadOnly && (
                        <div className="art-card-actions">
                            <button className="art-action-btn edit" onClick={() => handleOpenModal(art)}>
                                <Edit2 size={12} />
                            </button>
                            <button className="art-action-btn delete" onClick={() => handleDelete(art.id)}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}


                    <span className="art-category-badge">{catInfo.label}</span>
                    <span className="art-provider-badge">{art.nombre_proveedor || 'S/P'}</span>
                </div>

                {/* Content */}
                <h4 className="art-name">{art.nombre}</h4>

                <div className="art-finance-row">
                    <span className="art-cost" title="Costo Interno">
                        $ {Number(art.costo_u || 0).toLocaleString('es-CO')}
                    </span>
                    <div className="art-price-container">
                        <span className="art-price">
                            ${Number(art.precio_u || 0).toLocaleString('es-CO')}
                        </span>
                        <span className="art-unit">
                            {ABREV_UNIDADES[art.uni_medida] || '/UND'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
};

export default AdminInventario;
