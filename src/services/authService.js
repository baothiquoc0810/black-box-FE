import axios from 'axios';
import { REGISTER_API_URL, LOGIN_API_URL } from '../constants/apiUrls';

const TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

const saveUserData = (userData) => {
    const dataWithExpiration = {
        ...userData,
        tokenExpiration: Date.now() + TOKEN_EXPIRATION_TIME
    }
    localStorage.setItem('user', JSON.stringify(dataWithExpiration));
    return dataWithExpiration;
}

const AuthService = {

    login: async (username, password) => {
        try {
            const response = await axios.post(`${LOGIN_API_URL}`, {
                username,
                password
            });
            
            if (response.data.result.token){
                return saveUserData(response.data.result.user);
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
        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) return null;

        const currentTime = Date.now();
        if(currentTime > user.tokenExpiration){
            localStorage.removeItem('user');
            return null;
        }
        return user;
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
            
            if(response.data.result.token) {
                return AuthService._saveUserData(response.data.result);
            }
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;