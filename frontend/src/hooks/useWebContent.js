import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function useWebContent(page) {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/web-content/${page}`);
                if (res.ok) {
                    const data = await res.json();
                    setContent(data);
                }
            } catch (err) {
                console.error(`Error fetching ${page} content:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [page]);

    return { content, loading };
}
