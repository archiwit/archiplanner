import React from 'react';
import { 
    Image, Type, Terminal, Layout, 
    Star, MessageSquare, Plus, MousePointer2 
} from 'lucide-react';

const blocks = [
    { type: 'HERO', label: 'Cabecera Hero', icon: <Image size={18} />, description: 'Imagen de fondo, título y botón.' },
    { type: 'HERO_MODERN', label: 'Hero Moderno (Cinemático)', icon: <Layout size={18} style={{ color: '#d4af37' }} />, description: 'Fondo cine (video/img) con carrusel lateral.' },
    { type: 'TITLE', label: 'Título de Sección', icon: <Type size={18} />, description: 'Título grande con subtítulo.' },
    { type: 'SERVICES', label: 'Grilla de Servicios', icon: <Layout size={18} />, description: 'Cards con servicios ofrecidos.' },
    { type: 'STORIES', label: 'Historias Verticales', icon: <Star size={18} />, description: 'Vídeos verticales interactivos.' },
    { type: 'TESTIMONIALS', label: 'Testimonios', icon: <MessageSquare size={18} />, description: 'Slider de comentarios de clientes.' },
    { type: 'HTML', label: 'Bloque Personalizado', icon: <Terminal size={18} />, description: 'Código HTML/JS directo.' },
    { type: 'CTA_FINAL', label: 'Llamado a Acción', icon: <MousePointer2 size={18} />, description: 'Banner de cierre con botón.' }
];

const BlockLibrary = ({ onAddBlock }) => {
    return (
        <div className="block-library glass-panel">
            <div className="library-header">
                <h3>Librería de Bloques</h3>
                <p>Haz clic en "+" para añadir a la página</p>
            </div>
            <div className="library-grid">
                {blocks.map((block) => (
                    <div key={block.type} className="library-item glass-panel">
                        <div className="item-icon">{block.icon}</div>
                        <div className="item-info">
                            <h4>{block.label}</h4>
                            <p>{block.description}</p>
                        </div>
                        <button 
                            className="add-block-btn"
                            onClick={() => onAddBlock(block.type)}
                            title="Añadir bloque"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .block-library {
                    padding: 20px;
                    background: transparent;
                }
                .library-header {
                    margin-bottom: 24px;
                }
                .library-header h3 {
                    font-size: 16px;
                    color: var(--color-primary);
                    margin-bottom: 4px;
                }
                .library-header p {
                    font-size: 11px;
                    opacity: 0.5;
                }
                .library-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .library-item {
                    display: grid;
                    grid-template-columns: 40px 1fr 40px;
                    align-items: center;
                    padding: 12px;
                    gap: 12px;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }
                .library-item:hover {
                    border-color: rgba(255,132,132,0.2);
                    background: rgba(255,132,132,0.05);
                }
                .item-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-bg-alt);
                    border-radius: 8px;
                    color: var(--color-primary);
                }
                .item-info h4 {
                    font-size: 13px;
                    margin-bottom: 2px;
                }
                .item-info p {
                    font-size: 10px;
                    opacity: 0.5;
                    line-height: 1.2;
                }
                .add-block-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }
                .add-block-btn:hover {
                    transform: scale(1.1);
                    background: #ff6b6b;
                }
            `}} />
        </div>
    );
};

export default BlockLibrary;
