import React from 'react';

const Row = ({ id, children, config = {}, onEdit }) => {
    const { 
        bgType = 'transparent', 
        bgColor = 'transparent', 
        bgGradient = '', 
        bgImage = '', 
        bgVideo = '',
        marginTop = '0px',
        marginRight = '0px',
        marginBottom = '0px',
        marginLeft = '0px',
        paddingTop = '80px',
        paddingRight = '0px',
        paddingBottom = '80px',
        paddingLeft = '0px',
        maxWidth = '1200px',
        minHeight = 'auto',
        isFullWidth = false,
        gap = '20px',
        alignItems = 'stretch',
        justifyContent = 'flex-start',
        borderBottom = 'none',
        animation = 'none',
        zIndex = 1
    } = config;

    const rowStyle = {
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderBottom,
        position: 'relative',
        overflow: 'visible', // Changed to visible to allow animations/shadows to overflow
        minHeight: minHeight || 'auto',
        zIndex: zIndex || 1
    };

    const containerStyle = {
        width: isFullWidth ? '100%' : 'auto',
        maxWidth: isFullWidth ? '100%' : maxWidth,
        margin: isFullWidth ? '0' : '0 auto',
        padding: isFullWidth ? '0' : '0 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        alignItems,
        justifyContent,
        position: 'relative',
        zIndex: 2
    };

    let backgroundElement = null;
    if (bgType === 'color') {
        rowStyle.backgroundColor = bgColor;
    } else if (bgType === 'gradient') {
        rowStyle.background = bgGradient;
    } else if (bgType === 'image') {
        backgroundElement = (
            <div 
                className="row-bg-image" 
                style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    zIndex: 1
                }} 
            />
        );
    } else if (bgType === 'video') {
        backgroundElement = (
            <video 
                autoPlay loop muted playsInline
                className="row-bg-video" 
                style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                    objectFit: 'cover', zIndex: 1
                }}
            >
                <source src={bgVideo} type="video/mp4" />
            </video>
        );
    }

    return (
        <section 
            id={id} 
            className={`builder-row-wrapper anim-${animation}`} 
            style={rowStyle}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
            {backgroundElement}
            <div className="builder-row-container" style={containerStyle}>
                {children}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .builder-row-wrapper { transition: outline 0.2s ease, all 0.3s ease-out; cursor: pointer; }
                .builder-row-wrapper:hover { outline: 2px solid #ff8484; outline-offset: -2px; }
                
                /* ANIMATIONS */
                .anim-fade-in { animation: v4-fade-in 0.8s ease forwards; }
                .anim-slide-up { animation: v4-slide-up 0.8s ease forwards; }
                .anim-slide-down { animation: v4-slide-down 0.8s ease forwards; }
                .anim-zoom-in { animation: v4-zoom-in 0.8s ease forwards; }

                @keyframes v4-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes v4-slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes v4-slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes v4-zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}} />
        </section>
    );
};

export default Row;
