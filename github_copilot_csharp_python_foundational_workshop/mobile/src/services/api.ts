import axios from 'axios';
import { getToken } from '../utils/auth';

// Use localhost for Android Emulator (10.0.2.2) if not specified, or standard localhost for iOS
const getBaseUrl = () => {
    if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
    // Fallback logic could be added here if needed
    return 'http://localhost:8000';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
