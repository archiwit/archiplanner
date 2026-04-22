import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, UPLOADS_URL } from '../../config';
import paginasV4Service from '../../services/paginasV4Service';
import PhoneMockup from '../../components/ui/PhoneMockup';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
    Layers, Plus, MousePointer, Layout, Type, Image as ImageIcon,
    Video, Code, ChevronRight, ChevronLeft, Check, Globe, Clock, FileText,
    Trash2, Copy, Move, Settings, Search, X, MapPin, Mail, Layers as Layers2,
    MousePointer2, Monitor, Tablet, Smartphone, Save, Eye, Star, Info,
    CheckCircle, MessageSquare, Briefcase, Users, LayoutDashboard, Play,
    CreditCard, Grid, ArrowRight, Camera, User
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDraggable,
    useDroppable,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BuilderRow from '../../components/builder/Row';
import BuilderColumn from '../../components/builder/Column';
import PropertyPanel from '../../components/builder/PropertyPanel';
import EditorialTestimonials from '../../components/ui/Tesimonios';
import SectionPulse from '../../components/ui/SectionPulse';
import FounderCtaV4 from '../../components/ui/FounderCtaV4';
import InstagramFeed from '../../components/ui/InstagramFeed';
import ContactSectionV4 from '../../components/ui/ContactSectionV4';
import galeriaService from '../../services/galeriaService';

// --- Error Boundary for Canvas Stability ---
class CanvasErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("Canvas Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '60px', textAlign: 'center', background: '#1a1a1a', borderRadius: '30px', border: '1px dashed #ff8484', margin: '40px' }}>
                    <h2 style={{ color: '#ff8484' }}>Vaya, algo salió mal en este bloque</h2>
                    <p style={{ color: '#666' }}>El constructor ha detenido un cierre inesperado. Intenta recargar la página o eliminar el último elemento añadido.</p>
                    <button onClick={() => window.location.reload()} style={{ background: '#ff8484', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Recargar Editor</button>
                </div>
            );
        }
        return (
            <>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .swal2-container { z-index: 100000 !important; }
                    .swal2-popup { background: #1a1a1a !important; color: #fff !important; border-radius: 20px !important; }
                    .swal2-title { color: #fff !important; }
                    .swal2-html-container { color: #aaa !important; }
                    .swal2-confirm { background: #ff4444 !important; border-radius: 10px !important; }
                    .swal2-cancel { background: #333 !important; border-radius: 10px !important; }
                `}} />
                {this.props.children}
            </>
        );
    }
}

// --- DND Helper Components ---
const DraggableItem = ({ item, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${item.type}`,
        data: item
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`s-item ${isDragging ? 'is-dragging' : ''}`}
            {...listeners}
            {...attributes}
            onClick={() => onClick(item.type)}
        >
            <div className="s-item-icon">{item.icon}</div>
            <span>{item.label}</span>
        </div>
    );
};

const DroppableColumn = ({ id, children, onEdit, span, config, onAddComponent }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'col', id }
    });

    return (
        <div
            ref={setNodeRef}
            className={`v4-droppable-col ${isOver ? 'is-over' : ''} ${!children || children.length === 0 ? 'is-empty' : ''}`}
        >
            <BuilderColumn id={id} span={span} config={config} onEdit={onEdit}>
                <div className="v4-col-inner">
                    <button
                        className="v4-btn-add-top"
                        onClick={() => onAddComponent(id, 'heading', true)}
                        title="Añadir Título Arriba"
                    >
                        <Plus size={14} />
                    </button>

                    <SortableContext
                        items={(children || []).map(node => String(node.props.comp?.id || node.key))}
                        strategy={verticalListSortingStrategy}
                    >
                        {children}
                    </SortableContext>

                    {(!children || children.length === 0) && (
                        <div className="v4-empty-col-state" onClick={() => onAddComponent(id, 'text')}>
                            <Plus size={24} />
                            <span>Añadir Contenido</span>
                        </div>
                    )}

                    <button
                        className="v4-btn-add-bottom"
                        onClick={() => onAddComponent(id, 'text', false)}
                        title="Añadir Texto Abajo"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </BuilderColumn>
            {isOver && (
                <div className="drop-indicator-v4">
                    <span className="di-label">SOLTAR PARA INSERTAR</span>
                </div>
            )}
        </div>
    );
};

const SortableRowWrapper = ({ row, onEdit, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: row.id, data: { type: 'row', ...row } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} className="sortable-row-handle-container">
            <div className={`row-drag-handle ${isDragging ? 'grabbing' : ''}`} {...listeners} {...attributes}>
                <Move size={12} />
            </div>
            <BuilderRow id={row.id} config={row.config} onEdit={onEdit}>
                {children}
            </BuilderRow>
        </div>
    );
};

const SortableComponentWrapper = ({ comp, activeElementId, onClick, renderComponent }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: comp.id, data: { type: 'comp', ...comp } });

    const config = comp.config || {};

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
        marginTop: config.marginTop || 0,
        marginRight: config.marginRight || 0,
        marginBottom: config.marginBottom || 0,
        marginLeft: config.marginLeft || 0,
        paddingTop: config.paddingTop || 0,
        paddingRight: config.paddingRight || 0,
        paddingBottom: config.paddingBottom || 0,
        paddingLeft: config.paddingLeft || 0,
        zIndex: config.zIndex || 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`v4-comp-wrapper ${activeElementId === comp.id ? 'active' : ''} ${isDragging ? 'is-dragging-comp' : ''}`}
            onClick={onClick}
        >
            <div className="comp-drag-handle" {...listeners} {...attributes}>
                <Move size={10} />
            </div>
            {renderComponent(comp)}
        </div>
    );
};

// Components
const FileTextIcon = ({ size }) => <Type size={size} />;

