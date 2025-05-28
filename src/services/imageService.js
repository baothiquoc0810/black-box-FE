import axios from "../services/axiosConfig"
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_DELETE_URL } from "../constants/apiUrls"

const ImageService = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.result;
    },

    deleteImage: async (imageId) => {
        try {
            const response = await axios.post(`${CLOUDINARY_DELETE_URL}/${imageId}`);
            return response.data.result;
        } catch (error) {
            throw error;
        }
    }
}

export default ImageService;