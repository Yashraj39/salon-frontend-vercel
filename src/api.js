import axios from "axios";

const api = axios.create({
 //baseURL: "https://render-qs89.onrender.com/api/v1.0",
 baseURL: "http://localhost:8080/api/v1.0",
});

export default api;
