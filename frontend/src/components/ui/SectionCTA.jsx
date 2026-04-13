import React from 'react';
import Button from './Button';
import PhoneMockup from './celular';
import { getImageUrl } from '../../utils/imageUtils';

const SectionCTA = ({ cta, showPhone = false }) => {
    if (!cta) return null;

    return (
        <section className="cta-final section-padding" style={{ position: "relative" }}>
            <div>
                <div className="container scroll-reveal">
                    <div className="cta-card">
                        {cta.tag && <span className="tag">{cta.tag}</span>}
                        {cta.titulo && <h2 dangerouslySetInnerHTML={{ __html: cta.titulo }} />}
                        {cta.descripcion && <p>{cta.descripcion}</p>}
                        <Button href={cta.enlace || "/contacto"} className="btn-primary btn-large">
                            {cta.texto_boton || "Solicitar Propuesta"}
                        </Button>
                    </div>
                </div>
            </div>
            {showPhone && (
                <div className="phone-mockup-container">
                    <PhoneMockup videoSrc={getImageUrl(cta.imagen) || "/images/home/historia1.mp4"} />
                </div>
            )}
        </section>
    );
};

export default SectionCTA;
