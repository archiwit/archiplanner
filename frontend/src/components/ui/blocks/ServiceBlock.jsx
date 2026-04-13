import React from 'react';
import { getImageUrl } from '../../../utils/imageUtils';

const ServiceBlock = ({ data = {} }) => {
    const { 
        titulo = "Nuestros Servicios", 
        servicios = [], 
        distribucion = "grid", 
        mostrarImagen = true,
        estilos = {}
    } = data;

    const blockStyle = {
        paddingTop: estilos.paddingTop || '80px',
        paddingBottom: estilos.paddingBottom || '80px',
        backgroundColor: estilos.bgColor || 'transparent',
    };

    const titleStyle = {
        fontSize: estilos.titleSize || '32px',
        color: estilos.titleColor || 'var(--color-text)',
        textAlign: estilos.textAlign || 'center',
        marginBottom: '48px'
    };

    return (
        <section className="service-block-section container" style={blockStyle}>
            {titulo && <h2 style={titleStyle}>{titulo}</h2>}
            
            <div className={`services-display-${distribucion} ${distribucion === 'grid' ? 'grid-3' : 'list-vertical'}`}>
                {servicios.map((srv, idx) => (
                    <div key={srv.id || idx} className={`service-item-dynamic ${distribucion}`}>
                        {mostrarImagen && srv.foto && (
                            <div className="service-img-wrapper">
                                <img src={getImageUrl(srv.foto)} alt={srv.nombre} />
                            </div>
                        )}
                        <div className="service-content">
                            <h3>{srv.nombre}</h3>
                            <p>{srv.descripcion || srv.nota}</p>
                            {srv.precio_u && <span className="price">${Number(srv.precio_u).toLocaleString()}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServiceBlock;
