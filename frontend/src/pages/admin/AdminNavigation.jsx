import React, { useState, useEffect } from 'react';
import { 
    Save, 
    Plus, 
    Trash2, 
    ChevronRight, 
    ChevronDown, 
    GripVertical, 
    Settings,
    Layout,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Share2,
    Globe,
    ExternalLink
} from 'lucide-react';
import paginasV4Service from '../../services/paginasV4Service';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import Swal from 'sweetalert2';
import { AdminInput, AdminIconButton, AdminImageUpload, AdminTextarea, AdminButton } from '../../components/ui/AdminFormFields';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy, 
    useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './style/AdminNavigation.css';

/**
 * Sortable Item Component
 */
const SortableNavItem = ({ item, onEdit, onDelete, onAddChild, level = 1 }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className={`nav-item-wrapper nav-level-${level}`}>
            <div className="nav-item-row">
                <div {...attributes} {...listeners} className="drag-handle">
                    <GripVertical size={16} />
                </div>
                <div className="nav-item-content">
                    <div className="nav-item-info">
                        <h4>{item.label}</h4>
                        <span>{item.path || 'Sin ruta'}</span>
                    </div>
                    <div className="nav-item-actions">
                        {level < 3 && (
                            <button onClick={() => onAddChild(item.id)} className="action-btn" title="Añadir Sub-menú">
                                <Plus size={14} />
                            </button>
                        )}
                        <button onClick={() => onEdit(item)} className="action-btn">
                            <Settings size={14} />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="action-btn delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
            {item.children && item.children.length > 0 && (
                <div className="nav-children">
                    {item.children.map(child => (
                        <SortableNavItem 
                            key={child.id} 
                            item={child} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onAddChild={onAddChild}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminNavigation = () => {
    const { companyConfig, setCompanyConfig } = useAuth();
    const [activeTab, setActiveTab] = useState('navbar');
    const [navItems, setNavItems] = useState([]);
    const [footerConfig, setFooterConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [availablePages, setAvailablePages] = useState([]);
    const [expandedSvg, setExpandedSvg] = useState({}); // Tracking expanded SVG editors

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const pages = await paginasV4Service.getAll();
                setAvailablePages(pages);
            } catch (error) {
                console.error("Error fetching pages for navigation:", error);
            }
        };
        fetchPages();
    }, []);

    // Default configuration for new systems
    const DEFAULT_NAV = [
        { id: '1', label: 'Inicio', path: '/', type: 'link', children: [] },
        { id: '2', label: 'Servicios', path: '/servicios', type: 'link', children: [] },
        { id: '3', label: 'Galería', path: '/galeria', type: 'link', children: [] },
        { id: '4', label: 'Nosotros', path: '/nosotros', type: 'link', children: [] },
        { id: '5', label: 'Contacto', path: '/contacto', type: 'cta', variant: 'primary', children: [] }
    ];

    const DEFAULT_FOOTER = {
        columns: [
            { id: 'c1', type: 'brand', title: 'Sobre Nosotros', hook: 'Curadores de momentos inolvidables. Diseño y planificación integral de eventos de lujo.' },
            { id: 'c2', type: 'links', title: 'Explora', items: [
                { label: 'Servicios', path: '/servicios' },
                { label: 'Galería', path: '/galeria' },
                { label: 'Nosotros', path: '/nosotros' }
            ]},
            { id: 'c3', type: 'contact', title: 'Información', showIcons: true },
            { id: 'c4', type: 'social', title: 'Siguenos', showInstagram: true }
        ],
        bottom: {
            copyright: 'Todos los derechos reservados. Diseñado con Distinción.',
            devName: 'ArchiWit',
            devUrl: 'https://ArchiWit.com',
            policies: [
                { label: 'Privacidad', path: '/privacidad' },
                { label: 'Protección', path: '/proteccion' }
            ]
        }
    };

    useEffect(() => {
        if (companyConfig) {
            try {
                const nav = companyConfig.nav_config ? JSON.parse(companyConfig.nav_config) : null;
                const footer = companyConfig.footer_config ? JSON.parse(companyConfig.footer_config) : null;
                setNavItems(Array.isArray(nav) ? nav : DEFAULT_NAV);
                setFooterConfig(footer || DEFAULT_FOOTER);
            } catch (e) {
                console.error("Error parsing configs", e);
                setNavItems(DEFAULT_NAV);
                setFooterConfig(DEFAULT_FOOTER);
            }
        }
    }, [companyConfig]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToSave = {
                ...companyConfig,
                nav_config: JSON.stringify(navItems),
                footer_config: JSON.stringify(footerConfig)
            };
            const res = await axios.put(`${API_BASE_URL}/config`, dataToSave);
            if (res.data.success) {
                setCompanyConfig(dataToSave);
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Configuración de navegación guardada correctamente.',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: 'var(--color-primary)'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la configuración de navegación.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: 'var(--color-primary)'
            });
        } finally {
            setLoading(false);
        }
    };

    const addItem = (parentId = null) => {
        const newItem = {
            id: Date.now().toString(),
            label: 'Nuevo Enlace',
            path: '/',
            type: 'link',
            children: []
        };

        if (!parentId) {
            setNavItems([...navItems, newItem]);
        } else {
            const updated = navItems.map(item => {
                if (item.id === parentId) return { ...item, children: [...(item.children || []), newItem] };
                if (item.children) {
                    const updateDeep = (childs) => childs.map(c => {
                        if (c.id === parentId) return { ...c, children: [...(c.children || []), newItem] };
                        if (c.children) return { ...c, children: updateDeep(c.children) };
                        return c;
                    });
                    return { ...item, children: updateDeep(item.children) };
                }
                return item;
            });
            setNavItems(updated);
        }
    };

    const deleteItem = (id) => {
        const filterItems = (items) => items.filter(i => {
            if (i.id === id) return false;
            if (i.children) i.children = filterItems(i.children);
            return true;
        });
        setNavItems(filterItems([...navItems]));
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setNavItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="admin-nav-container">
            <div className="admin-nav-header">
                <div>
                    <h2>Menús y Navegación</h2>
                    <p className="subtitle">Configura el menú principal y el pie de página de tu sitio.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    className="btn-icon-tooltip primary" 
                    disabled={loading}
                    title={loading ? 'Guardando...' : 'Guardar Configuración'}
                >
                    <Save size={22} />
                </button>
            </div>

            <div className="admin-nav-tabs">
                <button 
                    className={`nav-tab-btn ${activeTab === 'navbar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('navbar')}
                >
                    <Layout size={18} /> Menu Superior (NavBar)
                </button>
                <button 
                    className={`nav-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('footer')}
                >
                    <ArrowRight size={18} /> Pie de Página (Footer)
                </button>
            </div>

            <div className="builder-layout">
                <div className="builder-main">
                    {activeTab === 'navbar' ? (
                        <div className="navbar-builder">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={navItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    <div className="nav-item-list">
                                        {navItems.map(item => (
                                            <SortableNavItem 
                                                key={item.id} 
                                                item={item} 
                                                onEdit={setIsEditing} 
                                                onDelete={deleteItem}
                                                onAddChild={addItem}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                            <button className="btn-add-item" onClick={() => addItem()}>
                                <Plus size={18} /> Añadir enlace principal
                            </button>
                        </div>
                    ) : (
                        <div className="footer-builder">
                            <div className="footer-grid-config">
                                {footerConfig?.columns.slice(0, 4).map((col, idx) => (
                                    <div key={col.id} className="footer-col-preview active">
                                        <div className="col-header">
                                            <h4>Columna {idx + 1}: {col.title}</h4>
                                        </div>
                                        <div className="col-settings">
                                            {col.type === 'brand' && (
                                                <div className="input-group">
                                                    <label>Mensaje de Gancho</label>
                                                    <textarea 
                                                        value={col.hook} 
                                                        onChange={(e) => {
                                                            const newCols = [...footerConfig.columns];
                                                            newCols[idx] = { ...newCols[idx], hook: e.target.value };
                                                            setFooterConfig({...footerConfig, columns: newCols});
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {col.type === 'contact' && (
                                                <div className="contact-toggles">
                                                    <p>Se mostrará automáticamente:</p>
                                                    <ul>
                                                        <li><Mail size={14} /> {companyConfig?.email_contacto}</li>
                                                        <li><Phone size={14} /> {companyConfig?.telefono}</li>
                                                        <li><MapPin size={14} /> {companyConfig?.city}</li>
                                                    </ul>
                                                </div>
                                            )}
                                            {col.type === 'social' && (
                                                <div className="social-items-manager" style={{ marginTop: '10px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                id={`showIg_${idx}`}
                                                                checked={col.showInstagram} 
                                                                onChange={(e) => {
                                                                    const newCols = [...footerConfig.columns];
                                                                    newCols[idx] = { ...newCols[idx], showInstagram: e.target.checked };
                                                                    setFooterConfig({...footerConfig, columns: newCols});
                                                                }}
                                                            />
                                                            <label htmlFor={`showIg_${idx}`} style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.8 }}>Mostrar Feed Instagram</label>
                                                        </div>

                                                        {(col.items || []).map((sItem, sIdx) => {
                                                            const isExpanded = expandedSvg[`${idx}_${sIdx}`];
                                                            return (
                                                                <div key={sItem.id || sIdx} className="social-item-card">
                                                                    <div className="social-item-card-header">
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <div className="mini-icon-preview" dangerouslySetInnerHTML={{ __html: sItem.svg || '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>' }} />
                                                                            <span style={{ fontSize: '11px', fontWeight: '700' }}>{sItem.label || 'Sin nombre'}</span>
                                                                        </div>
                                                                        <div className="social-item-card-actions">
                                                                            <button 
                                                                                className={`svg-toggle-btn ${isExpanded ? 'active' : ''}`}
                                                                                onClick={() => setExpandedSvg({...expandedSvg, [`${idx}_${sIdx}`]: !isExpanded})}
                                                                                title="Editar SVG"
                                                                            >
                                                                                <Share2 size={10} /> {isExpanded ? 'Cerrar' : 'SVG'}
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    const newCols = [...footerConfig.columns];
                                                                                    newCols[idx].items = newCols[idx].items.filter((_, i) => i !== sIdx);
                                                                                    setFooterConfig({...footerConfig, columns: newCols});
                                                                                }}
                                                                                className="action-btn delete" 
                                                                                style={{ width: '24px', height: '24px' }}
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="social-compact-row">
                                                                        <AdminInput 
                                                                            label="Nombre" 
                                                                            value={sItem.label} 
                                                                            onChange={(e) => {
                                                                                const newCols = [...footerConfig.columns];
                                                                                newCols[idx].items[sIdx].label = e.target.value;
                                                                                setFooterConfig({...footerConfig, columns: newCols});
                                                                            }}
                                                                        />
                                                                        <AdminInput 
                                                                            label="URL" 
                                                                            value={sItem.url} 
                                                                            onChange={(e) => {
                                                                                const newCols = [...footerConfig.columns];
                                                                                newCols[idx].items[sIdx].url = e.target.value;
                                                                                setFooterConfig({...footerConfig, columns: newCols});
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <div className={`svg-editor-collapsed ${isExpanded ? 'expanded' : ''}`}>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                                                            <AdminImageUpload 
                                                                                label="Icono"
                                                                                value={sItem.image}
                                                                                onChange={(e) => {
                                                                                    const newCols = [...footerConfig.columns];
                                                                                    newCols[idx].items[sIdx].image = e.target.value;
                                                                                    setFooterConfig({...footerConfig, columns: newCols});
                                                                                }}
                                                                            />
                                                                            <AdminTextarea 
                                                                                label="Código SVG"
                                                                                rows={3}
                                                                                value={sItem.svg}
                                                                                onChange={(e) => {
                                                                                    const newCols = [...footerConfig.columns];
                                                                                    newCols[idx].items[sIdx].svg = e.target.value;
                                                                                    setFooterConfig({...footerConfig, columns: newCols});
                                                                                }}
                                                                                placeholder="<svg>...</svg>"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <button 
                                                            className="btn-add-item" 
                                                            style={{ margin: 0, padding: '8px', fontSize: '12px' }}
                                                            onClick={() => {
                                                                const newCols = [...footerConfig.columns];
                                                                if (!newCols[idx].items) newCols[idx].items = [];
                                                                newCols[idx].items.push({ id: Date.now().toString(), label: '', url: '', svg: '', image: null });
                                                                setFooterConfig({...footerConfig, columns: newCols});
                                                            }}
                                                        >
                                                            <Plus size={14} /> Red Social
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="builder-sidebar">
                    <div className="sidebar-card">
                        <h3>Propiedades</h3>
                        {isEditing ? (
                            <div className="edit-form">
                                <div className="input-group">
                                    <label>Etiqueta</label>
                                    <input 
                                        type="text" 
                                        value={isEditing.label} 
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const updateLabel = (items) => items.map(i => {
                                                if (i.id === isEditing.id) return { ...i, label: newVal };
                                                if (i.children) return { ...i, children: updateLabel(i.children) };
                                                return i;
                                            });
                                            setNavItems(updateLabel([...navItems]));
                                            setIsEditing({...isEditing, label: newVal});
                                        }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Ruta / URL</label>
                                    <div className="flex-col gap-10">
                                        <select 
                                            value={isEditing.path} 
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                const updatePath = (items) => items.map(i => {
                                                    if (i.id === isEditing.id) return { ...i, path: newVal };
                                                    if (i.children) return { ...i, children: updatePath(i.children) };
                                                    return i;
                                                });
                                                setNavItems(updatePath([...navItems]));
                                                setIsEditing({...isEditing, path: newVal});
                                            }}
                                            style={{ background: '#111', color: 'white', border: '1px solid #333', borderRadius: '8px', padding: '10px' }}
                                        >
                                            <option value="">Selecciona una página...</option>
                                            <option value="/">Inicio (Página Principal)</option>
                                            
                                            <optgroup label="Páginas V4 (Constructor)">
                                                {availablePages.map(p => {
                                                    // Usar URL limpia para servicios y nosotros si existen
                                                    const cleanPaths = ['servicios', 'nosotros'];
                                                    const path = cleanPaths.includes(p.slug) ? `/${p.slug}` : `/p/${p.slug}`;
                                                    return <option key={p.id} value={path}>{p.nombre}</option>;
                                                })}
                                            </optgroup>

                                            <optgroup label="Secciones del Sistema">
                                                <option value="/galeria">Galería de Eventos</option>
                                                <option value="/contacto">Formulario de Contacto</option>
                                            </optgroup>
                                        </select>
                                        <input 
                                            type="text" 
                                            placeholder="O ingresa una URL manual..."
                                            value={isEditing.path} 
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                const updatePath = (items) => items.map(i => {
                                                    if (i.id === isEditing.id) return { ...i, path: newVal };
                                                    if (i.children) return { ...i, children: updatePath(i.children) };
                                                    return i;
                                                });
                                                setNavItems(updatePath([...navItems]));
                                                setIsEditing({...isEditing, path: newVal});
                                            }}
                                            style={{ marginTop: '5px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '8px', padding: '10px' }}
                                        />
                                    </div>
                                </div>

                                {/* ICON OPTIONS FOR MAIN MENU */}
                                <div className="input-group" style={{ marginTop: '15px' }}>
                                    <AdminImageUpload 
                                        label="Icono de Imagen"
                                        value={isEditing.image}
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const updateImg = (items) => items.map(i => {
                                                if (i.id === isEditing.id) return { ...i, image: newVal };
                                                if (i.children) return { ...i, children: updateImg(i.children) };
                                                return i;
                                            });
                                            setNavItems(updateImg([...navItems]));
                                            setIsEditing({...isEditing, image: newVal});
                                        }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginTop: '15px' }}>
                                    <AdminTextarea 
                                        label="Código SVG (Opcional)"
                                        rows={2}
                                        value={isEditing.svg}
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const updateSvg = (items) => items.map(i => {
                                                if (i.id === isEditing.id) return { ...i, svg: newVal };
                                                if (i.children) return { ...i, children: updateSvg(i.children) };
                                                return i;
                                            });
                                            setNavItems(updateSvg([...navItems]));
                                            setIsEditing({...isEditing, svg: newVal});
                                        }}
                                        placeholder="<svg>...</svg>"
                                    />
                                </div>
                                <button onClick={() => setIsEditing(null)} className="btn-v4 w-full mt-20">Listo</button>
                            </div>
                        ) : (
                            <p className="no-selection">Selecciona un elemento para editar sus ajustes.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNavigation;
