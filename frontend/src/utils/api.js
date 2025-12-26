import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Correct Backend Port
    timeout: 960000, // 16 minutes for AI generation
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
