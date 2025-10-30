import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  searchUsers: (search) => api.get(`/users/search?search=${search}`),
  recommendMembers: (skills, interests) =>
    api.get(
      `/users/recommend?skills=${skills.join(",")}&interests=${interests.join(
        ","
      )}`
    ),
};

// Group API
export const groupAPI = {
  createGroup: (data) => api.post("/groups", data),
  getGroups: () => api.get("/groups"),
  getGroupById: (id) => api.get(`/groups/${id}`),
  joinGroup: (id) => api.post(`/groups/${id}/join`),
};

// Invitation API
export const invitationAPI = {
  getInvitations: () => api.get("/invitations"),
  acceptInvitation: (id) => api.patch(`/invitations/${id}/accept`),
  declineInvitation: (id) => api.patch(`/invitations/${id}/decline`),
};

export default api;
