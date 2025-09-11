import React, { useState, useContext } from "react";
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, MapPin, Phone, Shield } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import LoginModal from '../auth/LoginModal.jsx';

const Header = ({ onCartClick, cartItems }) => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
  <header className="bg-neutral-200 shadow-lg sticky top-0 z-50 w-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Left side - Logo */}
        <div className="flex-shrink-0 flex items-center space-x-0">
          <div className="w-8 h-8 bg-gradient-to-r from-black to-black rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r text-stone-950">
            BhallaDistributors
          </span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Prayagraj, 211003</span>
          </div>

          <button
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-black transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-6 h-6 text-gray-600" />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.email}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex-shrink-0 whitespace-nowrap bg-black text-white px-1 sm:px-2 py-2 rounded-lg hover:bg-neutral-200 hover:text-black transition-colors font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  </header>
  );
};

export default Header;