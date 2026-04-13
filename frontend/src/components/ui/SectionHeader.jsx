import React from 'react';

const SectionHeader = ({ tag, title, description, centered = true, className = '' }) => {
    return (
        <div className={`section-header scroll-reveal ${centered ? '' : 'text-left'} ${className}`}>
            {tag && <span className="tag">{tag}</span>}
            {title && (
                <h2>
                    {typeof title === 'string' && title.includes('<span>') ? (
                        <span dangerouslySetInnerHTML={{ __html: title }} />
                    ) : (
                        title
                    )}
                </h2>
            )}
            {description && <p>{description}</p>}
            <div className={`underline ${centered ? 'mx-auto' : ''}`}></div>
        </div>
    );
};

export default SectionHeader;
