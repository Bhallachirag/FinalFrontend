import React, { useState, useEffect } from "react";
import { Check, Search, Shield, Clock, Phone, Mail, MapPin} from "lucide-react";
import Header from "../components/layout/Header.jsx";
import { SearchFilter } from "../components/index.js";
import VaccineCard from "../components/vaccine/VaccineCard.jsx";
import Cart from "../components/cart/Cart.jsx";
import { transformVaccineData } from "../utils/helpers.js";
import vaccineService from "../services/vaccineService.js";

const HomePage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchVaccines = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiResponse = await vaccineService.fetchVaccines();

        if (apiResponse.success) {
          const transformedVaccines = transformVaccineData(apiResponse);
          setVaccines(transformedVaccines);
          setFilteredVaccines(transformedVaccines);
        } else {
          throw new Error(apiResponse.message || "API returned error");
        }
      } catch (error) {
        console.error("API fetch failed:", error.message);
        setError(`API Error: ${error.message}`);
        setVaccines([]);
        setFilteredVaccines([]);
        showNotification(`Failed to load vaccines: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccines();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("razorpay_payment_id")) {
      const paymentStatus = urlParams.get("razorpay_payment_link_status");
      const paymentId = urlParams.get("razorpay_payment_id");
      if (paymentStatus === "paid") {
        showNotification(
          "Payment successful! Your booking has been confirmed.",
          "success"
        );
        setCartItems([]);
      } else {
        showNotification("Payment was not completed.", "error");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredVaccines(vaccines);
      return;
    }

    try {
      const apiResponse = await vaccineService.searchVaccines(searchTerm);
      if (apiResponse.success) {
        const transformedData = transformVaccineData(apiResponse);
        setFilteredVaccines(transformedData);
        return;
      }
    } catch (error) {
      console.warn("Search API failed, using client-side search:", error);
    }

    const filtered = vaccines.filter((vaccine) =>
      vaccine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVaccines(filtered);
  };

  const handleFilter = (filterType, value) => {
    let filtered = [...vaccines];

    if (filterType === "priceRange" && value) {
      if (value === "0-1000") {
        filtered = filtered.filter((v) => v.inventory.price <= 1000);
      } else if (value === "1000-3000") {
        filtered = filtered.filter(
          (v) => v.inventory.price > 1000 && v.inventory.price <= 3000
        );
      } else if (value === "3000-5000") {
        filtered = filtered.filter(
          (v) => v.inventory.price > 3000 && v.inventory.price <= 5000
        );
      } else if (value === "5000+") {
        filtered = filtered.filter((v) => v.inventory.price > 5000);
      }
    }

    if (filterType === "availability" && value) {
      if (value === "inStock") {
        filtered = filtered.filter((v) => v.inventory.quantity > 10);
      } else if (value === "lowStock") {
        filtered = filtered.filter(
          (v) => v.inventory.quantity > 0 && v.inventory.quantity <= 10
        );
      }
    }

    if (filterType === "sortBy" && value) {
      if (value === "priceLowToHigh") {
        filtered.sort((a, b) => a.inventory.price - b.inventory.price);
      } else if (value === "priceHighToLow") {
        filtered.sort((a, b) => b.inventory.price - a.inventory.price);
      } else if (value === "nameAZ") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    setFilteredVaccines(filtered);
  };

  const handleAddToCart = (vaccine, inventory) => {
    const existingItem = cartItems.find(
      (item) =>
        item.vaccineId === vaccine.vaccineId &&
        item.inventoryId === inventory.id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.vaccineId === vaccine.vaccineId &&
          item.inventoryId === inventory.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: vaccine.id,
          vaccineId: vaccine.vaccineId,
          inventoryId: inventory.id,
          name: vaccine.name,
          price: inventory.price,
          batchNumber: inventory.batchNumber,
          quantity: 1,
          maxQuantity: inventory.quantity,
        },
      ]);
    }
    showNotification(
      `${vaccine.name} (${inventory.batchNumber}) added to cart!`
    );
  };

  const handleUpdateCartQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(item);
      return;
    }

    if (newQuantity > item.maxQuantity) {
      showNotification(`Only ${item.maxQuantity} items available`, "error");
      return;
    }

    setCartItems(
      cartItems.map((cartItem) =>
        cartItem.vaccineId === item.vaccineId &&
        cartItem.inventoryId === item.inventoryId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const handleRemoveFromCart = (item) => {
    setCartItems(
      cartItems.filter(
        (cartItem) =>
          !(
            cartItem.vaccineId === item.vaccineId &&
            cartItem.inventoryId === item.inventoryId
          )
      )
    );
    showNotification(`${item.name} removed from cart`);
  };

  const handleCheckout = (result) => {
    if (result.success) {
      setCartItems([]);
      setIsCartOpen(false);
      showNotification(
        result.message || "Redirecting to payment...",
        "success"
      );
    } else {
      showNotification(result.message || "Checkout failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <Header onCartClick={() => setIsCartOpen(true)} cartItems={cartItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-black to-black text-neutral-200 py-20 width-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Book vaccines online with ease. Safe, reliable, and convenient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-neutral-200 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                Browse Vaccines
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-black transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-stone-950 mb-2">5K+</div>
              <div className="text-gray-600">Vaccines Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-stone-950 mb-2">
                1000+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-stone-950 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-stone-950 mb-2">100%</div>
              <div className="text-gray-600">Authentic Products</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vaccines Section */}
      <section id="vaccines" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available Vaccines & Injections
            </h2>
            <p className="text-xl text-gray-600">
              Browse our comprehensive collection of vaccines and book your
              vaccines
            </p>
          </div>

          <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredVaccines.map((vaccine) => (
                <VaccineCard
                  key={vaccine.id}
                  vaccine={vaccine}
                  inventory={vaccine.inventory}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {!loading && filteredVaccines.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No vaccines found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose BhallaDistributors?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                100% Authentic
              </h3>
              <p className="text-gray-600">
                All vaccines are sourced directly from authorized manufacturers
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery to your doorstep
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Round-the-clock customer support for all your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-white to-white rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="text-2xl font-bold">BhallaDistributors</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for vaccine distribution and healthcare
                solutions.
              </p>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+91 91403 58238</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4"  />
                <span>chiragbhalla73@gmail.com</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Vaccines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Booking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Online Booking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home Delivery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Reminders
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 mt-1" />
                  <span>Prayagraj, Uttar Pradesh, 211003</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 91403 58239</span>
                </div>
                <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>chiragbhalla73@gmail.com</span>
              </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BhallaDistributors. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default HomePage;
