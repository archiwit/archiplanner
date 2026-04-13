import React from 'react';

const StoryItem = ({ story, index, onClick }) => {
    // Generate a hash based index-like height class
    const heightClass = `item-height-${(index % 3) + 1}`;
    
    return (
        <div 
            className={`story-item ${heightClass} scroll-reveal`}
            onClick={() => onClick(story)}
        >
            <video 
                src={story.url} 
                autoPlay 
                muted 
                loop 
                playsInline
            />
            <div className="story-overlay">
                <span>{story.titulo}</span>
            </div>
        </div>
    );
};

export default StoryItem;
