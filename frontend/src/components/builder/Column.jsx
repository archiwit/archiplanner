import React from 'react';

const Column = ({ id, span = 12, children, config = {}, onEdit }) => {
    const {
        marginTop = '0px',
        marginRight = '0px',
        marginBottom = '0px',
        marginLeft = '0px',
        paddingTop = '0px',
        paddingRight = '0px',
        paddingBottom = '0px',
        paddingLeft = '0px',
        bgColor = 'transparent',
        borderRadius = '0',
        textAlign = 'left',
        display = 'block',
        flexDirection = 'column',
        alignItems = 'stretch',
        justifyContent = 'flex-start',
        border = 'none',
        animation = 'none',
        zIndex = 1
    } = config;

    // Grid 12 logic
    const widthPercentage = (span / 12) * 100;

    const columnStyle = {
        width: `calc(${widthPercentage}% - (var(--row-gap, 20px) * (12 - ${span}) / 12))`,
        flexBasis: `calc(${widthPercentage}% - (var(--row-gap, 20px) * (12 - ${span}) / 12))`,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        backgroundColor: bgColor,
        borderRadius,
        textAlign,
        display,
        flexDirection,
        alignItems,
        justifyContent,
        border,
        minHeight: '20px',
        position: 'relative',
        transition: 'all 0.3s ease',
        zIndex: zIndex || 1
    };

    return (
        <div 
            id={id} 
            className={`builder-col anim-${animation}`} 
            style={columnStyle}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
            {children}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .builder-col { transition: outline 0.2s ease; min-width: 0; }
                
                /* Animations (re-use same as Row) */
                .anim-fade-in { animation: v4-fade-in 0.8s ease forwards; }
                .anim-slide-up { animation: v4-slide-up 0.8s ease forwards; }
                .anim-slide-down { animation: v4-slide-down 0.8s ease forwards; }
                .anim-zoom-in { animation: v4-zoom-in 0.8s ease forwards; }
            `}} />
        </div>
    );
};

export default Column;
