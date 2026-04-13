import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const useCTAs = () => {
    const [ctas, setCtas] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCtas = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/ctas`);
                const data = await res.json();
                
                // Convert array to object for easy access by slug
                const ctaMap = data.reduce((acc, cta) => {
                    acc[cta.slug] = cta;
                    return acc;
                }, {});
                
                setCtas(ctaMap);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching CTAs:', err);
                setLoading(false);
            }
        };

        fetchCtas();
    }, []);

    return { ctas, loading };
};

export default useCTAs;
