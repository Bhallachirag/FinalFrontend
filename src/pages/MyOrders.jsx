import React, { useEffect, useState, useContext } from "react";
import {
  Calendar, Clock, Package, CreditCard, Syringe, ArrowLeft, CheckCircle,
  AlertCircle, Loader2, RefreshCw, ShoppingBag, Search, Filter, Plus,
  LayoutDashboard, FileText, Bell, LogOut, Globe, User, Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from '../stores/authStore.js';
import bookingService from '../services/bookingService.js';
import { formatDate, formatPrice } from '../utils/helpers.js';

export default function MyOrders() {
  const { user, token, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filterDuplicateOrders = (orders) => orders.filter(order => !!parseInt(order.id));

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        let userId = user.id || user.userId || user._id;

        if (!userId && token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              userId = payload.id || payload.userId || payload.sub || payload.user_id;
            }
          } catch (e) { /* ignore */ }
        }

        if (!userId) throw new Error("No user ID found. Please re-login.");
        const rawOrders = await bookingService.fetchUserBookings(userId, token);
        const list = filterDuplicateOrders(rawOrders);
        setOrders(list);
        setFilteredOrders(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const handleSearchFilter = (search, status) => {
    let result = [...orders];
    if (search.trim()) {
      result = result.filter(o => getVaccineName(o).toLowerCase().includes(search.toLowerCase()));
    }
    if (status !== "all") {
      result = result.filter(o => (o.status || "").toLowerCase() === status.toLowerCase());
    }
    setFilteredOrders(result);
  };

  const getVaccineName = (order) => {
    try {
      if (order.notes) {
        const notesData = JSON.parse(order.notes);
        if (notesData.cartItems?.length > 0) return notesData.cartItems.map(i => i.vaccineName).join(', ');
      }
    } catch { /* ignore */ }
    return order.vaccineId ? `Vaccine #${order.vaccineId}` : 'Vaccine Order';
  };

  const getCartItems = (order) => {
    try { if (order.notes) { const d = JSON.parse(order.notes); return d.cartItems || []; } } catch { /* ignore */ }
    return [];
  };

  const statusConfig = {
    confirmed: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, dot: "bg-emerald-500" },
    inprocess: { label: "In Process", color: "bg-[#eff6ff] text-blue-700 border-blue-200", icon: Loader2, dot: "bg-blue-500" },
    pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, dot: "bg-amber-500" },
    booked: { label: "Booked", color: "bg-purple-50 text-purple-700 border-purple-200", icon: CheckCircle, dot: "bg-purple-500" },
    default: { label: "Processing", color: "bg-slate-50 text-slate-700 border-slate-200", icon: Package, dot: "bg-slate-400" },
  };

  const getStatus = (status) => statusConfig[status?.toLowerCase()] || { ...statusConfig.default, label: status || "Processing" };

  if (!user) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-100">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Login Required</h2>
        <p className="text-xs text-slate-500 mb-6">Please log in to view your vaccine booking records.</p>
        <Link to="/" className="block w-full py-3 bg-emerald-600 text-white rounded-2xl font-extrabold text-xs text-center shadow-md">
          Go to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-800">
      
      {/* ===== CIVICPULSE SOLID EMERALD SIDEBAR ===== */}
      <aside className="w-64 bg-[#059669] text-white flex flex-col justify-between flex-shrink-0 p-4 shadow-xl z-20 hidden md:flex">
        
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 mb-6 px-2 pt-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Syringe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-none">Bhalla Vaccine</h1>
              <p className="text-[10px] text-emerald-100/80 font-bold uppercase tracking-wider mt-1">Patient Portal</p>
            </div>
          </div>

          {/* Big CTA Button (Matching CivicPulse "+ Report an Issue") */}
          <Link
            to="/"
            className="w-full bg-[#047857] hover:bg-[#065f46] text-white font-extrabold py-3.5 px-4 rounded-2xl mb-6 shadow-md flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book a Vaccine</span>
          </Link>

          {/* Nav Items (Matching CivicPulse Active White Capsule Style) */}
          <nav className="space-y-1.5">
            <Link to="/" className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-emerald-50 hover:bg-emerald-600/60 transition-all">
              <LayoutDashboard className="w-4 h-4" />
              <span>Home Catalog</span>
            </Link>

            <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-white text-[#047857] shadow-md shadow-emerald-900/10">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>My Bookings</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {orders.length}
              </span>
            </div>

            <a href="#notifications" className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-emerald-50 hover:bg-emerald-600/60 transition-all">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </a>
          </nav>
        </div>

        {/* Bottom Profile Badge (Matching CivicPulse user badge at bottom left) */}
        <div className="bg-[#047857]/90 rounded-2xl p-3 flex items-center justify-between border border-emerald-500/30">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl text-white font-extrabold flex items-center justify-center text-xs shadow-inner">
              {user.email[0].toUpperCase()}
            </div>
            <div className="truncate text-left">
              <p className="font-extrabold text-white text-xs truncate leading-none">{user.email.split('@')[0]}</p>
              <p className="text-[10px] text-emerald-200 font-bold mt-0.5">Citizen / Patient</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* ===== MAIN CONTENT AREA (Matching CivicPulse Image 6) ===== */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 md:hidden"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">My Bookings</h2>
              <p className="text-xs text-slate-500">Track and manage your requested vaccine appointments.</p>
            </div>
          </div>
          <Link to="/" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>+ Book a Vaccine</span>
          </Link>
        </header>

        <main className="p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {/* Search & Filter Bar (Matching CivicPulse Image 6) */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings by vaccine name..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); handleSearchFilter(e.target.value, statusFilter); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); handleSearchFilter(searchTerm, e.target.value); }}
                className="px-4 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="inprocess">In Process</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-white h-32 rounded-3xl border border-gray-100 animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center text-red-700 text-xs font-bold">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (

            /* Empty State (Matching CivicPulse Image 6 exact layout) */
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No Bookings Submitted</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                You haven't requested any vaccine bookings yet. When you submit a booking, it will appear here for you to track.
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Book Your First Vaccine</span>
              </Link>
            </div>

          ) : (

            /* Orders Card List */
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const status = getStatus(order.status);
                const cartItems = getCartItems(order);
                const vaccineName = getVaccineName(order);

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                          💉
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{vaccineName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold">Booking #{order.id} • {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">DOSE QUANTITY</p>
                        <p className="font-black text-slate-900 mt-0.5">{order.noOfDoses || 1} Dose(s)</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">TOTAL AMOUNT</p>
                        <p className="font-black text-emerald-600 mt-0.5">{formatPrice(order.totalCost)}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl col-span-2 sm:col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">COLD-CHAIN STATUS</p>
                        <p className="font-black text-slate-800 mt-0.5">Verified Safe ❄️</p>
                      </div>
                    </div>

                    {cartItems.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-2xl space-y-2 text-xs border border-gray-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Breakdown</p>
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-700">
                            <span className="font-bold">{item.vaccineName}</span>
                            <span>{item.noOfDoses} dose(s) - <strong className="text-slate-900">{formatPrice(item.itemCost)}</strong></span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          )}

        </main>
      </div>

    </div>
  );
}