const COMPONENT_PALETTE = [
    { type: 'card-v4', label: 'Card Editorial', icon: <CreditCard size={18} />, description: 'Tarjeta versátil para servicios o hitos.', defaultConfig: { title: 'Nuevo Evento', tag: 'PLANIFICACIÓN', desc: 'Descripción editorial...', media_type: 'image', layout: 'vertical', shape: 'rounded', style: 'boxed', alignment: 'left', showLink: true } },
    { type: 'query-grid-v4', label: 'Rejilla Dinámica', icon: <Grid size={18} />, description: 'Generador automático de cards desde BD.', defaultConfig: { source: 'servicios', columns: 3, limit: 6, cardStyle: { style: 'boxed', shape: 'rounded', alignment: 'left', layout: 'vertical', showLink: true } } },
    { type: 'row', label: 'Bloque / Fila', icon: <Layout size={18} />, description: 'Contenedor principal.', defaultConfig: { isFullWidth: false, maxWidth: '1200px', paddingTop: '80px', paddingBottom: '80px', bgType: 'transparent' } },
    { type: 'grid-static', label: 'Rejilla / Columnas', icon: <Grid size={18} />, description: 'Fila con columnas personalizables.', isRow: true, defaultConfig: { columns: 1 } },
    { type: 'heading', label: 'Titulado', icon: <Type size={18} />, description: 'Encabezado elegante.', defaultConfig: { variant: 'standard', content: 'Nuevo Título Editorial', titleMain: 'Pasión por Crear', titleHighlight: 'Momentos Eternos', subtitle: 'NUESTRA ESENCIA', description: 'En ArchiPlanner, no solo organizamos eventos; diseñamos experiencias que perduran en la memoria.', fontSize: '56px', textColor: '#FFFFFF', textAlign: 'left', fontWeight: '800' } },
    { type: 'text', label: 'Texto Editor', icon: <FileText size={18} />, description: 'Bloque de texto rico.', defaultConfig: { content: '<p>Tu contenido aquí...</p>', textColor: '#AAAAAA' } },
    { type: 'image', label: 'Imagen Simple', icon: <ImageIcon size={18} />, description: 'Pieza visual única.', defaultConfig: { src: '', alt: 'Diseño ArchiPlanner' } },
    { type: 'video', label: 'Video Player', icon: <Play size={18} />, description: 'Reproductor de video simple.', defaultConfig: { url: '', controls: true, autoPlay: false, muted: false } },
    { type: 'stories', label: 'Historias Video', icon: <Clock size={18} />, description: 'Scroll horizontal de historias circulares.', defaultConfig: { items: [{ id: 1, title: 'Boda En los Alpes', image: '', video: '' }] } },
    { type: 'cta-editorial', label: 'CTA Editorial', icon: <MousePointer2 size={18} />, description: 'Bloque de acción con título y texto HTML.', defaultConfig: { title: '<h3>Título de Acción</h3>', content: '<p>Descripción persuasiva aquí...</p>', buttonLabel: 'Me interesa', link: '#', style: 'primary' } },
    { type: 'button', label: 'Botón Acción', icon: <MousePointer2 size={18} />, description: 'Enlace externo o interno.', defaultConfig: { label: 'Empezar ahora', link: '#', style: 'primary-glow' } },
    { type: 'gallery', label: 'Galería Fotos', icon: <ImageIcon size={18} />, description: 'Mosaico de imágenes o Portfolio.', defaultConfig: { source: 'manual', images: [], columns: 4, gap: 10, category: 'todos' } },
    { type: 'hero-modern', label: 'ArchiSlider Premium', icon: <Play size={18} />, description: 'Slider Saint Antönien de alta gama.', defaultConfig: { titulo: "Título Impacto", subtitulo: "Subtítulo elegante", media_path: '' } },
    { type: 'testimonios', label: 'Testimonios', icon: <MessageSquare size={18} />, description: 'Slider de testimonios de clientes.', defaultConfig: {} },
    { type: 'cta-phone-v4', label: 'CTA Phone V4', icon: <Smartphone size={18} />, description: 'CTA editorial con mockup de teléfono y video.', defaultConfig: { title: '¿Listo para elevar tu evento?', hook: 'EMPIEZA AHORA', closure: 'Diseñamos y planificamos cada detalle para que tú solo disfrutes. Tu visión, nuestra magia.', buttonLabel: 'Reserva tu fecha mágica', actionType: 'whatsapp', whatsappMessage: 'Hola, me interesa ArchiPlanner para mi evento', customPhone: '', phoneVideo: '', bgColor: '#121212', accentColor: '#e87c7c' } },
    { type: 'form', label: 'Formulario V4', icon: <FileText size={18} />, description: 'Captación de leads premium.', defaultConfig: { title: 'DÉJANOS TU VISIÓN', buttonLabel: 'ENVIAR MENSAJE' } },
    { type: 'PULSE', label: 'Pulse de Marca', icon: <Star size={18} />, description: 'Sección premium de pilares estratégicos con estética Oro Rosa.', defaultConfig: { title: 'El Pulse de cada Evento', tag: 'VIVIMOS EL MÉTODO', closingPhrase: 'Vivimos el pulse de cada evento...', bgColor: '#000000', svgColor: '#ff8484', textColor: '#ffffff', titleColor: '' } },
    { type: 'services-grid-v4', label: 'Grilla Servicios', icon: <Grid size={18} />, description: 'Muestra servicios en bloque Clásico o Delicado.', defaultConfig: { title: 'Nuestros Servicios', tag: 'Expertise', category: 'principales', variant: 'classic', centered: false } },
    { type: 'services-corporate-v4', label: 'Diseño Corporativo', icon: <LayoutDashboard size={18} />, description: 'Layout asimétrico 1+2 para servicios empresariales.', defaultConfig: { title: 'Eventos Corporativos', tag: 'Empresariales', category: 'corporativos' } },
    { type: 'founder-cta-v4', label: 'Cita Fundadora', icon: <User size={18} />, description: 'CTA con foto, degradado y cita de confianza.', defaultConfig: { quote: '"Nuestra pasión es transformar sueños en realidades inolvidables, con la seguridad y experiencia que mereces."', founderName: 'Nombre Fundadora', founderRole: 'CEO & Founder', image: '', imagePosition: 'left', btnLabel: 'Agenda una Entrevista', btnLink: '/contacto', bgColor: '#121212', accentColor: '#ff8484' } },
    { type: 'INSTAGRAM', label: 'Feed Instagram', icon: <Camera size={18} />, description: 'Módulo de posts recientes de Instagram Business.', defaultConfig: { title: '@ARCHI.PLANNER' } },
    { type: 'contact-v4', label: 'Contacto Premium', icon: <Mail size={18} />, description: 'Página de contacto completa con Hero, Info y Formulario.', defaultConfig: { heroTagline: 'Experiencias de Lujo', heroTitle: 'Hablemos de tu <br/><span>Próximo Hito</span>', infoTagline: 'Exclusividad', infoTitle: 'Conversemos', infoDescription: 'Déjanos acompañarte en la creación de una experiencia inolvidable. Estamos listos para elevar tu visión y convertir tu próximo hito en algo legendario.', formTitle: 'Envíanos un mensaje', submitText: 'Solicitar Asesoría Exclusiva' } },
];

