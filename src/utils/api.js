const API_ENDPOINTS = {
  AUTH_SERVICE: import.meta.env.VITE_AUTH_SERVICE_PATH ,
  VACCINE_SERVICE: import.meta.env.VITE_VACCINE_SERVICE_PATH,
  BOOKING_SERVICE: import.meta.env.VITE_BOOKING_SERVICE_PATH ,
};

export class ApiService {
  static async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true, data: data.data || data, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async get(endpoint, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(endpoint, { method: 'GET', headers });
  }

  static async post(endpoint, body = null, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(endpoint, { 
      method: 'POST', 
      headers,
      body: body ? JSON.stringify(body) : null
    });
  }

  static async put(endpoint, body = null, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(endpoint, { 
      method: 'PUT', 
      headers,
      body: body ? JSON.stringify(body) : null
    });
  }

  static async patch(endpoint, body = null, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(endpoint, { 
      method: 'PATCH', 
      headers,
      body: body ? JSON.stringify(body) : null
    });
  }

  static async delete(endpoint, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export { API_ENDPOINTS };