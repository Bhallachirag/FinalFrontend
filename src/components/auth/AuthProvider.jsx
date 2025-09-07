import React, { useState, useEffect } from "react";
import { AuthContext } from '../../stores/authStore.js';
import authService from '../../services/authService.js';
import { ADMIN_EMAIL } from '../../utils/constants.js';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = (user) => {
    return user?.email === ADMIN_EMAIL;
  };

  const decodeTokenAndGetUserId = (token) => {
    try {
      if (!token) return null;
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.id || payload.userId || payload.user_id || payload.sub || null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem('token');
      setTokenState(null);
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUserEmail = localStorage.getItem('userEmail');
      const storedUserId = localStorage.getItem('userId');
      
      if (storedToken && storedUserEmail) {
        setTokenState(storedToken);
        let userId = storedUserId || decodeTokenAndGetUserId(storedToken);
        
        const userData = {
          email: storedUserEmail,
          mobileNumber: localStorage.getItem('userMobileNumber') || null,
          id: userId // This should be numeric, not email
        };
        
        setUser(userData);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setToken(result.token);
        
        const userIdFromToken = decodeTokenAndGetUserId(result.token);
        const userData = {
          email: email,
          mobileNumber: null,
          id: userIdFromToken // This should be numeric now
        };
        
        setUser(userData);

        // Store user data for persistence
        localStorage.setItem('userEmail', email);
        if (userIdFromToken) {
          localStorage.setItem('userId', userIdFromToken.toString());
        }
        
        // Check if admin and log
        if (email === ADMIN_EMAIL) {
          console.log('Admin user detected! Should redirect to admin panel');
        }
        
        return { success: true };
      } else {
        console.log('Login failed:', result.message);
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: "Network error. Please check your connection." 
      };
    }
  };

  const register = async (email, password, mobileNumber) => {
    try {
      const result = await authService.register(email, password, mobileNumber);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: "Network error. Please check your connection." 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobileNumber');
    localStorage.removeItem('userId');
  };

  // Debug log whenever auth state changes
  useEffect(() => {
  }, [user, token, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      isAdmin: user ? isAdmin(user) : false,
      setUser,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;