const VisualBuilderV4 = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [page, setPage] = useState(null);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeElement, setActiveElement] = useState(null);
    const [viewport, setViewport] = useState('desktop');
    const [activeTab, setActiveTab] = useState('elements');
    const [stories, setStories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [systemConfig, setSystemConfig] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPage();
    }, [id]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || !active) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // --- 1. DROPPING FROM PALETTE ---
        if (activeId.startsWith('palette-')) {
            const itemType = active.data.current?.type;
            if (!itemType) return;

            let targetColId = null;
            let targetIndex = -1;
            let forcePrepend = false;

            // Detect drop position within the column
            if (over.data.current?.type === 'col') {
                targetColId = overId;

                // If drop is in the top part of the column, prepend
                const overRect = over.rect;
                const dropY = event.activatorEvent?.clientY || 0;
                const colTop = overRect.top;
                const colHeight = overRect.height;

                if (dropY < colTop + (colHeight * 0.3)) {
                    forcePrepend = true;
                }
            }
            // Is it over another component?
            else if (over.data.current?.type === 'comp') {
                content.forEach(row => {
                    row.children.forEach(col => {
                        const idx = col.children.findIndex(c => String(c.id) === overId);
                        if (idx !== -1) {
                            targetColId = String(col.id);
                            targetIndex = idx;
                        }
                    });
                });
            }

            if (targetColId) {
                if (itemType === 'row' || itemType === 'grid-static') {
                    const rowId = `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    const columnsCount = itemType === 'grid-static' ? 1 : 1;
                    const children = [];
                    for (let i = 0; i < columnsCount; i++) {
                        children.push({
                            id: `col-${rowId}-${i + 1}`,
                            type: 'col',
                            span: 12 / columnsCount,
                            children: [],
                            config: {}
                        });
                    }
                    const newRow = { id: rowId, type: 'row', config: {}, children };

                    // Insert at bottom or specific index (simplified to bottom for palette drop for now)
                    setContent([...content, newRow]);
                    setActiveElement(newRow);
                } else {
                    const compId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    const paletteItem = COMPONENT_PALETTE.find(p => p.type === itemType);
                    const newComp = {
                        id: compId,
                        type: itemType,
                        config: { ...(paletteItem?.defaultConfig || { content: 'Elemento' }) }
                    };

                    setContent(prev => prev.map(row => ({
                        ...row,
                        children: row.children.map(col => {
                            if (String(col.id) !== targetColId) return col;
                            const newChildren = [...col.children];

                            if (forcePrepend) {
                                newChildren.unshift(newComp);
                            } else if (targetIndex !== -1) {
                                newChildren.splice(targetIndex, 0, newComp);
                            } else {
                                newChildren.push(newComp);
                            }
                            return { ...col, children: newChildren };
                        })
                    })));
                    setActiveElement(newComp);
                }
            }
            return;
        }

        // --- 2. ROW REORDERING ---
        if (active.data.current?.type === 'row' && over.data.current?.type === 'row') {
            if (activeId !== overId) {
                setContent((items) => {
                    const oldIndex = items.findIndex(i => String(i.id) === activeId);
                    const newIndex = items.findIndex(i => String(i.id) === overId);
                    if (oldIndex === -1 || newIndex === -1) return items;
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
            return;
        }

        // --- 3. COMPONENT REORDERING (Cross-Column Support) ---
        if (active.data.current?.type === 'comp') {
            let activeInfo = null;
            let overInfo = null;

            content.forEach(row => {
                row.children.forEach(col => {
                    const aIdx = col.children.findIndex(c => String(c.id) === activeId);
                    if (aIdx !== -1) activeInfo = { colId: String(col.id), index: aIdx, comp: col.children[aIdx] };

                    if (over.data.current?.type === 'comp') {
                        const oIdx = col.children.findIndex(c => String(c.id) === overId);
                        if (oIdx !== -1) overInfo = { colId: String(col.id), index: oIdx };
                    } else if (over.data.current?.type === 'col' && String(col.id) === overId) {
                        overInfo = { colId: overId, index: col.children.length };
                    }
                });
            });

            if (activeInfo && overInfo) {
                // Moving within same column
                if (activeInfo.colId === overInfo.colId) {
                    if (activeId !== overId) {
                        setContent(prev => prev.map(row => ({
                            ...row,
                            children: row.children.map(col => {
                                if (String(col.id) !== activeInfo.colId) return col;
                                return { ...col, children: arrayMove(col.children, activeInfo.index, overInfo.index) };
                            })
                        })));
                    }
                }
                // Moving between columns
                else {
                    setContent(prev => prev.map(row => ({
                        ...row,
                        children: row.children.map(col => {
                            // Remove from source
                            if (String(col.id) === activeInfo.colId) {
                                return { ...col, children: col.children.filter(c => String(c.id) !== activeId) };
                            }
                            // Add to target
                            if (String(col.id) === overInfo.colId) {
                                const newChildren = [...col.children];
                                newChildren.splice(overInfo.index, 0, activeInfo.comp);
                                return { ...col, children: newChildren };
                            }
                            return col;
                        })
                    })));
                }
            }
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const sRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/servicios`).then(r => r.json());
                setAllServices(sRes || []);
            } catch (err) {
                console.error("Error fetching services for builder:", err);
            }
        };
        fetchInitialData();
    }, []);

    const fetchPage = async () => {
        try {
            // Fetch System Config for branding
            const configRes = await fetch(`${API_BASE_URL}/config`).then(r => r.json());
            setSystemConfig(configRes);

            // Optional: Fetch Gallery Data
            try {
                const gRes = await galeriaService.getEventos();
                const cRes = await galeriaService.getCategorias();
                setAllEvents(Array.isArray(gRes) ? gRes : []);
                setAllCategories(Array.isArray(cRes) ? cRes : []);
                setStories(Array.isArray(gRes) && gRes.length > 0 ? gRes : []);
            } catch (galErr) {
                console.error("Gallery data failed to load:", galErr);
                setAllEvents([]);
                setAllCategories([]);
            }

            // Optional: Fetch Services for queries
            try {
                const servicesRes = await fetch(`${API_BASE_URL}/services`).then(r => r.json());
                setAllServices(Array.isArray(servicesRes) ? servicesRes : []);
            } catch (servErr) {
                console.error("Services data failed to load:", servErr);
                setAllServices([]);
            }

            const data = await paginasV4Service.getById(id);
            setPage(data);
            
            // Critical Fix: Ensure content is parsed if it's a string from the DB
            let loadedContent = data.content;
            if (typeof loadedContent === 'string') {
                try {
                    loadedContent = JSON.parse(loadedContent);
                } catch (e) {
                    console.error("Error parsing page content:", e);
                    loadedContent = [];
                }
            }
            setContent(Array.isArray(loadedContent) ? loadedContent : []);

            // Ensure style_config exists
            if (!data.style_config) {
                data.style_config = { canvasBg: '#FFFFFF', canvasText: '#121212' };
            } else if (typeof data.style_config === 'string') {
                try {
                    data.style_config = JSON.parse(data.style_config);
                } catch (e) {
                    data.style_config = { canvasBg: '#FFFFFF', canvasText: '#121212' };
                }
            }
            if (!data.style_config.canvasBg) data.style_config.canvasBg = '#FFFFFF';
            if (!data.style_config.canvasText) data.style_config.canvasText = '#121212';
        } catch (err) {
            console.error('Error fetching page:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'No pudimos recuperar tu diseño.',
                background: '#121212',
                color: '#fff',
                confirmButtonColor: '#ff8484'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await paginasV4Service.update(id, {
                ...page,
                content: content
            });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Diseño guardado correctamente',
                showConfirmButton: false,
                timer: 2000,
                background: '#121212',
                color: '#fff'
            });
        } catch (err) {
            Swal.fire('Error', 'No se pudo guardar la página.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Structural Helpers ---
    const addRow = () => {
        const rowId = `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newRow = {
            id: rowId,
            type: 'row',
            config: {},
            children: [
                { id: `col-${rowId}-1`, type: 'col', span: 12, children: [], config: {} }
            ]
        };
        setContent([...content, newRow]);
        setActiveElement(newRow);
    };

    const addComponentToColumn = (colId, type, prepend = false) => {
        const compId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const paletteItem = COMPONENT_PALETTE.find(p => p.type === type);
        const newComp = {
            id: compId,
            type,
            config: { ...(paletteItem?.defaultConfig || { content: 'Elemento' }) }
        };

        setContent(prev => prev.map(row => ({
            ...row,
            children: row.children.map(col => {
                if (col.id.toString() !== colId.toString()) return col;
                const newChildren = [...col.children];
                if (prepend) {
                    newChildren.unshift(newComp);
                } else {
                    newChildren.push(newComp);
                }
                return { ...col, children: newChildren };
            })
        })));
        setActiveElement(newComp);
    };

    const deleteElement = async (elementId) => {
        if (!elementId) return;
        const idStr = String(elementId);
        console.log(`[BUILDER] Attempting to delete: ${idStr}`);

        const result = await Swal.fire({
            title: '¿Eliminar elemento?',
            text: "Esta acción borrará el diseño seleccionado permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4444',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sí, borrar',
            background: '#121212',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        setContent(prev => {
            // 1. Filter out if it's a top-level row
            const rowsAfterRowDeletion = prev.filter(row => String(row.id) !== idStr);
            console.log(`[BUILDER] Rows remaining after top-level check: ${rowsAfterRowDeletion.length}`);

            // 2. Deep filter for columns and components
            return rowsAfterRowDeletion.map(row => ({
                ...row,
                children: row.children
                    .filter(col => String(col.id) !== idStr) // Remove the column if ID matches
                    .map(col => ({
                        ...col,
                        children: col.children.filter(comp => String(comp.id) !== idStr) // Remove component if ID matches
                    }))
            }));
        });

        setActiveElement(null);
        console.log(`[BUILDER] Deletion logic executed for: ${idStr}`);
    };

    const duplicateElement = (elementId) => {
        const idStr = String(elementId);
        setContent(prev => {
            const newContent = [];
            prev.forEach(row => {
                if (String(row.id) === idStr) {
                    const newRowId = `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    const duplicatedRow = {
                        ...JSON.parse(JSON.stringify(row)),
                        id: newRowId,
                        children: row.children.map((col, cIdx) => ({
                            ...col,
                            id: `col-${newRowId}-${cIdx + 1}`,
                            children: col.children.map(comp => ({
                                ...comp,
                                id: `comp-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                            }))
                        }))
                    };
                    newContent.push(row);
                    newContent.push(duplicatedRow);
                } else {
                    const rowCopy = { ...row };
                    rowCopy.children = row.children.map(col => {
                        const newColChildren = [];
                        col.children.forEach(comp => {
                            newColChildren.push(comp);
                            if (String(comp.id) === idStr) {
                                const duplicatedComp = {
                                    ...JSON.parse(JSON.stringify(comp)),
                                    id: `comp-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                                };
                                newColChildren.push(duplicatedComp);
                            }
                        });
                        return { ...col, children: newColChildren };
                    });
                    newContent.push(rowCopy);
                }
            });
            return newContent;
        });
    };

    const updateElement = (updated) => {
        const idStr = String(updated.id);
        const recurse = (list) => list.map(item => {
            if (String(item.id) === idStr) return updated;
            if (item.children) return { ...item, children: recurse(item.children) };
            return item;
        });
        setContent(recurse([...content]));
        setActiveElement(updated);
    };

    const updateCanvasBg = (newBg) => {
        // Simple luminance check
        const hex = newBg.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        const newTextColor = luminance < 0.5 ? '#FFFFFF' : '#121212';

        setPage({
            ...page,
            style_config: {
                ...page.style_config,
                canvasBg: newBg,
                canvasText: newTextColor
            }
        });
    };

    const onAddSidePalette = (type) => {
        if (type === 'row' || type === 'grid-static') { addRow(); return; }

        const defaultConfigs = {
            hero: { title: 'Tu Visión, Nuestra Realidad', subtitle: 'Diseñamos eventos que perduran en la memoria.', bgImage: '', height: '700px' },
            services: { items: [1, 2, 3] },
            gallery: { images: [] },
            features: { items: [1, 2, 3, 4] },
            testimonials: { items: [1, 2] },
            heading: { content: 'Nuevo Título', fontSize: '56px', textColor: '#FFFFFF', textAlign: 'center' },
            text: { content: '<p>Este es tu nuevo bloque de texto premium...</p>', textColor: '#AAAAAA', textAlign: 'left' },
            image: { src: '', alt: 'Diseño ArchiPlanner' },
            button: { label: 'Empezar ahora', link: '#', style: 'primary-glow', textAlign: 'center' },
            video: { url: '', controls: true, autoPlay: false, muted: false },
            stories: { items: [{ id: 1, title: 'Boda Premium', image: '', video: '' }, { id: 2, title: 'Evento Social', image: '', video: '' }] },
            'card-v4': { title: 'Nuevo Evento', tag: 'PLANIFICACIÓN', desc: 'Descripción editorial...', media_type: 'image', layout: 'vertical', shape: 'rounded', style: 'boxed', alignment: 'left', showLink: true },
            'query-grid-v4': { source: 'servicios', columns: 3, limit: 6, cardStyle: { style: 'boxed', shape: 'rounded', alignment: 'left', layout: 'vertical', showLink: true } },
            'cta-editorial': { title: '<h3>Título de Acción</h3>', content: '<p>Descripción persuasiva aquí...</p>', buttonLabel: 'Me interesa', link: '#', style: 'primary', textAlign: 'center' },
            'hero-marquee': { images: [], height: '500px' },
            'hero-modern': { titulo: 'Saint Antönien', subtitulo: 'Majestic events', media_path: '' },
            'cta-phone-v4': { title: '¿Listo para elevar tu evento?', hook: 'EMPIEZA AHORA', closure: 'Diseñamos y planificamos cada detalle para que tú solo disfrutes. Tu visión, nuestra magia.', buttonLabel: 'Reserva tu fecha mágica', link: '#', phoneVideo: '', bgColor: '#121212', accentColor: '#e87c7c' },
            'PULSE': { title: 'El Pulse de cada Evento', tag: 'VIVIMOS EL MÉTODO', closingPhrase: 'Vivimos el pulse de cada evento...', bgColor: '#000000', svgColor: '#ff8484', textColor: '#ffffff', titleColor: '' },
            'INSTAGRAM': { title: '@ARCHI.PLANNER' }
        };

        const compId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newComp = {
            id: compId,
            type,
            config: { ...(defaultConfigs[type] || { content: 'Elemento' }) }
        };

        // If something is active and it's a column, add to it
        if (activeElement && activeElement.type === 'col') {
            addComponentToColumn(activeElement.id, type);
            return;
        }

        // Default to adding a new row with the component
        const rowId = `row-${Date.now()}`;
        const colId = `col-${rowId}-1`;
        const newRow = {
            id: rowId,
            type: 'row',
            config: {},
            children: [{ id: colId, type: 'col', span: 12, children: [newComp], config: {} }]
        };
        setContent(prev => [...prev, newRow]);
        setActiveElement(newComp);
    };

    // --- Component Rendering ---
    const renderComponent = (comp) => {
        if (!comp || !comp.config) return <div className="v4-error-comp">Error: Componente malformado</div>;
        const { type, config } = comp;
        switch (type) {
            case 'hero':
                return (
                    <div className="v4-hero-block" style={{ height: config.height || '600px', backgroundImage: `url(${config.bgImage || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070'})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <div className="hero-content text-center" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.3)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '-2px' }}>{config.title || 'Título Hero V4'}</h1>
                            <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto 30px' }}>{config.subtitle || 'Subtítulo editorial elegante.'}</p>
                            <button className="btn-v4-save" style={{ background: '#ff8484', color: 'black', padding: '15px 30px', borderRadius: '50px', fontWeight: '800' }}>Acción Principal</button>
                        </div>
                    </div>
                );
            case 'hero-marquee':
                return (
                    <div className="v4-hero-marquee" style={{ height: config.height || '400px', overflow: 'hidden', background: '#000', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div className="marquee-track">
                            {(config.images || []).concat(config.images || []).map((img, i) => (
                                <div key={i} className="marquee-item">
                                    <img src={img} alt="Gallery" />
                                </div>
                            ))}
                        </div>
                        <div className="marquee-content-overlay">
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'white', textShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>Editorial Gallery</h2>
                        </div>
                    </div>
                );
            case 'hero-modern':
                const mockupMedia = config.media_path || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070';
                const isVideoMock = config.media_type === 'video';

                return (
                    <div className="v4-mock-hero-modern" style={{ height: '500px', background: '#0a0a0a', display: 'flex', alignItems: 'center', padding: '0 60px', position: 'relative', overflow: 'hidden' }}>
                        {/* Mock Background */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                            {isVideoMock ? (
                                <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                    <Video size={100} opacity={0.2} />
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', color: '#555' }}>MOCK VIDEO BG</div>
                                </div>
                            ) : (
                                <img src={mockupMedia} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'blur(5px)' }} alt="Mock BG" />
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #000 30%, transparent 100%)' }}></div>
                        </div>

                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <span style={{ color: '#ff8484', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '12px' }}>Exclusividad & Estilo</span>
                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', color: 'white', maxWidth: '500px', margin: '20px 0', lineHeight: 1.1 }}>
                                {config.titulo || "Suiza Alps ArchiPlanner"}
                            </h1>
                            <p style={{ color: '#aaa', maxWidth: '400px', fontSize: '14px', lineHeight: '1.6' }}>
                                {config.subtitulo || "Explora la majestuosidad de los eventos con un nivel de detalle editorial sin precedentes."}
                            </p>
                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ background: '#ff8484', color: 'black', padding: '12px 25px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px' }}>
                                    {config.buttonLabel || "Ver Álbum"}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1.2, display: 'flex', gap: '15px', position: 'relative', zIndex: 1, justifyContent: 'flex-end' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '180px',
                                    height: '380px',
                                    background: `rgba(26, 26, 26, 0.8)`,
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,132,132,0.2)',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '20px'
                                }}>
                                    <div style={{ width: '100%' }}>
                                        <div style={{ width: '30px', height: '2px', background: '#ff8484', marginBottom: '10px' }}></div>
                                        <div style={{ fontSize: '11px', color: 'white', fontWeight: 'bold' }}>Evento Galería {i}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,132,132,0.1)', color: '#ff8484', padding: '5px 12px', borderRadius: '50px', fontSize: '9px', fontWeight: '900', letterSpacing: '1px', border: '1px solid rgba(255,132,132,0.3)' }}>
                            ARCHISLIDER PREMIUM
                        </div>
                    </div>
                );
            case 'PULSE':
                return <SectionPulse {...config} />;
            case 'services':
                return (
                    <div className="v4-services-grid p-40">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,132,132,0.1)', width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Briefcase size={28} style={{ color: '#ff8484' }} />
                                    </div>
                                    <h3 style={{ color: '#222' }}>Servicio {i}</h3>
                                    <p style={{ color: '#888', fontSize: '14px' }}>Descripción del servicio premium.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'heading':
                if (config.variant === 'premium') {
                    const vars = {
                        '--v4-title-color': config.textColor || '#FFFFFF',
                        '--v4-highlight-color': config.highlightColor || 'var(--color-primary)',
                        '--v4-font-size': config.fontSize || '56px',
                        '--v4-font-weight': config.fontWeight || '800',
                        '--v4-tagline-color': config.labelColor || 'var(--color-primary)',
                        '--v4-align': config.textAlign || 'left'
                    };
                    return (
                        <div className={`v4-premium-header-group editorial-gold text-${vars['--v4-align']}`} style={vars}>
                            {config.subtitle && (
                                <span className="v4-premium-tagline">{config.subtitle}</span>
                            )}
                            <div className="v4-premium-title-container">
                                <h2 className="v4-premium-title-main">{config.titleMain}</h2>
                                <h2 className="v4-premium-title-highlight">{config.titleHighlight}</h2>
                            </div>
                            {config.description && (
                                <p className="v4-premium-description">{config.description}</p>
                            )}
                            <div className="v4-premium-line-block">
                                <div className="v4-premium-line"></div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="v4-header-group" style={{ textAlign: config.textAlign || 'center' }}>
                        {config.subtitle && (
                            <span className="v4-overline" style={{ color: config.labelColor || '#ff8484' }}>
                                {config.subtitle}
                            </span>
                        )}
                        <h2 className="v4-title-main" style={{
                            color: config.textColor,
                            fontSize: config.fontSize || '56px',
                            textAlign: 'inherit',
                            fontWeight: config.fontWeight || '700',
                            fontFamily: config.fontFamily || 'inherit'
                        }}>{config.content}</h2>
                    </div>
                );
            case 'gallery':
                if (config.source === 'dynamic') {
                    const activeCat = config.category || 'todos';
                    const filtered = allEvents.filter(ev => activeCat === 'todos' || ev.slug === activeCat || (ev.categoria_nombre && ev.categoria_nombre.toLowerCase() === activeCat.toLowerCase()));
                    
                    return (
                        <div className="v4-portfolio-container">
                            <div className="v4-portfolio-filters">
                                <button className={`v4-filter-pill ${activeCat === 'todos' ? 'active' : ''}`}>TODOS</button>
                                {allCategories.map(cat => (
                                    <button key={cat.id} className={`v4-filter-pill ${activeCat === cat.slug ? 'active' : ''}`}>
                                        {cat.nombre.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="v4-portfolio-grid" style={{ 
                                gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)`,
                                gap: `${config.gap || 20}px` 
                            }}>
                                {filtered.length === 0 ? (
                                    <div className="v4-empty">No hay eventos para esta categoría...</div>
                                ) : (
                                    filtered.map((ev, idx) => (
                                        <div key={idx} className="v4-portfolio-card">
                                            <div className="portfolio-media">
                                                <img src={resolveMediaPath(ev.portada_url)} alt={ev.titulo} />
                                            </div>
                                            <div className="portfolio-content">
                                                <div className="portfolio-tag">{ev.categoria_nombre || 'EVENTO'}</div>
                                                <h3 className="portfolio-title">{ev.titulo}</h3>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="v4-gallery-container p-20">
                        <div className="v4-gallery-grid" style={{ 
                            gridTemplateColumns: `repeat(${config.columns || 4}, 1fr)`,
                            gap: `${config.gap || 10}px` 
                        }}>
                            {(!config.images || config.images.length === 0) ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                                    <div key={idx} className="v4-gallery-item placeholder">
                                        <ImageIcon size={24} />
                                        <span>Bloque de Galería</span>
                                    </div>
                                ))
                            ) : (
                                config.images.map((img, idx) => (
                                    <div key={idx} className="v4-gallery-item">
                                        <img src={resolveMediaPath(img)} alt={`Gallery ${idx}`} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'text':
                return <div style={{
                    color: config.textColor,
                    textAlign: config.textAlign,
                    fontSize: config.fontSize,
                    fontWeight: config.fontWeight || '400',
                    fontFamily: config.fontFamily || 'inherit'
                }} dangerouslySetInnerHTML={{ __html: config.content }} />;

            case 'features':
                return (
                    <div className="v4-features-block p-60" style={{ background: '#000', color: 'white' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
                            {[{ v: '120+', l: 'Bodas' }, { v: '5k', l: 'Invitados' }, { v: '15', l: 'Premios' }, { v: '24h', l: 'Soporte' }].map((f, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#ff8484' }}>{f.v}</div>
                                    <div style={{ opacity: 0.5, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>{f.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'cta-phone-v4':
                return (
                    <div className="v4-cta-phone-container">
                        <PhoneMockup
                            src={config.phoneVideo?.startsWith('http') ? config.phoneVideo : `${UPLOADS_URL}/${config.phoneVideo}`}
                            className="v4-cta-phone-pop"
                        />
                        <div className="v4-cta-phone-preview" style={{ backgroundColor: config.bgColor || '#121212' }}>
                            <div className="v4-cta-content">
                                {config.hook && <span className="c-hook" style={{ color: config.accentColor }}>{config.hook}</span>}
                                {config.title && <h2 className="c-title" dangerouslySetInnerHTML={{ __html: config.title }} />}
                                {config.closure && <p className="c-closure" dangerouslySetInnerHTML={{ __html: config.closure }} />}
                                <button className="c-btn" style={{ backgroundColor: config.accentColor }}>{config.buttonLabel}</button>
                            </div>
                        </div>
                    </div>
                );
            case 'card-v4': return renderCardV4(config);
            case 'query-grid-v4': return renderQueryGridV4(config);
            case 'cta-editorial':
                return (
                    <div className="v4-cta-editorial p-40" style={{ textAlign: config.textAlign || 'center', background: config.bgColor || 'transparent', borderRadius: config.borderRadius || '20px' }}>
                        {config.title && <div className="v4-cta-title" style={{ color: config.titleColor || '#fff', marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: config.title }} />}
                        {config.content && <div className="v4-cta-text" style={{ color: config.textColor || '#aaa', marginBottom: '30px' }} dangerouslySetInnerHTML={{ __html: config.content }} />}
                        {config.buttonLabel && (
                            <button className={`btn-v4 btn-v4-${config.style || 'primary'}`} onClick={() => console.log("Link:", config.link)}>
                                {config.buttonLabel}
                            </button>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div className="v4-image-render-preview" style={{ 
                        aspectRatio: config.aspectRatio || 'auto',
                        overflow: 'hidden',
                        borderRadius: config.borderRadius || '12px',
                        boxShadow: config.boxShadow || 'none',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <img 
                            src={resolveMediaPath(config.media_path || config.src)} 
                            alt={config.titulo || 'Imagen'} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: config.objectFit || 'cover',
                                display: 'block'
                            }} 
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Error+de+Imagen';
                            }}
                        />
                    </div>
                );
            case 'stories':
                return (
                    <div className="v4-stories-mock p-20" style={{ background: '#0a0a0a', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0' }}>
                            {(config.items || []).map((item, idx) => (
                                <div key={idx} style={{ textAlign: 'center', minWidth: '80px' }}>
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: '50%',
                                        border: '3px solid #ff8484', padding: '3px',
                                        background: '#222', margin: '0 auto 8px',
                                        overflow: 'hidden'
                                    }}>
                                        {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt={item.title} /> : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={20} color="#555" /></div>}
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>{item.title || 'Historia'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div className="v4-video-mock" style={{ aspectRatio: '16/9', background: '#000', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <div style={{ textAlign: 'center', color: '#333' }}>
                            <Play size={60} opacity={0.3} />
                            <div style={{ fontSize: '12px', marginTop: '10px' }}>REPRODUCTOR DE VIDEO</div>
                        </div>
                    </div>
                );
            case 'button':
                return (
                    <div style={{ textAlign: config.textAlign || 'center', padding: '15px 0' }}>
                        <button className={`btn-v4 btn-v4-${config.style || 'primary-glow'}`} style={{ borderRadius: config.borderRadius || '50px' }}>
                            {config.label || 'Botón de Acción'}
                        </button>
                    </div>
                );
            case 'form':
                return (
                    <div className="form-rendered-container premium-form-v4" style={{ padding: '40px', background: '#111', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 className="v4-premium-title" style={{ fontSize: '28px', marginBottom: '25px', textAlign: 'center' }}>
                            {config.title || 'Contáctanos'} 
                        </h3>
                        <div className="form-v4-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <input type="text" className="dense-input" disabled value=" " style={{ paddingTop: '24px' }} />
                                <label style={{ position: 'absolute', left: '20px', top: '8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ff8484', fontWeight: '700' }}>Nombre Completo *</label>
                            </div>
                            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <input type="text" className="dense-input" disabled value=" " style={{ paddingTop: '24px' }} />
                                <label style={{ position: 'absolute', left: '20px', top: '8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ff8484', fontWeight: '700' }}>Correo Electrónico *</label>
                            </div>
                            <div className="form-field full" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <textarea className="dense-input" disabled value=" " rows={3} style={{ paddingTop: '24px' }}></textarea>
                                <label style={{ position: 'absolute', left: '20px', top: '8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ff8484', fontWeight: '700' }}>Mensaje *</label>
                            </div>
                            <button className="btn-render btn-v4 btn-v4-primary full" style={{ gridColumn: 'span 2' }}>
                                {config.buttonLabel || 'Solicitar Asesoría'}
                            </button>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '10px', color: '#666', textAlign: 'center' }}>* Estilos de etiqueta flotante activos en vista pública.</div>
                    </div>
                );
            case 'services-grid-v4':
                return <ServicesGridV4 {...config} services={allServices} />;
            case 'services-corporate-v4':
                return <ServicesCorporateV4 {...config} services={allServices} />;
            case 'founder-cta-v4':
                return <FounderCtaV4 {...config} />;
            case 'INSTAGRAM':
                return <InstagramFeed />;
            case 'contact-v4':
                return <ContactSectionV4 config={config} />;
            case 'testimonios': return <EditorialTestimonials />;
            default:
                return (
                    <div style={{ padding: '20px', border: '1px dashed #ddd', textAlign: 'center', color: '#888' }}>
                        Elemento: <strong>{type.toUpperCase()}</strong>
                    </div>
                )
        }
    };

    const resolveMediaPath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${UPLOADS_URL}/${cleanPath}`;
    };

    const renderCardV4 = (conf) => {
        const {
            num = '', tag = '', title = '', desc = '', media_type = 'image', media_path = '',
            layout = 'vertical', shape = 'rounded', alignment = 'left', style = 'boxed',
            showLink = false, linkUrl = '', linkLabel = 'Consultar Detalles',
            titleColor = '#FFFFFF', descColor = '#AAAAAA', labelColor = '#ff8484',
            overlay = false, overlayColor = 'rgba(0,0,0,0.5)',
            animation = '', ctaStyle = 'link',
            titleFontFamily = '', titleFontWeight = '700', fontSize = '',
            descFontFamily = '', ctaAlignment = 'right'
        } = conf;

        const resolvedPath = resolveMediaPath(media_path);
        const isSvg = (media_type === 'svg' || (media_path && media_path.trim().startsWith('<svg')));

        return (
            <div className={`v4-card-item layout-${layout} shape-${shape} align-${alignment} style-${style} anim-${animation} ${overlay ? 'has-overlay' : ''} premium-card-v4`}>
                {overlay && <div className="card-overlay" style={{ background: overlayColor }}></div>}

                <div className="card-media">
                    {media_type === 'image' && !isSvg && <img src={resolvedPath || 'https://via.placeholder.com/400x300'} alt={title} />}
                    {isSvg && (
                        <div className="service-icon-svg" dangerouslySetInnerHTML={{ __html: media_path }} />
                    )}
                </div>

                <div className="card-content">
                    {(num || tag) && <div className="card-tag" style={{ color: labelColor }}>{tag || num}</div>}
                    <h3 className="card-title" style={{
                        color: titleColor,
                        fontFamily: titleFontFamily || 'inherit',
                        fontWeight: titleFontWeight || '700',
                        fontSize: fontSize || '22px'
                    }}>{title}</h3>
                    <div className="card-description" style={{
                        color: descColor,
                        fontFamily: descFontFamily || 'inherit'
                    }} dangerouslySetInnerHTML={{ __html: desc }}></div>
                    {showLink && linkUrl && (
                        <div className={`card-cta-wrapper cta-${ctaAlignment || 'right'} cta-${ctaStyle}`}>
                            {ctaStyle === 'button' ? (
                                <button className="v4-card-btn" style={{ background: labelColor }}>
                                    {linkLabel} <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                                </button>
                            ) : (
                                <div className="card-link" style={{ color: labelColor }}>
                                    {linkLabel} <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderQueryGridV4 = (conf) => {
        const { source = 'servicios', columns = 3, limit = 6, sectionFilter = 'todos', cardStyle = {}, mediaPreference = 'priority_svg' } = conf;

        let items = [];
        if (source === 'servicios') {
            items = allServices.filter(s => sectionFilter === 'todos' || s.seccion === sectionFilter).slice(0, limit);
        }

        const getMediaConfig = (item) => {
            const hasImg = !!item.imagen;
            const hasSvg = !!item.icono_svg;

            if (mediaPreference === 'none') return { path: '', type: 'none' };
            if (mediaPreference === 'only_image') return { path: item.imagen, type: 'image' };
            if (mediaPreference === 'only_svg') return { path: item.icono_svg, type: 'svg' };

            if (mediaPreference === 'priority_svg') {
                return hasSvg ? { path: item.icono_svg, type: 'svg' } : { path: item.imagen, type: 'image' };
            }

            // priority_image (default)
            return hasImg ? { path: item.imagen, type: 'image' } : { path: item.icono_svg, type: 'svg' };
        };

        return (
            <div className={`v4-query-grid cols-${columns}`}>
                {items.length === 0 ? (
                    <div className="v4-empty">No se encontraron {source} para mostrar...</div>
                ) : (
                    items.map((item, idx) => {
                        const mediaConfig = getMediaConfig(item);
                        return (
                            <div key={idx} className="v4-query-item">
                                {renderCardV4({
                                    ...cardStyle,
                                    title: item.titulo,
                                    desc: item.descripcion,
                                    media_path: mediaConfig.path,
                                    media_type: mediaConfig.type,
                                    linkUrl: item.link || '#'
                                })}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    if (loading) return (
        <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8484' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner-loader" style={{ margin: '0 auto 20px' }}></div>
                <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Cincelando el ArchiBuilder V4...</h2>
            </div>
        </div>
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className={`archi-builder-v4 viewport-${viewport}`}>
                {/* TOOLBAR */}
                <header className="v4-toolbar">
                    <div className="t-left">
                        <button className="t-btn-back" onClick={() => navigate('/admin/paginas-v4')}><ChevronLeft size={20} /></button>
                        <div className="t-page-name">{page?.nombre} <span className="t-dot"></span> <span className="t-status">{page?.estado}</span></div>
                    </div>
                    <div className="t-center">
                        <div className="t-viewport-group">
                            <button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')}><Monitor size={18} /></button>
                            <button className={viewport === 'tablet' ? 'active' : ''} onClick={() => setViewport('tablet')}><Tablet size={18} /></button>
                            <button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')}><Smartphone size={18} /></button>
                        </div>
                    </div>
                    <div className="t-right">
                        <button className="t-btn-preview" onClick={() => window.open(`/p/${page?.slug}?preview=true`, '_blank')}><Eye size={16} /> <span>Previa</span></button>
                        <button className="t-btn-save" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Check size={16} /> : <Save size={16} />}
                            {isSaving ? 'Guardando' : 'Guardar'}
                        </button>
                    </div>
                </header>

                <main className="v4-editor-layout">
                    {/* SIDEBAR LEFT */}
                    <aside className="v4-sidebar">
                        <div className="v4-sidebar-header">
                            <div className="s-icons">
                                <button className={activeTab === 'elements' ? 'active' : ''} onClick={() => setActiveTab('elements')}><Plus size={20} /></button>
                                <button className={activeTab === 'layers' ? 'active' : ''} onClick={() => setActiveTab('layers')}><Layers size={20} /></button>
                                <button className={activeTab === 'seo' ? 'active' : ''} onClick={() => setActiveTab('seo')}><Globe size={20} /></button>
                                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={20} /></button>
                            </div>
                        </div>

                        <div className="s-content">
                            {activeTab === 'elements' && (
                                <div className="s-pane">
                                    <h3>Componentes</h3>
                                    <div className="s-palette-grid">
                                        {COMPONENT_PALETTE.map(c => (
                                            <DraggableItem key={c.type} item={c} onClick={onAddSidePalette} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'layers' && (
                                <div className="s-pane">
                                    <h3>Navegador de Capas</h3>
                                    <div className="s-layers-tree">
                                        {content.map((row, rIdx) => (
                                            <div key={row.id || `row-${rIdx}`} className="s-layer-row">
                                                <div className="s-layer-label" onClick={() => setActiveElement(row)}><Layout size={12} /> Fila {rIdx + 1}</div>
                                                <div className="s-layer-children">
                                                    {row.children.map((col, cIdx) => (
                                                        <div key={col.id || `col-${rIdx}-${cIdx}`} className="s-layer-col">
                                                            <div className="s-layer-label">Columna {cIdx + 1}</div>
                                                            <div className="s-layer-children">
                                                                {col.children.map((comp, compIdx) => (
                                                                    <div key={comp.id || `comp-${rIdx}-${cIdx}-${compIdx}`} className="s-layer-item" onClick={() => setActiveElement(comp)}>{comp.type}</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'seo' && (
                                <div className="s-pane">
                                    <h3>Configuración SEO</h3>
                                    <div className="s-form-field">
                                        <label>Meta Título</label>
                                        <input value={page?.seo_title || ''} onChange={e => setPage({ ...page, seo_title: e.target.value })} />
                                    </div>
                                    <div className="s-form-field">
                                        <label>Meta Descripción</label>
                                        <textarea rows="4" value={page?.seo_description || ''} onChange={e => setPage({ ...page, seo_description: e.target.value })} />
                                    </div>
                                    <div className="s-seo-preview">
                                        <div className="p-title">{page?.seo_title || page?.nombre}</div>
                                        <div className="p-url">tuweb.com/p/{page?.slug}</div>
                                        <div className="p-desc">{page?.seo_description || 'Sin descripción...'}</div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="s-pane">
                                    <h3>Ajustes Generales</h3>
                                    <div className="s-form-field">
                                        <label>Nombre de Página</label>
                                        <input value={page?.nombre || ''} onChange={e => setPage({ ...page, nombre: e.target.value })} />
                                    </div>
                                    <div className="s-form-field">
                                        <label>URL (Slug)</label>
                                        <input value={page?.slug || ''} onChange={e => setPage({ ...page, slug: e.target.value })} />
                                    </div>
                                    <div className="s-form-check">
                                        <input type="checkbox" checked={page?.is_homepage || false} onChange={e => setPage({ ...page, is_homepage: e.target.checked })} id="chHome" />
                                        <label htmlFor="chHome">Establecer como Inicio</label>
                                    </div>

                                    <div className="s-form-check mt-10">
                                        <input type="checkbox" checked={page?.is_visible !== 0} onChange={e => setPage({ ...page, is_visible: e.target.checked ? 1 : 0 })} id="chVisible" />
                                        <label htmlFor="chVisible">Página Pública en Menú</label>
                                    </div>

                                    <div className="s-form-field mt-20">
                                        <label>Color de fondo de página</label>
                                        <div className="s-color-picker-row">
                                            <input
                                                type="color"
                                                value={page?.style_config?.canvasBg || '#121212'}
                                                onChange={e => updateCanvasBg(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                value={page?.style_config?.canvasBg || '#121212'}
                                                onChange={e => updateCanvasBg(e.target.value)}
                                            />
                                        </div>
                                        <div className="s-color-presets mt-10">
                                            {['#FFFFFF', '#F8F8F8', '#121212', '#000000', '#F3E5F5', '#E3F2FD'].map(c => (
                                                <div
                                                    key={c}
                                                    className="s-preset"
                                                    style={{ background: c, border: c === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                                                    onClick={() => updateCanvasBg(c)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="s-form-field mt-20">
                                        <label>Color global de texto</label>
                                        <div className="s-color-picker-row">
                                            <input
                                                type="color"
                                                value={page?.style_config?.canvasText || '#FFFFFF'}
                                                onChange={e => setPage({
                                                    ...page,
                                                    style_config: { ...page.style_config, canvasText: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="text"
                                                value={page?.style_config?.canvasText || '#FFFFFF'}
                                                onChange={e => setPage({
                                                    ...page,
                                                    style_config: { ...page.style_config, canvasText: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="s-color-presets mt-10">
                                            {['#121212', '#FFFFFF', '#666666', '#ff8484', '#000000'].map(c => (
                                                <div
                                                    key={c}
                                                    className="s-preset"
                                                    style={{ background: c, border: c === '#121212' ? '1px solid #333' : 'none' }}
                                                    onClick={() => setPage({
                                                        ...page,
                                                        style_config: { ...page.style_config, canvasText: c }
                                                    })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="s-danger mt-30">
                                        <button className="btn-v4-danger" onClick={() => deleteElement(id)}>Eliminar Página Permanentemente</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* CANVAS AREA */}
                    <div className="v4-canvas-container">
                        <div className="v4-canvas-paper" style={{
                            background: page?.style_config?.canvasBg || '#121212',
                            color: page?.style_config?.canvasText || '#FFFFFF'
                        }}>
                            <CanvasErrorBoundary>
                                {content.length === 0 ? (
                                    <div className="v4-empty" style={{ color: 'inherit' }}>
                                        <h2 style={{ color: 'inherit' }}>Diseño Vacío</h2>
                                        <p style={{ color: 'inherit', opacity: 0.6 }}>Comienza a construir arrastrando una fila desde el panel izquierdo.</p>
                                        <button className="btn-v4-add-initial" onClick={addRow}>
                                            <Plus size={18} style={{ marginRight: '8px' }} />
                                            Crear Bloque ArchiPlanner
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <SortableContext items={(content || []).map(r => String(r.id))} strategy={verticalListSortingStrategy}>
                                            {content.map(row => (
                                                <SortableRowWrapper key={row.id} row={row} onEdit={() => setActiveElement(row)}>
                                                    {row.children.map(col => (
                                                        <DroppableColumn
                                                            key={col.id}
                                                            id={col.id}
                                                            span={col.span}
                                                            config={col.config}
                                                            onEdit={() => setActiveElement(col)}
                                                            onAddComponent={addComponentToColumn}
                                                        >
                                                            {col.children.map(comp => (
                                                                <SortableComponentWrapper
                                                                    key={comp.id}
                                                                    comp={comp}
                                                                    activeElementId={activeElement?.id}
                                                                    onClick={(e) => { e.stopPropagation(); setActiveElement(comp); }}
                                                                    renderComponent={renderComponent}
                                                                />
                                                            ))}
                                                        </DroppableColumn>
                                                    ))}
                                                </SortableRowWrapper>
                                            ))}
                                        </SortableContext>
                                        <div className="v4-canvas-footer">
                                            <button className="btn-v4-add-row-persistent" onClick={addRow}>
                                                <Plus size={18} />
                                                <span>Añadir Nuevo Bloque / Fila</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </CanvasErrorBoundary>
                        </div>
                    </div>

                    {/* PROPERTY PANEL */}
                    {activeElement && (
                        <PropertyPanel
                            activeElement={activeElement}
                            updateElement={updateElement}
                            deleteElement={deleteElement}
                            duplicateElement={duplicateElement}
                            systemConfig={systemConfig}
                            allCategories={allCategories}
                            onClose={() => setActiveElement(null)}
                        />
                    )}
                </main>

                <DragOverlay>
                    {/* Drag Overlay is simple for now, just shows a representation of the item */}
                </DragOverlay>

                <style dangerouslySetInnerHTML={{
                    __html: `
                .archi-builder-v4 { height: 100vh; display: flex; flex-direction: column; background: #000; color: white; overflow: hidden; position: fixed; inset: 0; z-index: 9999; }
                .v4-toolbar { height: 70px; background: #0b0b0b; border-bottom: 1px solid #1a1a1a; display: flex; justify-content: space-between; align-items: center; padding: 0 25px; }
                .t-left, .t-center, .t-right { flex: 1; display: flex; align-items: center; }
                .t-center { justify-content: center; }
                .t-right { justify-content: flex-end; gap: 15px; }
                .t-btn-back { background: transparent; border: none; color: white; cursor: pointer; margin-right: 15px; }
                
                .t-viewport-group { background: #1a1a1a; padding: 5px; border-radius: 12px; display: flex; gap: 5px; }
                .t-viewport-group button { background: transparent; border: none; color: #555; padding: 8px 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .t-viewport-group button.active { background: #000; color: #ff8484; }
                
                .t-btn-preview {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .t-btn-preview:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: #ff8484;
                }

                .t-btn-save { background: #ff8484; color: black; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; }
                
                .v4-editor-layout { display: flex; flex: 1; overflow: hidden; }
                .v4-sidebar { width: 320px; background: #0b0b0b; border-right: 1px solid #1a1a1a; display: flex; }
                .s-icons { width: 70px; background: #050505; display: flex; flex-direction: column; align-items: center; padding-top: 25px; gap: 20px; }
                .s-icons button { background: transparent; border: none; color: #444; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .s-icons button.active { color: #ff8484; background: rgba(255,132,132,0.1); }
                .s-content { flex: 1; padding: 25px; overflow-y: auto; }
                .s-content h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 25px; }
                
                .s-palette-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .s-item { background: #151515; border: 1px solid #222; padding: 20px 10px; border-radius: 15px; text-align: center; cursor: pointer; transition: 0.2s; }
                .s-item:hover { transform: translateY(-3px); border-color: #ff8484; }
                .s-item-icon { color: #666; margin-bottom: 8px; }
                .s-item span { font-size: 11px; font-weight: 600; color: #ccc; }
                
                .v4-canvas-container { flex: 1; background: #111; overflow-y: auto; padding: 20px 0; display: flex; justify-content: center; }
                .v4-canvas-paper { background: white; width: 100%; max-width: 1200px; min-height: 800px; box-shadow: 0 40px 100px rgba(0,0,0,0.8); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease; box-sizing: border-box; padding: 0; }
                .viewport-tablet .v4-canvas-paper { max-width: 768px; }
                .viewport-mobile .v4-canvas-paper { max-width: 375px; }
                
                .v4-comp-wrapper { position: relative; border: 1px solid transparent; min-height: 20px; transition: all 0.2s ease; }
                .v4-comp-wrapper:hover { border-color: rgba(255,132,132,0.3); background: rgba(255,255,255,0.01); }
                .v4-comp-wrapper.active { border: 2px solid #ff8484 !important; outline: 4px solid rgba(255,132,132,0.1); z-index: 5; }
                
                .comp-drag-handle {
                    position: absolute; top: 10px; right: 10px; background: #ff8484; color: black;
                    width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center;
                    justify-content: center; opacity: 0; cursor: grab; transition: 0.2s; z-index: 10;
                }
                .v4-comp-wrapper:hover .comp-drag-handle { opacity: 1; }
                .comp-drag-handle:active { cursor: grabbing; }

                .sortable-row-handle-container { position: relative; margin-bottom: 2px; }
                .row-drag-handle {
                    position: absolute; left: -25px; top: 50%; transform: translateY(-50%);
                    background: #222; color: #666; width: 20px; height: 40px; border-radius: 4px;
                    display: flex; align-items: center; justify-content: center; cursor: grab;
                    transition: 0.2s; z-index: 10; border: 1px solid #333;
                }
                .row-drag-handle:hover { color: #ff8484; border-color: #ff8484; background: #000; }
                .row-drag-handle.grabbing { cursor: grabbing; color: #ff8484; }

                .v4-btn-add-comp { width: 100%; padding: 10px; background: rgba(0,0,0,0.02); border: 1px dashed #ddd; color: #ccc; cursor: pointer; opacity: 0; border-radius: 8px; margin-top: 10px; }
                .builder-col:hover .v4-btn-add-comp { opacity: 1; }
                .v4-btn-add-comp:hover { background: rgba(255,132,132,0.05); color: #ff8484; border-color: #ff8484; }


                .s-form-field { margin-bottom: 20px; }
                .s-form-field label { display: block; font-size: 11px; font-weight: 700; color: #666; margin-bottom: 8px; }
                .s-form-field input, .s-form-field textarea { background: #1a1a1a; border: 1px solid #222; border-radius: 10px; color: white; width: 100%; padding: 12px; font-size: 14px; }
                
                .s-color-picker-row { display: flex; gap: 10px; }
                .s-color-picker-row input[type="color"] { width: 50px; padding: 5px; height: 45px; cursor: pointer; }
                .s-color-picker-row input[type="text"] { flex: 1; text-transform: uppercase; }
                
                .s-color-presets { display: flex; gap: 8px; flex-wrap: wrap; }
                .s-preset { width: 25px; height: 25px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
                .s-preset:hover { transform: scale(1.2); }

                .s-seo-preview { background: white; padding: 20px; border-radius: 15px; margin-top: 30px; }
                .s-seo-preview .p-title { color: #1a0dab; font-size: 18px; }
                .s-seo-preview .p-url { color: #006621; font-size: 14px; }
                .s-seo-preview .p-desc { color: #545454; font-size: 13px; }
                
                .s-layers-tree { font-size: 11px; }
                .s-layer-label { padding: 8px; border-radius: 8px; cursor: pointer; color: #888; display: flex; align-items: center; gap: 8px; }
                .s-layer-label:hover { background: #1a1a1a; color: white; }
                .s-layer-children { padding-left: 15px; border-left: 1px solid #222; margin-left: 10px; }
                .s-layer-item { padding: 5px 10px; opacity: 0.5; cursor: pointer; }
                .s-layer-item:hover { opacity: 1; color: #ff8484; }
                
                .v4-empty { padding: 100px 40px; text-align: center; color: #222; }
                .btn-v4-add-initial { background: #ff8484; color: black; border: none; padding: 18px 40px; border-radius: 50px; font-weight: 800; cursor: pointer; margin-top: 30px; }

                .v4-canvas-footer { padding: 40px; display: flex; justify-content: center; border-top: 1px dashed rgba(0,0,0,0.05); }
                .btn-v4-add-row-persistent {
                    background: transparent; border: 2px dashed rgba(255, 132, 132, 0.2);
                    color: #777; padding: 15px 40px; border-radius: 50px; font-weight: 700;
                    font-size: 13px; cursor: pointer; transition: 0.3s; display: flex;
                    align-items: center; gap: 12px;
                }
                .btn-v4-add-row-persistent:hover {
                    border-color: #ff8484; color: #ff8484; background: rgba(255, 132, 132, 0.05);
                    transform: translateY(-2px);
                }

                .is-dragging { opacity: 0.5; cursor: grabbing !important; border: 1px dashed #ff8484 !important; }
                .v4-droppable-col { position: relative; min-height: 50px; }
                .v4-droppable-col.is-over { background: rgba(255, 132, 132, 0.05); }
                
                /* New Insertion Buttons */
                .v4-col-inner { position: relative; padding: 10px 0; }
                
                .v4-btn-add-top, .v4-btn-add-bottom {
                    width: 100%; height: 30px; border: 1px dashed rgba(255,132,132,0.2);
                    background: transparent; color: #666; font-size: 11px; font-weight: 700;
                    cursor: pointer; opacity: 0; transition: 0.2s; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    z-index: 10;
                }
                
                .v4-btn-add-top { margin-bottom: 15px; border-style: dotted; }
                .v4-btn-add-bottom { margin-top: 15px; }

                .v4-droppable-col:hover .v4-btn-add-top,
                .v4-droppable-col:hover .v4-btn-add-bottom { opacity: 0.3; }
                
                .v4-btn-add-top:hover, .v4-btn-add-bottom:hover { 
                    opacity: 1 !important; background: rgba(255,132,132,0.05); border-color: #ff8484; color: #ff8484;
                }

                .drop-indicator-v4 { 
                    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                    background: rgba(40, 20, 20, 0.6); border: 2px dashed #ff8484; color: #ff8484; 
                    font-size: 12px; font-weight: 800; z-index: 50; pointer-events: none; border-radius: 15px;
                    backdrop-filter: blur(2px);
                }
                .di-label { background: #ff8484; color: black; padding: 5px 15px; border-radius: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }

                .btn-v4-danger {
                    background: #1a1a1a;
                    border: 1px solid rgba(255, 0, 0, 0.2);
                    color: #ff4444;
                    padding: 12px;
                    width: 100%;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: 0.2s;
                    font-weight: 600;
                    font-size: 12px;
                }
                .btn-v4-danger:hover {
                    background: #ff4444;
                    color: white;
                    box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
                }

                /* MARQUEE */
                .marquee-track {
                    display: flex;
                    width: max-content;
                    animation: marquee 40s linear infinite;
                }
                .marquee-item {
                    width: 400px;
                    height: 500px;
                    flex-shrink: 0;
                    margin-right: 20px;
                }
                .marquee-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 20px;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                /* CTA PHONE V4 PREVIEW (EDICIÓN) */
                .v4-cta-phone-container {
                    position: relative;
                    padding: 60px 0;
                    display: flex;
                    align-items: center;
                    overflow: visible;
                }
                .v4-cta-phone-preview {
                    width: 90%;
                    margin-left: auto;
                    border-radius: 30px 0 0 30px;
                    padding: 80px 40px 80px 120px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    position: relative;
                    z-index: 1;
                }
                .v4-cta-phone-pop {
                    position: absolute !important;
                    left: 2% !important;
                    top: 50% !important;
                    transform: translateY(-50%) rotate(-3deg) !important;
                    z-index: 10 !important;
                    width: 280px !important; /* Slightly smaller for editor sidebar space */
                    height: 500px !important;
                }
                .v4-cta-content { color: white; flex: 1; }
                .v4-cta-content .c-hook { display: block; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; font-size: 11px; margin-bottom: 12px; opacity: 0.9; }
                .v4-cta-content .c-title { font-size: 38px; font-weight: 800; line-height: 1.2; margin-bottom: 20px; white-space: normal; }
                .v4-cta-content .c-closure { font-size: 15px; opacity: 0.8; line-height: 1.6; margin-bottom: 30px; max-width: 500px; }
                .v4-cta-content .c-btn { padding: 15px 35px; border-radius: 10px; border: none; color: white; font-weight: 700; text-transform: uppercase; font-size: 12px; cursor: pointer; }

                .marquee-content-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.2);
                    pointer-events: none;
                    z-index: 2;
                }

                /* PREMIUM HEADING */
                .v4-premium-header-group {
                    padding: 40px 0;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }
                .v4-premium-header-group.text-left { align-items: flex-start; text-align: left; }
                .v4-premium-header-group.text-center { align-items: center; text-align: center; }
                .v4-premium-header-group.text-right { align-items: flex-end; text-align: right; }

                .v4-premium-tagline {
                    display: block;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 5px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    color: var(--v4-tagline-color);
                }
                .v4-premium-title-container {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }
                .v4-premium-title-main {
                    font-family: 'Playfair Display', serif;
                    font-size: var(--v4-font-size);
                    color: var(--v4-title-color);
                    font-weight: var(--v4-font-weight);
                    line-height: 1.05;
                    margin: 0;
                }
                .v4-premium-title-highlight {
                    font-family: 'Playfair Display', serif;
                    font-size: var(--v4-font-size);
                    color: var(--v4-highlight-color);
                    font-style: italic;
                    font-weight: 400;
                    line-height: 1.05;
                    margin: 2px 0 0 0;
                }
                .v4-premium-description {
                    font-size: 16px;
                    line-height: 1.6;
                    color: rgba(255,255,255,0.7);
                    max-width: 600px;
                    font-weight: 300;
                    margin: 20px 0 0 0;
                }
                .v4-premium-line-block {
                    margin-top: 30px;
                    display: flex;
                    width: 100%;
                }
                .v4-premium-line {
                    width: 60px;
                    height: 2px;
                    background: var(--v4-highlight-color);
                }

                /* GALLERY V4 */
                .v4-gallery-grid {
                    display: grid;
                    width: 100%;
                }
                .v4-gallery-item {
                    aspect-ratio: 1/1;
                    overflow: hidden;
                    border-radius: 12px;
                    background: #151515;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: 0.3s;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .v4-gallery-item.placeholder { color: #444; gap: 10px; }
                .v4-gallery-item.placeholder span { font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.5; }
                .v4-gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .v4-gallery-item:hover { transform: scale(1.02); border-color: var(--color-primary); }

                /* PORTFOLIO V4 */
                .v4-portfolio-container { padding: 40px 20px; width: 100%; }
                .v4-portfolio-filters { display: flex; justify-content: center; gap: 12px; margin-bottom: 50px; flex-wrap: wrap; }
                .v4-filter-pill { 
                    background: transparent; border: 1px solid rgba(255,132,132,0.3); color: #777; 
                    padding: 8px 24px; border-radius: 30px; font-size: 11px; font-weight: 800; 
                    cursor: pointer; transition: 0.3s; letter-spacing: 1px;
                }
                .v4-filter-pill:hover { border-color: var(--color-primary); color: #fff; }
                .v4-filter-pill.active { background: rgba(255,132,132,0.1); border-color: var(--color-primary); color: var(--color-primary); }

                .v4-portfolio-grid { display: grid; width: 100%; }
                .v4-portfolio-card { 
                    position: relative; aspect-ratio: 9/13; border-radius: 20px; overflow: hidden; 
                    background: #111; cursor: pointer; transition: 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .portfolio-media { width: 100%; height: 100%; }
                .portfolio-media img { width: 100%; height: 100%; object-fit: cover; transition: 0.8s; }
                .v4-portfolio-card:hover .portfolio-media img { transform: scale(1.1); }
                
                .portfolio-content { 
                    position: absolute; bottom: 0; left: 0; right: 0; padding: 30px; 
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
                    display: flex; flex-direction: column; gap: 5px;
                }
                .portfolio-tag { font-size: 10px; font-weight: 900; color: var(--color-primary); text-transform: uppercase; letter-spacing: 2px; }
                .portfolio-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #fff; margin: 0; letter-spacing: -0.5px; }
                
                .v4-portfolio-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                .v4-portfolio-card:hover::after { opacity: 1; }
                .v4-portfolio-card::after { 
                    content: ''; position: absolute; inset: 0; border: 1px solid rgba(255,132,132,0.2); 
                    border-radius: 20px; pointer-events: none; opacity: 0; transition: 0.3s;
                }
            `}} />
            </div>
        </DndContext>
    );
};

export default VisualBuilderV4;
