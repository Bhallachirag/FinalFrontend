import { createContext } from 'react';

export const AuthContext = createContext();

export class AuthStore {
  constructor() {
    this.user = null;
    this.token = localStorage.getItem('token');
    this.loading = true;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  setUser(user) {
    this.user = user;
    if (user?.email) {
      localStorage.setItem('userEmail', user.email);
    }
    if (user?.mobileNumber) {
      localStorage.setItem('userMobileNumber', user.mobileNumber);
    }
    this.notify();
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    this.token = token;
    this.notify();
  }

  setLoading(loading) {
    this.loading = loading;
    this.notify();
  }

  isAdmin() {
    return this.user?.email === 'chirag@admin.com';
  }

  clear() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobileNumber');
    this.notify();
  }

  init() {
    const storedToken = localStorage.getItem('token');
    const storedUserEmail = localStorage.getItem('userEmail');
    
    if (storedToken && storedUserEmail) {
      this.token = storedToken;
      this.user = {
        email: storedUserEmail,
        mobileNumber: localStorage.getItem('userMobileNumber') || null
      };
    }
    this.loading = false;
    this.notify();
  }
}

export const authStore = new AuthStore();