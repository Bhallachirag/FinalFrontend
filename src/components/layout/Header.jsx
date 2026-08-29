import React, { useState, useContext } from "react";
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Globe, Syringe, LogOut, Package, Shield, ChevronDown } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoginModal from '../auth/LoginModal.jsx';

const Header = ({ onCartClick, cartItems }) => {
  const { user, logout } = useContext(AuthContext);
  const { lang, toggleLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Left - Logo & Subtitle (CivicPulse style) */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden p-1">
                <img src="/logo.png" alt="Bhalla Distributors Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">
                  bhalladistributors<span className="text-emerald-600">.</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                  Healthcare & Vaccine Care
                </span>
              </div>
            </Link>

            {/* Center Nav - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#vaccines" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                {t("navVaccines")}
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                {t("navHowItWorks")}
              </a>
              <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                {t("navWhyUs")}
              </a>
              <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                {t("navContact")}
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Language Selector Pill */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-3.5 py-2 rounded-full cursor-pointer transition-all shadow-sm active:scale-95"
                title="Switch Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === "en" ? "English / हिंदी" : "हिंदी / English"}</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                  {lang === "en" ? "EN" : "HI"}
                </span>
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-bold text-gray-800 max-w-[110px] truncate">
                      {user.email.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Package className="w-4 h-4 text-emerald-600" />
                          <span>My Bookings & Orders</span>
                        </Link>
                        {user.email === 'chiragbhalla03@gmail.com' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-xs font-bold text-gray-700 hover:text-emerald-600 px-4 py-2.5 rounded-xl transition-colors uppercase tracking-wider"
                  >
                    {t("login")}
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 uppercase tracking-wider"
                  >
                    {t("signUp")}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;