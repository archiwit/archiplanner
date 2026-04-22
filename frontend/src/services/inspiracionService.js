import axios from 'axios';
import { API_BASE_URL } from '../config';

const inspiracionService = {
    getByEvent: async (cotId) => {
        const res = await axios.get(`${API_BASE_URL}/inspiraciones/${cotId}`);
        return res.data;
    },

    save: async (data) => {
        // Since it might include a file, we use FormData
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        const res = await axios.post(`${API_BASE_URL}/inspiraciones`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    delete: async (id) => {
        const res = await axios.delete(`${API_BASE_URL}/inspiraciones/${id}`);
        return res.data;
    }
};

export default inspiracionService;
