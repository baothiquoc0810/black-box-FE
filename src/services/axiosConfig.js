import axios from 'axios';

axios.interceptors.request.use(
    (config) => {
        const result = JSON.parse(localStorage.getItem('user'));
        if (result && result.token) {
            config.headers.Authorization = `Bearer ${result.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401){
            localStorage.removeItem('user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default axios;