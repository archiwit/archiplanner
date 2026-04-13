import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SortableList, { SortableItem } from '../../components/admin/SortableList';
import BlockLibrary from '../../components/admin/BlockLibrary';
import { 
    Plus, Settings, Trash2, Eye, Save, 
    Layers, Layout, Type, Image as ImageIcon, 
    MousePointer, Code, Quote, Video, Briefcase,
    X, Check, ChevronRight, ChevronDown, ChevronUp, Move,
    Upload, FileCheck, Search
} from 'lucide-react';
import { 
    DndContext, 
    useDraggable, 
    useDroppable,
    rectIntersection,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';

const NestedBlockPreview = ({ el, parentId, index, colIndex = null, setEditingBlock, deleteNestedBlock }) => (
    <div className="nested-item-preview" onClick={(e) => {
        e.stopPropagation();
        setEditingBlock({ 
            ...el, 
            isNested: true, 
            parentId: parentId, 
            nestedIndex: index,
            parentColIndex: colIndex
        });
    }}>
        <div className="flex-between w-full">
            <div className="nested-item-tag">{el.tipo}</div>
            <button 
                className="tool-btn delete small" 
                onClick={(e) => {
                    e.stopPropagation();
                    const btn = e.currentTarget;
                    if (btn.classList.contains('confirming')) {
                        deleteNestedBlock(parentId, index, colIndex);
                        btn.classList.remove('confirming');
                    } else {
                        btn.classList.add('confirming');
                        setTimeout(() => btn.classList.remove('confirming'), 3000);
                    }
                }}
            >
                <Trash2 size={10} />
            </button>
        </div>
        <div className="nested-item-label">{el.metadata?.titulo || 'Contenido'}</div>
    </div>
);

const DraggablePaletteItem = ({ comp, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${comp.id}`,
        data: { type: 'NEW_BLOCK', blockType: comp.id }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: isDragging ? 0.5 : 1
    } : undefined;

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`palette-item ${isDragging ? 'is-dragging' : ''}`} 
            onClick={() => onClick(comp.id)}
            {...listeners} 
            {...attributes}
        >
            <div className="item-icon">{comp.icon}</div>
            <div className="item-info">
                <span className="item-label">{comp.label}</span>
                <span className="item-desc">{comp.description}</span>
            </div>
            <Plus size={14} className="item-plus" />
        </div>
    );
};

const DroppableZone = ({ id, children, isOverParent, colIndex = null }) => {
    const droppableId = colIndex !== null ? `zone::${id}::col::${colIndex}` : `zone::${id}`;
    const { setNodeRef, isOver } = useDroppable({
        id: droppableId,
        data: { type: 'ZONE', parentId: id, colIndex: colIndex }
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`inner-drop-zone ${isOver ? 'is-over' : ''} ${children.length === 0 ? 'is-empty' : ''}`}
            style={{ 
                minHeight: '120px', 
                border: isOver ? '2px solid var(--color-primary)' : '2px dashed rgba(255,255,255,0.1)',
                background: isOver ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.02)',
                boxShadow: isOver ? '0 0 30px rgba(212, 175, 55, 0.25)' : 'none',
                zIndex: isOver ? 100 : 1,
                position: 'relative'
            }}
        >
            {children.length === 0 ? (
                <div className="zone-empty-placeholder">
                    <div className="dashed-box">
                        <Plus size={16} className="mb-4 opacity-40" />
                        <span className="text-xxs">Soltar aquí (Col)</span>
                    </div>
                </div>
            ) : (
                <div className="zone-nested-content">
                    {children}
                </div>
            )}
        </div>
    );
};

const DroppableCanvas = ({ sections, editingBlock, setEditingBlock, deleteBlock, deleteNestedBlock, collapsedBlocks, toggleCollapse, onAddSubElement }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-droppable',
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`canvas-viewport ${isOver ? 'is-over' : ''}`}
        >
            <div className="canvas-paper">
                {sections.length === 0 ? (
                    <div className="paper-empty">
                        <Plus size={40} className="mb-20 text-primary" />
                        <h3>Empieza a diseñar</h3>
                        <p>Arrastra un componente de la izquierda al lienzo.</p>
                    </div>
                ) : (
                    <div className="paper-content-stack">
                        {sections.map(section => {
                            let meta = {};
                            try {
                                meta = typeof section.metadata === 'string' ? JSON.parse(section.metadata) : (section.metadata || {});
                            } catch(e) { console.error("Error parsing metadata for section", section.id); }
                            
                            const isSelected = editingBlock?.id === section.id;
                            const isCollapsed = collapsedBlocks[section.id];

                            return (
                                <div 
                                    key={section.id} 
                                    className={`canvas-block-wrapper ${isSelected ? 'is-selected' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setEditingBlock(section); }}
                                >
                                    <div className="block-overlay-tools">
                                        <span className="block-tag">{section.tipo}</span>
                                        <button className="tool-btn" title="Colapsar/Expandir" onClick={(e) => { e.stopPropagation(); toggleCollapse(section.id); }}>
                                            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                        </button>
                                        <button className="tool-btn" title="Ajustes" onClick={(e) => { e.stopPropagation(); setEditingBlock(section); }}><Settings size={12} /></button>
                                        <button 
                                            className="tool-btn delete" 
                                            title="Eliminar (Doble clic)" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const btn = e.currentTarget;
                                                if (btn.classList.contains('confirming')) {
                                                    deleteBlock(section.id);
                                                    btn.classList.remove('confirming');
                                                } else {
                                                    btn.classList.add('confirming');
                                                    setTimeout(() => btn.classList.remove('confirming'), 3000);
                                                }
                                            }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    {isCollapsed ? (
                                        <div className="collapsed-placeholder">
                                            <span className="font-bold">{meta.titulo || section.tipo}</span>
                                            <span className="text-xxs opacity-40 ml-10">Bloque Oculto</span>
                                        </div>
                                    ) : (
                                        <div className="block-preview-placeholder" style={{ 
                                            minHeight: section.tipo === 'CUSTOM_ZONE' ? (meta.estilos?.heightClass === 'full' ? '400px' : '100px') : '100px', 
                                            background: meta.estilos?.bgColor || 'rgba(255,255,255,0.02)',
                                            paddingTop: meta.estilos?.paddingTop || '20px',
                                            paddingBottom: meta.estilos?.paddingBottom || '20px',
                                            display: 'flex',
                                            flexDirection: meta.estilos?.flexDirection || 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '20px'
                                        }}>
                                            {section.tipo === 'CUSTOM_ZONE' ? (
                                                <DroppableZone id={section.id} children={
                                                    (meta.elementos || []).map((el, i) => (
                                                        <NestedBlockPreview key={i} el={el} parentId={section.id} index={i} setEditingBlock={setEditingBlock} deleteNestedBlock={deleteNestedBlock} />
                                                    ))
                                                } />
                                            ) : section.tipo === 'GRID_LAYOUT' || section.tipo === 'COLUMNS_2' || section.tipo === 'COLUMNS_3' ? (
                                                <div className="grid-renderer-wrapper" style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: `repeat(${meta.columnas?.length || 2}, 1fr)`,
                                                    gap: meta.estilos?.gap || '20px',
                                                    width: '100%'
                                                }}>
                                                    {(meta.columnas || [ { elementos: [] }, { elementos: [] } ]).map((col, colIdx) => (
                                                        <DroppableZone key={colIdx} id={section.id} colIndex={colIdx} children={
                                                            (col.elementos || []).map((el, i) => (
                                                                <NestedBlockPreview key={i} el={el} parentId={section.id} index={i} colIndex={colIdx} setEditingBlock={setEditingBlock} deleteNestedBlock={deleteNestedBlock} />
                                                            ))
                                                        } />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="placeholder-content">
                                                    <h4 style={{ color: meta.estilos?.textColor }}>{meta.titulo || section.tipo}</h4>
                                                    <p className="text-xxs opacity-30">Haz clic para editar propiedades</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

import { COMPONENT_REGISTRY, CATEGORIES } from '../../components/admin/ComponentRegistry.jsx';

const AdminBlockEditor = () => {
    const [pages, setPages] = useState(['home', 'servicios', 'galeria', 'nosotros', 'contacto']);
    const [currentPage, setCurrentPage] = useState('home');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBlock, setEditingBlock] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showNavigator, setShowNavigator] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [collapsedBlocks, setCollapsedBlocks] = useState({});
    const [isCreatingPage, setIsCreatingPage] = useState(false);
    const [newPageName, setNewPageName] = useState('');

    const toggleCollapse = (id) => {
        setCollapsedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
    };


    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        fetchSections();
    }, [currentPage]);

    const fetchPages = async () => {
        try {
            const res = await api.get('/paginas');
            setPages(res.data);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
    };

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/secciones/${currentPage}`);
            const dataWithIds = res.data.map((s, idx) => ({
                ...s,
                id: s.id ? s.id.toString() : `temp-${idx}`
            }));
            setSections(dataWithIds);
        } catch (err) {
            console.error('Error fetching sections:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (newItems) => {
        setSections(newItems);
        try {
            await api.put(`/secciones/reorder`, { 
                pagina: currentPage,
                secciones: newItems.map((s, idx) => ({ id: s.id, orden: idx + 1 }))
            });
        } catch (err) {
            console.error('Error reordering sections:', err);
        }
    };

    const addBlock = (type) => {
        const comp = COMPONENT_REGISTRY.find(c => c.id === type);
        let metadata = JSON.parse(JSON.stringify(comp?.defaultMetadata || { 
            titulo: `Nuevo ${type}`, 
            estilos: { paddingTop: '80px', paddingBottom: '80px' } 
        }));

        const newId = `new-${Date.now()}`;
        const newBlock = {
            id: newId,
            pagina: currentPage,
            tipo: type,
            activo: 1,
            metadata: JSON.stringify(metadata),
            orden: sections.length + 1 // Use current length for order
        };
        
        setSections(prev => [...prev, newBlock]);
        setEditingBlock(newBlock);
    };

    const saveBlock = async (block) => {
        setIsSaving(true);
        console.log('Builder: Intentando guardar bloque...', { id: block.id, tipo: block.tipo });
        
        try {
            const formData = new FormData();
            formData.append('tipo', block.tipo);
            formData.append('activo', block.activo || 1);
            formData.append('orden', block.orden || sections.length);
            
            // Ensure metadata is a clean string
            const metaToSave = typeof block.metadata === 'string' ? block.metadata : JSON.stringify(block.metadata);
            formData.append('metadata', metaToSave);
            
            if (selectedFile) {
                formData.append('media_file', selectedFile);
            }

            let response;
            if (block.id.toString().startsWith('new-')) {
                formData.append('pagina', currentPage);
                response = await api.post('/secciones', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('Builder: Bloque nuevo guardado. Respuesta:', response.data);
            } else {
                response = await api.put(`/secciones/${block.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('Builder: Bloque existente actualizado. Respuesta:', response.data);
            }

            // OPTIMISTIC SYNC: Instead of full fetch, we update the local state with returned data
            const savedData = response.data;
            if (savedData && savedData.id) {
                const refreshedBlock = {
                    ...savedData,
                    id: savedData.id.toString(), // Ensure string ID
                    // Backend returns metadata as object or string depending on version, normalize here:
                    metadata: typeof savedData.metadata === 'string' ? savedData.metadata : JSON.stringify(savedData.metadata)
                };

                setSections(prev => {
                    const exists = prev.find(s => s.id === block.id);
                    if (exists) {
                        return prev.map(s => s.id === block.id ? refreshedBlock : s);
                    } else {
                        return [...prev, refreshedBlock];
                    }
                });
            } else {
                // Fallback to fetch if response is unexpected
                fetchSections();
            }

            setSelectedFile(null);
            setEditingBlock(null);
            alert('¡Cambios aplicados con éxito!');
        } catch (err) {
            console.error('Error saving block:', err);
            alert('Error al guardar: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const deleteBlock = async (id) => {
        // Confirmation is now handled by the UI button (double click)
        try {
            if (!id.toString().startsWith('new-')) {
                await api.delete(`/secciones/${id}`);
            }
            setSections(prev => prev.filter(s => s.id.toString() !== id.toString()));
            if (editingBlock?.id?.toString() === id.toString()) setEditingBlock(null);
        } catch (err) {
            console.error('Error deleting block:', err);
            alert('Error al eliminar bloque basal');
        }
    };

    const deleteNestedBlock = (parentId, nestedIndex, colIndex = null) => {
        // Confirmation is now handled by the UI button (double click)
        
        const parent = sections.find(s => s.id.toString() === parentId.toString());
        if (!parent) return;

        const m = typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata;
        const updatedMeta = { ...m };

        if (colIndex !== null) {
            const newCols = [...(m.columnas || [])];
            newCols[colIndex].elementos = (newCols[colIndex].elementos || []).filter((_, i) => i !== nestedIndex);
            updatedMeta.columnas = newCols;
        } else {
            const newElements = (m.elementos || []).filter((_, i) => i !== nestedIndex);
            updatedMeta.elementos = newElements;
        }

        const updatedParent = { ...parent, metadata: JSON.stringify(updatedMeta) };
        setSections(prev => prev.map(s => s.id === parentId ? updatedParent : s));
        
        if (editingBlock?.parentId === parentId && editingBlock?.nestedIndex === nestedIndex) {
            setEditingBlock(null);
        }
        
        alert('Componente anidado marcado para eliminar. Pulsa "Aplicar Cambios" en el área principal para persistir.');
    };

    const updateNestedBlock = (updatedNested) => {
        const { parentId, nestedIndex, parentColIndex } = updatedNested;
        
        setSections(prev => prev.map(parent => {
            if (parent.id.toString() !== parentId.toString()) return parent;

            const m = typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : (parent.metadata || {});
            const updatedMeta = { ...m };

            if (parentColIndex !== null) {
                const newCols = [...(m.columnas || [])];
                newCols[parentColIndex].elementos = [...(newCols[parentColIndex].elementos || [])];
                newCols[parentColIndex].elementos[nestedIndex] = { 
                    tipo: updatedNested.tipo, 
                    metadata: updatedNested.metadata 
                };
                updatedMeta.columnas = newCols;
            } else {
                const newElements = [...(m.elementos || [])];
                newElements[nestedIndex] = { 
                    tipo: updatedNested.tipo, 
                    metadata: updatedNested.metadata 
                };
                updatedMeta.elementos = newElements;
            }

            return { ...parent, metadata: JSON.stringify(updatedMeta) };
        }));
        
        setEditingBlock(updatedNested);
    };

    const filteredComponents = COMPONENT_REGISTRY.filter(c => {
        const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.data.current?.type === 'NEW_BLOCK') {
            const blockType = active.data.current.blockType;
            const overId = over.id.toString();
            
            if (overId.startsWith('zone::')) {
                const parts = overId.split('::');
                const parentId = parts[1];
                const colIndex = parts.includes('col') ? parseInt(parts[parts.indexOf('col') + 1]) : null;
                console.log('Builder: Agregando anidado a:', parentId, 'Col:', colIndex);
                addNestedBlock(parentId, blockType, colIndex);
            } else {
                addBlock(blockType);
            }
        }
    };

    const addNestedBlock = (parentId, type, colIndex = null) => {
        const comp = COMPONENT_REGISTRY.find(c => c.id === type);
        const metadata = JSON.parse(JSON.stringify(comp?.defaultMetadata || { titulo: `Nuevo ${type}`, estilos: {} }));

        const newNestedBlock = { 
            id: `nested-${Date.now()}`, 
            tipo: type, 
            metadata: metadata 
        };

        setSections(prev => {
            let parentToUpdate = null;
            const updatedSections = prev.map(s => {
                if (s.id.toString() !== parentId.toString()) return s;

                const m = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                let updatedMeta;

                if (colIndex !== null) {
                    const newCols = [...(m.columnas || [ { elementos: [] }, { elementos: [] } ])];
                    newCols[colIndex].elementos = [...(newCols[colIndex].elementos || []), newNestedBlock];
                    updatedMeta = { ...m, columnas: newCols };
                } else {
                    const newElements = [...(m.elementos || []), newNestedBlock];
                    updatedMeta = { ...m, elementos: newElements };
                }
                
                parentToUpdate = { ...s, metadata: JSON.stringify(updatedMeta) };
                return parentToUpdate;
            });

            // Persistencia inmediata para evitar pérdida de datos en anidados
            if (parentToUpdate && !parentToUpdate.id.startsWith('new-')) {
                setTimeout(() => saveBlock(parentToUpdate), 100);
            }

            return updatedSections;
        });

        // Effect after state update is queued for UI focus
        setTimeout(() => {
            setEditingBlock({ 
                ...newNestedBlock, 
                isNested: true, 
                parentId: parentId, 
                nestedIndex: 999, // We'll find it by ID in property panel if needed, but 999 is placeholder for "last"
                parentColIndex: colIndex
            });
        }, 200);
    };

    if (loading) return (
        <div className="admin-loader-container">
            <div className="spinner-loader grow"></div>
            <p>ArchiPlanner Master Builder V3 - Cargando...</p>
        </div>
    );

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={rectIntersection} 
            onDragEnd={handleDragEnd}
        >
            <div className={`master-builder-v3 ${isPreviewMode ? 'preview-mode' : ''} ${editingBlock ? 'has-properties' : ''}`}>
                {/* Sidebar Izquierda: Paleta de Componentes */}
                {!isPreviewMode && (
                    <div className="builder-palette-sidebar">
                        <div className="palette-header">
                            <div className="page-management-box">
                                <div className="selector-row">
                                    <select value={currentPage} onChange={(e) => setCurrentPage(e.target.value)}>
                                        {pages.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                    </select>
                                    <button className="icon-btn delete" onClick={async () => {
                                        if (currentPage === 'home') return alert('Home no se borra');
                                        if (window.confirm(`Eliminar toda la página "${currentPage}"?`)) {
                                            try { await api.delete(`/paginas/${currentPage}`); setPages(pages.filter(p => p !== currentPage)); setCurrentPage('home'); } catch(e) {}
                                        }
                                    }}><Trash2 size={14} /></button>
                                </div>
                                
                                {isCreatingPage ? (
                                    <div className="new-page-inline">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            placeholder="nuevo-slug" 
                                            value={newPageName}
                                            onChange={(e) => setNewPageName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && newPageName) {
                                                    try {
                                                        await api.post('/paginas', { slug: newPageName });
                                                        setPages(prev => [...prev, newPageName]);
                                                        setCurrentPage(newPageName);
                                                        setNewPageName('');
                                                        setIsCreatingPage(false);
                                                    } catch (err) { alert('Error al crear página'); }
                                                } else if (e.key === 'Escape') setIsCreatingPage(false);
                                            }}
                                        />
                                        <button onClick={async () => {
                                            if (!newPageName) return setIsCreatingPage(false);
                                            try {
                                                await api.post('/paginas', { slug: newPageName });
                                                setPages(prev => [...prev, newPageName]);
                                                setCurrentPage(newPageName);
                                                setNewPageName('');
                                                setIsCreatingPage(false);
                                            } catch (err) { alert('Error'); }
                                        }}>OK</button>
                                    </div>
                                ) : (
                                    <button className="btn-add-page" onClick={() => setIsCreatingPage(true)}>
                                        <Plus size={12} /> Nueva Página
                                    </button>
                                )}
                            </div>

                            <div className="search-palette">
                                <Search size={14} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar componente..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="category-grid">
                                <button className={`cat-btn ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>All</button>
                                {CATEGORIES.map(cat => (
                                    <button key={cat} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="palette-items-scrollable">
                            {filteredComponents.map(comp => (
                                <DraggablePaletteItem 
                                    key={comp.id} 
                                    comp={comp} 
                                    onClick={addBlock} 
                                />
                            ))}
                        </div>

                        <div className="palette-footer">
                            <button className="btn-navigator" onClick={() => setShowNavigator(true)}>
                                <Layers size={14} /> Navegador
                            </button>
                        </div>
                    </div>
                )}

                {/* AREA CENTRAL: Visual Canvas Workspace */}
                <div className="builder-workspace-canvas">
                    <div className="canvas-top-bar">
                        <div className="workspace-info">
                            <Layers size={18} className="text-primary mr-8" />
                            <h2>Página: <span className="text-white">{currentPage.toUpperCase()}</span></h2>
                        </div>
                        <div className="workspace-tools">
                            <button className="btn-tool" onClick={() => setShowNavigator(!showNavigator)}>
                                <Move size={16} /> Estructura
                            </button>
                            <button className={`btn-tool ${isPreviewMode ? 'active' : ''}`} onClick={() => setIsPreviewMode(!isPreviewMode)}>
                                {isPreviewMode ? <Settings size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <DroppableCanvas 
                        sections={sections} 
                        editingBlock={editingBlock}
                        setEditingBlock={setEditingBlock}
                        deleteBlock={deleteBlock}
                        deleteNestedBlock={deleteNestedBlock}
                        collapsedBlocks={collapsedBlocks}
                        toggleCollapse={toggleCollapse}
                        onAddSubElement={(section, type) => {
                            const m = typeof section.metadata === 'string' ? JSON.parse(section.metadata) : section.metadata;
                            const newElements = [...(m.elementos || []), { tipo: type, content: 'Nuevo Contenido', width: '1' }];
                            saveBlock({ ...section, metadata: JSON.stringify({ ...m, elementos: newElements }) });
                        }}
                    />
                </div>

            {/* FLOATING NAVIGATOR OVERLAY */}
            {showNavigator && (
                <div className="navigator-overlay">
                    <div className="navigator-panel slide-in-top">
                        <div className="panel-header">
                            <h3>Navegador de Capas</h3>
                            <button onClick={() => setShowNavigator(false)}><X size={18} /></button>
                        </div>
                        <div className="panel-body">
                            <SortableList items={sections} onReorder={handleReorder}>
                                {sections.map(s => {
                                    const m = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata;
                                    return (
                                        <SortableItem key={s.id} id={s.id} className="nav-item">
                                            <div className="nav-handle"><Move size={14} /></div>
                                            <div className="nav-info">
                                                <span className="nav-title">{m.titulo || s.tipo}</span>
                                                <span className="nav-type">{s.tipo}</span>
                                            </div>
                                            <button className="nav-del" onClick={() => deleteBlock(s.id)}><Trash2 size={12} /></button>
                                        </SortableItem>
                                    );
                                })}
                            </SortableList>
                        </div>
                        <div className="panel-footer">
                            <p className="text-xxs">Arrastra para reordenar las secciones en la página.</p>
                        </div>
                    </div>
                </div>
            )}


            {/* Sidebar Derecho: Atributos */}
            {editingBlock && (
                <div className="builder-sidebar-right fade-in-right">
                    <div className="property-header">
                        <div className="flex-between">
                            <h3>Ajustes de Bloque</h3>
                            <button className="icon-close" onClick={() => setEditingBlock(null)}><X size={20} /></button>
                        </div>
                        <div className="block-type-preview">
                            <span className="text-dim">Tipo:</span>
                            <span className="text-primary font-bold ml-8">{editingBlock.tipo}</span>
                        </div>
                    </div>
                    
                    <div className="property-body">
                        <BlockAttributeEditor 
                            block={editingBlock} 
                            onChange={(updated) => {
                                if (editingBlock.isNested) {
                                    updateNestedBlock(updated);
                                } else {
                                    setEditingBlock(updated);
                                }
                            }} 
                            onFileSelect={(file) => setSelectedFile(file)}
                            selectedFile={selectedFile}
                        />
                    </div>

                    <div className="property-footer">
                        <button 
                            className="btn-save-block" 
                            onClick={async () => {
                                if (editingBlock.isNested) {
                                    // For nested blocks, we save the entire parent
                                    const parent = sections.find(s => s.id === editingBlock.parentId);
                                    await saveBlock(parent);
                                } else {
                                    await saveBlock(editingBlock);
                                }
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="spinner-loader"></div>
                            ) : (
                                <><Save size={18} /> Aplicar Cambios</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .master-builder-v3 {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    height: calc(100vh - 64px);
                    background: #050505;
                    overflow: hidden;
                    margin: -12px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Inter', sans-serif;
                }
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                .master-builder-v3.has-properties {
                    grid-template-columns: 320px 1fr 340px;
                }
                .master-builder-v3.preview-mode {
                    grid-template-columns: 1fr;
                }

                /* PALETTE SIDEBAR */
                .builder-palette-sidebar {
                    background: #0a0a0a;
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    z-index: 100;
                }
                .palette-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .palette-header h3 { font-size: 14px; color: var(--color-primary); margin: 0; letter-spacing: 1px; text-transform: uppercase; }
                .palette-title-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .btn-new-page { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 4px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
                .btn-new-page:hover { background: var(--color-primary); color: #000; }
                .page-selector-minimal select {
                    width: 100%;
                    background: #151515;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 8px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                }
                .search-palette { position: relative; }
                .search-palette .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: 0.3; }
                .search-palette input {
                    width: 100%;
                    background: #151515;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 10px 10px 10px 32px;
                    border-radius: 6px;
                    font-size: 13px;
                }
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 6px;
                    margin-top: 15px;
                }
                .cat-btn {
                    background: #111;
                    border: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.4);
                    padding: 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    text-transform: uppercase;
                }
                .cat-btn.active {
                    background: var(--color-primary-dim);
                    color: white;
                    border-color: var(--color-primary);
                }

                .palette-items-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .palette-item {
                    background: #121212;
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: grab;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .palette-item:hover {
                    background: #1a1a1a;
                    border-color: var(--color-primary-dim);
                    transform: translateX(4px);
                }
                .palette-item .item-icon {
                    width: 32px;
                    height: 32px;
                    background: rgba(212, 175, 55, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                }
                .palette-item .item-info {
                    flex: 1;
                }
                .palette-item .item-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: white;
                }
                .palette-item .item-desc {
                    display: block;
                    font-size: 10px;
                    color: rgba(255,255,255,0.4);
                }
                .palette-item .item-plus {
                    color: rgba(255,255,255,0.2);
                }

                /* CANVAS AREA */
                .builder-workspace-canvas {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    background: #080808;
                    position: relative;
                }
                .canvas-top-bar {
                    padding: 15px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    background: rgba(5,5,5,0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }
                .canvas-viewport {
                    flex: 1;
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                    background: radial-gradient(circle at 50% 50%, #111 0%, #050505 100%);
                }
                .canvas-viewport.is-over {
                    background: rgba(212, 175, 55, 0.05);
                    box-shadow: inset 0 0 100px rgba(212, 175, 55, 0.1);
                }

                /* NESTED DROP ZONES */
                .inner-drop-zone {
                    width: 100%;
                    min-height: 80px;
                    border: 2px dashed rgba(255,255,255,0.03);
                    border-radius: 8px;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: flex-start;
                    background: rgba(0,0,0,0.1);
                    padding: 4px;
                }
                .inner-drop-zone.is-over {
                    border-color: var(--color-primary);
                    background: rgba(212, 175, 55, 0.05);
                }
                .zone-empty-placeholder {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nested-item-preview {
                    background: #111;
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 10px;
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nested-item-preview:hover {
                    border-color: var(--color-primary);
                    background: #151515;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .nested-item-tag {
                    align-self: flex-start;
                    font-size: 7px;
                    font-weight: 800;
                    background: #222;
                    color: rgba(255,255,255,0.5);
                    padding: 1px 4px;
                    border-radius: 2px;
                    text-transform: uppercase;
                }
                .nested-item-label { font-size: 10px; color: white; font-weight: 500; }
                .grid-renderer-wrapper { padding: 10px; }
                .canvas-paper {
                    width: 100%;
                    max-width: 1200px;
                    min-height: 800px;
                    background: #111;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }
                .canvas-block-wrapper {
                    position: relative;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                .canvas-block-wrapper:hover {
                    border-color: rgba(212, 175, 55, 0.3);
                }
                .canvas-block-wrapper.is-selected {
                    border-color: var(--color-primary);
                }
                .block-overlay-tools {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    gap: 5px;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 20;
                }
                .canvas-block-wrapper:hover .block-overlay-tools {
                    opacity: 1;
                    pointer-events: auto;
                }
                .block-tag {
                    background: var(--color-primary);
                    color: #000;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 3px;
                    text-transform: uppercase;
                }
                .tool-btn {
                    width: 24px;
                    height: 24px;
                    background: #222;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-management-box { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .selector-row { display: flex; gap: 5px; margin-bottom: 8px; }
                .selector-row select { 
                    flex: 1; background: #1a1a1a; border: 1px solid #333; color: white; 
                    border-radius: 4px; padding: 5px; font-size: 12px; outline: none;
                }
                .selector-row select:focus { border-color: var(--color-primary); }
                .icon-btn.delete { 
                    background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); 
                    border-radius: 4px; padding: 5px; display: flex; align-items: center; cursor: pointer;
                }
                .icon-btn.delete:hover { background: #e74c3c; color: white; }
                
                .btn-add-page { 
                    width: 100%; border: 1px dashed #444; background: transparent; color: #888; 
                    border-radius: 4px; padding: 6px; font-size: 11px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                    transition: all 0.2s;
                }
                .btn-add-page:hover { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,132,132,0.05); }

                .new-page-inline { display: flex; gap: 5px; }
                .new-page-inline input { 
                    flex: 1; background: #000; border: 1px solid var(--color-primary); 
                    color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;
                }
                .new-page-inline button { 
                    background: var(--color-primary); color: #000; border: none; 
                    border-radius: 4px; padding: 0 10px; font-size: 10px; font-weight: bold; cursor: pointer;
                }

                .tool-btn:hover { background: #333; color: var(--color-primary); }
                .tool-btn.delete:hover { background: #e74c3c; color: white; }
                .tool-btn.delete.confirming { 
                    background: #f39c12 !important; 
                    color: white !important;
                    animation: pulse-warn 0.8s infinite;
                }
                @keyframes pulse-warn {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .tool-btn.small { width: 18px; height: 18px; border-radius: 3px; }

                /* INTERACTIVE CANVAS ENHANCEMENTS */
                .canvas-block-wrapper.is-collapsed {
                    min-height: 40px !important;
                    margin-bottom: 5px;
                }
                .collapsed-placeholder {
                    padding: 10px 20px;
                    background: #151515;
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                    color: rgba(255,255,255,0.6);
                }
                .zone-empty-state {
                    text-align: center;
                    padding: 30px;
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 8px;
                    background: rgba(0,0,0,0.2);
                }
                .btn-add-inner {
                    background: var(--color-primary);
                    color: #000;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    margin: 0 auto;
                }
                .sub-elements-preview {
                    display: flex;
                    gap: 5px;
                    margin-top: 10px;
                    justify-content: center;
                }
                .sub-item-chip {
                    font-size: 9px;
                    background: rgba(255,255,255,0.05);
                    padding: 2px 6px;
                    border-radius: 3px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                /* SIDEPANEL RIGHT (PROPERTIES) */
                /* PRO-STYLE SIDEPANEL RIGHT (ELEMENTOR INSPIRED) */
                .builder-sidebar-right {
                    background: #0a0a0a;
                    border-left: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 64px);
                    position: sticky;
                    top: 0;
                    box-shadow: -10px 0 30px rgba(0,0,0,0.3);
                }
                .property-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    flex-shrink: 0;
                }
                .property-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    padding-bottom: 100px; /* Space for sticky footer */
                }
                .property-footer {
                    padding: 24px 20px;
                    background: #111;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    z-index: 100;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
                    flex-shrink: 0;
                    margin-top: auto;
                    display: flex;
                    gap: 10px;
                }
                
                .attribute-editor-v3 {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .v3-pill-group {
                    display: flex;
                    background: #111;
                    padding: 4px;
                    border-radius: 8px;
                    gap: 2px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .v3-pill-btn {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.3);
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .v3-pill-btn.active {
                    background: var(--color-primary-dim);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }
                .v3-pill-btn:hover:not(.active) {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }

                /* INTERNAL ADDERS STYLING */
                .btn-add-field {
                    flex: 1;
                    background: #0d0d0d;
                    border: 1px dashed rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.4);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s;
                }
                .btn-add-field:hover {
                    border-color: var(--color-primary);
                    background: rgba(212, 175, 55, 0.03);
                    color: var(--color-primary);
                }

                .prop-group label {
                    display: block;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 8px;
                }
                .v3-input {
                    width: 100%;
                    background: #151515;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 10px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-family: inherit;
                }
                .v3-input:focus {
                    border-color: var(--color-primary);
                    outline: none;
                    background: #1a1a1a;
                }
                .prop_flex_row { display: flex; gap: 10px; align-items: center; }
                .prop-section-divider {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--color-primary);
                    margin-top: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                }
                .btn-save-block {
                    width: 100%;
                    background: var(--color-primary);
                    color: #000;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                }

                /* NAVIGATOR OVERLAY */
                .navigator-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .navigator-panel {
                    width: 400px;
                    background: #111;
                    border: 1px solid var(--color-primary-dim);
                    border-radius: 12px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                }
                .panel-header {
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .nav-item {
                    background: #181818;
                    border: 1px solid rgba(255,255,255,0.05);
                    margin-bottom: 5px;
                    padding: 10px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .nav-handle { cursor: grab; color: rgba(255,255,255,0.3); }
                .nav-info { flex: 1; }
                .nav-title { display: block; font-size: 12px; font-weight: 600; color: white; }
                .nav-type { font-size: 10px; color: rgba(255,255,255,0.3); }
                .nav-del { background: transparent; border: none; color: rgba(255,255,255,0.2); cursor: pointer; }
                .nav-del:hover { color: #e74c3c; }
                
                /* FORM SPECIFIC CLASSES */
                .form-field-card {
                    background: #151515;
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    position: relative;
                }
                .field-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; }
                .btn-add-field {
                    background: rgba(255,255,255,0.05);
                    border: 1px dashed rgba(255,255,255,0.2);
                    color: white;
                    width: 100%;
                    padding: 10px;
                    font-size: 11px;
                    cursor: pointer;
                    border-radius: 6px;
                    margin-top: 10px;
                }
                .btn-add-field:hover { background: rgba(255,255,255,0.1); border-color: var(--color-primary); }
                
                .text-primary { color: var(--color-primary); }
                .text-dim { color: rgba(255,255,255,0.4); }
                .text-xs { font-size: 11px; }
                .text-xxs { font-size: 9px; }
                .font-bold { font-weight: 700; }
                .mb-20 { margin-bottom: 20px; }
                .flex-row { display: flex; flex-direction: row; }
                .gap-5 { gap: 5px; }

                /* ANIMATIONS */
                @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fade-in-right { animation: fadeInRight 0.4s ease forwards; }
            `}} />
        </div>
        </DndContext>
    );
};


const BlockAttributeEditor = ({ block, onChange, onFileSelect, selectedFile }) => {
    const getSafeMeta = (m) => {
        if (!m) return {};
        if (typeof m === 'object') return m;
        try { return JSON.parse(m); } catch (e) { return {}; }
    };
    const meta = getSafeMeta(block.metadata);

    const updateMeta = (field, value) => {
        const newMeta = { ...meta, [field]: value };
        onChange({ ...block, metadata: JSON.stringify(newMeta) });
    };

    const updateStyle = (styleField, value) => {
        const newStyles = { ...(meta.estilos || {}), [styleField]: value };
        updateMeta('estilos', newStyles);
    };

    return (
        <div className="attribute-editor-v3">
            <div className="prop-group">
                <label>Identificador Interno</label>
                <input 
                    className="v3-input"
                    type="text" 
                    value={meta.titulo || ''} 
                    onChange={(e) => updateMeta('titulo', e.target.value)}
                    placeholder="ej: Hero Principal..."
                />
            </div>

            {/* CONFIGURACION DE LAYOUT (NUEVO) */}
            <div className="prop-section-divider">Layout & Estructura</div>
            
            <div className="prop-grid-2">
                <div className="prop-group">
                    <label>Ancho de Contenedor</label>
                    <select className="v3-input" value={meta.ancho_total ? 'full' : 'framed'} onChange={e => updateMeta('ancho_total', e.target.value === 'full')}>
                        <option value="full">Pantalla Total (100%)</option>
                        <option value="framed">Enmarcado (Max-Width)</option>
                    </select>
                </div>
                <div className="prop-group">
                    <label>Altura Recomendada</label>
                    <select className="v3-input" value={meta.estilos?.heightClass || 'm'} onChange={e => updateStyle('heightClass', e.target.value)}>
                        <option value="xs">Extra Pequeño</option>
                        <option value="s">Pequeño</option>
                        <option value="m">Mediano (Default)</option>
                        <option value="l">Grande</option>
                        <option value="xl">Extra Grande</option>
                        <option value="full">Ocupar Pantalla (100vh)</option>
                    </select>
                </div>
            </div>


            {/* SELECCION DE COLUMNAS (GRID) */}
            {(block.tipo === 'GRID_LAYOUT' || block.tipo?.startsWith('COLUMNS')) && (
                <>
                    <div className="prop-group">
                        <label>Estructura de Columnas</label>
                        <div className="v3-pill-group">
                            {[1, 2, 3, 4].map(num => (
                                <button 
                                    key={num}
                                    className={`v3-pill-btn ${ (meta.columnas?.length || (meta.elementos ? 1 : 2)) === num ? 'active' : ''}`}
                                    onClick={() => {
                                        const currentCols = meta.columnas || (meta.elementos ? [{ elementos: meta.elementos }] : [ { elementos: [] }, { elementos: [] } ]);
                                        let newCols = [...currentCols];
                                        
                                        if (num > currentCols.length) {
                                            for(let i=currentCols.length; i<num; i++) newCols.push({ elementos: [] });
                                        } else {
                                            newCols = newCols.slice(0, num);
                                        }
                                        
                                        const updatedMeta = { ...meta, columnas: newCols };
                                        delete updatedMeta.elementos; 
                                        onChange({ ...block, metadata: JSON.stringify(updatedMeta) });
                                    }}
                                >
                                    {num} Col
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="prop-group">
                        <label>Dirección de Columnas</label>
                        <div className="v3-pill-group">
                            <button 
                                className={`v3-pill-btn ${ (meta.estilos?.gridDirection || 'row') === 'row' ? 'active' : ''}`}
                                onClick={() => updateStyle('gridDirection', 'row')}
                            >
                                Horizontal
                            </button>
                            <button 
                                className={`v3-pill-btn ${ meta.estilos?.gridDirection === 'column' ? 'active' : ''}`}
                                onClick={() => updateStyle('gridDirection', 'column')}
                            >
                                Vertical
                            </button>
                        </div>
                    </div>
                </>
            )}

            {block.tipo === 'CUSTOM_ZONE' && (
                <div className="prop-group">
                    <label>Distribución (Flex)</label>
                    <div className="v3-pill-group">
                        <button 
                            className={`v3-pill-btn ${meta.estilos?.flexDirection === 'row' ? 'active' : ''}`} 
                            onClick={() => updateStyle('flexDirection', 'row')}
                        >Horizontal</button>
                        <button 
                            className={`v3-pill-btn ${meta.estilos?.flexDirection === 'column' ? 'active' : ''}`} 
                            onClick={() => updateStyle('flexDirection', 'column')}
                        >Vertical</button>
                    </div>
                </div>
            )}

            {/* CAMPOS DINAMICOS SEGUN TIPO */}
            <div className="prop-section-divider">Contenido del Módulo</div>

            {(block.tipo === 'HERO_MODERN' || block.tipo === 'TITLE' || block.tipo === 'CTA') && (
                <>
                    <div className="prop-group">
                        <label>Subtítulo / Tag</label>
                        <input className="v3-input" type="text" value={meta.subtitulo || ''} onChange={(e) => updateMeta('subtitulo', e.target.value)} />
                    </div>
                    <div className="prop-group">
                        <label>Título H1 / Principal</label>
                        <input className="v3-input" type="text" value={meta.titulo_h1 || meta.titulo || ''} onChange={(e) => updateMeta('titulo_h1', e.target.value)} />
                    </div>
                    {block.tipo === 'CTA' && (
                        <div className="prop-group">
                            <label>Texto del Botón</label>
                            <input className="v3-input" type="text" value={meta.texto_boton || ''} onChange={(e) => updateMeta('texto_boton', e.target.value)} />
                        </div>
                    )}
                </>
            )}

            {block.tipo === 'CUSTOM_ZONE' && (
                <div className="prop-group">
                    <label>Elementos de la Zona</label>
                    <div className="sub-elements-list">
                        {(meta.elementos || []).map((el, index) => (
                            <div key={index} className="form-field-card">
                                <div className="field-header">
                                    <span className="text-primary font-bold">{el.tipo} #{index+1}</span>
                                    <button className="nav-del" onClick={() => {
                                        const newElements = meta.elementos.filter((_, i) => i !== index);
                                        updateMeta('elementos', newElements);
                                    }}><X size={14} /></button>
                                </div>
                                <div className="attribute-editor-v3" style={{ gap: '10px' }}>
                                    {el.tipo === 'HTML' && (
                                        <textarea 
                                            className="v3-input" 
                                            placeholder="Contenido HTML..." 
                                            value={el.content} 
                                            onChange={(e) => {
                                                const newElements = [...meta.elementos];
                                                newElements[index] = { ...newElements[index], content: e.target.value };
                                                updateMeta('elementos', newElements);
                                            }} 
                                        />
                                    )}
                                    {el.tipo === 'IMAGE' && (
                                        <input 
                                            className="v3-input" 
                                            placeholder="Ruta Imagen / URL" 
                                            value={el.media_path} 
                                            onChange={(e) => {
                                                const newElements = [...meta.elementos];
                                                newElements[index] = { ...newElements[index], media_path: e.target.value };
                                                updateMeta('elementos', newElements);
                                            }} 
                                        />
                                    )}
                                    <div className="prop_flex_row">
                                        <label className="text-xxs">Ancho Relativo</label>
                                        <select 
                                            className="v3-input" 
                                            value={el.width} 
                                            onChange={(e) => {
                                                const newElements = [...meta.elementos];
                                                newElements[index] = { ...newElements[index], width: e.target.value };
                                                updateMeta('elementos', newElements);
                                            }}
                                        >
                                            <option value="1">100% (Ancho Total)</option>
                                            <option value="1/2">50% (Media Columna)</option>
                                            <option value="1/3">33% (Un tercio)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-row gap-5" style={{ marginTop: '10px' }}>
                        <button className="btn-add-field" onClick={() => {
                            const newElements = [...(meta.elementos || []), { tipo: 'HTML', content: 'Nuevo Texto', width: '1' }];
                            updateMeta('elementos', newElements);
                        }}><Plus size={12} /> HTML</button>
                        <button className="btn-add-field" onClick={() => {
                            const newElements = [...(meta.elementos || []), { tipo: 'IMAGE', media_path: '', width: '1/2' }];
                            updateMeta('elementos', newElements);
                        }}><Plus size={12} /> Imagen</button>
                    </div>
                </div>
            )}

            {block.tipo === 'FORM' && (
                <div className="prop-group">
                    <label>Gestión de Campos</label>
                    <div className="form-fields-list">
                        {(meta.campos || []).map((field, index) => (
                            <div key={field.id || index} className="form-field-card">
                                <div className="field-header">
                                    <span className="text-primary font-bold">Campo #{index + 1}</span>
                                    <button className="nav-del" onClick={() => {
                                        const newFields = meta.campos.filter((_, i) => i !== index);
                                        updateMeta('campos', newFields);
                                    }}><X size={14} /></button>
                                </div>
                                <div className="attribute-editor-v3" style={{ gap: '10px' }}>
                                    <input 
                                        className="v3-input" 
                                        placeholder="Etiqueta / Label" 
                                        value={field.label} 
                                        onChange={(e) => {
                                            const newFields = [...meta.campos];
                                            newFields[index] = { ...newFields[index], label: e.target.value };
                                            updateMeta('campos', newFields);
                                        }} 
                                    />
                                    <div className="prop_flex_row">
                                        <select 
                                            className="v3-input" 
                                            value={field.tipo} 
                                            onChange={(e) => {
                                                const newFields = [...meta.campos];
                                                newFields[index] = { ...newFields[index], tipo: e.target.value };
                                                updateMeta('campos', newFields);
                                            }}
                                        >
                                            <option value="text">Texto</option>
                                            <option value="email">Email</option>
                                            <option value="tel">Teléfono</option>
                                            <option value="textarea">Área de texto</option>
                                            <option value="select">Selección</option>
                                        </select>
                                        <label className="prop_flex_row" style={{ margin: 0 }}>
                                            <input 
                                                type="checkbox" 
                                                checked={field.required} 
                                                onChange={(e) => {
                                                    const newFields = [...meta.campos];
                                                    newFields[index] = { ...newFields[index], required: e.target.checked };
                                                    updateMeta('campos', newFields);
                                                }} 
                                            />
                                            <span className="text-xxs">Req?</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-add-field" onClick={() => {
                        const newFields = [...(meta.campos || []), { id: Date.now(), label: 'Nuevo Campo', tipo: 'text', placeholder: '...', required: false }];
                        updateMeta('campos', newFields);
                    }}>
                        <Plus size={14} /> Añadir Campo
                    </button>
                    
                    <div className="prop-group mt-20" style={{ marginTop: '20px' }}>
                        <label>Mensaje de Éxito</label>
                        <input className="v3-input" type="text" value={meta.mensaje_exito || ''} onChange={(e) => updateMeta('mensaje_exito', e.target.value)} />
                    </div>
                </div>
            )}

            {/* SECCION: ESTILOS DE BOTON (CASO CTA) */}
            {block.tipo === 'CTA' && (
                <div className="prop-group">
                    <label>Esitlo de Botón</label>
                    <div className="v3-pill-group" style={{ marginBottom: '10px' }}>
                        <button className={`v3-pill-btn ${meta.estilos_boton?.variant === 'primary' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, variant: 'primary' })}>Dorado</button>
                        <button className={`v3-pill-btn ${meta.estilos_boton?.variant === 'outline' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, variant: 'outline' })}>Esquema</button>
                        <button className={`v3-pill-btn ${meta.estilos_boton?.variant === 'solid-white' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, variant: 'solid-white' })}>Blanco</button>
                    </div>
                    <label>Tamaño</label>
                    <div className="v3-pill-group">
                        <button className={`v3-pill-btn ${meta.estilos_boton?.size === 'small' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, size: 'small' })}>Peque</button>
                        <button className={`v3-pill-btn ${meta.estilos_boton?.size === 'normal' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, size: 'normal' })}>Normal</button>
                        <button className={`v3-pill-btn ${meta.estilos_boton?.size === 'large' ? 'active' : ''}`} onClick={() => updateMeta('estilos_boton', { ...meta.estilos_boton, size: 'large' })}>Grande</button>
                    </div>
                </div>
            )}


            {block.tipo === 'HTML' && (
                <div className="prop-group">
                    <label>Contenido HTML</label>
                    <textarea 
                        rows={8}
                        className="v3-input font-mono"
                        value={meta.html || ''} 
                        onChange={(e) => updateMeta('html', e.target.value)}
                    />
                </div>
            )}

            {(block.tipo === 'HERO_MODERN' || block.tipo === 'IMAGE') && (
                <div className="prop-group">
                    <label>Imagen / Video de Fondo</label>
                    <div className={`v3-upload-zone ${selectedFile ? 'has-file' : ''}`}>
                        <input type="file" onChange={(e) => onFileSelect(e.target.files[0])} />
                        <div className="upload-btn-ui">
                            {selectedFile ? <Check size={16} /> : <Upload size={16} />}
                            <span>{selectedFile ? 'Listo para subir' : 'Seleccionar archivo'}</span>
                        </div>
                    </div>
                    {meta.media_path && <div className="text-xxs opacity-40 mt-5 truncate">Actual: {meta.media_path}</div>}
                </div>
            )}

            {/* ESTILOS VISUALES */}
            <div className="prop-section-divider">Espaciado y Colores</div>
            <div className="prop-grid-2">
                <div className="prop-group">
                    <label>Padding Top</label>
                    <input className="v3-input" type="text" value={meta.estilos?.paddingTop || '80px'} onChange={(e) => updateStyle('paddingTop', e.target.value)} />
                </div>
                <div className="prop-group">
                    <label>Padding Bottom</label>
                    <input className="v3-input" type="text" value={meta.estilos?.paddingBottom || '80px'} onChange={(e) => updateStyle('paddingBottom', e.target.value)} />
                </div>
            </div>

            <div className="prop-group">
                <label>Color de fondo (Hex / CSS)</label>
                <div className="color-picker-v3">
                    <input type="color" value={meta.estilos?.bgColor || '#080808'} onChange={(e) => updateStyle('bgColor', e.target.value)} />
                    <input className="v3-input" type="text" value={meta.estilos?.bgColor || '#080808'} onChange={(e) => updateStyle('bgColor', e.target.value)} />
                </div>
            </div>
        </div>
    );
};


export default AdminBlockEditor;
