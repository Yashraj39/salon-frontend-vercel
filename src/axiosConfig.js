
import axios from "axios";

const api = axios.create({
 baseURL: "https://render-qs89.onrender.com/api/v1.0/", // direct backend URL
});

export default api;
