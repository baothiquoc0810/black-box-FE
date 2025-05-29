import axios from "../services/axiosConfig"
import { GET_ALL_IMAGES_API_URL } from "../constants/apiUrls"

const UserService = {
    getAllImages: async (userId) => {
        const response = await axios.get(`${GET_ALL_IMAGES_API_URL}/${userId}`);
        return response.data.result;
    }
}

export default UserService;