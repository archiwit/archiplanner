import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Search, Package, DollarSign } from 'lucide-react';
import DynamicForm from '../../components/ui/DynamicForm/DynamicForm';
import { UPLOADS_URL } from '../../config';

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

const UNIDADES_MEDIDA = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'hora', label: 'Hora' },
    { value: 'dia', label: 'Día / Jornada' },
    { value: 'evento', label: 'Evento completo' }
];

const AdminInventario = () => {
    const [articulos, setArticulos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filtroActivo, setFiltroActivo] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [formData, setFormData] = useState(null);

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

    return (
        <div className="admin-inventario">
            {/* Header */}
            <div style={{
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '600' }}>Inventario</h2>
                    <p style={{ margin: 0, color: 'var(--color-text-dim)', fontSize: '13px' }}>
                        {totalArticulos} artículos • {totalProveedores} proveedores
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal(null)}
                    style={{
                        background: 'var(--color-tertiary)',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        color: '#000',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={16} />
                    Nuevo
                </button>
            </div>

            {/* Búsqueda */}
            <div style={{
                position: 'relative',
                marginBottom: '24px'
            }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-dim)'
                    }}
                />
                <input
                    type="text"
                    placeholder="Buscar por nombre o proveedor..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '11px 14px 11px 40px',
                        color: 'var(--color-text)',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Filtros */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '28px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setFiltroActivo('todas')}
                    style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: filtroActivo === 'todas'
                            ? '1px solid var(--color-tertiary)'
                            : '1px solid rgba(255,255,255,0.08)',
                        background: filtroActivo === 'todas'
                            ? 'rgba(95, 220, 127, 0.12)'
                            : 'rgba(255,255,255,0.02)',
                        color: filtroActivo === 'todas'
                            ? 'var(--color-tertiary)'
                            : 'var(--color-text-dim)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: filtroActivo === 'todas' ? '600' : '500',
                        transition: 'all 0.2s'
                    }}
                >
                    Todos ({totalArticulos})
                </button>
                {CATEGORIAS.map(cat => {
                    const count = porCategoriaUnificada[cat.value]?.length || 0;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setFiltroActivo(cat.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: filtroActivo === cat.value
                                    ? `1px solid ${cat.gradient.includes('#5FDC7F') ? 'var(--color-tertiary)' : 'rgba(255,255,255,0.2)'}`
                                    : '1px solid rgba(255,255,255,0.08)',
                                background: filtroActivo === cat.value
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(255,255,255,0.02)',
                                color: filtroActivo === cat.value
                                    ? '#fff'
                                    : 'var(--color-text-dim)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: filtroActivo === cat.value ? '600' : '500',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat.label} ({count})
                        </button>
                    );
                })}
                {/* Dynamically show tabs for other categories found */}
                {categoriasExtra.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFiltroActivo(cat)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: filtroActivo === cat
                                ? '1px solid var(--color-primary)'
                                : '1px solid rgba(255,255,255,0.08)',
                            background: filtroActivo === cat
                                ? 'rgba(255, 132, 132, 0.12)'
                                : 'rgba(255,255,255,0.02)',
                            color: filtroActivo === cat
                                ? 'var(--color-primary)'
                                : 'var(--color-text-dim)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat.toUpperCase()} ({porCategoriaUnificada[cat]?.length || 0})
                    </button>
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
                                        options: UNIDADES_MEDIDA,
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
            <div
                key={art.id}
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '12px',
                    transition: 'all 0.2s',
                    position: 'relative'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
            >
                {/* Imagen */}
                <div style={{
                    height: '100px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    position: 'relative'
                }}>
                    {art.foto ? (
                        <img
                            src={`${UPLOADS_URL}${art.foto}`}
                            alt={art.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'rgba(255,255,255,0.15)'
                        }}>
                            <Package size={24} />
                        </div>
                    )}
                    {/* Categoría badge pequeño */}
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: '600',
                        color: '#fff',
                        textTransform: 'uppercase'
                    }}>
                        {catInfo.label}
                    </span>
                </div>

                {/* Nombre */}
                <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {art.nombre}
                </p>

                {/* Precio y Costo */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{
                            fontWeight: '800',
                            fontSize: '15px',
                            color: 'var(--color-tertiary)',
                            letterSpacing: '-0.5px'
                        }}>
                            ${Number(art.precio_u).toLocaleString('es-CO')}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                            fontSize: '9px',
                            color: 'rgba(255,255,100,0.6)',
                            background: 'rgba(255,255,100,0.08)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            border: '1px solid rgba(255,255,100,0.1)'
                        }} title="Costo Interno">
                            <DollarSign size={8} />
                            {Number(art.costo_u).toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>

                {/* Proveedor */}
                <div style={{ marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: art.nombre_proveedor === 'ArchiPlanner' ? 'var(--color-primary)' : 'var(--color-text-dim)',
                        background: art.nombre_proveedor === 'ArchiPlanner' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        border: art.nombre_proveedor === 'ArchiPlanner' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {art.nombre_proveedor}
                    </span>
                </div>

                {/* Footer: Unidad y Botones */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <span style={{
                        fontSize: '10px',
                        color: 'var(--color-text-dim)',
                        fontWeight: '500',
                        textTransform: 'lowercase',
                        opacity: 0.7
                    }}>
                        / {art.uni_medida}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => handleOpenModal(art)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Editar"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button
                            onClick={() => handleDelete(art.id)}
                            style={{
                                background: 'rgba(255, 100, 100, 0.1)',
                                border: 'none',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                color: 'rgba(255,100,100,0.8)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Eliminar"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default AdminInventario;
