import { useEffect } from 'react';

/**
 * Custom hook to initialize IntersectionObserver for .scroll-reveal elements.
 */
const useScrollReveal = (deps = []) => {
    useEffect(() => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const revealOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);
        
        revealElements.forEach((el, index) => {
            // Automatically add delay to grid children if needed
            if (el.parentElement && el.parentElement.classList.contains('reveal-grid')) {
                el.dataset.delay = (index % 3) * 150;
            }
            revealObserver.observe(el);
        });

        // Cleanup
        return () => {
            revealElements.forEach(el => revealObserver.unobserve(el));
        };
    }, deps);
};

export default useScrollReveal;
