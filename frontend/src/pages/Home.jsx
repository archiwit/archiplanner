import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import useWebContent from '../hooks/useWebContent';
import { API_BASE_URL } from '../config';
import usePageSections from '../hooks/usePageSections';
import useCTAs from '../hooks/useCTAs';
import BlockRenderer from '../components/ui/BlockRenderer';

const Home = () => {
    const { sections, loading: sectionsLoading } = usePageSections('home');
    const { ctas } = useCTAs();
    const { content } = useWebContent('home');
    const [servicios, setServicios] = React.useState({ principales: [], sociales: [], stories: [] });
    const [serviciosLoading, setServiciosLoading] = React.useState(true);

    useScrollReveal([sectionsLoading, serviciosLoading]);

    React.useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [pRes, sRes, hRes, gRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/servicios/section/principales`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/servicios/section/sociales`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/historias`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/galeria/eventos`).then(r => r.json())
                ]);
                setServicios({ 
                    principales: pRes, 
                    sociales: sRes, 
                    stories: hRes,
                    eventos: gRes // Nueva data para el carrusel
                });
                setServiciosLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setServiciosLoading(false);
            }
        };
        fetchAllData();
    }, []);

    return (
        <div className="home-page fade-in">
            {sectionsLoading ? (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#000' }}>
                    <div className="spinner-loader"></div>
                </div>
            ) : !sections.some(s => s.tipo?.toLowerCase() === 'hero_modern') && (
                <BlockRenderer 
                    section={{
                        id: 'default-hero-modern',
                        tipo: 'hero_modern',
                        metadata: JSON.stringify({
                            titulo: "Creamos Historias Inolvidables",
                            subtitulo: "Diseño editorial y curaduría de eventos para almas sofisticadas",
                            media_type: "image",
                            media_path: "/uploads/gallery/1775751276627_portada.jpg"
                        })
                    }}
                    servicios={servicios}
                />
            )}

            {sections.map(section => (
                <BlockRenderer 
                    key={section.id} 
                    section={section} 
                    ctas={ctas} 
                    content={content}
                    servicios={servicios}
                />
            ))}
        </div>
    );
};

export default Home;
