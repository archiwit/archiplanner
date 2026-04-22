import React from 'react';

const SectionPulse = ({
    tag = "VIVIMOS EL MÉTODO",
    title = "El Pulse de cada Evento",
    closingPhrase = "Vivimos el pulse de cada evento...",
    bgColor = "transparent",
    svgColor = "var(--color-secondary)",
    textColor = "#ffffff",
    titleColor = ""
}) => {
    const pillars = [
        {
            letter: "P",
            name: "Pasión",
            description: "Actuamos antes de que las cosas pasen, anticipando necesidades y resolviendo imprevistos, viviendo cada evento con energía, compromiso y amor por el detalle.",
            color: "#e5aeaeff"
        },
        {
            letter: "U",
            name: "Único",
            description: "Trabajamos en sincronía con clientes, proveedores y equipo, creando una experiencia integrada donde todos reman hacia el mismo objetivo.",
            color: "#c88f8fff"
        },
        {
            letter: "L",
            name: "Liderazgo",
            description: "Tomamos la batuta de cada proyecto, guiando y coordinando con claridad para que el proceso sea fluido, seguro y confiable.",
            color: "#d68080ff"
        },
        {
            letter: "S",
            name: "Sostenibilidad",
            description: "Diseñamos eventos responsables con el entorno, tomando decisiones conscientes en materiales, proveedores y procesos para reducir el impacto ambiental.",
            color: "var(--color-primary)"
        },
        {
            letter: "E",
            name: "Excelencia",
            description: "Buscamos resultados impecables en cada detalle, incorporando creatividad y herramientas tecnológicas que eleven el nivel de cada experiencia.",
            color: "#e86e6eff"
        }
    ];

    return (
        <section className="v4-pulse-section">
            {/* SVG Definitions for Rose Gold Gradient */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="roseGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#c98f8a', stopOpacity: 1 }} />
                        <stop offset="25%" style={{ stopColor: '#fff1ea', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#b76e79', stopOpacity: 1 }} />
                        <stop offset="75%" style={{ stopColor: '#d9a6a0', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#8f5d63', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
            </svg>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Outfit:wght@300;400;700;800&display=swap');

                .v4-pulse-section {
                    background: ${bgColor};
                    padding: 20px 0;
                    color: ${textColor};
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                }

                .v4-pulse-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 40px;
                    position: relative;
                    z-index: 2;
                }

                .v4-pulse-header {
                    text-align: center;
                    margin-bottom: 20px;
                    animation: fadeInUp 1s ease-out;
                }

                .v4-pulse-tag {
                    color: ${textColor};
                    opacity: 0.8;
                    letter-spacing: 6px;
                    font-weight: 800;
                    font-size: 13px;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: -15px;
                }

                .v4-pulse-title {
                    font-size: 56px;
                    font-weight: 800;
                    background: ${titleColor ? 'none' : 'linear-gradient(to right, #ffffff, #f5d1c3, #c48a73)'};
                    color: ${titleColor || 'transparent'};
                    -webkit-background-clip: ${titleColor ? 'border-box' : 'text'};
                    -webkit-text-fill-color: ${titleColor ? 'unset' : 'transparent'};
                    letter-spacing: -1px;
                }

                .v4-pulse-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 40px;
                }

                .v4-pulse-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    opacity: 0;
                    animation: fadeInUp 0.8s ease-out forwards;
                }

                .v4-pulse-item:nth-child(1) { animation-delay: 0.2s; }
                .v4-pulse-item:nth-child(2) { animation-delay: 0.4s; }
                .v4-pulse-item:nth-child(3) { animation-delay: 0.6s; }
                .v4-pulse-item:nth-child(4) { animation-delay: 0.8s; }
                .v4-pulse-item:nth-child(5) { animation-delay: 1.0s; }

                .v4-pulse-item:hover {
                    transform: translateY(-15px);
                }

                .v4-pulse-star-box {
                    position: relative;
                    width: 150px;
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: -25px;
                    filter: drop-shadow(0 10px 20px rgba(183, 110, 121, 0.3));
                    transition: filter 0.3s ease;
                }

                .v4-pulse-item:hover .v4-pulse-star-box {
                    filter: drop-shadow(0 15px 30px rgba(183, 110, 121, 0.5));
                }

                .v4-star-svg-element {
                    width: 100%;
                    height: 100%;
                }

                .v4-pulse-letter {
                    position: absolute;
                    z-index: 2;
                    font-size: 48px;
                    font-weight: 900;
                    color: #0a0a0a;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -46%);
                    text-shadow: 0 2px 4px rgba(255,255,255,0.2);
                }

                .v4-pulse-name-box {
                    width: 100%;
                    padding: 7px 10px;
                    margin-bottom: 15px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 8px rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                }

                .v4-pulse-name-box::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: 0.5s;
                }

                .v4-pulse-item:hover .v4-pulse-name-box::after {
                    left: 100%;
                    transition: 0.8s;
                }

                .v4-pulse-name {
                    color: #0a0a0a;
                    font-weight: 800;
                    font-size: 18px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .v4-pulse-desc {
                    font-size: 15px;
                    line-height: 1.2;
                    color: ${textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : textColor};
                    opacity: ${textColor === '#ffffff' ? '1' : '0.8'};
                    max-width: 260px;
                    font-weight: 300;
                }

                .v4-pulse-footer {
                    margin-top: 20px;
                    text-align: center;
                    animation: fadeIn 2s ease-in;
                }

                .v4-pulse-closure {
                    font-family: 'Dancing Script', cursive;
                    font-size: 48px;
                    color: ${textColor};
                    letter-spacing: 1px;
                }

                .v4-pulse-closure span {
                    color: var(--color-primary);
                    font-weight: 700;
                    margin: 0 10px;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @media (max-width: 1280px) {
                    .v4-pulse-grid { grid-template-columns: repeat(3, 1fr); gap: 60px 30px; }
                }

                @media (max-width: 768px) {
                    .v4-pulse-grid { 
                        grid-template-columns: 1fr; 
                        gap: 10px; 
                    }
                    .v4-pulse-item {
                        flex-direction: row;
                        text-align: left;
                        align-items: center;
                        gap: 0;
                        opacity: 1; 
                        animation: fadeIn 0.5s ease-out forwards;
                    }
                    .v4-pulse-star-box { 
                        width: 85px; 
                        height: 85px; 
                        margin-bottom: 0;
                        flex-shrink: 0;
                        z-index: 10;
                    }
                    .v4-pulse-letter { 
                        font-size: 30px; 
                    }
                    .v4-pulse-name-box {
                        margin-bottom: 0;
                        margin-left: -12px;
                        width: auto;
                        flex-grow: 1;
                        padding: 8px 15px 8px 20px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                        z-index: 5;
                    }
                    .v4-pulse-name {
                        font-size: 14px;
                    }
                    .v4-pulse-desc { 
                        display: none; 
                    }
                    .v4-pulse-title { 
                        font-size: 32px; 
                    }
                    .v4-pulse-tag {
                        font-size: 10px;
                        letter-spacing: 3px;
                    }
                    .v4-pulse-closure { 
                        font-size: 28px; 
                    }
                    .v4-pulse-container {
                        padding: 0 20px;
                    }
                    .v4-pulse-header {
                        margin-bottom: 30px;
                    }
                }

                .v4-pulse-image {
                    width: 100%;
                    margin-top: -50px;
                    position: relative;
                    z-index: 1;
                }
                .cls-1 {
                    fill: ${svgColor};
                    stroke-width: 0px;
                }

                .v4-pulse-imgt{
                    background-color: transparent;
                    min-height: 100px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    text-align: center;
                    position: absolute;
                    width: 100%;      
                    top: -98px;
                     & svg{
                        display: block;
                        width: 110%;
                        height: 100%;
                        filter: drop-shadow(0px -15px 10px rgba(0, 0, 0, 0.3));
                    }
                }
                .v4-pulse-imgB{
                    background-color: transparent;
                    min-height: 100px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    text-align: center;
                    position: absolute;      
                    width: 100%;      
                    bottom: -98px;
               
                    & svg{
                        display: block;
                        width: 110%;
                        height: 100%;
                        filter: drop-shadow(0px 15px 10px rgba(0, 0, 0, 0.3));
                    }
                }
            ` }} />

            <div className="v4-pulse-container">
                <div className="v4-pulse-header">
                    <span className="v4-pulse-tag">{tag}</span>
                    <h2 className="v4-pulse-title">{title}</h2>
                </div>

                <div className="v4-pulse-grid">
                    {pillars.map((p, idx) => (
                        <div key={idx} className="v4-pulse-item">
                            <div className="v4-pulse-star-box">
                                <svg className="v4-star-svg-element" viewBox="0 0 24 24">
                                    <path fill={p.color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="v4-pulse-letter">{p.letter}</span>
                            </div>
                            <div className="v4-pulse-name-box" style={{ backgroundColor: p.color }}>
                                <span className="v4-pulse-name">{p.name}</span>
                            </div>
                            <p className="v4-pulse-desc">{p.description}</p>
                        </div>
                    ))}
                </div>

                <div className="v4-pulse-footer">
                    <p className="v4-pulse-closure">
                        "{closingPhrase.split('pulse')[0]}<span>pulse</span>{closingPhrase.split('pulse')[1]}"
                    </p>
                </div>
            </div>

            <div className="v4-pulse-imgt">
                <svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" data-name="Capa 2" viewBox="0 0 626 67.13">
                    <g id="Capa_2-2" data-name="Capa 2">
                        <path class="cls-1" d="M0,4.13c1.33-.37,3.17.72,3.95-1.22,1.98-4.94,4.23-2.59,6.51-.29,3.06,3.09,6.28,4.97,10.98,3.29,3.8-1.36,7.03-.57,7.05,4.99,5.5-1.13,9.82,3.95,15.39,2.12.98-.32,1.23.89,1.64,1.56,1.49,2.46,3.99,3.8,6.52,4.28,8.93,1.69,16.6,6.79,25.31,9.02,3.9,1,7.04.17,9.97-2.75,4.38-4.37,6.7-4.4,12.11-1.01,2.42,1.52,11.24-1.17,12.6-4.45,1.22-2.96,3.09-3.14,5.48-2.78,6.15.92,12.22.77,18.11-1.35,1.64-.59,2.4-.06,3.27,1.15,1.83,2.53,3.84,3.01,6.03.33,1.98-2.43,3.66-2.63,6.67-.71,3.26,2.08,7.56,5.12,11.24-.13.25-.36,1.21-.38,1.82-.32,6.75.69,13.53-.12,20.33.58,3.93.4,8.39.47,12.36-1.61,2.68-1.4,5.09.53,7.46,1.46,6.72,2.63,13.65,4.32,20.84,4.49,2.32.05,3.95,1.57,6.81,1.23,5.32-.63,8.1-3.54,12.02-6.28,5.5-3.85,12.15-9.14,19.93-3.11,2.69,2.08,7.77.3,8.86,5.25.02.1.29.14.43.22,2.91,1.51,12.78-.46,14.19-2.05,9.88-1,18.27,4.87,27.82,1.09-.69,3.41,2.88,7.4,6.14,7.12,4.26-.37,8.19.98,12.27,1.41,6.81.72,13.29-1.43,19.98-1.72,4.11-.18,6.82-2.71,8.08-6.85.56-1.84,1.67-3.63,3.39-4.76,1.78-.01,1.37,1.62,1.86,2.67,2.64-.46,5.07-1.54,6.69-3.16,4.56-4.55,9.19-5.25,14.57-1.72,4.55,2.99,8.99,2.92,13.27-.71.99-.84,2.23-1.56,3.66-1.34,4.41.68,8.61-.67,12.72-1.1,4.77-.5,10.02-1.75,15.29-.79,5.76,1.05,10.5,2.88,14.3,7.48,1.43,1.73,3.52,3.17,6.42.76,2.14-1.78,5.04-2.53,7.59,1.09,1.51,2.14,4.35,5.65,8.13,2.01.75-.72,1.45.36,2.16.51,3.45.73,6.49-.29,9.03-2.68.91-.86,1.39-2.77,3.01-1.97,5.58,2.76,7.19-2.12,9.66-5.01,1.19-1.39,2.22-1.78,4.03-2.07,15.74-2.55,30.03,2.88,44.38,7.86,2.6.9,4.2.53,6.74-.65,6.95-3.23,13.93-7.76,22.27-4.42,2.24.9,4.53.86,6.87.88,4.47.05,8.53,1.42,11.75,4.58,2.68,2.64,5.4,5.12,9.48,4.46,1.87-.3,1.53,2.11,3.5,1.93,2.63-3.21,5.61-4.14,9.97-1.42,4.2,2.62,7.91-1.76,11.94-2.6.57-.12.82-.04,1.17.24v50H0c0-21,0-42,0-63Z" />
                    </g>
                </svg>
            </div>
            <div className="v4-pulse-imgB">
                <svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" data-name="Capa 2" viewBox="0 0 626 82.44">
                    <g id="Capa_2-2" data-name="Capa 2">
                        <path class="cls-1" d="M626,59c-1.62-.86-2.79.43-4.16.83-3.09.9-5.52.85-8.55-1.66-2.33-1.93-5.76-3.42-10-3.6-5.28-.22-12.28-1.64-16.03-4.55-5.7-4.43-7.23-.48-10.27,1.82-.52.4-.98.87-1.63,1.46-3.8-1.76-7.69-3.49-11.05.92-.33.43-1.57.35-2.35.23-8.43-1.26-14.28,2.5-18.73,9.31-1.76,2.69-10.18,5.27-13.08,3.27-4.96-3.43-9.54-.32-14.24-.22-2.38.05-4.71,1.35-5.08-3.48-3.74,5.76-10.1,1.31-13.01,5.56-6.35-2.5-11.13-7.9-18.42-6.77-2.61-5.29-8.05-2.37-11.96-3.52-4.19-1.24-8.62-2.58-13.06-3.39-4.2-.76-8.35-1.83-11.82-4.61-.74-.59-2.17-1.32-2.7-1.01-4.58,2.73-9.25-.48-13.9.43-3.99.78-8.1-2.1-12.34.16-1.41.75-.85-2.26-1.85-2.5-7.5,1.09-14.35,1.66-21.61-.25-7.47-1.97-14.65,1.89-21.68,4.22-5.59,1.86-11.16,2.36-16.96,2.94-5.65.57-10.13.04-15.21-2.24-2.9-1.3-7.02.26-9.97,2.12-6.4,4.03-13.73,6.84-18.4,13.3-.47.65-1.13,1.37-1.85,1.59-8.2,2.51-16.32,5.45-24.7,7.14-4.21.85-8.54,3.24-13.22,1.33-.64-.26-1.96.99-2.89,1.66-.8.58-1.84,2.04-2.15,1.88-4.87-2.45-9.32,2.46-14.07.69-1.45-.54-2.8-.58-4.32-.07-2.91.98-5.17-.14-6.85-2.62-2.43-3.6-6.05-5.08-10.17-5.48-3.57-.35-7.28-3.04-10.64.85-.92,1.07-2.47.48-3.71-.23-1.28-.74-2.53-1.51-4.13-1.58-4.58-.19-8.49-1.58-10.02-6.64-1.14.75-2.36,1.73-2.48,1.61-2.88-2.9-6.98-1.26-10.23-2.84-1.56-.76-3.68-2.18-5.25.38-.41.67-1.24.74-1.75.36-3-2.22-7.42-1.76-9.88-3.98-4.8-4.34-9.64-3.16-14.7-1.79-3.17.86-6.75.21-9.27,3.69-1.15,1.58-4.52,1.11-6.42-.58-5.14-4.55-11.62-4.13-17.74-5.07-.8-.12-1.69.1-2.43-.16-4.78-1.64-9.67-.11-12.91,3.38-2.26,2.43-4.6,3.99-8.79,4.46-4.51.51-9.04-1.6-13.78.53-2.01.9-5.78-.41-8.84.61-3.13,1.04-6.1-1.06-9.28-1.16-1.21,3.35-2.67,6.02-6.81,6.69-2.44.4-5.83,2-6.66,3.96-2.48,5.82-6.44,3.71-9.86,2.35-6.21-2.49-11.83-2.41-18.51-.74-7.47,1.87-15.59,4.69-23.59,1.02V0h626v59Z" />
                    </g>
                </svg>
            </div>
        </section>
    );
};

export default SectionPulse;
