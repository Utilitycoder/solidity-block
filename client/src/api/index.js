import axios from "axios"

const API = axios.create({ baseURL: "http://localhost:5000" })

API.interceptors.request.use((req) => {
    if (localStorage.getItem("profile")) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("profile")).token}`
    }

    return req
})

export const fetchContracts = () => API.get("/posts")
export const createContract = (newContract) => API.post("/posts", newContract)
export const updateContract = (id, updatedContract) => API.patch(`/posts/${id}`, updatedContract);
export const deleteContract = (id) => API.delete(`/posts/${id}`)

export const signIn = (formData) => API.post('/user/signin', formData);
export const signUp = (formData) => API.post('/user/signup', formData);
export const aiprompt = (prompt) => API.post('/api', prompt);
