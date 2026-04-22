import React from 'react';
import { Quote, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const FounderCtaV4 = ({ 
    quote = '"Nuestra pasión es transformar sueños en realidades inolvidables, con la seguridad y experiencia que mereces."', 
    founderName = 'Nombre Fundadora',
    founderRole = 'CEO & Founder',
    image = '', 
    imagePosition = 'left',
    btnLabel = 'Agenda una Entrevista',
    btnLink = '/contacto',
    bgColor = '#121212',
    accentColor = '#ff8484'
}) => {
    const resolvedImage = image ? getImageUrl(image) : null;
    const isRight = imagePosition === 'right';

    return (
        <section className="founder-cta-v4-section" style={{ backgroundColor: bgColor }}>
            <div className={`founder-cta-container ${isRight ? 'reverse' : ''}`}>
                
                {/* Image Module */}
                <div className="founder-image-wrapper">
                    {resolvedImage ? (
                        <img src={resolvedImage} alt={founderName} className="founder-portrait" />
                    ) : (
                        <div className="founder-placeholder">
                            <span>[ Sube tu retrato editorial ]</span>
                        </div>
                    )}
                    <div className="image-gradient-overlay" style={{ 
                        background: `linear-gradient(to bottom, transparent 60%, ${bgColor} 98%)` 
                    }}></div>
                </div>

                {/* Content Module */}
                <div className="founder-content-wrapper">
                    <div className="quote-icon" style={{ color: accentColor }}>
                        <Quote size={32} fill={accentColor} fillOpacity={0.1} strokeWidth={1.5} />
                    </div>

                    <blockquote className="founder-quote">
                        {quote}
                    </blockquote>

                    <div className="founder-info">
                        <h4 className="founder-name">{founderName}</h4>
                        <span className="founder-role" style={{ color: accentColor }}>{founderRole}</span>
                    </div>

                    <div className="founder-cta-action">
                        <a 
                            href={btnLink} 
                            className="btn-v4-cta" 
                            style={{ borderColor: accentColor, color: accentColor }}
                        >
                            {btnLabel} <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .founder-cta-v4-section {
                    width: 100%;
                    overflow: hidden;
                    padding: 50px 0;
                }
                .founder-cta-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 60px;
                    padding: 0 40px;
                }
                .founder-cta-container.reverse {
                    flex-direction: row-reverse;
                }

                .founder-image-wrapper {
                    flex: 1;
                    position: relative;
                    aspect-ratio: 3/4;
                    max-width: 380px;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .founder-portrait {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center top;
                }
                .founder-placeholder {
                    width: 100%;
                    height: 100%;
                    background: #1a1a1a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #444;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    border: 1px dashed #333;
                }
                .image-gradient-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background: linear-gradient(to bottom, transparent 70%, ${bgColor} 98%);
                }

                .founder-content-wrapper {
                    flex: 1.2;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .quote-icon {
                    margin-bottom: -10px;
                }
                .founder-quote {
                    font-family: 'Playfair Display', serif;
                    font-size: 24px;
                    line-height: 1.4;
                    color: #fff;
                    font-style: italic;
                    margin: 0;
                    letter-spacing: -0.3px;
                }
                .founder-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .founder-name {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    color: #fff;
                }
                .founder-role {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 800;
                }

                .founder-cta-action {
                    margin-top: 15px;
                }
                .btn-v4-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 28px;
                    border-radius: 50px;
                    border: 1px solid transparent;
                    font-weight: 700;
                    font-size: 13px;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .btn-v4-cta:hover {
                    background: transparent !important;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                @media (max-width: 968px) {
                    .founder-cta-container, 
                    .founder-cta-container.reverse {
                        flex-direction: column;
                        gap: 40px;
                        text-align: center;
                    }
                    .founder-content-wrapper {
                        align-items: center;
                    }
                    .founder-image-wrapper {
                        max-width: 350px;
                    }
                    .founder-quote {
                        font-size: 24px;
                    }
                }
            `}} />
        </section>
    );
};

export default FounderCtaV4;
