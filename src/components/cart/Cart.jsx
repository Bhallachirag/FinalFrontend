import React, { useState, useContext } from "react";
import { X, ShoppingCart, User, Plus, Minus, Lock } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import bookingService from '../../services/bookingService.js';
import LoginModal from '../auth/LoginModal.jsx';

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, token } = useContext(AuthContext);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutClick = async () => {
    if (!user || !token) {
      setShowLoginModal(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const checkoutData = {
        userId: user.id || user.email,
        cartItems: items.map(item => ({
          id: item.vaccineId,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        }))
      };

      const result = await bookingService.checkout(checkoutData, token);

      if (result.success) {
        console.log('Redirecting to payment URL:', result.paymentUrl);
        window.location.href = result.paymentUrl;
        onClose();
        
        if (onCheckout) {
          onCheckout({
            success: true,
            message: result.message,
            bookingId: result.bookingId
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      if (onCheckout) {
        onCheckout({
          success: false,
          message: error.message || 'Checkout failed. Please try again.'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setTimeout(() => {
      handleCheckoutClick();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.vaccineId}-${item.inventoryId}`}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-black to-black rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Batch: {item.batchNumber}</p>
                      <p className="text-black font-bold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => onRemove(item)} className="text-black hover:text-red-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t flex-shrink-0 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-black">₹{total.toFixed(2)}</span>
              </div>

              {user && (
                <div className="flex items-center mb-3 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  Logged in as {user.email}
                </div>
              )}

              <button
                onClick={handleCheckoutClick}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-black to-black text-white py-3 rounded-xl font-semibold hover:from-stone-900 hover:to-stone-900 hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : !user ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Login to Proceed
                  </>
                ) : (
                  "Pay Now ₹" + total.toFixed(2)
                )}
              </button>

              {!user && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  You need to login before proceeding to checkout
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Cart;