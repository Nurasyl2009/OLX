import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData, getAuthHeaders());
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  await axios.delete(`${API_URL}/products/${id}`, getAuthHeaders());
  return id;
};

export const placeOrder = async (productId) => {
  const response = await axios.post(`${API_URL}/orders`, { product_id: productId }, getAuthHeaders());
  return response.data;
};

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`, getAuthHeaders());
  return response.data;
};

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
  return response.data;
};

export const updateRole = async (userId, role) => {
  const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, { role }, getAuthHeaders());
  return response.data;
};

export const deleteUser = async (userId) => {
  await axios.delete(`${API_URL}/admin/users/${userId}`, getAuthHeaders());
};

export const getLogs = async () => {
  const response = await axios.get(`${API_URL}/admin/logs`, getAuthHeaders());
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get(`${API_URL}/admin/orders`, getAuthHeaders());
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/auth/profile`, getAuthHeaders());
  return response.data;
};

export const topUpBalance = async (amount) => {
  const response = await axios.post(`${API_URL}/auth/topup`, { amount }, getAuthHeaders());
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`, getAuthHeaders());
  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await axios.put(`${API_URL}/notifications/read`, {}, getAuthHeaders());
  return response.data;
};

export const getSellerStats = async () => {
  const response = await axios.get(`${API_URL}/seller/stats`, getAuthHeaders());
  return response.data;
};

export const getNotificationUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/notifications/unread-count`, getAuthHeaders());
  return response.data;
};

export const markOneNotificationRead = async (id) => {
  const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, getAuthHeaders());
  return response.data;
};

// Chat / Messages
export const sendMessage = async (receiver_id, message_text) => {
  const response = await axios.post(`${API_URL}/messages`, { receiver_id, message_text }, getAuthHeaders());
  return response.data;
};

export const getChatHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/messages/${userId}`, getAuthHeaders());
  return response.data;
};

export const getConversations = async () => {
  const response = await axios.get(`${API_URL}/conversations`, getAuthHeaders());
  return response.data;
};

export const getMessagesUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/messages-unread-count`, getAuthHeaders());
  return response.data;
};

export const getUsersList = async () => {
  const response = await axios.get(`${API_URL}/users-list`, getAuthHeaders());
  return response.data;
};

export const submitSellerRequest = async (reason) => {
  const response = await axios.post(`${API_URL}/seller-request`, { reason }, getAuthHeaders());
  return response.data;
};

export const getSellerRequestStatus = async () => {
  const response = await axios.get(`${API_URL}/seller-request/status`, getAuthHeaders());
  return response.data;
};

export const getAdminSellerRequests = async () => {
  const response = await axios.get(`${API_URL}/admin/seller-requests`, getAuthHeaders());
  return response.data;
};

export const approveSellerRequest = async (id) => {
  const response = await axios.put(`${API_URL}/admin/seller-requests/${id}/approve`, {}, getAuthHeaders());
  return response.data;
};

export const rejectSellerRequest = async (id) => {
  const response = await axios.put(`${API_URL}/admin/seller-requests/${id}/reject`, {}, getAuthHeaders());
  return response.data;
};
