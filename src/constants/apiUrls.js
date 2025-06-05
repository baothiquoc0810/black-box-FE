export const API_URL = 'http://localhost:8080/api';


//user
export const REGISTER_API_URL = `${API_URL}/user/create`;
export const GET_ALL_IMAGES_API_URL = `${API_URL}/user/getAllImages`;
export const AUTH_API_URL = `${API_URL}/auth/`;
export const LOGIN_API_URL = `${API_URL}/auth/login`;
export const VERIFY_USER_API_URL = `${API_URL}/auth/verify`;

//cloudinary
export const CLOUDINARY_UPLOAD_URL = `${API_URL}/cloudinary/upload`;
export const CLOUDINARY_DELETE_URL = `${API_URL}/cloudinary/delete`;

//tag
export const GET_ALL_TAGS_API_URL = `${API_URL}/tag/allTags`;
export const INSERT_TAG_API_URL = `${API_URL}/tag/insert`;
export const DELETE_TAG_API_URL = `${API_URL}/tag/delete`;