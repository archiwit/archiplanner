import axios from 'axios';

const test = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/articulos');
        console.log('Total items:', res.data.length);
        const categories = res.data.map(a => a.categoria);
        console.log('Categories found:', [...new Set(categories)]);
        console.log('Items details:', res.data.map(a => ({ id: a.id, nombre: a.nombre, categoria: a.categoria })));
    } catch (err) {
        console.error('Error fetching articles:', err.message);
    }
};

test();
