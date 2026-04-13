import React from 'react';
import { 
    Layout, Type, MousePointer, Code, 
    Image as ImageIcon, Quote, Video, Briefcase, 
    Columns, Grid, GalleryVertical, Smartphone, Plus
} from 'lucide-react';

/**
 * Registry of available components in ArchiPlanner Master Builder V3.
 * CATEGORIES: Layout, Typography, Media, Dynamic, Corporate
 */
export const COMPONENT_REGISTRY = [
    // --- CATEGORY: LAYOUT ---
    {
        id: 'GRID_LAYOUT',
        label: 'Grid Multi-Columna',
        category: 'Layout',
        icon: <Grid size={18} />,
        description: 'Contenedor flexible para crear diseños de múltiples columnas.',
        defaultMetadata: {
            titulo: 'Layout Rejilla',
            columnas: [ { elementos: [] }, { elementos: [] } ],
            estilos: { paddingTop: '80px', paddingBottom: '80px', gap: '40px', gridDirection: 'row' }
        }
    },
    {
        id: 'CUSTOM_ZONE',
        label: 'Zona Libre',
        category: 'Layout',
        icon: <Plus size={18} />,
        description: 'Una zona simple para soltar componentes en vertical.',
        defaultMetadata: {
            titulo: 'Zona Libre',
            elementos: [],
            estilos: { paddingTop: '60px', paddingBottom: '60px' }
        }
    },
    {
        id: 'COLUMNS_2',
        label: 'Dos Columnas (Simétrico)',
        category: 'Layout',
        icon: <Columns size={18} />,
        description: 'División horizontal 1:1 sólida.',
        defaultMetadata: {
            titulo: 'Layout 2 Columnas',
            columnas: [ { elementos: [] }, { elementos: [] } ],
            estilos: { paddingTop: '60px', paddingBottom: '60px', gap: '30px', gridDirection: 'row' }
        }
    },
    {
        id: 'COLUMNS_3',
        label: 'Tres Columnas',
        category: 'Layout',
        icon: <Grid size={18} />,
        description: 'División horizontal 1:1:1.',
        defaultMetadata: {
            titulo: 'Layout 3 Columnas',
            columnas: [ { elementos: [] }, { elementos: [] }, { elementos: [] } ],
            estilos: { paddingTop: '60px', paddingBottom: '60px', gap: '20px', gridDirection: 'row' }
        }
    },

    // --- CATEGORY: LITE ELEMENTS ---
    {
        id: 'TITLE',
        label: 'Título de Sección',
        category: 'Typography',
        icon: <Type size={18} />,
        description: 'Título editorial grande con subtítulo centrado.',
        defaultMetadata: {
            titulo: 'Nuestro Legado',
            subtitulo: 'Diseño que trasciende el tiempo',
            estilos: { paddingTop: '100px', paddingBottom: '40px', textAlign: 'center' }
        }
    },
    {
        id: 'HTML',
        label: 'Bloque de Texto / HTML',
        category: 'Typography',
        icon: <Code size={18} />,
        description: 'Ideal para descripciones largas, listas o código embed.',
        defaultMetadata: {
            titulo: 'Nota Editorial',
            html: '<p>Ingresa tu contenido aquí...</p>',
            estilos: { paddingTop: '40px', paddingBottom: '40px' }
        }
    },

    // --- CATEGORY: MEDIA ---
    {
        id: 'HERO_MODERN',
        label: 'Hero Moderno (Cinemático)',
        category: 'Media',
        icon: <Layout size={18} style={{ color: '#d4af37' }} />,
        description: 'Cabecera de alto impacto con video de fondo y carrusel lateral.',
        defaultMetadata: {
            titulo: 'Creamos Historias Inolvidables',
            subtitulo: 'Curaduría de eventos para almas sofisticadas',
            media_type: 'image',
            media_path: '',
            ancho_total: true
        }
    },
    {
        id: 'IMAGE',
        label: 'Imagen Premium',
        category: 'Media',
        icon: <ImageIcon size={18} />,
        description: 'Imagen a pantalla completa o con marco dinámico.',
        defaultMetadata: {
            titulo: 'Captura Visual',
            media_path: '',
            estilos: { borderRadius: '20px', overflow: 'hidden' }
        }
    },
    {
        id: 'VIDEO_REELS',
        label: 'Reels / Historias Verticales',
        category: 'Media',
        icon: <Smartphone size={18} />,
        description: 'Galería de videos verticales tipo Instagram.',
        defaultMetadata: {
            titulo: 'Historias en Movimiento',
            items: []
        }
    },

    // --- CATEGORY: MARKETING ---
    {
        id: 'CTA',
        label: 'Llamado a la Acción',
        category: 'Marketing',
        icon: <MousePointer size={18} />,
        description: 'Botón destacado con fondo visual para conversiones.',
        defaultMetadata: {
            titulo: '¿Listo para empezar?',
            subtitulo: 'Hablemos de tu próximo gran evento',
            texto_boton: 'Agendar Cita',
            cta_slug: 'default',
            estilos_boton: { 
                variant: 'primary', // primary, outline, solid-white
                size: 'normal',   // small, normal, large
                borderRadius: '8px'
            }
        }
    },
    {
        id: 'TESTIMONIALS',
        label: 'Módulo de Testimonios',
        category: 'Marketing',
        icon: <Quote size={18} />,
        description: 'Carrusel de opiniones de clientes con fotos.',
        defaultMetadata: {
            titulo: 'Palabras de Confianza'
        }
    },

    // --- CATEGORY: DYNAMIC ---
    {
        id: 'SERVICES',
        label: 'Rejilla de Servicios',
        category: 'Dynamic',
        icon: <Briefcase size={18} />,
        description: 'Listado dinámico de servicios principales de la empresa.',
        defaultMetadata: {
            titulo: 'Nuestras Experiencias',
            layout: 'grid'
        }
    },
    {
        id: 'STORIES',
        label: 'Galería de Historias',
        category: 'Dynamic',
        icon: <GalleryVertical size={18} />,
        description: 'Explorador visual de casos de éxito recientes.',
        defaultMetadata: {
            titulo: 'Visto en el Hero'
        }
    },
    {
        id: 'FORM',
        label: 'Formulario de Contacto',
        category: 'Marketing',
        icon: <Plus size={18} />,
        description: 'Capturar leads con campos personalizados.',
        defaultMetadata: {
            titulo: 'Contáctanos',
            mensaje_exito: '¡Gracias! Nos pondremos en contacto pronto.',
            email_destino: 'admin@archiplanner.com',
            campos: [
                { id: 1, label: 'Nombre Completo', tipo: 'text', placeholder: 'Tu nombre...', required: true },
                { id: 2, label: 'Email', tipo: 'email', placeholder: 'tu@email.com', required: true },
                { id: 3, label: 'Mensaje', tipo: 'textarea', placeholder: '¿Cómo podemos ayudarte?', required: false }
            ]
        }
    },
    {
        id: 'PULSE',
        label: 'Pulse de Marca',
        category: 'Dynamic',
        icon: <Plus size={18} style={{ color: '#e1a694' }} />,
        description: 'Sección de pilares estratégicos P-U-L-S-E con estética Oro Rosa.',
        defaultMetadata: {
            titulo: 'El Pulse de cada Evento',
            tag: 'VIVIMOS EL MÉTODO',
            closingPhrase: 'Vivimos el pulse de cada evento...',
            estilos: { paddingTop: '0px', paddingBottom: '0px' }
        }
    }
];

export const CATEGORIES = ['Layout', 'Typography', 'Media', 'Marketing', 'Dynamic'];

export const getComponentByType = (type) => COMPONENT_REGISTRY.find(c => c.id === type);
