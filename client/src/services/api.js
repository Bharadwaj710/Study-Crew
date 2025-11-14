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
  uploadAvatar: (formData) =>
    api.put("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  // Prefer POST remove endpoint for compatibility; DELETE remains supported on server
  removeAvatar: () => api.post("/users/profile/avatar/remove"),
  // Public profile (no auth required endpoint)
  getById: (id) => api.get(`/users/public/${id}`),
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
  // Accepts optional search string, fetches /groups/explore with or without search query
  exploreGroups: (search = "") => {
    const url = search.trim()
      ? `/groups/explore?search=${encodeURIComponent(search)}`
      : "/groups/explore";
    return api.get(url);
  },

  requestJoinGroup: (groupId) => api.post(`/groups/${groupId}/join-request`),

  getJoinRequests: (groupId) => api.get(`/groups/${groupId}/join-requests`),

  cancelJoinRequest: (groupId) =>
    api.delete(`/groups/${groupId}/cancel-join-request`),
  leaveGroup: (groupId) => api.put(`/groups/${groupId}/leave`),

  removeMember: (groupId, memberId) =>
    api.put(`/groups/${groupId}/remove/${memberId}`),

  handleJoinRequest: (groupId, userId, action) =>
    api.put(`/groups/${groupId}/handle-request`, { userId, action }),

  deleteGroup: (id) => api.delete(`/groups/${id}`),
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

export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  respondNotification: (id, action) =>
    api.patch(`/notifications/${id}/respond`, { action }),
};

export const messageAPI = {
  getMessages: (groupId, limit = 50, before = null) => {
    let url = `/groups/${groupId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    return api.get(url);
  },
  createMessage: (groupId, messageData) =>
    api.post(`/groups/${groupId}/messages`, messageData),
  editMessage: (messageId, text) => api.put(`/messages/${messageId}`, { text }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Upload API
export const uploadAPI = {
  uploadFile: (formData) =>
    api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadAvatar: (formData) =>
    api.post("/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
