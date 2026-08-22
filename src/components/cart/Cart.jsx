import React, { useState, useContext } from "react";
import { X, ShoppingCart, User, Plus, Minus, Lock, Syringe, ArrowRight, Trash2 } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import bookingService from '../../services/bookingService.js';
import LoginModal from '../auth/LoginModal.jsx';

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, token } = useContext(AuthContext);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
        window.location.href = result.paymentUrl;
        onClose();
        if (onCheckout) onCheckout({ success: true, message: result.message, bookingId: result.bookingId });
      }
    } catch (error) {
      if (onCheckout) onCheckout({ success: false, message: error.message || 'Checkout failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setTimeout(handleCheckoutClick, 500);
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 font-sans ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Your Vaccine Booking Cart</h2>
                <p className="text-xs text-slate-400 font-bold">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4 text-emerald-600">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-400">Select vaccines to complete your booking</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-3 bg-emerald-600 text-white text-xs font-extrabold rounded-2xl hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Browse Vaccines
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.vaccineId}-${item.inventoryId}`}
                    className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                      <Syringe className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-xs leading-tight truncate">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Batch: {item.batchNumber}</p>
                      <p className="text-xs font-black text-emerald-600 mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-slate-600 font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-slate-600 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(item)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-gray-100 bg-white space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Cold-Chain Shipping</span>
                  <span className="text-emerald-600 font-extrabold">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {user && (
                <div className="flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>Booking for <strong>{user.email}</strong></span>
                </div>
              )}

              <button
                onClick={handleCheckoutClick}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : !user ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Login to Complete Booking</span>
                  </>
                ) : (
                  <>
                    <span>Pay & Confirm ₹{total.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
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