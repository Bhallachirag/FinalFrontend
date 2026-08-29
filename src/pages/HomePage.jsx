import React, { useState, useEffect } from "react";
import {
  Syringe, Search, Eye, Edit3, ListCheck, CheckCircle2, Send, Clock, Users,
  ShieldCheck, MapPin, BarChart3, ChevronRight, X, Phone, Mail, Globe, Sparkles,
  ArrowRight, Heart, Bell, LayoutDashboard, Home, FileText, PieChart, Activity
} from "lucide-react";
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
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

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
      } catch (err) {
        setError(`Failed to load vaccines: ${err.message}`);
        setVaccines([]);
        setFilteredVaccines([]);
        showNotification(`Failed to load vaccines: ${err.message}`, "error");
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
      if (paymentStatus === "paid") {
        showNotification("🎉 Booking confirmed! Cold-chain dispatch initiated.", "success");
        setCartItems([]);
      } else {
        showNotification("Payment was not completed.", "error");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) { setFilteredVaccines(vaccines); return; }
    try {
      const apiResponse = await vaccineService.searchVaccines(searchTerm);
      if (apiResponse.success) { setFilteredVaccines(transformVaccineData(apiResponse)); return; }
    } catch (e) { /* fallback */ }
    setFilteredVaccines(vaccines.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  const handleFilter = (filterType, value) => {
    let filtered = [...vaccines];
    if (filterType === "priceRange" && value) {
      const ranges = { "0-1000": [0,1000], "1000-3000": [1001,3000], "3000-5000": [3001,5000], "5000+": [5001,Infinity] };
      const [min, max] = ranges[value] || [0, Infinity];
      filtered = filtered.filter(v => v.inventory.price >= min && v.inventory.price <= max);
    }
    if (filterType === "availability" && value) {
      if (value === "inStock") filtered = filtered.filter(v => v.inventory.quantity > 10);
      else if (value === "lowStock") filtered = filtered.filter(v => v.inventory.quantity > 0 && v.inventory.quantity <= 10);
    }
    if (filterType === "sortBy" && value) {
      if (value === "priceLowToHigh") filtered.sort((a,b) => a.inventory.price - b.inventory.price);
      else if (value === "priceHighToLow") filtered.sort((a,b) => b.inventory.price - a.inventory.price);
      else if (value === "nameAZ") filtered.sort((a,b) => a.name.localeCompare(b.name));
    }
    setFilteredVaccines(filtered);
  };

  const handleAddToCart = (vaccine, inventory) => {
    const existing = cartItems.find(i => i.vaccineId === vaccine.id && i.inventoryId === inventory.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.vaccineId === vaccine.id && i.inventoryId === inventory.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, { id: vaccine.id, vaccineId: vaccine.id, inventoryId: inventory.id, name: vaccine.name, price: inventory.price, batchNumber: inventory.batchNumber, quantity: 1, maxQuantity: inventory.quantity }]);
    }
    showNotification(`🧪 ${vaccine.name} added to booking cart!`);
  };

  const handleUpdateCartQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) { handleRemoveFromCart(item); return; }
    if (newQuantity > item.maxQuantity) { showNotification(`Only ${item.maxQuantity} doses available`, "error"); return; }
    setCartItems(cartItems.map(i => i.vaccineId === item.vaccineId && i.inventoryId === item.inventoryId ? { ...i, quantity: newQuantity } : i));
  };

  const handleRemoveFromCart = (item) => {
    setCartItems(cartItems.filter(i => !(i.vaccineId === item.vaccineId && i.inventoryId === item.inventoryId)));
    showNotification(`${item.name} removed from cart`);
  };

  const handleCheckout = (result) => {
    if (result.success) { setCartItems([]); setIsCartOpen(false); showNotification(result.message || "Redirecting to payment...", "success"); }
    else showNotification(result.message || "Checkout failed", "error");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-[100] max-w-sm w-full shadow-2xl rounded-2xl border overflow-hidden transition-all duration-300 ${notification.type === "error" ? "bg-red-900 text-white border-red-800" : "bg-emerald-950 text-white border-emerald-800"}`}>
          <div className="flex items-center space-x-3 p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === "error" ? "bg-red-800" : "bg-emerald-800"}`}>
              {notification.type === "error" ? <X className="w-4 h-4 text-white" /> : <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            </div>
            <span className="text-xs font-semibold flex-1">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <Header onCartClick={() => setIsCartOpen(true)} cartItems={cartItems} />

      {/* ===== HERO SECTION (Matching CivicPulse Image 1) ===== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-[#fafbfc] overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category Pill */}
              {/* <div className="inline-flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200/80 rounded-full px-4 py-1.5">
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-700">
                  REIMAGINING HEALTHCARE ACCESS
                </span>
              </div> */}

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Your Health.<br />
                Your City.<br />
                <span className="text-emerald-600">Your Vaccine Pulse.</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Book certified vaccines, track real-time inventory, and ensure seamless temperature-controlled delivery for your community in Prayagraj.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="#vaccines"
                  className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-7 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Syringe className="w-4 h-4" />
                  <span>Book a Vaccine</span>
                </a>
                <button
                  onClick={() => setIsLearnMoreOpen(true)}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-gray-200 text-slate-800 font-bold text-sm px-7 py-4 rounded-2xl transition-all shadow-sm"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Explore Vaccines</span>
                </button>
              </div>

              {/* Social Proof Badges */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">CB</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-teal-600 text-white text-xs font-bold flex items-center justify-center">BD</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">VP</div>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-extrabold text-slate-900">10K+</span> Citizens Protected in Prayagraj & UP
                </div>
              </div>

            </div>

            {/* Right Column - Interactive Mini Dashboard Mockup (Matching CivicPulse Image 1 & 4) */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl bg-white border border-gray-200/90 shadow-2xl overflow-hidden p-1 bg-gradient-to-b from-gray-100 to-gray-50">
                
                {/* Window Chrome / Bar */}
                <div className="bg-slate-900 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">bhalladistributors.com/portal</span>
                  <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Internal Split Layout Mockup */}
                <div className="flex h-[420px] bg-slate-50 overflow-hidden text-xs">
                  
                  {/* Left Mini Sidebar (CivicPulse Emerald Green) */}
                  <div className="w-48 bg-emerald-700 text-white p-3 flex flex-col justify-between flex-shrink-0">
                    <div>
                      <div className="flex items-center space-x-2 mb-4 px-1">
                        <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                          <Syringe className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-extrabold text-white text-xs tracking-tight">Vaccine Pulse</span>
                      </div>

                      {/* Mini CTA */}
                      <button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 px-3 rounded-xl mb-4 flex items-center justify-center space-x-1 text-[11px]">
                        <span>+ Book Vaccine</span>
                      </button>

                      {/* Mini Nav Items */}
                      <div className="space-y-1">
                        <div className="bg-white text-emerald-800 font-extrabold px-3 py-2 rounded-xl flex items-center space-x-2 shadow-sm">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </div>
                        <div className="text-emerald-100/80 hover:bg-emerald-600/50 px-3 py-2 rounded-xl flex items-center space-x-2 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          <span>My Bookings</span>
                        </div>
                        <div className="text-emerald-100/80 hover:bg-emerald-600/50 px-3 py-2 rounded-xl flex items-center space-x-2 font-medium">
                          <Search className="w-3.5 h-3.5" />
                          <span>Explore Vaccines</span>
                        </div>
                        <div className="text-emerald-100/80 hover:bg-emerald-600/50 px-3 py-2 rounded-xl flex items-center space-x-2 font-medium">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notifications</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Profile Footer */}
                    <div className="bg-emerald-800/80 rounded-xl p-2 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-emerald-600 rounded-lg text-white font-bold flex items-center justify-center text-[10px]">C</div>
                      <div className="flex-1 truncate">
                        <p className="font-bold text-white text-[11px] truncate">chiragbhalla</p>
                        <p className="text-[9px] text-emerald-200">Resident</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Main Mockup Dashboard */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">Good morning, Chirag! 👋</h4>
                        <p className="text-[10px] text-slate-500">Let's keep Prayagraj healthy and safe.</p>
                      </div>
                      <div className="bg-white border border-gray-200 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Prayagraj, UP</span>
                      </div>
                    </div>

                    {/* 4 Pastel Stat Cards (Matching CivicPulse image 1/4) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-2">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">+</div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Total Vaccines</p>
                          <p className="text-xs font-black text-slate-900">128 <span className="text-[8px] text-emerald-600 font-normal">+12/wk</span></p>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-2">
                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-bold">⏳</div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">In Dispatch</p>
                          <p className="text-xs font-black text-slate-900">48 <span className="text-[8px] text-amber-600 font-normal">cold-chain</span></p>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-2">
                        <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 font-bold">✓</div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Delivered</p>
                          <p className="text-xs font-black text-slate-900">75 <span className="text-[8px] text-sky-600 font-normal">+18/wk</span></p>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-2">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold">👍</div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Satisfaction</p>
                          <p className="text-xs font-black text-slate-900">4.9⭐ <span className="text-[8px] text-purple-600 font-normal">99%</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Mini Map Card / Availability preview */}
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span>Prayagraj Storage Heatmap</span>
                        <span className="text-emerald-600">● 100% Operational</span>
                      </div>
                      <div className="h-20 bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-50 rounded-lg relative flex items-center justify-center overflow-hidden border border-emerald-100">
                        <div className="absolute top-3 left-6 w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                        <div className="absolute bottom-4 right-10 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <div className="absolute top-5 right-16 w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold text-slate-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                          📍 Central Depot: Civil Lines
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== STATS STRIP (Matching CivicPulse Image 2) ===== */}
      <section className="relative -mt-8 z-20 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            <div className="flex items-center space-x-4 pt-2 md:pt-0 md:pl-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Syringe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">7+</p>
                <p className="text-xs font-semibold text-slate-500">Vaccines Available</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 md:pt-0 md:pl-6">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">3,000+</p>
                <p className="text-xs font-semibold text-slate-500">Doses Delivered</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 md:pt-0 md:pl-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">1,500+</p>
                <p className="text-xs font-semibold text-slate-500">Active Citizens</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 md:pt-0 md:pl-6">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">99.4%</p>
                <p className="text-xs font-semibold text-slate-500">Satisfaction Rate</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HOW VACCINE PULSE WORKS (Matching CivicPulse Image 2) ===== */}
      <section id="how-it-works" className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How <span className="text-emerald-600">Vaccine Pulse</span> Works
          </h2>
          <p className="text-base text-slate-500 font-normal mt-2 max-w-lg mx-auto">
            Simple steps to get vaccinated and stay safe in Prayagraj
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="absolute -bottom-2 font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  01
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Choose Vaccine</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Browse certified vaccines, compare prices, and check batch expiry details in real time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Edit3 className="w-8 h-8 text-amber-600" />
                </div>
                <span className="absolute -bottom-2 font-black text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  02
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Book Appointment</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Select your required doses and complete secure online payment via Razorpay.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-20 h-20 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ListCheck className="w-8 h-8 text-sky-600" />
                </div>
                <span className="absolute -bottom-2 font-black text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  03
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Track Cold-Chain</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Follow your dispatch status live with verified temperature storage guarantees.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="absolute -bottom-2 font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  04
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Stay Protected</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Receive authentic digital certificates and automated dose reminder alerts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===== WHY VACCINE PULSE (Matching CivicPulse Image 3) ===== */}
      <section id="features" className="py-20 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why <span className="text-emerald-600">Vaccine Pulse</span>?
          </h2>
          <p className="text-base text-slate-500 font-normal mt-2 max-w-lg mx-auto">
            Powerful features to empower citizens and build better healthcare
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 text-center">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-600 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Easy Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book vaccines in seconds with instant batch verification and transparent pricing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-time Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track the status of your bookings from warehouse dispatch to delivery.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Community Powered</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sourced directly for clinics, hospitals, and households across Prayagraj.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-sky-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% Authentic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Certified vaccines sourced directly from authorized government manufacturers.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-600 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Location Based</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Localized delivery routes ensuring fastest turnarounds in UP districts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cold-Chain Assured</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uncompromised temperature control guarantees maximum vaccine potency.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===== VACCINES CATALOG SECTION ===== */}
      <section id="vaccines" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">
                VERIFIED INVENTORY
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Available Vaccines</h2>
            </div>
            <p className="text-xs text-slate-500 mt-2 md:mt-0">
              Showing {filteredVaccines.length} verified products available in Prayagraj
            </p>
          </div>

          <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-3xl p-5 border border-gray-100 animate-pulse space-y-4">
                  <div className="h-40 bg-gray-200 rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center max-w-md mx-auto">
              <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
          ) : filteredVaccines.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200/60 rounded-3xl p-12 text-center max-w-md mx-auto">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No vaccines match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        </div>
      </section>

      {/* ===== DARK FOOTER (Matching CivicPulse Image 3) ===== */}
      <footer id="contact" className="bg-[#0b1329] text-white pt-16 pb-12 border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">bhalladistributors<span className="text-emerald-500">.</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering communities and healthcare providers in Prayagraj to work together for safer, healthier cities.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#vaccines" className="hover:text-emerald-400 transition-colors">Book a Vaccine</a></li>
                <li><a href="#vaccines" className="hover:text-emerald-400 transition-colors">Explore Catalog</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Why Choose Us</a></li>
              </ul>
            </div>

            {/* Organization */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Organization</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><button onClick={() => setIsLearnMoreOpen(true)} className="hover:text-emerald-400 transition-colors text-left">About Us</button></li>
                <li><span className="hover:text-emerald-400 transition-colors">For Clinics & Hospitals</span></li>
                <li><span className="hover:text-emerald-400 transition-colors">Cold-Chain Standard</span></li>
                <li><span className="hover:text-emerald-400 transition-colors">Contact Support</span></li>
              </ul>
            </div>

            {/* Legal / Contact */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Contact & Legal</h4>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <p className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-emerald-500" /><span>Prayagraj, UP 211003</span></p>
                <p className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-emerald-500" /><span>+91 91403 58239</span></p>
                <p className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5 text-emerald-500" /><span>chiragbhalla73@gmail.com</span></p>
              </div>
              <p className="text-[10px] text-slate-500">Privacy Policy • Terms of Service</p>
            </div>

          </div>

          <div className="border-t border-slate-800/80 pt-8 text-center text-xs text-slate-500">
            <p>© 2025 Bhalla Distributors. All rights reserved. Built for Prayagraj, Uttar Pradesh.</p>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {isLearnMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLearnMoreOpen(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <button onClick={() => setIsLearnMoreOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/30">
                <Syringe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Bhalla Distributors 👋</h3>
              <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
                <p>Based in <strong>Prayagraj, Uttar Pradesh</strong>, we distribute government-certified vaccines to clinics, hospitals, and citizens.</p>
                <p>Our platform ensures 100% cold-chain temperature control and batch authenticity.</p>
                <p className="text-sm font-extrabold text-emerald-600 pt-2">We Care and We Serve!</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
