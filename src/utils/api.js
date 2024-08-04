import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090/api';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const removeRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
    'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export const refreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token found');
    }
    try {
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });
        const { token } = response.data;
        setToken(token);
        return token;
    } catch (error) {
        console.error('Token refresh failed:', error);
        removeToken();
        removeRefreshToken();
        throw error;
    }
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const isAuthenticated = () => !!getToken();

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 409) {
            throw new Error('Email already exists');
        }
        console.error('Register error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getItems = async (page = 1, limit = 20) => {
    const response = await api.get(`/items?page=${page}&limit=${limit}`);
    return response.data;
};

export const searchItems = async (query, page = 1, limit = 20) => {
    try {
        const response = await api.get(`/items/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error searching items:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getPendingOrder = async () => {
    const response = await api.get('/orders/pending');
    return response.data;
};

export const getOrder = async (orderId) => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

export const addToOrder = async (itemId, quantity) => {
    const response = await api.post('/orders/items', { itemId, quantity });
    return response.data;
};

export const removeFromOrder = async (orderId, orderItemId) => {
    try {
        const response = await api.delete(`/orders/${orderId}/items/${orderItemId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing item from order:', error);
        throw error;
    }
};

export const updateOrderItem = async (orderId, orderItemId, newQuantity) => {
    try {
        const response = await api.put(`/orders/${orderId}/items/${orderItemId}`, { quantity: newQuantity });
        return response.data;
    } catch (error) {
        console.error('Error updating order item:', error);
        throw error;
    }
};

export const updateOrderItemQuantity = async (itemId, quantity) => {
    const response = await api.put('/orders/process/update-quantity', { itemId, quantity });
    return response.data;
};
export const addItemToExistingOrder = async (orderId, itemId, quantity) => {
    try {
        const response = await api.post(`/orders/${orderId}/items`, { itemId, quantity });
        return response.data;
    } catch (error) {
        console.error('Error adding item to existing order:', error);
        throw error;
    }
};

export const closeOrder = async (orderId) => {
    try {
        const response = await api.post(`/orders/${orderId}/close`);
        return response.data;
    } catch (error) {
        console.error('Error closing order:', error);
        throw error;
    }
};

export const getUserOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getFavorites = async (page = 1, limit = 20) => {
    const response = await api.get(`/favorites?page=${page}&limit=${limit}`);
    return response.data;
};

export const addToFavorites = async (itemId) => {
    const response = await api.post(`/favorites/${itemId}`);
    return response.data;
};

export const removeFromFavorites = async (itemId) => {
    const response = await api.delete(`/favorites/${itemId}`);
    return response.data;
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const deleteUserProfile = async () => {
    try {
        const response = await api.delete('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error deleting user profile:', error);
        if (error.response) {
        throw new Error(`Server error: ${error.response.status} ${error.response.data}`);
    } else if (error.request) {
        throw new Error('No response received from server');
    } else {
        throw new Error('Error setting up the request');
        }
    }
};

export const logout = () => {
    removeToken();
    removeRefreshToken();
};

export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const createOrderFromCart = async () => {
    try {
        console.log('Sending request to create order from cart');
        const response = await api.post('/orders/create-from-cart');
        console.log('Received response:', response.data);
        return response.data.orderId;
    } catch (error) {
        console.error('Error creating order from cart:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
};

export const updateCartItem = async (itemId, { quantity }) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
};

export const removeCartItem = async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
};

export const placeOrder = async () => {
    const response = await api.post('/orders');
    return response.data;
};

export const addToCart = async ({ itemId, quantity }) => {
    console.log(`Adding to cart: itemId=${itemId}, quantity=${quantity}`);
    try {
        const response = await api.post('/cart', { itemId, quantity });
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const clearCart = async () => {
    const response = await api.delete('/cart');
    return response.data;
};

export const getCartTotal = async () => {
    const response = await api.get('/cart/total');
    return response.data;
};

export const checkItemAvailability = async (itemId) => {
    try {
        const response = await api.get(`/items/${itemId}/availability`);
        return response.data;
    } catch (error) {
        console.error('Error checking item availability:', error);
        throw error;
    }
};
export const getUserOrderHistory = async () => {
    const response = await api.get('/orders/history');
    return response.data;
};

export default api;