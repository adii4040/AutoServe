import axios from 'axios';

/**
 * Axios instance with credentials and base config
 * Automatically includes cookies in all requests
 */
const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor to handle errors consistently
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login if needed
      console.error('Unauthorized - token may have expired');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
