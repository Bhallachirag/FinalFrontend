import React, { useEffect, useState, useContext } from "react";
import { Calendar, Clock, User, Package, CreditCard, Mail } from "lucide-react";
import { AuthContext } from '../stores/authStore.js';
import bookingService from '../services/bookingService.js';
import { formatDate, formatPrice } from '../utils/helpers.js';
import { STATUS_COLORS } from '../utils/constants.js';

export default function MyOrders() {
  const { user, token } = useContext(AuthContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterDuplicateOrders = (orders) => {
    return orders.filter(order => {
      const bookingId = parseInt(order.id);
      return bookingId;
    });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user has an ID
        let userId = user.id || user.userId || user._id;
        
        // If no user ID, try to decode it from the JWT token
        if (!userId && token) {
          try {
            console.log('Trying to decode JWT token to get user ID');
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('JWT payload:', payload);
              userId = payload.id || payload.userId || payload.sub || payload.user_id;
              console.log('User ID from JWT:', userId);
            }
          } catch (jwtError) {
            console.error('Error decoding JWT:', jwtError);
          }
        }
        
        if (!userId) {
          throw new Error(`No user ID found. Available user fields: ${Object.keys(user).join(', ')}. Please check your authentication system or JWT token structure.`);
        }
        const rawOrders = await bookingService.fetchUserBookings(userId, token);
        // Filter out duplicate orders (keep only odd booking IDs)
        const filteredOrders = filterDuplicateOrders(rawOrders);
        setOrders(filteredOrders);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError(`Error: ${err.message}`);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const getVaccineName = (order) => {
    try {
      if (order.notes) {
        const notesData = JSON.parse(order.notes);
        if (notesData.cartItems && notesData.cartItems.length > 0) {
          const vaccineNames = notesData.cartItems.map(item => item.vaccineName).join(', ');
          return vaccineNames;
        }
      }
    } catch (e) {
      console.error('Error parsing notes:', e);
    }
    return `Vaccine (ID: ${order.vaccineId})`;
  };

  const getStatusColor = (status) => {
    const statusKey = status?.toLowerCase();
    return STATUS_COLORS[statusKey] || STATUS_COLORS.default;
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please login to see your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Vaccine Orders</h2>
        <div className="animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border mb-4 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Vaccine Orders</h2>
        <p className="text-gray-600">View and manage your vaccination appointments</p>
        <p className="text-sm text-gray-500 mt-1">
          Showing orders for: {user.email} - Found {orders.length} booking(s)
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">You haven't made any vaccination bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getVaccineName(order)}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Updated:</span>
                      <span className="ml-1">{formatDate(order.updatedAt)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Doses:</span>
                      <span className="ml-1">{order.noOfDoses}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Total Cost:</span>
                      <span className="ml-1 text-lg font-semibold text-gray-900">
                        {formatPrice(order.totalCost)}
                      </span>
                    </div>

                    <div className="flex items-start text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="font-medium">Status:</span>
                        <span className="ml-1 text-gray-500">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cart Details */}
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Order Details:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {(() => {
                        try {
                          const notesData = JSON.parse(order.notes);
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Cart ID: {notesData.cartId}</p>
                              {notesData.cartItems && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Items:</p>
                                  {notesData.cartItems.map((item, index) => (
                                    <div key={index} className="text-sm text-gray-600 ml-2">
                                     {item.vaccineName} - {item.noOfDoses} dose(s) - {formatPrice(item.itemCost)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return <p className="text-sm text-gray-500">Raw notes: {order.notes}</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {order.status === 'InProcess' && (
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

