import React, { useEffect, useState, useContext } from "react";
import {
  Users, Package, Calendar, Eye, AlertTriangle, Edit2, Trash2, Plus, X,
  Syringe, LayoutDashboard, CheckCircle, Clock, TrendingUp, Search,
  ChevronRight, Save, RefreshCw, LogOut, Shield, User, Bell, Activity,
  Globe, Filter, MapPin, FileText, CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";
import { AuthContext } from "../stores/authStore.js";
import { DEFAULT_STATS, ADMIN_EMAIL } from "../utils/constants.js";
import {
  getVaccinePrice, getVaccineQuantity, getInventoryDetails,
  extractUserName, extractVaccineName, extractDateTimeFromCreatedAt, groupBookingsByDate
} from "../utils/helpers.js";
import vaccineService from "../services/vaccineService.js";
import bookingService from "../services/bookingService.js";
import authService from "../services/authService.js";

// Reusable Toast
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-xs font-bold transition-all ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
      <span>{toast.message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
};

// Confirm Dialog
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-xs text-slate-500 text-center mb-6">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Vaccine Modal
const EditVaccineModal = ({ vaccine, isOpen, onClose, onSave, loading }) => {
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });

  useEffect(() => {
    if (vaccine) {
      const inv = getInventoryDetails(vaccine);
      setForm({ name: vaccine.name || "", price: inv?.price || "", quantity: inv?.quantity || "" });
    }
  }, [vaccine]);

  if (!isOpen || !vaccine) return null;
  const inventory = getInventoryDetails(vaccine);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="h-1.5 bg-emerald-600" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-slate-900">Edit Vaccine Details</h3>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Vaccine Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50">Cancel</button>
            <button onClick={() => onSave(vaccine, form, inventory)} disabled={loading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Vaccine Modal
const AddVaccineModal = ({ isOpen, onClose, onAdd, loading }) => {
  const [form, setForm] = useState({ name: "", ageGroup: "All ages", description: "", quantity: "100", price: "500", batchNumber: "BT202501", expiryDate: "2026-12-31", manufacturedDate: "2025-01-01", manufacturer: "Pfizer / Serum Institute" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="h-1.5 bg-emerald-600" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Add New Vaccine to Inventory</h3>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onAdd(form); }} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vaccine Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" placeholder="e.g. Covaxin" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age Group *</label>
                <select value={form.ageGroup} onChange={e => setForm({...form, ageGroup: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white">
                  {["0-2 years","2-5 years","5-12 years","12-18 years","18+ years","All ages"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                <input required type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Number *</label>
                <input required type="text" value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                <input required type="text" value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufactured Date *</label>
                <input required type="date" value={form.manufacturedDate} onChange={e => setForm({...form, manufacturedDate: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
                <input required type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Vaccine</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext) || { user: { email: ADMIN_EMAIL }, token: "mock-token", loading: false };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, pendingBookings: 0, totalVaccines: 0 });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [userCache, setUserCache] = useState({});
  const [bookingSearch, setBookingSearch] = useState("");
  const [vaccineSearch, setVaccineSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, vaccine: null });
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const timer = setTimeout(() => { setStats(DEFAULT_STATS); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === "vaccines" && vaccines.length === 0) fetchVaccines();
    if (activeTab === "bookings" && bookings.length === 0) fetchBookings();
  }, [activeTab]);

  const fetchUserData = async (userId) => {
    if (userCache[userId]) return userCache[userId];
    try {
      const userData = await authService.fetchUserData(userId, token);
      setUserCache(prev => ({ ...prev, [userId]: userData }));
      return userData;
    } catch { return null; }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookingsArray = await bookingService.fetchAllBookings(token);
      const filtered = bookingsArray.filter(b => b.id);
      const withUsers = await Promise.all(
        filtered.map(async (b) => {
          const userId = b.userId || b.userid;
          if (userId) return { ...b, userData: await fetchUserData(userId) };
          return b;
        })
      );
      setBookings(withUsers);
      setStats(prev => ({ ...prev, totalBookings: withUsers.length }));
      showToast(`Loaded ${withUsers.length} bookings`);
    } catch (err) { showToast(err.message, "error"); } finally { setBookingsLoading(false); }
  };

  const fetchVaccines = async () => {
    setVaccinesLoading(true);
    try {
      const data = await vaccineService.fetchVaccines();
      const array = data.data || [];
      setVaccines(array);
      setStats(prev => ({ ...prev, totalVaccines: array.length }));
      showToast(`Loaded ${array.length} vaccines`);
    } catch (err) { showToast(err.message, "error"); } finally { setVaccinesLoading(false); }
  };

  const isDemoAdmin = user?.email === 'demo.admin@vaxflow.com' || user?.isDemoAdmin;

  const handleAddVaccine = async (data) => {
    if (isDemoAdmin) {
      setShowAddModal(false);
      showToast("🔒 Demo Admin Mode: Data creation is disabled to protect live records.", "error");
      return;
    }
    setAddLoading(true);
    try {
      const added = await vaccineService.addVaccine(data, token);
      setVaccines(prev => [...prev, added]);
      setShowAddModal(false);
      setStats(prev => ({ ...prev, totalVaccines: prev.totalVaccines + 1 }));
      showToast("Vaccine added successfully! ✓");
    } catch (err) { showToast(err.message, "error"); } finally { setAddLoading(false); }
  };

  const handleEditSave = async (vaccine, form, inventory) => {
    if (isDemoAdmin) {
      setEditModal({ open: false, vaccine: null });
      showToast("🔒 Demo Admin Mode: Editing is disabled to protect live records.", "error");
      return;
    }
    setEditLoading(true);
    try {
      if (form.name !== vaccine.name) await vaccineService.updateVaccine(vaccine.id, { name: form.name }, token);
      if (inventory && (parseFloat(form.price) !== inventory.price || parseInt(form.quantity) !== inventory.quantity)) {
        await vaccineService.updateInventory(inventory.id, { ...inventory, price: parseFloat(form.price), quantity: parseInt(form.quantity) }, token);
      }
      setVaccines(prev => prev.map(v => v.id === vaccine.id ? { ...v, name: form.name, Inventories: v.Inventories?.map((inv, i) => i === 0 ? { ...inv, price: parseFloat(form.price), quantity: parseInt(form.quantity) } : inv) } : v));
      setEditModal({ open: false, vaccine: null });
      showToast("Vaccine updated successfully! ✓");
    } catch (err) { showToast(err.message, "error"); } finally { setEditLoading(false); }
  };

  const handleDeleteVaccine = (v) => {
    if (isDemoAdmin) {
      showToast("🔒 Demo Admin Mode: Delete action is disabled to protect live records.", "error");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Delete Vaccine",
      message: `Delete "${v.name}" from system inventory?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          await vaccineService.deleteVaccine(v.id, token);
          setVaccines(prev => prev.filter(x => x.id !== v.id));
          showToast("Vaccine deleted");
        } catch (err) { showToast(err.message, "error"); }
      }
    });
  };

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /></div>;

  const isAdmin = user?.email === ADMIN_EMAIL || user?.email === 'chiragbhalla03@gmail.com' || user?.email === 'demo.admin@vaxflow.com' || user?.isDemoAdmin;
  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-100">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-500 mb-6">Admin credentials required to view this portal.</p>
        <button onClick={() => window.location.href = "/"} className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-extrabold text-xs">Return Home</button>
      </div>
    </div>
  );

  const filteredVaccines = vaccines.filter(v => v.name?.toLowerCase().includes(vaccineSearch.toLowerCase()));
  const filteredBookings = bookings.filter(b => extractUserName(b.userData).toLowerCase().includes(bookingSearch.toLowerCase()) || extractVaccineName(b).toLowerCase().includes(bookingSearch.toLowerCase()));
  const { grouped: groupedBookings, sortedDateKeys } = groupBookingsByDate(filteredBookings);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-800">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))} />
      <EditVaccineModal isOpen={editModal.open} vaccine={editModal.vaccine} onClose={() => setEditModal({ open: false, vaccine: null })} onSave={handleEditSave} loading={editLoading} />
      <AddVaccineModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddVaccine} loading={addLoading} />

      {/* ===== CIVICPULSE SOLID EMERALD SIDEBAR ===== */}
      <aside className="w-64 bg-[#059669] text-white flex flex-col justify-between flex-shrink-0 p-4 shadow-xl z-20">
        
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 mb-6 px-2 pt-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <img src="/logo.png" alt="Bhalla Distributors Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-none">Bhalla Admin</h1>
              <p className="text-[10px] text-emerald-100/80 font-bold uppercase tracking-wider mt-1">Vaccine Control Center</p>
            </div>
          </div>

          {/* Big CTA Button (Matching CivicPulse "+ Report an Issue" green button) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-[#047857] hover:bg-[#065f46] text-white font-extrabold py-3.5 px-4 rounded-2xl mb-6 shadow-md flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Vaccine</span>
          </button>

          {/* Nav Items (Matching CivicPulse Active White Capsule Style) */}
          <nav className="space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "vaccines", label: "Vaccines Inventory", icon: Syringe, count: vaccines.length },
              { id: "bookings", label: "Customer Bookings", icon: Package, count: bookings.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-[#047857] shadow-md shadow-emerald-900/10"
                      : "text-emerald-50 hover:bg-emerald-600/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-emerald-800/80 text-emerald-100"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Badge (Matching CivicPulse user badge at bottom left) */}
        <div className="bg-[#047857]/90 rounded-2xl p-3 flex items-center justify-between border border-emerald-500/30">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl text-white font-extrabold flex items-center justify-center text-xs shadow-inner">
              C
            </div>
            <div className="truncate text-left">
              <p className="font-extrabold text-white text-xs truncate leading-none">chiragbhalla</p>
              <p className="text-[10px] text-emerald-200 font-bold mt-0.5">System Admin & Owner</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
            {activeTab === "dashboard" ? "Admin Dashboard Overview" : activeTab === "vaccines" ? "Vaccine Inventory Database" : "Customer Booking Logs"}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>English / Hindi</span>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              
              {/* 4 Stat Cards in a Row (Matching CivicPulse pastel stat cards Image 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vaccines</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalVaccines} <span className="text-xs font-normal text-emerald-600">+12/wk</span></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Dispatch</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.pendingBookings} <span className="text-xs font-normal text-amber-600">37% total</span></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalBookings} <span className="text-xs font-normal text-sky-600">100% verified</span></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Satisfaction</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">4.9⭐ <span className="text-xs font-normal text-purple-600">99% support</span></p>
                  </div>
                </div>

              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left 8 cols - Quick Inventory Table */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-slate-900">Recent Inventory Stocks</h3>
                    <button onClick={() => { setActiveTab("vaccines"); fetchVaccines(); }} className="text-xs font-bold text-emerald-600 hover:underline">View All Vaccines →</button>
                  </div>
                  {vaccines.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Click "Vaccines Inventory" on the left menu to load live inventory details.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {vaccines.slice(0, 5).map(v => {
                        const price = getVaccinePrice(v);
                        const qty = getVaccineQuantity(v);
                        return (
                          <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">💉</div>
                              <div>
                                <p className="font-bold text-slate-900">{v.name}</p>
                                <p className="text-[10px] text-slate-400">Age: {v.ageGroup || 'All ages'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">₹{price}</p>
                              <p className={`text-[10px] font-semibold ${qty > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>{qty} in stock</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right 4 cols - Quick Action Card */}
                <div className="lg:col-span-4 bg-emerald-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-300" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Bhalla Vaccine Pulse</h3>
                    <p className="text-xs text-emerald-200/90 leading-relaxed mb-6">
                      Sourced directly from authorized government labs. Ensure cold-chain safety for Prayagraj.
                    </p>
                  </div>
                  <button onClick={() => setShowAddModal(true)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all">
                    + Add Vaccine Entry
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* VACCINES TAB */}
          {activeTab === "vaccines" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Vaccine Inventory</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{vaccines.length} items registered</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search vaccine..." value={vaccineSearch} onChange={e => setVaccineSearch(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
                  </div>
                  <button onClick={fetchVaccines} className="p-2 border border-gray-200 rounded-xl hover:bg-slate-50 text-slate-600"><RefreshCw className={`w-4 h-4 ${vaccinesLoading ? 'animate-spin' : ''}`} /></button>
                </div>
              </div>

              {vaccinesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="bg-white h-40 rounded-3xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVaccines.map(v => {
                    const price = getVaccinePrice(v);
                    const qty = getVaccineQuantity(v);
                    const inv = v.Inventories?.[0];
                    return (
                      <div key={v.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{v.ageGroup || 'All ages'}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${qty > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {qty > 10 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-2xl">
                          <div><p className="text-[9px] font-bold text-slate-400">PRICE</p><p className="font-black text-slate-900">₹{price}</p></div>
                          <div><p className="text-[9px] font-bold text-slate-400">QTY</p><p className="font-black text-slate-900">{qty}</p></div>
                          <div><p className="text-[9px] font-bold text-slate-400">BATCH</p><p className="font-black text-slate-900 truncate">{inv?.batchNumber || 'N/A'}</p></div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button onClick={() => setEditModal({ open: true, vaccine: v })} className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1">
                            <Edit2 className="w-3.5 h-3.5" /><span>Edit</span>
                          </button>
                          <button onClick={() => handleDeleteVaccine(v)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-1">
                            <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900">All Customer Bookings ({bookings.length})</h3>
                <button onClick={fetchBookings} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center space-x-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-white h-24 rounded-3xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                          📦
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{extractUserName(b.userData)}</p>
                          <p className="text-slate-400">Order #{b.id} • {extractVaccineName(b)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm">₹{b.totalCost || '0'}</p>
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          {b.status || 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
