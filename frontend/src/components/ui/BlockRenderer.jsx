import React from 'react';
import SectionCTA from './SectionCTA';
import SectionFeatured from './SectionFeatured';
import SectionValues from './SectionValues';
import SectionPulse from './SectionPulse';
import SectionPersonal from './SectionPersonal';
import EditorialTestimonials from './Tesimonios';
import StoryGallery from './StoryGallery';
import ServiceBlock from './blocks/ServiceBlock';
import SectionHeroModern from './SectionHeroModern';
import { UPLOADS_URL } from '../../config';

/**
 * MASTER BLOCK RENDERER V3
 * Responsable de renderizar bloques de contenido y zonas anidadas.
 */
const ContactForm = ({ meta, styles }) => {
    const [status, setStatus] = React.useState('idle'); // idle, sending, success
    const [formData, setFormData] = React.useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => setStatus('success'), 1500); // Simulación
    };

    if (status === 'success') {
        return (
            <div className="form-success-message fade-in">
                <div className="success-icon">✓</div>
                <h3>{meta.titulo || '¡Enviado!'}</h3>
                <p>{meta.mensaje_exito}</p>
                <button className="btn btn-outline mt-20" onClick={() => setStatus('idle')}>Volver a escribir</button>
            </div>
        );
    }

    return (
        <form className="v3-dynamic-form" onSubmit={handleSubmit}>
            {meta.titulo && <h3 className="form-title">{meta.titulo}</h3>}
            <div className="form-fields-grid">
                {(meta.campos || []).map((field, idx) => (
                    <div key={idx} className={`form-group ${field.tipo === 'textarea' ? 'full-width' : ''}`}>
                        <label>{field.label} {field.required && <span className="text-primary">*</span>}</label>
                        {field.tipo === 'textarea' ? (
                            <textarea 
                                placeholder={field.placeholder} 
                                required={field.required}
                                onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                            />
                        ) : (
                            <input 
                                type={field.tipo} 
                                placeholder={field.placeholder} 
                                required={field.required}
                                onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                            />
                        )}
                    </div>
                ))}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
        </form>
    );
};

const BlockRenderer = ({ section, ctas = {}, content = {}, servicios = {}, isNested = false }) => {
    if (!section) return null;

    const getSafeMeta = (m) => {
        if (!m) return {};
        if (typeof m === 'object') return m;
        try { return JSON.parse(m); } catch (e) { return {}; }
    };

    const meta = getSafeMeta(section.metadata);
    const styles = meta.estilos || {};
    
    // DETERMINAR CLASES DE LAYOUT
    const wrapperClasses = [
        'block-render-wrapper',
        meta.ancho_total ? 'is-full-width' : 'is-framed',
        styles.heightClass ? `height-${styles.heightClass}` : 'height-auto',
        section.tipo?.toLowerCase()
    ].filter(Boolean).join(' ');

    const globalStyle = {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        backgroundColor: styles.bgColor,
        color: styles.textColor,
        ...(styles.heightClass === 'full' ? { height: '100vh', display: 'flex', alignItems: 'center' } : {}),
        ...styles
    };

    // --- RENDERIZADO RECURSIVO PARA ZONAS ---
    const renderNode = () => {
        switch (section.tipo?.toUpperCase()) {
            case 'CUSTOM_ZONE':
            case 'GRID_LAYOUT':
            case 'COLUMNS_2':
            case 'COLUMNS_3':
            case 'COLUMNS_4':
                const hasCols = !!meta.columnas;
                return (
                    <div className={`v3-layout-grid ${hasCols ? 'has-columns' : 'flat-zone'}`} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: hasCols && (styles.gridDirection !== 'column') ? `repeat(${meta.columnas.length}, 1fr)` : '1fr',
                        gap: styles.gap || '30px',
                    }}>
                        {hasCols ? (
                            meta.columnas.map((col, cIdx) => (
                                <div key={cIdx} className="grid-column">
                                    {(col.elementos || []).map((el, eIdx) => (
                                        <BlockRenderer 
                                            key={eIdx}
                                            section={el} 
                                            isNested={true}
                                            ctas={ctas}
                                            content={content}
                                            servicios={servicios}
                                        />
                                    ))}
                                </div>
                            ))
                        ) : (
                            (meta.elementos || []).map((el, idx) => (
                                <div key={idx} style={{ flex: el.flex || (el.width === '1/2' ? '0 0 48%' : '1') }}>
                                    <BlockRenderer 
                                        section={el} 
                                        isNested={true}
                                        ctas={ctas}
                                        content={content}
                                        servicios={servicios}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                );

            case 'HERO':
            case 'HERO_MODERN':
                return (
                    <SectionHeroModern 
                        data={meta} 
                        ctas={ctas} 
                        stories={servicios.eventos || servicios.stories || []} 
                    />
                );

            case 'TITLE':
                return (
                    <div className="text-center scroll-reveal">
                        <h2 className="editorial-title" style={{ fontSize: styles.titleSize }}>
                            {meta.titulo_h1 || meta.titulo}
                        </h2>
                        {meta.subtitulo && <p className="editorial-subtitle">{meta.subtitulo}</p>}
                    </div>
                );

            case 'HTML':
                return <div className="html-content" dangerouslySetInnerHTML={{ __html: meta.html }} />;

            case 'IMAGE':
                const imgSrc = meta.media_path?.startsWith('http') ? meta.media_path : `${UPLOADS_URL}${meta.media_path || meta.img}`;
                return (
                    <div className="v3-image-wrapper" style={{ borderRadius: styles.borderRadius, overflow: 'hidden' }}>
                        <img src={imgSrc} alt={meta.titulo} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                );

            case 'CTA':
                const ctaData = ctas[meta.cta_slug] || meta.cta_custom || {};
                return <SectionCTA cta={ctaData} showPhone={meta.showPhone} />;

            case 'SERVICES':
                return <ServiceBlock data={meta} />;

            case 'STORIES':
                return <StoryGallery stories={servicios.stories || []} />;

            case 'TESTIMONIALS':
                return <EditorialTestimonials />;

            case 'FORM':
                return (
                    <div className="v3-form-container">
                        <ContactForm 
                            meta={meta} 
                            styles={styles} 
                        />
                    </div>
                );

            // --- LEGACY ---
            case 'VALORES': return <SectionValues />;
            case 'PULSE': return <SectionPulse {...meta} />;
            case 'SERVICIOS': return <SectionFeatured principales={servicios.principales} sociales={servicios.sociales} />;

            default:
                return <div className="debug-label">Component: {section.tipo}</div>;
        }
    };

    // Si es un componente anidado, no agregamos el wrapper de sección con paddings
    if (isNested) return renderNode();

    return (
        <section 
            id={section.id} 
            className={wrapperClasses} 
            style={globalStyle}
        >
            <div className={meta.ancho_total ? 'full-bleed' : 'container'}>
                {renderNode()}
            </div>
        </section>
    );
};

export default BlockRenderer;
