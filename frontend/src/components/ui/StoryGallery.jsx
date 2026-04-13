import React, { useState } from 'react';
import StoryItem from './StoryItem';

const StoryGallery = ({ stories = [] }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Filter only active stories for the public gallery if status exists
    const activeStories = stories.length > 0 
        ? stories.filter(s => s.activo !== 0)
        : [
            { id: 1, url: '/images/home/historia1.mp4', titulo: 'Boda en la Playa', activo: 1 },
            { id: 2, url: '/images/home/historia1.mp4', titulo: 'Corporativo Luxury', activo: 1 },
            { id: 3, url: '/images/home/historia1.mp4', titulo: 'XV Años Neon', activo: 1 },
            { id: 4, url: '/images/home/historia1.mp4', titulo: 'Cena Intima', activo: 1 },
        ];

    return (
        <section className="story-gallery-section section-padding container">
            <div className="story-asymmetric-grid reveal-grid">
                {activeStories.map((story, index) => (
                    <StoryItem 
                        key={story.id} 
                        story={story} 
                        index={index} 
                        onClick={setSelectedVideo} 
                    />
                ))}
            </div>

            {selectedVideo && (
                <div className="story-modal" onClick={() => setSelectedVideo(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedVideo(null)}>&times;</button>
                        <video src={selectedVideo.url} controls autoPlay />
                    </div>
                </div>
            )}
        </section>
    );
};

export default StoryGallery;
