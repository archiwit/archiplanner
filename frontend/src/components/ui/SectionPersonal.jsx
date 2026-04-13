import React from 'react';
import Button from './Button';
import { getImageUrl } from '../../utils/imageUtils';

const SectionPersonal = ({ data }) => {
    if (!data) return null;

    return (
        <section className="personal-branding-section section-padding">
            <div className="container">
                <div className="personal-grid">
                    <div className="personal-image scroll-reveal">
                        <img 
                            src={getImageUrl(data.imagen) || "/images/personal/archi.jpg"} 
                            alt="ArchiPlanner Personal" 
                        />
                    </div>
                    <div className="personal-content scroll-reveal">
                        <span className="tag">{data.tag || "Cercanía"}</span>
                        <h2>{data.titulo || "Diseñemos juntos tu próximo gran hito"}</h2>
                        <div dangerouslySetInnerHTML={{ __html: data.descripcion || "Mi compromiso es convertir tu visión en una reality impecable." }} />
                        <div className="personal-cta">
                            <Button href={data.enlace || "/contacto"} className="btn-primary">
                                {data.texto_boton || "Solicitar Propuesta Exclusiva"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionPersonal;
