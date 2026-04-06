import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../utils/auth';

// BFF Gateway URL - all API calls go through the BFF (port 3000)
// The BFF routes to Python (8000), C# (8081), and Java (8082) backends
const getBaseUrl = () => {
    // Local development - use appropriate localhost for platform
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to reach host machine
        return 'http://10.0.2.2:3000';
    }
    // iOS simulator and web can use localhost directly
    return 'http://localhost:3000';
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
