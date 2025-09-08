import { API_ENDPOINTS } from '../utils/constants.js';

class AuthService {
  constructor() {
    this.baseURL = API_ENDPOINTS.AUTH_SERVICE;
  }

  async login(email, password) {
    try {
      
      const response = await fetch(`${this.baseURL}/api/v1/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          token: data.data,
          user: { email }
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Wrong Password or Wrong Email' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: "Network error. Please check your connection." 
      };
    }
  }

  async register(email, password, mobileNumber) {
    try {
      const requestBody = { email, password, mobileNumber };
      const response = await fetch(`${this.baseURL}/api/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Registration successful for:', email);
        return { success: true, message: data.message };
      } else {
        console.error('Registration failed:', data);
        return { 
          success: false, 
          message: data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return { 
        success: false, 
        message: "Network error. Please check your connection." 
      };
    }
  }

  async fetchUserData(userId, token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_SERVICE}/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }
}

export default new AuthService();