import React from 'react';
import SectionHeader from './SectionHeader';

const SectionValues = () => {
    return (
        <section className="values section-padding bg-graphite-light">
            <div className="container">
                <SectionHeader tag="Valores" title="Nuestra Promesa" centered={true} />
                <div className="process-steps reveal-grid">
                    <div className="step scroll-reveal" data-step="01">
                        <h3>Sofisticación</h3>
                        <p>Diseño editorial que marca tendencia y respira exclusividad.</p>
                    </div>
                    <div className="step scroll-reveal" data-step="02">
                        <h3>Orden</h3>
                        <p>Logística milimétrica para que tú solo te preocupes por disfrutar.</p>
                    </div>
                    <div className="step scroll-reveal" data-step="03">
                        <h3>Creatividad</h3>
                        <p>Soluciones disruptivas que transforman espacios ordinarios en mágicos.</p>
                    </div>
                    <div className="step scroll-reveal" data-step="04">
                        <h3>Cercanía</h3>
                        <p>Un equipo humano que se convierte en tu aliado más fiel.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionValues;
