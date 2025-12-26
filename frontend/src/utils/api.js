import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Uses Env Var in Prod, Localhost in Dev
    timeout: 960000, // 16 minutes for AI generation
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
