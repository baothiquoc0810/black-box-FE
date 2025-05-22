import axios from 'axios';
import { REGISTER_API_URL, LOGIN_API_URL } from '../constants/apiUrls';

const AuthService = {

    login: async (username, password) => {
        try {
            const response = await axios.post(`${LOGIN_API_URL}`, {
                username,
                password
            });

            if (response.data.result.token){
                localStorage.setItem('user', JSON.stringify(response.data.result.user));
            }
            return response.data.result.user;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    isAuthenticated: () => {
        const user = localStorage.getItem('user');
        return !!user;
    },

    register: async (username, email, password) => {
        try {
            const response = await axios.post(`${REGISTER_API_URL}`, {
                username,
                email,
                password
            });
            
            if(response.data.result.token){
                localStorage.setItem('user', JSON.stringify(response.data.result));
            }
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;