import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const usePageSections = (pagina) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/secciones/${pagina}`);
                const data = await res.json();
                setSections(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sections:', err);
                setLoading(false);
            }
        };

        fetchSections();
    }, [pagina]);

    return { sections, loading };
};

export default usePageSections;
