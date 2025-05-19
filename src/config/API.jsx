import axios from "axios"


const API = axios.create({
baseURL:"http://localhost:5000/",
// baseURL: "https://website-backend-production-e152.up.railway.app/",
   withCredentials: true,
})

// API.interceptors.request.use((config)=>{
//     const token = localStorage.getItem('authToken')
//     if(!token) config.headers.Authorization  = `Bearer ${token}`
//     return config;
// })

export default API;
