import { API_ENDPOINTS } from '../utils/constants.js';

class BookingService {
  constructor() {
    this.baseURL = API_ENDPOINTS.BOOKING_SERVICE;
  }

  async fetchAllBookings(token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/bookings/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async fetchUserBookings(userId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      throw error;
    }
  }

  async checkout(checkoutData, token) {
    try {
      console.log('Calling booking service at:', `${this.baseURL}/api/v1/cart/checkout`);
      console.log('Sending checkout data:', checkoutData);

      const response = await fetch(`${this.baseURL}/api/v1/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(checkoutData)
      });

      const result = await response.json();
      console.log('Booking service response:', result);

      if (response.ok && result.success) {
        return {
          success: true,
          paymentUrl: result.paymentUrl,
          bookingId: result.bookingId,
          message: 'Redirecting to payment gateway...'
        };
      } else {
        throw new Error(result.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }
}

export default new BookingService();    