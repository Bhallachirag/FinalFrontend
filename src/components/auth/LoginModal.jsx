import React, { useState, useContext } from "react";
import { X, Mail, Lock, Phone } from "lucide-react";
import { AuthContext } from '../../stores/authStore.js';
import { ADMIN_EMAIL } from '../../utils/constants.js';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await authContext.login(formData.email, formData.password);
        if (result.success) {
          localStorage.setItem('userEmail', formData.email);

          const storedEmail = localStorage.getItem('userEmail');
          const storedToken = localStorage.getItem('token');
          
          if (formData.email === ADMIN_EMAIL) {
            // Close modal first
            onClose();
            if (onLoginSuccess) onLoginSuccess();
            
            // Redirect to admin page
            setTimeout(() => {
              console.log('🔄 Executing admin redirect...');
              window.location.href = '/admin';
            }, 200);
            return;
          }
        }
      } else {
        result = await authContext.register(
          formData.email,
          formData.password,
          formData.mobileNumber
        );
        
        if (result.success) {
          const loginResult = await authContext.login(formData.email, formData.password);
          
          if (loginResult.success) {
            localStorage.setItem('userEmail', formData.email);
          }
          
          result = loginResult;
        }
      }

      if (result.success) {
        console.log('Authentication successful');
        onClose();
        if (onLoginSuccess) onLoginSuccess();
        setFormData({ email: "", password: "", mobileNumber: "" });
      } else {
        console.log('Authentication failed:', result.message);
        setError(result.message || "Authentication failed");
      }
    } catch (error) {
      console.error(' LoginModal error:', error);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 max-w-md w-full overflow-hidden">
       <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r bg-green-400 text-black">
        <div></div> {/* Empty spacer */}
        <h2 className="text-2xl font-bold">
        {isLogin ? "Login" : "Sign Up"}
        </h2>
        <button
        onClick={onClose}
        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        > 
        <X className="w-6 h-6" />
        </button>
            </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your mobile number"
                required
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r bg-green-500 text-black py-3 rounded-lg font-semibold hover:from-stone-900 hover:to-stone-900 hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-black hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;