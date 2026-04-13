import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paginasV4Service from '../services/paginasV4Service';
import BuilderRow from '../components/builder/Row';
import BuilderColumn from '../components/builder/Column';
import SectionHeroModern from '../components/ui/SectionHeroModern';
import EditorialTestimonials from '../components/ui/Tesimonios';
import { API_BASE_URL, UPLOADS_URL } from '../config';
import Swal from 'sweetalert2';
import { ArrowRight } from 'lucide-react';
import PhoneMockup from '../components/ui/PhoneMockup';
import SectionPulse from '../components/ui/SectionPulse';
import galeriaService from '../services/galeriaService';

const PublicPageViewV4 = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [stories, setStories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('todos');
    const [systemConfig, setSystemConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({ nombre: '', correo: '', telefono: '', mensaje: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resolveMediaPath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Clean leading slash if any
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Ensure we point to the absolute URL of the backend
        return `${UPLOADS_URL}/${cleanPath}`;
    };

    useEffect(() => {
        const fetchPage = async () => {
            try {
                // Fetch site stories for hero components
                const targetSlug = slug || 'homepage_v4';

                // Parallel fetch for content and dynamic data
                // Parallel fetch for content and branding (critical)
                const [pageData, configRes] = await Promise.all([
                    paginasV4Service.getBySlug(targetSlug),
                    fetch(`${API_BASE_URL}/config`).then(r => r.json()).catch(() => ({}))
                ]);

                setSystemConfig(configRes);

                // Optional: Fetch Dynamic Data
                try {
                    const [gRes, cRes, servicesRes, hRes] = await Promise.all([
                        galeriaService.getEventos().catch(() => []),
                        galeriaService.getCategorias().catch(() => []),
                        fetch(`${API_BASE_URL}/services`).then(r => r.json()).catch(() => []),
                        fetch(`${API_BASE_URL}/historias`).then(r => r.json()).catch(() => [])
                    ]);
                    setAllEvents(gRes);
                    setAllCategories(cRes);
                    setStories(gRes.length > 0 ? gRes : (hRes || []));
                    setAllServices(servicesRes);
                } catch (optErr) {
                    console.error("Optional data load failed:", optErr);
                }

                const data = pageData;
                const searchParams = new URLSearchParams(window.location.search);
                const isPreview = searchParams.get('preview') === 'true';

                // Verify publication and visibility status for public users
                const isNotPublished = data.estado !== 'publicado';
                const isNotVisible = Number(data.is_visible) === 0;

                if ((isNotPublished || isNotVisible) && !isPreview) {
                    setError('La página aún no está disponible para el público.');
                } else {
                    setPage(data);
                    document.title = `${data.nombre} | ArchiPlanner`;
                }
            } catch (err) {
                console.error("Error loading V4 page:", err);
                setError('Página no encontrada');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    const handleFormSubmit = async (e, config) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await paginasV4Service.submitContact({
                ...formData,
                pagina_origen: page.nombre
            });
            Swal.fire({
                title: '¡Mensaje Enviado!',
                text: 'Gracias por contactarnos. Un asesor se comunicará contigo pronto.',
                icon: 'success',
                confirmButtonColor: '#d4af37'
            });
            setFormData({ nombre: '', correo: '', telefono: '', mensaje: '' });
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.', 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                                <button className="v4-card-btn" style={{ background: labelColor }} onClick={() => navigate(linkUrl)}>
                                    {linkLabel} <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                                </button>
                            ) : (
                                <div className="card-link" style={{ color: labelColor }} onClick={() => navigate(linkUrl)}>
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

    const renderComponent = (comp) => {
        const { type, config } = comp;

        switch (type) {
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
                    const currentCat = activeCategory || config.category || 'todos';
                    const filtered = allEvents.filter(ev => 
                        currentCat === 'todos' || 
                        ev.slug === currentCat || 
                        (ev.categoria_nombre && ev.categoria_nombre.toLowerCase() === currentCat.toLowerCase())
                    );
                    
                    return (
                        <div className="v4-portfolio-container section-padding">
                            <div className="v4-portfolio-filters">
                                <button 
                                    className={`v4-filter-pill ${currentCat === 'todos' ? 'active' : ''}`}
                                    onClick={() => setActiveCategory('todos')}
                                >TODOS</button>
                                {allCategories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        className={`v4-filter-pill ${currentCat === cat.slug ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.slug)}
                                    >
                                        {cat.nombre.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="v4-portfolio-grid" style={{ 
                                gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)`,
                                gap: `${config.gap || 20}px` 
                            }}>
                                {filtered.map((ev, idx) => (
                                    <div key={idx} className="v4-portfolio-card">
                                        <div className="portfolio-media">
                                            <img src={resolveMediaPath(ev.portada_url)} alt={ev.titulo} loading="lazy" />
                                        </div>
                                        <div className="portfolio-content">
                                            <div className="portfolio-tag">{ev.categoria_nombre || 'EVENTO'}</div>
                                            <h3 className="portfolio-title">{ev.titulo}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="v4-gallery-container section-padding">
                        <div className="v4-gallery-grid" style={{ 
                            gridTemplateColumns: `repeat(${config.columns || 4}, 1fr)`,
                            gap: `${config.gap || 10}px` 
                        }}>
                            {(config.images || []).map((img, idx) => (
                                <div key={idx} className="v4-gallery-item">
                                    <img src={resolveMediaPath(img)} alt={`Gallery ${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div style={{
                        color: config.textColor,
                        fontSize: config.fontSize,
                        textAlign: config.textAlign,
                        fontWeight: config.fontWeight || '400',
                        fontFamily: config.fontFamily || 'inherit'
                    }}
                        dangerouslySetInnerHTML={{ __html: config.content }} />
                );
            case 'image':
                return <img src={config.src || ''} style={{ width: '100%', display: 'block', borderRadius: '8px' }} alt={config.alt} />;
            case 'button':
                const handleClick = () => {
                    if (config.linkType === 'internal') {
                        navigate(config.link);
                    } else {
                        window.open(config.link, '_blank');
                    }
                };
                return (
                    <div className={`btn-rendered-wrapper text-${config.textAlign || 'center'}`} style={{ padding: '10px 0' }}>
                        <button className={`btn-v4 btn-v4-${config.style || 'primary'}`} onClick={handleClick} style={{ borderRadius: config.borderRadius || '8px' }}>
                            {config.label || 'Botón'}
                        </button>
                    </div>
                );
            case 'map':
                const encodedAddr = encodeURIComponent(config.address || 'Bogotá, Colombia');
                return (
                    <div className="map-rendered-container">
                        <iframe width="100%" height={config.height || "400"} frameBorder="0" style={{ border: 0, borderRadius: '12px', overflow: 'hidden' }}
                            src={`https://maps.google.com/maps?q=${encodedAddr}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                );
            case 'form':
                return (
                    <div className="form-rendered-container premium-form-v4">
                        <h3 className="v4-premium-title" style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
                            {config.title || 'Contáctanos'}
                        </h3>
                        <form className="form-v4-grid" onSubmit={(e) => handleFormSubmit(e, config)}>
                            <div className="form-field">
                                <label>Nombre Completo</label>
                                <input type="text" className="dense-input" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label>Correo Electrónico</label>
                                <input type="email" className="dense-input" required value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
                            </div>
                            <div className="form-field full">
                                <label>Teléfono</label>
                                <input type="text" className="dense-input" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                            </div>
                            <div className="form-field full">
                                <label>Mensaje</label>
                                <textarea className="dense-input" required value={formData.mensaje} onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}></textarea>
                            </div>
                            <button className="btn-v4 btn-v4-primary full" disabled={isSubmitting}>
                                {isSubmitting ? 'Enviando...' : (config.buttonLabel || 'Enviar')}
                            </button>
                        </form>
                    </div>
                );
            case 'stories':
                return (
                    <div className="v4-stories-container">
                        <div className="stories-horizontal-scroll">
                            {(config.items || []).map((item, idx) => (
                                <div key={idx} className="story-item-v4" onClick={() => item.video && window.open(item.video, '_blank')}>
                                    <div className="story-circle">
                                        <div className="story-inner">
                                            {item.image ? <img src={item.image} alt={item.title} /> : <div className="story-placeholder"></div>}
                                        </div>
                                    </div>
                                    <span className="story-label">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div className="video-rendered-container">
                        <video src={config.url} controls={config.controls} autoPlay={config.autoPlay} muted={config.muted} style={{ width: '100%', borderRadius: '12px' }} />
                    </div>
                );
            case 'hero-modern':
                return <SectionHeroModern data={config} stories={stories} />;
            case 'hero-marquee':
                return (
                    <div className="v4-hero-marquee" style={{ height: config.height || '400px', overflow: 'hidden', background: '#000', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div className="marquee-track">
                            {(config.images || []).concat(config.images || []).map((img, i) => (
                                <div key={i} className="marquee-item" style={{ width: '400px', flexShrink: 0, marginRight: '20px' }}>
                                    <img src={img} alt="Gallery" style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '20px' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'card-v4':
                return renderCardV4(config);
            case 'query-grid-v4':
                return renderQueryGridV4(config);
            case 'cta-editorial':
                return (
                    <div className="v4-cta-editorial p-40" style={{ textAlign: config.textAlign || 'center', background: config.bgColor || 'transparent', borderRadius: config.borderRadius || '20px' }}>
                        {config.title && <div className="v4-cta-title" dangerouslySetInnerHTML={{ __html: config.title }} />}
                        {config.content && <div className="v4-cta-text" dangerouslySetInnerHTML={{ __html: config.content }} />}
                        {config.buttonLabel && (
                            <a href={config.link} className={`btn-v4 btn-v4-${config.style || 'primary'}`} style={{ textDecoration: 'none', display: 'inline-block' }}>
                                {config.buttonLabel}
                            </a>
                        )}
                    </div>
                );
            case 'cta-phone-v4':
                return (
                    <div className="v4-cta-phone-container">
                        <PhoneMockup
                            src={resolveMediaPath(config.phoneVideo)}
                            className="v4-cta-phone-pop"
                        />
                        <div className="v4-cta-phone-component" style={{ backgroundColor: config.bgColor || '#121212' }}>
                            <div className="v4-cta-phone-wrapper">
                                <div className="v4-cta-content">
                                    {config.hook && <span className="c-hook" style={{ color: config.accentColor || '#e87c7c' }}>{config.hook}</span>}
                                    {config.title && <h2 className="c-title" dangerouslySetInnerHTML={{ __html: config.title }} />}
                                    {config.closure && <p className="c-closure" dangerouslySetInnerHTML={{ __html: config.closure }} />}
                                    {(() => {
                                        const phone = config.customPhone || systemConfig?.telefono || '';
                                        let href = config.link || '#';

                                        if (config.actionType === 'whatsapp') {
                                            const msg = encodeURIComponent(config.whatsappMessage || '');
                                            href = `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`;
                                        } else if (config.actionType === 'contacto') {
                                            href = '/contacto';
                                        } else if (config.actionType === 'sms') {
                                            href = `sms:${phone.replace(/\D/g, '')}`;
                                        } else if (config.actionType === 'call') {
                                            href = `tel:${phone.replace(/\D/g, '')}`;
                                        } else if (config.actionType === 'link') {
                                            href = config.link;
                                        }

                                        return (
                                            <a href={href} className="c-btn" style={{ backgroundColor: config.accentColor, textDecoration: 'none' }} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                                                {config.buttonLabel}
                                            </a>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'testimonios':
                return <EditorialTestimonials />;
            case 'PULSE':
                return <SectionPulse {...config} />;
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="public-loader">
            <div className="spinner-loader grow"></div>
            <p style={{ color: 'white', marginTop: '20px' }}>Cargando experiencia ArchiPlanner...</p>
        </div>
    );

    if (error) return (
        <div className="public-error-page">
            <h1>404</h1>
            <p>{error}</p>
            <button className="btn-v4 btn-v4-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
    );

    return (
        <div className="site-wrapper fade-in">
            {(page?.content || []).map(row => (
                <BuilderRow key={row.id} id={row.id} config={row.config}>
                    {(row.children || []).map(col => (
                        <BuilderColumn key={col.id} id={col.id} span={col.span} config={col.config}>
                            {(col.children || []).map(comp => (
                                <div key={comp.id} className="rendered-component">
                                    {renderComponent(comp)}
                                </div>
                            ))}
                        </BuilderColumn>
                    ))}
                </BuilderRow>
            ))}

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&display=swap');
                :root { --color-primary: #d4af37; --color-dark: #000000; --color-onyx: #121212; --font-premium: 'Outfit', sans-serif; }
                .site-wrapper { 
                    min-height: 100vh; 
                    background: ${page?.style_config?.canvasBg || '#fff'}; 
                    color: ${page?.style_config?.canvasText || 'inherit'};
                    font-family: var(--font-premium); 
                }
                .public-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; }
                .public-error-page { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; background: #000; color: white; }
                .public-error-page h1 { font-size: 120px; margin: 0; color: var(--color-primary); font-weight: 800; }
                .btn-v4 { padding: 14px 34px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; letter-spacing: 1px; }
                .btn-v4-primary { background: var(--color-primary); color: #000; }
                .btn-v4-primary:hover { background: #b8962d; transform: scale(1.05); }
                .btn-v4-secondary { background: var(--color-onyx); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .btn-v4-secondary:hover { background: #1a1a1a; filter: brightness(1.2); }
                .btn-v4-outline { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
                .btn-v4.full { width: 100%; }
                .form-rendered-container.premium-form-v4 { background: var(--color-onyx); border: 1px solid rgba(255,132,132,0.1); padding: 50px; border-radius: 30px; }
                .form-v4-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-field { display: flex; flex-direction: column; gap: 8px; }
                .form-field label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); font-weight: 700; }
                .form-field.full { grid-column: span 2; }

                .v4-premium-header-group { padding: 40px 0; display: flex; flex-direction: column; width: 100%; }
                .v4-premium-header-group.text-left { align-items: flex-start; text-align: left; }
                .v4-premium-header-group.text-center { align-items: center; text-align: center; }
                .v4-premium-header-group.text-right { align-items: flex-end; text-align: right; }
                .v4-premium-tagline { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 5px; font-weight: 800; margin-bottom: 8px; color: var(--v4-tagline-color); }
                .v4-premium-title-container { display: flex; flex-direction: column; width: 100%; }
                .v4-premium-title-main { font-family: 'Playfair Display', serif; font-size: var(--v4-font-size); color: var(--v4-title-color); font-weight: var(--v4-font-weight); line-height: 1.05; margin: 0; }
                .v4-premium-title-highlight { font-family: 'Playfair Display', serif; font-size: var(--v4-font-size); color: var(--v4-highlight-color); font-style: italic; font-weight: 400; line-height: 1.05; margin: 2px 0 0 0; }
                .v4-premium-description { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7); max-width: 600px; font-weight: 300; margin: 20px 0 0 0; }
                .v4-premium-line-block { margin-top: 30px; display: flex; width: 100%; }
                .v4-premium-line { width: 60px; height: 2px; background: var(--v4-highlight-color); }
                .v4-gallery-grid { display: grid; width: 100%; }
                .v4-gallery-item { aspect-ratio: 1/1; overflow: hidden; border-radius: 12px; background: #151515; transition: 0.3s; }
                .v4-gallery-item img { width: 100%; height: 100%; object-fit: cover; }
                .v4-gallery-item:hover { transform: scale(1.02); }

                /* PORTFOLIO V4 */
                .v4-portfolio-container { padding: 40px 0; width: 100%; }
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
                .v4-portfolio-card::after { 
                    content: ''; position: absolute; inset: 0; border: 1px solid rgba(255,132,132,0.2); 
                    border-radius: 20px; pointer-events: none; opacity: 0; transition: 0.3s;
                }
                .v4-portfolio-card:hover::after { opacity: 1; }
                
                @media (max-width: 768px) {
                    .v4-premium-title { font-size: 38px; }
                    .form-v4-grid { grid-template-columns: 1fr; }
                    .form-field.full { grid-column: span 1; }
                }
                
                /* Stories Public Styles */
                .stories-horizontal-scroll { display: flex; gap: 20px; overflow-x: auto; padding: 10px 0; scrollbar-width: none; }
                .stories-horizontal-scroll::-webkit-scrollbar { display: none; }
                .story-item-v4 { display: flex; flex-direction: column; align-items: center; min-width: 90px; cursor: pointer; transition: transform 0.3s ease; }
                .story-item-v4:hover { transform: scale(1.1); }
                .story-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(45deg, #d4af37, #f9e1a0, #d4af37); padding: 3px; margin-bottom: 8px; }
                .story-inner { width: 100%; height: 100%; border-radius: 50%; background: #000; overflow: hidden; border: 2px solid #000; }
                .story-inner img { width: 100%; height: 100%; object-fit: cover; }
                .story-placeholder { width: 100%; height: 100%; background: #222; }
                .story-label { font-size: 11px; font-weight: 600; color: inherit; text-align: center; }

                .marquee-track { display: flex; width: max-content; animation: marquee 40s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .rendered-component { position: relative; width: 100%; }

                /* CTA PHONE V4 PREMIUM */
                .v4-cta-phone-container {
                    position: relative;
                    padding: 80px 0;
                    margin: 60px 0;
                    display: flex;
                    align-items: center;
                    overflow: visible;
                }
                .v4-cta-phone-component { 
                        width: 80%;
    margin-left: auto;
    border-radius: 40px 0 0 40px;
    padding: 60px 2% 60px 12%;
    position: relative;
    display: flex;
    justify-content: flex-end;
    z-index: 1;
    border: solid 1px var(--color-primary);
    border-radius: 0 40px 40px 0;
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
                }
                .v4-cta-phone-wrapper {
                    max-width: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                }
                
                /* Class to manage the special pop-out in CTA context */
                .v4-cta-phone-pop {
                    position: absolute !important;
                    left: 2% !important;
                    top: 50% !important;
                    transform: translateY(-50%) rotate(-3deg) !important;
                    z-index: 10 !important;
                }

                .v4-cta-content { color: white; width: 100%; text-align: center; }
                .c-hook { display: block; text-transform: uppercase; letter-spacing: 4px; font-weight: 800; font-size: 14px; }
                .c-title { font-size: 50px; font-weight: 800; line-height: 1.1; margin-bottom: 30px; }
                .c-closure { font-size: 15px; opacity: 0.8; line-height: 1.6; margin: 0 auto 25px; max-width: 600px; }
                .c-btn { 
                    display: inline-block; 
                    padding: 12px 25px; 
                    border-radius: 12px; 
                    color: white; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 2px;
                    font-size: 14px;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .c-btn:hover { transform: translateY(-8px); box-shadow: 0 25px 50px rgba(0,0,0,0.6); filter: brightness(1.2); }

                @media (max-width: 1200px) {
                    .c-title { font-size: 48px; }
                    .v4-cta-phone-component { padding-left: 20%; }
                }

                @media (max-width: 992px) {
                    .v4-cta-phone-container { flex-direction: column; padding: 40px 20px; }
                    .v4-cta-phone-component { width: 100%; border-radius: 30px; padding: 400px 30px 60px; margin: 100px 0 0; }
                    .v4-cta-phone-pop { position: relative !important; left: 0 !important; top: 0 !important; transform: rotate(0) translateY(0) scale(0.9) !important; margin: 0 auto -350px !important; }
                    .c-title { font-size: 38px; }
                    .v4-cta-content { text-align: center; }
                    .c-closure { margin-left: auto; margin-right: auto; }
                }
            ` }} />
        </div>
    );
};

export default PublicPageViewV4;
