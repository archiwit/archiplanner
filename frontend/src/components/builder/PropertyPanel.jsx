import React, { useState, useEffect } from 'react';
import { 
    X, Layout, Palette, Settings, Type, Image as ImageIcon, Video, 
    Trash2, Copy, Link, ExternalLink, MapPin, Mail, Layers, Star, 
    MessageSquare, Briefcase, LayoutDashboard, Clock, Grid, Check,
    FileText, ArrowRight, Play, Monitor, Tablet, Smartphone, Save, Eye,
    ChevronRight, ChevronLeft, Globe, Search, Info
} from 'lucide-react';
import MediaSelectorModal from './MediaSelectorModal';
import paginasV4Service from '../../services/paginasV4Service';

const PropertyPanel = ({ activeElement, updateElement, onClose, deleteElement, duplicateElement, systemConfig, allCategories }) => {
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [selectionTarget, setSelectionTarget] = useState(null);
    const [availablePages, setAvailablePages] = useState([]);
    const [activeTab, setActiveTab] = useState('content'); // 'content', 'style', 'advanced'

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const pages = await paginasV4Service.getAll();
                setAvailablePages(pages);
            } catch (error) {
                console.error("Error fetching pages for selector:", error);
            }
        };
        fetchPages();
    }, []);

    if (!activeElement) return null;

    const { type, config = {} } = activeElement;

    const handleConfigChange = (key, value) => {
        updateElement({
            ...activeElement,
            config: { ...config, [key]: value }
        });
    };

    const renderSystemSwatches = (key) => {
        if (!systemConfig) return null;
        const brandColors = [
            { name: 'P', color: systemConfig.color_primario },
            { name: 'S', color: systemConfig.color_secundario },
            { name: 'T', color: systemConfig.color_terciario },
            { name: 'F', color: systemConfig.color_fondo || '#000000' }
        ].filter(c => c.color);

        return (
            <div className="system-swatches">
                {brandColors.map((c, idx) => (
                    <div 
                        key={idx} 
                        className="swatch-circle" 
                        style={{ background: c.color }} 
                        onClick={() => handleConfigChange(key, c.color)}
                        title={`Color de Marca: ${c.name}`}
                    />
                ))}
            </div>
        );
    };

    const renderTabsNav = () => (
        <div className="property-tabs-nav">
            <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>
                <Type size={14} /> <span>Contenido</span>
            </button>
            <button className={activeTab === 'style' ? 'active' : ''} onClick={() => setActiveTab('style')}>
                <Palette size={14} /> <span>Estilo</span>
            </button>
            <button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>
                <Settings size={14} /> <span>Avanzado</span>
            </button>
        </div>
    );

    const renderAdvancedTab = () => (
        <div className="settings-section">
            <div className="section-title"><Layout size={14} /> Disposición (Márgenes)</div>
            <div className="prop-grid-4">
                <div className="prop-group mini">
                    <label>Arriba</label>
                    <input type="text" placeholder="0px" value={config.marginTop || ''} onChange={(e) => handleConfigChange('marginTop', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Derecha</label>
                    <input type="text" placeholder="0px" value={config.marginRight || ''} onChange={(e) => handleConfigChange('marginRight', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Abajo</label>
                    <input type="text" placeholder="0px" value={config.marginBottom || ''} onChange={(e) => handleConfigChange('marginBottom', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Izquierda</label>
                    <input type="text" placeholder="0px" value={config.marginLeft || ''} onChange={(e) => handleConfigChange('marginLeft', e.target.value)} />
                </div>
            </div>

            <div className="section-title mt-20"><Layout size={14} /> Relleno (Paddings)</div>
            <div className="prop-grid-4">
                <div className="prop-group mini">
                    <label>Arriba</label>
                    <input type="text" placeholder="100px" value={config.paddingTop || ''} onChange={(e) => handleConfigChange('paddingTop', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Derecha</label>
                    <input type="text" placeholder="0px" value={config.paddingRight || ''} onChange={(e) => handleConfigChange('paddingRight', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Abajo</label>
                    <input type="text" placeholder="100px" value={config.paddingBottom || ''} onChange={(e) => handleConfigChange('paddingBottom', e.target.value)} />
                </div>
                <div className="prop-group mini">
                    <label>Izquierda</label>
                    <input type="text" placeholder="0px" value={config.paddingLeft || ''} onChange={(e) => handleConfigChange('paddingLeft', e.target.value)} />
                </div>
            </div>

            <div className="section-title mt-20"><Star size={14} /> Animaciones de Entrada</div>
            <div className="prop-group">
                <label>Efecto</label>
                <select value={config.animation || 'none'} onChange={(e) => handleConfigChange('animation', e.target.value)}>
                    <option value="none">Sin Animación</option>
                    <option value="fade-in">Fade In</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="reveal-left">Reveal Left</option>
                </select>
            </div>
            
            <div className="prop-group mt-10">
                <label>Z-Index</label>
                <input type="number" value={config.zIndex || 1} onChange={(e) => handleConfigChange('zIndex', parseInt(e.target.value))} />
            </div>
        </div>
    );

    const renderContentTab = () => {
        if (type === 'row') {
            return (
                <div className="settings-section">
                    <div className="section-title"><Layout size={14} /> Disposición de Bloque</div>
                    
                    <div className="prop-row-toggle">
                        <label>Ancho Completo (100%)</label>
                        <input 
                            type="checkbox" 
                            checked={config.isFullWidth || false} 
                            onChange={(e) => handleConfigChange('isFullWidth', e.target.checked)} 
                        />
                    </div>

                    {!config.isFullWidth && (
                        <div className="prop-group">
                            <label>Ancho Máximo (px/%/vw)</label>
                            <input 
                                type="text" 
                                value={config.maxWidth || '1200px'} 
                                placeholder="ej: 1200px o 90%" 
                                onChange={(e) => handleConfigChange('maxWidth', e.target.value)} 
                            />
                        </div>
                    )}

                    <div className="prop-group">
                        <label>Altura Mínima (px/vh/%)</label>
                        <input 
                            type="text" 
                            value={config.minHeight || 'auto'} 
                            placeholder="ej: 100vh o 500px" 
                            onChange={(e) => handleConfigChange('minHeight', e.target.value)} 
                        />
                        <div className="system-swatches mt-5">
                            {['auto', '600px', '800px', '100vh'].map(h => (
                                <button 
                                    key={h} 
                                    className={`btn-small ${config.minHeight === h ? 'active' : ''}`}
                                    onClick={() => handleConfigChange('minHeight', h)}
                                    style={{ fontSize: '9px', padding: '4px 8px' }}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="prop-group">
                        <label>Espaciado entre Columnas (Gap)</label>
                        <input 
                            type="text" 
                            value={config.gap || '20px'} 
                            placeholder="20px" 
                            onChange={(e) => handleConfigChange('gap', e.target.value)} 
                        />
                    </div>

                    <div className="prop-group">
                        <label>Alineación Vertical (Columnas)</label>
                        <select 
                            value={config.alignItems || 'stretch'} 
                            onChange={(e) => handleConfigChange('alignItems', e.target.value)}
                        >
                            <option value="stretch">Estirar (Misma altura)</option>
                            <option value="flex-start">Arriba</option>
                            <option value="center">Centro</option>
                            <option value="flex-end">Abajo</option>
                        </select>
                    </div>

                    <div className="prop-group">
                        <label>Justificado Horizontal</label>
                        <select 
                            value={config.justifyContent || 'flex-start'} 
                            onChange={(e) => handleConfigChange('justifyContent', e.target.value)}
                        >
                            <option value="flex-start">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="flex-end">Derecha</option>
                            <option value="space-between">Espaciado Equitativo</option>
                        </select>
                    </div>

                    <div className="section-title mt-20"><Grid size={14} /> Gestión de Rejilla (Columnas)</div>
                    <div className="prop-row-presets">
                        <button className="btn-preset" onClick={() => {
                            const newCols = [{ id: `col-${activeElement.id}-1`, type: 'col', span: 12, children: [], config: {} }];
                            updateElement({ ...activeElement, children: newCols });
                        }}>1 Col (100%)</button>
                        <button className="btn-preset" onClick={() => {
                            const newCols = [
                                { id: `col-${activeElement.id}-1`, type: 'col', span: 6, children: [], config: {} },
                                { id: `col-${activeElement.id}-2`, type: 'col', span: 6, children: [], config: {} }
                            ];
                            updateElement({ ...activeElement, children: newCols });
                        }}>2 Cols (50/50)</button>
                        <button className="btn-preset" onClick={() => {
                            const newCols = [
                                { id: `col-${activeElement.id}-1`, type: 'col', span: 4, children: [], config: {} },
                                { id: `col-${activeElement.id}-2`, type: 'col', span: 4, children: [], config: {} },
                                { id: `col-${activeElement.id}-3`, type: 'col', span: 4, children: [], config: {} }
                            ];
                            updateElement({ ...activeElement, children: newCols });
                        }}>3 Cols (33/33/33)</button>
                    </div>
                    <div className="v4-col-manager mt-15">
                        {(activeElement.children || []).map((col, idx) => (
                            <div key={col.id} className="v4-col-item-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '40px' }}>Col {idx + 1}</span>
                                <select 
                                    value={col.span || 12} 
                                    style={{ flex: 1, background: '#111', color: 'white', border: '1px solid #333', borderRadius: '5px', padding: '4px' }}
                                    onChange={(e) => {
                                        const newChildren = [...activeElement.children];
                                        newChildren[idx] = { ...col, span: parseInt(e.target.value) };
                                        updateElement({ ...activeElement, children: newChildren });
                                    }}
                                >
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => <option key={s} value={s}>Ancho {s}/12</option>)}
                                </select>
                                <button 
                                    onClick={() => {
                                        const newChildren = activeElement.children.filter(c => c.id !== col.id);
                                        updateElement({ ...activeElement, children: newChildren });
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button 
                            className="btn-v4 btn-v4-secondary btn-small full mt-10" 
                            style={{ padding: '8px', fontSize: '11px' }}
                            onClick={() => {
                                const newId = `col-${activeElement.id}-${Date.now()}`;
                                const newCol = { id: newId, type: 'col', span: 6, children: [], config: {} };
                                updateElement({ ...activeElement, children: [...(activeElement.children || []), newCol] });
                            }}
                        >
                            + Añadir Columna
                        </button>
                    </div>
                </div>
            );
        }
        
        if (type === 'col') return <div className="p-20 opacity-40 italic">Las columnas contienen otros elementos. Usa los controles de ancho en la pestaña Estilo.</div>;

        return (
            <div className="settings-section">
                {/* HEADINGS & TEXT */}
                {(type === 'text' || type === 'heading') && (
                    <>
                        {type === 'heading' && (
                            <div className="prop-group">
                                <label>Estilo de Título</label>
                                <select value={config.variant || 'standard'} onChange={(e) => handleConfigChange('variant', e.target.value)}>
                                    <option value="standard">Estándar V4</option>
                                    <option value="premium">Premium Editorial (Italics + Gold)</option>
                                </select>
                            </div>
                        )}
                        
                        {type === 'heading' && config.variant === 'premium' ? (
                            <>
                                <div className="prop-group">
                                    <label>Tagline (Arriba)</label>
                                    <input type="text" value={config.subtitle || ''} placeholder="Ej: NUESTRA ESENCIA" onChange={(e) => handleConfigChange('subtitle', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Título Parte 1 (Normal)</label>
                                    <input type="text" value={config.titleMain || ''} onChange={(e) => handleConfigChange('titleMain', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Título Parte 2 (Resaltado/Cursiva)</label>
                                    <input type="text" value={config.titleHighlight || ''} onChange={(e) => handleConfigChange('titleHighlight', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Descripción inferior</label>
                                    <textarea rows={4} value={config.description || ''} onChange={(e) => handleConfigChange('description', e.target.value)} />
                                </div>
                            </>
                        ) : (
                            <>
                                {type === 'heading' && (
                                    <div className="prop-group">
                                        <label>Subtítulo (Overline)</label>
                                        <input type="text" value={config.subtitle || ''} placeholder="Ej: PRINCIPALES" onChange={(e) => handleConfigChange('subtitle', e.target.value)} />
                                    </div>
                                )}
                                <div className="prop-group">
                                    <label>{type === 'heading' ? 'Título Principal' : 'Texto HTML'}</label>
                                    <textarea rows={type === 'heading' ? 3 : 10} value={config.content || ''} onChange={(e) => handleConfigChange('content', e.target.value)} />
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* HERO */}
                {type === 'hero' && (
                    <>
                        <div className="prop-group">
                            <label>Título Principal</label>
                            <input type="text" value={config.title || ''} onChange={(e) => handleConfigChange('title', e.target.value)} />
                        </div>
                        <div className="prop-group">
                            <label>Subtítulo</label>
                            <textarea value={config.subtitle || ''} onChange={(e) => handleConfigChange('subtitle', e.target.value)} />
                        </div>
                    </>
                )}

                {/* HERO MODERN */}
                {type === 'hero-modern' && (
                    <>
                        <div className="prop-group">
                            <label>Título</label>
                            <input type="text" value={config.titulo || ''} onChange={(e) => handleConfigChange('titulo', e.target.value)} />
                        </div>
                        <div className="prop-group">
                            <label>Subtítulo Editorial</label>
                            <textarea rows="4" value={config.subtitulo || ''} onChange={(e) => handleConfigChange('subtitulo', e.target.value)} />
                        </div>
                        <div className="prop-group">
                            <label>Etiqueta del Botón</label>
                            <input type="text" value={config.buttonLabel || ''} onChange={(e) => handleConfigChange('buttonLabel', e.target.value)} />
                        </div>
                    </>
                )}

                {/* VIDEO PLAYER */}
                {type === 'video' && (
                    <>
                        <div className="prop-group">
                            <label>URL del Video (YouTube / MP4)</label>
                            <input type="text" value={config.url || ''} placeholder="https://..." onChange={(e) => handleConfigChange('url', e.target.value)} />
                        </div>
                        <div className="prop-row-toggle">
                            <label>Autoplay</label>
                            <input type="checkbox" checked={config.autoPlay || false} onChange={(e) => handleConfigChange('autoPlay', e.target.checked)} />
                        </div>
                        <div className="prop-row-toggle">
                            <label>Controles</label>
                            <input type="checkbox" checked={config.controls || false} onChange={(e) => handleConfigChange('controls', e.target.checked)} />
                        </div>
                        <div className="prop-row-toggle">
                            <label>Silenciado</label>
                            <input type="checkbox" checked={config.muted || false} onChange={(e) => handleConfigChange('muted', e.target.checked)} />
                        </div>
                    </>
                )}

                {/* STORIES / VIDEOS TIPO HISTORIA */}
                {type === 'stories' && (
                    <>
                        <div className="section-title"><Clock size={14} /> Gestión de Historias</div>
                        <div className="v4-items-list-editor">
                            {(config.items || []).map((item, idx) => (
                                <div key={idx} className="v4-item-editor-card">
                                    <div className="item-header">
                                        <span>Historia #{idx + 1}</span>
                                        <button className="btn-mini-del" onClick={() => {
                                            const newItems = [...config.items];
                                            newItems.splice(idx, 1);
                                            handleConfigChange('items', newItems);
                                        }}><X size={12} /></button>
                                    </div>
                                    <div className="prop-group mini">
                                        <label>Título</label>
                                        <input type="text" value={item.title || ''} onChange={(e) => {
                                            const newItems = [...config.items];
                                            newItems[idx].title = e.target.value;
                                            handleConfigChange('items', newItems);
                                        }} />
                                    </div>
                                    <div className="prop-group mini">
                                        <label>Imagen Portada (URL)</label>
                                        <div className="flex-row">
                                            <input type="text" value={item.image || ''} onChange={(e) => {
                                                const newItems = [...config.items];
                                                newItems[idx].image = e.target.value;
                                                handleConfigChange('items', newItems);
                                            }} />
                                            <button className="btn-small" onClick={() => {
                                                setSelectionTarget(`story_img_${idx}`);
                                                setIsMediaModalOpen(true);
                                            }}>🏙️</button>
                                        </div>
                                    </div>
                                    <div className="prop-group mini">
                                        <label>URL Video / Enlace</label>
                                        <input type="text" value={item.video || ''} onChange={(e) => {
                                            const newItems = [...config.items];
                                            newItems[idx].video = e.target.value;
                                            handleConfigChange('items', newItems);
                                        }} />
                                    </div>
                                </div>
                            ))}
                            <button className="btn-v4-outline w-full mt-10" onClick={() => {
                                const newItems = [...(config.items || []), { id: Date.now(), title: 'Nueva Historia', image: '', video: '' }];
                                handleConfigChange('items', newItems);
                            }}>+ Añadir Historia</button>
                        </div>
                    </>
                )}
                
                {/* GALLERY / PORTFOLIO */}
                {type === 'gallery' && (
                    <>
                        <div className="section-title"><LayoutDashboard size={14} /> Fuente de Datos</div>
                        <div className="prop-group">
                            <label>Origen de la Galería</label>
                            <select value={config.source || 'manual'} onChange={(e) => handleConfigChange('source', e.target.value)}>
                                <option value="manual">Manual (Elegir Fotos)</option>
                                <option value="dynamic">Dinámico (Módulo Portfolio)</option>
                            </select>
                        </div>

                        {config.source === 'dynamic' ? (
                            <>
                                <div className="prop-group">
                                    <label>Categoría Inicial</label>
                                    <select value={config.category || 'todos'} onChange={(e) => handleConfigChange('category', e.target.value)}>
                                        <option value="todos">Todas las categorías</option>
                                        {(allCategories || []).map(cat => (
                                            <option key={cat.id} value={cat.slug}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="v4-panel-info-box mini mb-20">
                                    <div className="info-icon"><Info size={16} /></div>
                                    <p style={{fontSize: '10px', opacity: 0.7}}>Este modo trae los eventos del módulo <strong>"Galerías"</strong> con el diseño de filtros editorial.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="section-title"><ImageIcon size={14} /> Gestión de Galería</div>
                                <div className="v4-items-list-editor">
                                    {(config.images || []).map((img, idx) => (
                                        <div key={idx} className="v4-item-editor-card">
                                            <div className="item-header">
                                                <span>Imagen #{idx + 1}</span>
                                                <button className="btn-mini-del" onClick={() => {
                                                    const newImages = [...config.images];
                                                    newImages.splice(idx, 1);
                                                    handleConfigChange('images', newImages);
                                                }}><X size={12} /></button>
                                            </div>
                                            <div className="prop-group mini">
                                                <div className="flex-row">
                                                    <input type="text" value={img || ''} onChange={(e) => {
                                                        const newImages = [...config.images];
                                                        newImages[idx] = e.target.value;
                                                        handleConfigChange('images', newImages);
                                                    }} />
                                                    <button className="btn-small" onClick={() => {
                                                        setSelectionTarget(`gallery_img_${idx}`);
                                                        setIsMediaModalOpen(true);
                                                    }}>🏙️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn-v4-outline w-full mt-10" onClick={() => {
                                        const newImages = [...(config.images || []), ''];
                                        handleConfigChange('images', newImages);
                                    }}>+ Añadir Imagen</button>
                                </div>
                            </>
                        )}
                        
                        <div className="section-title mt-20"><Grid size={14} /> Ajustes de Rejilla</div>
                        <div className="prop-grid-2">
                            <div className="prop-group mini">
                                <label>Columnas</label>
                                <input type="number" value={config.columns || (config.source === 'dynamic' ? 3 : 4)} onChange={(e) => handleConfigChange('columns', parseInt(e.target.value))} />
                            </div>
                            <div className="prop-group mini">
                                <label>Espaciado (px)</label>
                                <input type="number" value={config.gap || (config.source === 'dynamic' ? 20 : 10)} onChange={(e) => handleConfigChange('gap', parseInt(e.target.value))} />
                            </div>
                        </div>
                    </>
                )}

                {/* BUTTON & CTA */}
                {(type === 'button' || type === 'cta-editorial') && (
                    <>
                        {type === 'cta-editorial' && (
                            <div className="prop-group">
                                <label>Título de la Llamada (HTML)</label>
                                <textarea rows="3" value={config.title || ''} placeholder="Ej: <h3>¡Contáctanos ya!</h3>" onChange={(e) => handleConfigChange('title', e.target.value)} />
                            </div>
                        )}
                        <div className="prop-group">
                            <label>{type === 'cta-editorial' ? 'Texto Descriptivo (HTML)' : 'Etiqueta'}</label>
                            {type === 'cta-editorial' ? (
                                <textarea rows="6" value={config.content || ''} onChange={(e) => handleConfigChange('content', e.target.value)} />
                            ) : (
                                <input type="text" value={config.label || ''} onChange={(e) => handleConfigChange('label', e.target.value)} />
                            )}
                        </div>
                        <div className="prop-group">
                            <label>Texto del Botón</label>
                            <input type="text" value={config.buttonLabel || ''} onChange={(e) => handleConfigChange('buttonLabel', e.target.value)} />
                        </div>
                        <div className="prop-group">
                            <label>Enlace</label>
                            <input type="text" value={config.link || ''} onChange={(e) => handleConfigChange('link', e.target.value)} />
                        </div>
                    </>
                )}

                {/* TESTIMONIOS */}
                {type === 'testimonios' && (
                    <div className="v4-panel-info-box">
                        <div className="info-icon"><MessageSquare size={20} /></div>
                        <h4>Fuente Automática</h4>
                        <p>Este componente muestra los testimonios gestionados en el módulo <strong>"Testimonios"</strong> del panel lateral.</p>
                        <button className="btn-small mt-10" onClick={() => window.open('/admin/testimonios', '_blank')}>Gestionar Testimonios</button>
                    </div>
                )}

                {/* IMAGE */}
                {type === 'image' && (
                    <div className="prop-group">
                        <label>URL / Archivo</label>
                        <div className="flex-row">
                            <input type="text" value={config.src || ''} onChange={(e) => handleConfigChange('src', e.target.value)} />
                            <button className="btn-small" onClick={() => { setSelectionTarget('src'); setIsMediaModalOpen(true); }}>Galería</button>
                        </div>
                    </div>
                )}

                {/* CARD V4 */}
                {(type === 'card-v4' || type === 'query-grid-v4') && (
                    <>
                        {type === 'card-v4' && (
                            <>
                                <div className="prop-group">
                                    <label>Número / Label Superior</label>
                                    <input type="text" value={config.num || config.tag || ''} onChange={(e) => handleConfigChange('tag', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Título de Card</label>
                                    <input type="text" value={config.title || ''} onChange={(e) => handleConfigChange('title', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Descripción / Contenido</label>
                                    <textarea rows="4" value={config.desc || ''} onChange={(e) => handleConfigChange('desc', e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label>Multimedia (URL Imagen o SVG)</label>
                                    <div className="flex-row">
                                        <input type="text" value={config.media_path || ''} onChange={(e) => handleConfigChange('media_path', e.target.value)} />
                                        <button className="btn-small" onClick={() => { setSelectionTarget('media_path'); setIsMediaModalOpen(true); }}>Galería</button>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div className="section-title mt-20"><Link size={14} /> Enlace y Acción</div>
                        <div className="prop-row-toggle">
                            <label>Mostrar Enlace / Botón</label>
                            <input type="checkbox" checked={config.showLink || config.cardStyle?.showLink || false} onChange={(e) => {
                                if (type === 'query-grid-v4') {
                                    handleConfigChange('cardStyle', { ...config.cardStyle, showLink: e.target.checked });
                                } else {
                                    handleConfigChange('showLink', e.target.checked);
                                }
                            }} />
                        </div>
                        {(config.showLink || config.cardStyle?.showLink) && (
                            <div className="flex-col gap-10 mt-10">
                                <div className="prop-group">
                                    <label>Texto del Botón/Enlace</label>
                                    <input 
                                        type="text" 
                                        placeholder="ej. Ver Detalles"
                                        value={(type === 'query-grid-v4' ? config.cardStyle?.linkLabel : config.linkLabel) || ''} 
                                        onChange={(e) => {
                                            if (type === 'query-grid-v4') {
                                                handleConfigChange('cardStyle', { ...config.cardStyle, linkLabel: e.target.value });
                                            } else {
                                                handleConfigChange('linkLabel', e.target.value);
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="prop-group">
                                    <label>Estilo de CTA</label>
                                    <select value={(type === 'query-grid-v4' ? config.cardStyle?.ctaStyle : config.ctaStyle) || 'link'} onChange={(e) => {
                                        if (type === 'query-grid-v4') {
                                            handleConfigChange('cardStyle', { ...config.cardStyle, ctaStyle: e.target.value });
                                        } else {
                                            handleConfigChange('ctaStyle', e.target.value);
                                        }
                                    }}>
                                        <option value="link">Enlace con flecha</option>
                                        <option value="button">Botón Relleno</option>
                                    </select>
                                </div>
                                <div className="prop-group">
                                    <label>Alineación de Enlace</label>
                                    <select value={(type === 'query-grid-v4' ? config.cardStyle?.ctaAlignment : config.ctaAlignment) || 'right'} onChange={(e) => {
                                        if (type === 'query-grid-v4') {
                                            handleConfigChange('cardStyle', { ...config.cardStyle, ctaAlignment: e.target.value });
                                        } else {
                                            handleConfigChange('ctaAlignment', e.target.value);
                                        }
                                    }}>
                                        <option value="left">Izquierda</option>
                                        <option value="center">Centro</option>
                                        <option value="right">Derecha</option>
                                    </select>
                                </div>
                                {type === 'card-v4' && (
                                    <div className="prop-group">
                                        <label>URL / Destino</label>
                                        <select value={config.linkUrl || ''} onChange={(e) => handleConfigChange('linkUrl', e.target.value)}>
                                            <option value="">Selecciona una página...</option>
                                            {availablePages.map(p => (
                                                <option key={p.id} value={`/p/${p.slug}`}>{p.nombre}</option>
                                            ))}
                                            <option value="/contacto">Formulario de Contacto</option>
                                        </select>
                                        <input type="text" className="mt-10" placeholder="O pega una URL externa..." value={config.linkUrl || ''} onChange={(e) => handleConfigChange('linkUrl', e.target.value)} />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* QUERY GRID V4 SETTINGS */}
                {type === 'query-grid-v4' && (
                    <div className="mt-30 border-t pt-20">
                        <div className="section-title"><LayoutDashboard size={14} /> Fuente Dinámica</div>
                        <div className="prop-group">
                            <label>Fuente de Datos</label>
                            <select value={config.source || 'servicios'} onChange={(e) => handleConfigChange('source', e.target.value)}>
                                <option value="servicios">Servicios (BD)</option>
                                <option value="historias">Galería / Historias</option>
                            </select>
                        </div>
                        <div className="prop-group">
                            <label>Filtro de Sección</label>
                            <select value={config.sectionFilter || 'todos'} onChange={(e) => handleConfigChange('sectionFilter', e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="principales">Principales / Corporativos</option>
                                <option value="sociales">Sociales / Íntimos</option>
                            </select>
                        </div>
                        <div className="prop-grid-2">
                            <div className="prop-group mini">
                                <label>Columnas</label>
                                <input type="number" min="1" max="4" value={config.columns || 3} onChange={(e) => handleConfigChange('columns', parseInt(e.target.value))} />
                            </div>
                            <div className="prop-group mini">
                                <label>Límite</label>
                                <input type="number" min="1" max="100" value={config.limit || 6} onChange={(e) => handleConfigChange('limit', parseInt(e.target.value))} />
                            </div>
                        </div>
                        <div className="prop-group mt-10">
                            <label>Preferencia de Medios</label>
                            <select value={config.mediaPreference || 'priority_svg'} onChange={(e) => handleConfigChange('mediaPreference', e.target.value)}>
                                <option value="priority_image">Prioridad Imagen</option>
                                <option value="priority_svg">Prioridad SVG Animado</option>
                                <option value="only_image">Solo Imagen</option>
                                <option value="only_svg">Solo SVG Animado</option>
                                <option value="none">Ocultar Multimedia</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* CTA PHONE V4 SETTINGS */}
                {type === 'cta-phone-v4' && (
                    <div className="mt-30 border-t pt-20">
                        <div className="section-title"><Smartphone size={14} /> CTA Editorial Premium</div>
                        
                        <div className="prop-group">
                            <label>Gancho (Hook - Texto Pequeño Arriba)</label>
                            <input type="text" value={config.hook || ''} onChange={(e) => handleConfigChange('hook', e.target.value)} placeholder="Ej: EMPIEZA AHORA" />
                        </div>

                        <div className="prop-group">
                            <label>Título Principal</label>
                            <input type="text" value={config.title || ''} onChange={(e) => handleConfigChange('title', e.target.value)} />
                        </div>

                        <div className="prop-group">
                            <label>Cierre / Cuerpo de Texto</label>
                            <textarea rows="4" value={config.closure || ''} onChange={(e) => handleConfigChange('closure', e.target.value)} />
                        </div>

                        <div className="prop-grid-2">
                            <div className="prop-group">
                                <label>Texto Botón</label>
                                <input type="text" value={config.buttonLabel || ''} onChange={(e) => handleConfigChange('buttonLabel', e.target.value)} />
                            </div>
                            <div className="prop-group">
                                <label>Tipo de Acción</label>
                                <select value={config.actionType || 'whatsapp'} onChange={(e) => handleConfigChange('actionType', e.target.value)}>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="contacto">Ir a Contacto</option>
                                    <option value="sms">Enviar SMS</option>
                                    <option value="call">Llamar</option>
                                    <option value="link">Enlace Externo</option>
                                </select>
                            </div>
                        </div>

                        {config.actionType === 'whatsapp' && (
                            <div className="prop-group">
                                <label>Mensaje Predefinido WhatsApp</label>
                                <textarea rows="2" value={config.whatsappMessage || ''} onChange={(e) => handleConfigChange('whatsappMessage', e.target.value)} placeholder="Ej: Hola, quiero información..." />
                            </div>
                        )}

                        {['whatsapp', 'sms', 'call'].includes(config.actionType) && (
                            <div className="prop-group">
                                <label>Teléfono (Dejar vacío para usar Global)</label>
                                <input type="text" value={config.customPhone || ''} onChange={(e) => handleConfigChange('customPhone', e.target.value)} placeholder="Ej: 573123456789" />
                            </div>
                        )}

                        {config.actionType === 'link' && (
                            <div className="prop-group">
                                <label>Enlace URL</label>
                                <input type="text" value={config.link || ''} onChange={(e) => handleConfigChange('link', e.target.value)} />
                            </div>
                        )}

                        <div className="prop-group">
                            <label>Video del Teléfono</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" style={{ flex: 1 }} value={config.phoneVideo || ''} onChange={(e) => handleConfigChange('phoneVideo', e.target.value)} placeholder="URL de video..." />
                                <button className="btn-v4-outline" style={{ padding: '0 10px' }} onClick={() => { setSelectionTarget('phoneVideo'); setIsMediaModalOpen(true); }}><Video size={14} /></button>
                            </div>
                        </div>

                        <div className="prop-grid-2">
                            <div className="prop-group">
                                <label>Color de Fondo</label>
                                <input type="color" value={config.bgColor || '#121212'} onChange={(e) => handleConfigChange('bgColor', e.target.value)} />
                            </div>
                            <div className="prop-group">
                                <label>Color Acento (Botón/Hook)</label>
                                <input type="color" value={config.accentColor || '#e87c7c'} onChange={(e) => handleConfigChange('accentColor', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStyleTab = () => {
        return (
            <div className="settings-section">
                {/* BACKGROUNDS FOR ALL */}
                <div className="section-title"><Palette size={14} /> Fondo</div>
                <div className="prop-group">
                    <label>Tipo de Fondo</label>
                    <select value={config.bgType || 'transparent'} onChange={(e) => handleConfigChange('bgType', e.target.value)}>
                        <option value="transparent">Transparente</option>
                        <option value="color">Color Sólido</option>
                        <option value="gradient">Degradado</option>
                        <option value="image">Imagen</option>
                        <option value="video">Video</option>
                    </select>
                </div>

                {config.bgType === 'color' && (
                    <div className="prop-group">
                        <label>Color</label>
                        <input type="color" value={config.bgColor || '#121212'} onChange={(e) => handleConfigChange('bgColor', e.target.value)} />
                    </div>
                )}

                {(config.bgType === 'image' || config.bgType === 'video') && (
                    <div className="prop-group">
                        <label>URL Multimedia</label>
                        <div className="flex-row">
                            <input type="text" value={config.bgImage || config.bgVideo || config.media_path || ''} onChange={(e) => handleConfigChange(config.media_path ? 'media_path' : (config.bgType === 'video' ? 'bgVideo' : 'bgImage'), e.target.value)} />
                            <button className="btn-small" onClick={() => { 
                                setSelectionTarget(config.media_path ? 'media_path' : (config.bgType === 'video' ? 'bgVideo' : 'bgImage')); 
                                setIsMediaModalOpen(true); 
                            }}>Galería</button>
                        </div>
                    </div>
                )}

                {/* TYPOGRAPHY FOR TEXT ELEMENTS */}
                {(type === 'text' || type === 'heading' || type === 'card-v4') && (
                    <div className="mt-30">
                        <div className="section-title"><Type size={14} /> Colores de Tipografía</div>
                        
                        {(type === 'card-v4') && (
                            <div className="prop-group">
                                <label>Color Número / Label</label>
                                <div className="s-color-picker-row">
                                    <input type="color" value={config.labelColor || '#ff8484'} onChange={(e) => handleConfigChange('labelColor', e.target.value)} />
                                    {renderSystemSwatches('labelColor')}
                                </div>
                            </div>
                        )}

                        <div className="prop-group">
                            <label>{type === 'card-v4' ? 'Color Título' : 'Color de Texto'}</label>
                            <div className="s-color-picker-row">
                                <input type="color" value={config.titleColor || config.textColor || '#ffffff'} onChange={(e) => handleConfigChange(config.titleColor ? 'titleColor' : 'textColor', e.target.value)} />
                                {renderSystemSwatches(config.titleColor ? 'titleColor' : 'textColor')}
                            </div>
                        </div>

                        {type === 'card-v4' && (
                            <div className="prop-group">
                                <label>Color Descripción</label>
                                <div className="s-color-picker-row">
                                    <input type="color" value={config.descColor || '#aaaaaa'} onChange={(e) => handleConfigChange('descColor', e.target.value)} />
                                    {renderSystemSwatches('descColor')}
                                </div>
                            </div>
                        )}

                        <div className="prop-group">
                            <label>Tamaño</label>
                            <input type="text" value={config.fontSize || '16px'} onChange={(e) => handleConfigChange('fontSize', e.target.value)} />
                        </div>
                        
                        <div className="prop-group mt-10">
                            <label><Type size={12} /> Familia Tipográfica {type === 'card-v4' ? '(Título)' : ''}</label>
                            <select value={config.titleFontFamily || config.fontFamily || ''} onChange={(e) => handleConfigChange(type === 'card-v4' ? 'titleFontFamily' : 'fontFamily', e.target.value)}>
                                <option value="">Por defecto del sistema</option>
                                <option value="'Playfair Display', serif">Playfair Display (Premium Serif)</option>
                                <option value="'Outfit', sans-serif">Outfit (Modern sans)</option>
                                <option value="'Inter', sans-serif">Inter (Clean sans)</option>
                                <option value="'Montserrat', sans-serif">Montserrat (Classic sans)</option>
                                <option value="'Cormorant Garamond', serif">Cormorant Garamond (High-end Serif)</option>
                            </select>
                        </div>

                        <div className="prop-group mini mt-5">
                            <label>Grosor (Weight)</label>
                            <select value={config.titleFontWeight || config.fontWeight || '400'} onChange={(e) => handleConfigChange(type === 'card-v4' ? 'titleFontWeight' : 'fontWeight', e.target.value)}>
                                <option value="300">300 - Fino</option>
                                <option value="400">400 - Normal</option>
                                <option value="600">600 - Semi-Bold</option>
                                <option value="700">700 - Bold</option>
                                <option value="900">900 - Black</option>
                            </select>
                        </div>

                        {type === 'card-v4' && (
                            <div className="prop-group mt-15">
                                <label><Type size={12} /> Familia (Descripción)</label>
                                <select value={config.descFontFamily || ''} onChange={(e) => handleConfigChange('descFontFamily', e.target.value)}>
                                    <option value="">Por defecto del sistema</option>
                                    <option value="'Inter', sans-serif">Inter</option>
                                    <option value="'Outfit', sans-serif">Outfit</option>
                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                </select>
                            </div>
                        )}

                        <div className="prop-group mt-15">
                            <label>Alineación Horizontal</label>
                            <select value={config.alignment || config.textAlign || 'left'} onChange={(e) => handleConfigChange(config.alignment ? 'alignment' : 'textAlign', e.target.value)}>
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
                                <option value="right">Derecha</option>
                                {type !== 'card-v4' && <option value="justify">Justificado</option>}
                            </select>
                        </div>
                    </div>
                )}

                {/* CARD SPECIFIC SHAPES & LAYOUTS */}
                {(type === 'card-v4' || type === 'query-grid-v4') && (
                    <div className="mt-30">
                        <div className="section-title"><Layout size={14} /> Estructura de Card</div>
                        <div className="prop-group">
                            <label>Estilo Visual</label>
                            <select value={(type === 'query-grid-v4' ? config.cardStyle?.style : config.style) || ''} onChange={(e) => {
                                if (type === 'query-grid-v4') {
                                    handleConfigChange('cardStyle', { ...config.cardStyle, style: e.target.value });
                                } else {
                                    handleConfigChange('style', e.target.value);
                                }
                            }}>
                                <option value="">Estándar / Transparente</option>
                                <option value="boxed">Editorial Boxed (Premium)</option>
                            </select>
                        </div>
                        <div className="prop-group">
                            <label>Animación de Entrada</label>
                            <select value={(type === 'query-grid-v4' ? config.cardStyle?.animation : config.animation) || ''} onChange={(e) => {
                                if (type === 'query-grid-v4') {
                                    handleConfigChange('cardStyle', { ...config.cardStyle, animation: e.target.value });
                                } else {
                                    handleConfigChange('animation', e.target.value);
                                }
                            }}>
                                <option value="">Sin animación</option>
                                <option value="fade-up">Desvanecer hacia arriba</option>
                                <option value="zoom-in">Zoom suave</option>
                                <option value="slide-in">Entrada lateral</option>
                                <option value="reveal">Revelado elegante</option>
                            </select>
                        </div>
                        <div className="prop-group">
                            <label>Forma de Imagen</label>
                            <select value={(type === 'query-grid-v4' ? config.cardStyle?.shape : config.shape) || 'rounded'} onChange={(e) => {
                                if (type === 'query-grid-v4') {
                                    handleConfigChange('cardStyle', { ...config.cardStyle, shape: e.target.value });
                                } else {
                                    handleConfigChange('shape', e.target.value);
                                }
                            }}>
                                <option value="square">Cuadrada</option>
                                <option value="rounded">Bordes Redondeados</option>
                                <option value="circle">Circular (Premium)</option>
                            </select>
                        </div>
                        <div className="prop-group">
                            <label>Disposición (Layout)</label>
                            <select value={(type === 'query-grid-v4' ? config.cardStyle?.layout : config.layout) || 'vertical'} onChange={(e) => {
                                if (type === 'query-grid-v4') {
                                    handleConfigChange('cardStyle', { ...config.cardStyle, layout: e.target.value });
                                } else {
                                    handleConfigChange('layout', e.target.value);
                                }
                            }}>
                                <option value="vertical">Vertical (Imagen Arriba)</option>
                                <option value="horizontal-left">Horizontal (Imagen Izquierda)</option>
                                <option value="horizontal-right">Horizontal (Imagen Derecha)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* COL-SPECIFIC STYLE */}
                {type === 'col' && (
                    <div className="prop-group mt-20">
                        <label>Ancho (1-12)</label>
                        <input type="range" min="1" max="12" value={activeElement.span || 12} onChange={(e) => updateElement({ ...activeElement, span: parseInt(e.target.value) })} />
                        <div className="text-right text-xxs">{activeElement.span || 12}/12</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="builder-property-panel">
            <div className="panel-header">
                <div className="header-info">
                    <div className="tag">{type.toUpperCase()}</div>
                    <h3>Propiedades</h3>
                </div>
                <button className="btn-close" onClick={onClose}><X size={18} /></button>
            </div>

            {renderTabsNav()}

            <div className="panel-scrollable">
                {activeTab === 'content' && renderContentTab()}
                {activeTab === 'style' && renderStyleTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
            </div>

            <div className="panel-footer-actions">
                <button className="foot-btn" onClick={() => duplicateElement(activeElement.id)} title="Duplicar"><Copy size={16} /></button>
                <button className="foot-btn delete" onClick={() => deleteElement(activeElement.id)} title="Eliminar"><Trash2 size={16} /></button>
            </div>

            <MediaSelectorModal 
                isOpen={isMediaModalOpen}
                type="image"
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(url) => {
                    if (selectionTarget.startsWith('story_img_')) {
                        const idx = parseInt(selectionTarget.replace('story_img_', ''));
                        const newItems = [...config.items];
                        newItems[idx].image = url;
                        handleConfigChange('items', newItems);
                    } else if (selectionTarget.startsWith('gallery_img_')) {
                        const idx = parseInt(selectionTarget.replace('gallery_img_', ''));
                        const newImages = [...(config.images || [])];
                        newImages[idx] = url;
                        handleConfigChange('images', newImages);
                    } else {
                        handleConfigChange(selectionTarget, url);
                    }
                }}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .builder-property-panel { width: 340px; background: #0b0b0b; border-left: 1px solid #1a1a1a; display: flex; flex-direction: column; height: 100%; color: white; box-shadow: -10px 0 30px rgba(0,0,0,0.5); z-index: 1000; }
                .panel-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #151515; }
                .header-info .tag { font-size: 9px; font-weight: 900; color: #ff8484; margin-bottom: 4px; border: 1px solid rgba(255,132,132,0.3); display: inline-block; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
                .header-info h3 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -0.5px; }
                
                .property-tabs-nav { display: flex; background: #050505; border-bottom: 1px solid #1a1a1a; }
                .property-tabs-nav button { flex: 1; padding: 15px 5px; background: transparent; border: none; color: #555; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; transition: 0.2s; border-bottom: 2px solid transparent; }
                .property-tabs-nav button span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .property-tabs-nav button:hover { color: #aaa; background: #0a0a0a; }
                .property-tabs-nav button.active { color: #ff8484; border-bottom-color: #ff8484; background: rgba(255,132,132,0.02); }

                .panel-scrollable { flex: 1; overflow-y: auto; padding: 25px; scrollbar-width: thin; scrollbar-color: #333 #0b0b0b; }
                .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #555; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; letter-spacing: 1px; }
                
                .prop-group { margin-bottom: 20px; }
                .prop-group label { display: block; font-size: 11px; font-weight: 600; color: #777; margin-bottom: 8px; }
                .prop-group input, .prop-group select, .prop-group textarea { width: 100%; background: #151515; border: 1px solid #222; border-radius: 8px; padding: 12px; color: white; font-size: 13px; transition: 0.2s; }
                .prop-group input:focus, .prop-group select:focus, .prop-group textarea:focus { border-color: #ff8484; outline: none; background: #1a1a1a; }
                
                .prop-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                .prop-group.mini { margin-bottom: 10px; }
                .prop-group.mini label { font-size: 9px; text-align: center; margin-bottom: 4px; }
                .prop-group.mini input { padding: 8px 4px; text-align: center; font-size: 11px; }

                .flex-row { display: flex; gap: 8px; }
                .btn-small { background: #222; border: 1px solid #333; color: white; font-size: 10px; font-weight: 700; padding: 0 12px; border-radius: 6px; cursor: pointer; }
                .btn-small:hover { background: #ff8484; color: black; border-color: #ff8484; }
                
                .panel-footer-actions { padding: 15px 25px; background: #050505; border-top: 1px solid #1a1a1a; display: flex; gap: 15px; }
                .foot-btn { flex: 1; background: #151515; border: 1px solid #222; color: #666; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .foot-btn:hover { color: white; border-color: #444; background: #1a1a1a; }
                .foot-btn.delete:hover { border-color: #ff4444; color: #ff4444; }

                .system-swatches { display: flex; gap: 6px; margin-top: 8px; }
                .swatch-circle { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.1); transition: 0.2s; }
                .swatch-circle:hover { transform: scale(1.15); border-color: #ff8484; }

                .prop-row-toggle { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: #151515; padding: 10px 15px; border-radius: 8px; }
                .prop-row-toggle label { font-size: 11px; font-weight: 700; color: #777; margin: 0; }
                .prop-row-toggle input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: #ff8484; }

                .flex-col { display: flex; flex-direction: column; }
                .gap-10 { gap: 10px; }

                .prop-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

                .text-right { text-align: right; }
                .text-xxs { font-size: 9px; opacity: 0.5; }
                .border-t { border-top: 1px solid #222; }
                .pt-20 { padding-top: 20px; }

                .v4-panel-info-box { background: rgba(255,132,132,0.05); border: 1px dashed rgba(255,132,132,0.2); border-radius: 12px; padding: 20px; text-align: center; }
                .v4-panel-info-box .info-icon { color: #ff8484; margin-bottom: 12px; opacity: 0.8; }
                .v4-panel-info-box h4 { font-size: 14px; margin-bottom: 8px; color: #fff; }
                .v4-panel-info-box p { font-size: 12px; color: #777; line-height: 1.5; margin-bottom: 0; }
                .v4-panel-info-box strong { color: #ff8484; }
            `}} />
        </div>
    );
};

export default PropertyPanel;
