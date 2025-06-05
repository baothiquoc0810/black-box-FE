import axios from "../services/axiosConfig"
import { GET_ALL_TAGS_API_URL, INSERT_TAG_API_URL, DELETE_TAG_API_URL } from "../constants/apiUrls"

const TagService = {
    getAllTags: async (pictureId) => {
        try {
            const response = await axios.get(`${GET_ALL_TAGS_API_URL}/${pictureId}`);
            return response.data.result;
        } catch (error) {
            throw error;
        }
    },

    insertTag: async (pictureId, name) => {
        try {
            const response = await axios.post(`${INSERT_TAG_API_URL}`, { pictureId, name });
            return response.data.result;
        } catch (error) {
            throw error;
        }
    },

    deleteTag: async (pictureId, name) => {
        try {
            const response = await axios.post(`${DELETE_TAG_API_URL}`, { pictureId, name });
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }

}

export default TagService;