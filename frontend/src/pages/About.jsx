import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SectionHeader from '../components/ui/SectionHeader';
import SectionValues from '../components/ui/SectionValues';
import SectionPulse from '../components/ui/SectionPulse';
import usePageSections from '../hooks/usePageSections';

const About = () => {
    const { sections, loading } = usePageSections('about');
    useScrollReveal([loading]);

    const renderSection = (section) => {
        switch (section.tipo) {
            case 'header':
                return (
                    <section className="page-header section-padding container" key={section.id}>
                        <div className="header-content scroll-reveal">
                            <span className="tag">Nuestra Esencia</span>
                            <h1>Pasión por Crear <br/><span>Momentos Eternos</span></h1>
                            <p>En ArchiPlanner, no solo organizamos eventos; diseñamos experiencias que perduran en la memoria.</p>
                            <div className="underline"></div>
                        </div>
                    </section>
                );
            case 'historia':
                return (
                    <section className="story section-padding container" key={section.id}>
                        <div className="story-grid">
                            <div className="story-content scroll-reveal">
                                <h2>Más que Planeación, <br/>es Curaduría</h2>
                                <p>Nacimos de la idea de que cada celebración es una obra de arte única. Nuestro enfoque editorial y nuestra obsesión por el detalle nos permiten elevar hitos tradicionales a experiencias cinematográficas.</p>
                                <p>Creemos en la elegancia del minimalismo, en la calidez de lo auténtico y en la perfección de lo planeado con alma.</p>
                            </div>
                            <div className="story-image scroll-reveal">
                                <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop" alt="Curaduría de Eventos" />
                            </div>
                        </div>
                    </section>
                );
            case 'valores':
                return <SectionValues key={section.id} />;
            case 'pulse':
                return <SectionPulse key={section.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="about-page">
            {sections.map(renderSection)}
        </div>
    );
};

export default About;
