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
    if (error.response?.status === 401) {
      // Clear stored data on auth error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Reload the page to reset the app state
      window.location.href = "/login";
    }
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
  createGroup: (data) => {
    console.log("Making POST request to /groups with data:", data);
    return api.post("/groups", data);
  },
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

export const taskAPI = {
  getTasks: (groupId) => api.get(`/groups/${groupId}/tasks`),
  getTask: (groupId, taskId) => api.get(`/groups/${groupId}/tasks/${taskId}`),
  createTask: (groupId, taskData) =>
    api.post(`/groups/${groupId}/tasks`, taskData),
  updateTask: (groupId, taskId, data) =>
    api.put(`/groups/${groupId}/tasks/${taskId}`, data),
  updateProgress: (groupId, taskId, payload) =>
    api.put(`/groups/${groupId}/tasks/${taskId}/progress`, payload),
  completeTask: (groupId, taskId) =>
    api.put(`/groups/${groupId}/tasks/${taskId}/complete`),
  deleteTask: (groupId, taskId) =>
    api.delete(`/groups/${groupId}/tasks/${taskId}`),
};

export const messageAPI = {
  getMessages: (groupId, limit = 50) =>
    api.get(`/groups/${groupId}/messages?limit=${limit}`),
  sendMessage: (groupId, text) =>
    api.post(`/groups/${groupId}/messages`, { text }),
};

export default api;
