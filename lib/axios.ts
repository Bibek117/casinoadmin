import axios from 'axios';
import { useRouter } from 'next/router';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const router = useRouter();
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;