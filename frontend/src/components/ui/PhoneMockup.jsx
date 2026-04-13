import React from 'react';

/**
 * PhoneMockup Component
 * A premium iPhone-style mockup with auto-playing video/image support.
 * 
 * Props:
 * @param {string} src - The URL of the video or image to display.
 * @param {string} type - 'video' (default) or 'image'.
 * @param {string} className - Additional CSS classes.
 * @param {number} rotation - Custom rotation in degrees (default: -2).
 * @param {object} style - Additional inline styles.
 */
const PhoneMockup = ({ src, type = 'video', className = '', rotation = -2, style = {} }) => {
    return (
        <div
            className={`v4-mockup-phone ${className}`}
            style={{
                transform: `rotate(${rotation}deg)`,
                ...style
            }}
        >
            <div className="p-screen">
                {src ? (
                    type === 'video' || src.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) ? (
                        <video
                            src={src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <img
                            src={src}
                            alt="Mockup Content"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )
                ) : (
                    <div className="p-placeholder">
                        <div className="p-icon-v"></div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .v4-mockup-phone {
                    width: 310px;
                    height: 552px; /* Altura calculada para 9:16 + padding */
                    background: #000;
                    border-radius: 44px;
                    padding: 12px;
                    position: relative;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.7), inset 0 0 15px rgba(255,255,255,0.1);
                    border: 8px solid #2a2a2a;
                    z-index: 10;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .v4-mockup-phone:hover {
                    box-shadow: 0 60px 120px rgba(0,0,0,0.9);
                    transform: scale(1.02) !important;
                }
                /* Dynamic Notch */
                .v4-mockup-phone::before {
                    content: '';
                    position: absolute;
                    top: 15px; left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 24px;
                    background: #000;
                    border-radius: 20px;
                    z-index: 12;
                    box-shadow: inset 0 0 4px rgba(255,255,255,0.1);
                }
                .p-screen {
                    width: 100%;
                    height: 100%;
                    background: #0a0a0a;
                    border-radius: 34px;
                    overflow: hidden;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .p-screen video, .p-screen img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* Fill the 9:16 container perfectly */
                }
                .p-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111;
                }
                .p-icon-v {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #333;
                    border-radius: 50%;
                    position: relative;
                }
                .p-icon-v::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 55%;
                    transform: translate(-50%, -50%);
                    border-style: solid;
                    border-width: 6px 0 6px 10px;
                    border-color: transparent transparent transparent #333;
                }
            `}} />
        </div>
    );
};

export default PhoneMockup;
