import React, { useEffect, useState, useContext } from "react";
import { Users, Package, Calendar, Eye, AlertTriangle, Edit2, Trash2, Plus, X} from "lucide-react";
import { AuthContext } from "../stores/authStore.js";
import { DEFAULT_STATS, ADMIN_EMAIL } from "../utils/constants.js";
import { getVaccinePrice, getVaccineQuantity, getInventoryDetails, extractUserName, extractVaccineName, extractDateTimeFromCreatedAt,
     groupBookingsByDate } from "../utils/helpers.js";
import vaccineService from "../services/vaccineService.js";
import bookingService from "../services/bookingService.js";
import authService from "../services/authService.js";

export default function AdminPage() {
  const {
    user,
    token,
    loading: authLoading,
  } = useContext(AuthContext) || {
    user: { email: ADMIN_EMAIL },
    token: "mock-token",
    loading: false,
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalVaccines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [vaccinesError, setVaccinesError] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [addVaccineLoading, setAddVaccineLoading] = useState(false);

  // Load stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(DEFAULT_STATS);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchUserData = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const userData = await authService.fetchUserData(userId, token);
      setUserCache((prev) => ({
        ...prev,
        [userId]: userData,
      }));

      return userData;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);

    try {
      const bookingsArray = await bookingService.fetchAllBookings(token);
      const filteredBookings = bookingsArray.filter(
        (booking) => booking.id % 2 !== 0
      );
      const bookingsWithUsers = await Promise.all(
        filteredBookings.map(async (booking) => {
          const userId = booking.userId || booking.userid;
          if (userId) {
            const userData = await fetchUserData(userId);
            return {
              ...booking,
              userData: userData,
            };
          }
          return booking;
        })
      );

      setBookings(bookingsWithUsers);
      console.log("Fetched bookings with user data:", bookingsWithUsers);
    } catch (err) {
      setBookingsError(err.message);
      console.error("Error fetching bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchVaccines = async () => {
    setVaccinesLoading(true);
    setVaccinesError(null);

    try {
      const data = await vaccineService.fetchVaccines();
      const vaccinesArray = data.data || [];

      setVaccines(vaccinesArray);
      console.log("Fetched vaccines:", vaccinesArray);
    } catch (err) {
      setVaccinesError(err.message);
      console.error("Error fetching vaccines:", err);
    } finally {
      setVaccinesLoading(false);
    }
  };

  const addVaccine = async (vaccineData) => {
    setAddVaccineLoading(true);

    try {
      const vaccineWithInventory = await vaccineService.addVaccine(
        vaccineData,
        token
      );

      setVaccines((prev) => [...prev, vaccineWithInventory]);
      setShowAddVaccineModal(false);

      setStats((prev) => ({
        ...prev,
        totalVaccines: prev.totalVaccines + 1,
      }));

      console.log("Vaccine and inventory created successfully");
    } catch (err) {
      alert(`Error adding vaccine: ${err.message}`);
      console.error("Error adding vaccine:", err);
    } finally {
      setAddVaccineLoading(false);
    }
  };

  const deleteVaccine = async (vaccineId) => {
    if (!confirm("Are you sure you want to delete this vaccine?")) return;

    try {
      await vaccineService.deleteVaccine(vaccineId, token);
      setVaccines((prev) => prev.filter((vaccine) => vaccine.id !== vaccineId));
      console.log("Vaccine deleted successfully");
    } catch (err) {
      alert(`Error deleting vaccine: ${err.message}`);
      console.error("Error deleting vaccine:", err);
    }
  };

  const updateVaccine = async (vaccineId, updatedData) => {
    try {
      await vaccineService.updateVaccine(vaccineId, updatedData, token);
      
      setVaccines((prev) =>
        prev.map((vaccine) => {
          if (vaccine.id === vaccineId) {
            const updatedVaccine = { ...vaccine, ...updatedData };

            // If price was updated and we have inventory, update the first inventory's price
            if (
              updatedData.price &&
              vaccine.Inventories &&
              vaccine.Inventories.length > 0
            ) {
              updatedVaccine.Inventories = vaccine.Inventories.map(
                (inv, index) =>
                  index === 0 ? { ...inv, price: updatedData.price } : inv
              );
            }

            return updatedVaccine;
          }
          return vaccine;
        })
      );

      console.log("Vaccine updated successfully");
    } catch (err) {
      alert(`Error updating vaccine: ${err.message}`);
      console.error("Error updating vaccine:", err);
    }
  };

  // Updated function to handle inventory updates separately
  const updateInventory = async (inventoryId, updatedData) => {
    try {
      await vaccineService.updateInventory(inventoryId, updatedData, token);

      // Update the specific inventory in state
      setVaccines((prev) =>
        prev.map((vaccine) => {
          if (vaccine.Inventories) {
            return {
              ...vaccine,
              Inventories: vaccine.Inventories.map((inv) =>
                inv.id === inventoryId ? { ...inv, ...updatedData } : inv
              ),
            };
          }
          return vaccine;
        })
      );

      console.log("Inventory updated successfully");
    } catch (err) {
      alert(`Error updating inventory: ${err.message}`);
      console.error("Error updating inventory:", err);
    }
  };

  const handleQuickUpdate = (vaccine) => {
    const currentName = vaccine.name || "";
    const currentPrice = getVaccinePrice(vaccine);
    const inventory = getInventoryDetails(vaccine);

    const newName = prompt("Enter new vaccine name:", currentName);
    const newPrice = prompt("Enter new price:", currentPrice);
    const newQuantity = inventory
      ? prompt("Enter new quantity:", inventory.quantity)
      : null;

    if (newName !== null || newPrice !== null || newQuantity !== null) {
      // Update vaccine name if changed
      if (newName !== null && newName !== currentName) {
        updateVaccine(vaccine.id, { name: newName });
      }

      // Update inventory price and quantity if changed and inventory exists
      if (inventory && (newPrice !== null || newQuantity !== null)) {
        const inventoryUpdates = {};

        if (newPrice !== null && parseFloat(newPrice) !== currentPrice) {
          inventoryUpdates.price = parseFloat(newPrice) || currentPrice;
        }

        if (
          newQuantity !== null &&
          parseInt(newQuantity) !== inventory.quantity
        ) {
          inventoryUpdates.quantity =
            parseInt(newQuantity) || inventory.quantity;
        }

        // Include all required fields for the PUT request
        if (Object.keys(inventoryUpdates).length > 0) {
          const fullInventoryData = {
            ...inventory,
            ...inventoryUpdates,
          };
          updateInventory(inventory.id, fullInventoryData);
        }
      }

      // If no inventory exists but price was provided, try to update via vaccine endpoint
      if (
        !inventory &&
        newPrice !== null &&
        parseFloat(newPrice) !== currentPrice
      ) {
        updateVaccine(vaccine.id, { price: parseFloat(newPrice) });
      }
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800 font-medium">Not Logged In</p>
          <p className="text-yellow-600 text-sm">
            Please log in to access the admin panel.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-medium">Access Denied</p>
          <p className="text-red-600 text-sm">
            You don't have admin privileges.
          </p>
          <p className="text-red-500 text-xs mt-1">
            Current user: {user?.email}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group bookings by date for display
  const { grouped: groupedBookings, sortedDateKeys } =
    groupBookingsByDate(bookings);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Welcome back, Admin! Manage your vaccine booking system.
        </p>
        <p className="text-sm text-gray-500 mt-1">Logged in as: {user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingBookings}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Vaccines
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalVaccines}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Management
          </h3>
          <p className="text-gray-600 mb-4">
            Manage user accounts and permissions
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            View All Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Management
          </h3>
          <p className="text-gray-600 mb-4">
            View and manage all vaccine bookings
          </p>
          <button
            onClick={fetchBookings}
            disabled={bookingsLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {bookingsLoading ? "Loading..." : "View All Bookings"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Vaccine Management
              </h3>
              <p className="text-gray-600">
                View all available vaccines and inventory
              </p>
            </div>
            <button
              onClick={() => setShowAddVaccineModal(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Vaccine
            </button>
          </div>
          <button
            onClick={fetchVaccines}
            disabled={vaccinesLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {vaccinesLoading ? "Loading..." : "View Vaccines"}
          </button>
        </div>
      </div>

      {/* Add Vaccine Modal */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Vaccine
                </h3>
                <button
                  onClick={() => setShowAddVaccineModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={addVaccineLoading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const vaccineData = {
                    name: formData.get("name"),
                    ageGroup: formData.get("ageGroup"),
                    description: formData.get("description"),
                    quantity: formData.get("quantity"),
                    price: formData.get("price"),
                    batchNumber: formData.get("batchNumber"),
                    expiryDate: formData.get("expiryDate"),
                    manufacturedDate: formData.get("manufacturedDate"),
                    manufacturer: formData.get("manufacturer"),
                    imageUrl: formData.get("imageUrl"),
                  };
                  addVaccine(vaccineData);
                }}
              >
                <div className="space-y-6">
                  {/* Vaccine Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Vaccine Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vaccine Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., COVID-19 Vaccine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age Group *
                        </label>
                        <select
                          name="ageGroup"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Age Group</option>
                          <option value="0-2 years">0-2 years</option>
                          <option value="2-5 years">2-5 years</option>
                          <option value="5-12 years">5-12 years</option>
                          <option value="12-18 years">12-18 years</option>
                          <option value="18+ years">18+ years</option>
                          <option value="All ages">All ages</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of the vaccine..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Inventory Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Inventory Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          required
                          min="0"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          required
                          min="0"
                          step="0.01"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 500.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch Number *
                        </label>
                        <input
                          type="text"
                          name="batchNumber"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., BT2024001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          name="manufacturer"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Pfizer Inc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manufactured Date *
                        </label>
                        <input
                          type="date"
                          name="manufacturedDate"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="date"
                          name="expiryDate"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL*
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddVaccineModal(false)}
                    disabled={addVaccineLoading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addVaccineLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addVaccineLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Vaccine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Error Display */}
      {bookingsError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Error fetching bookings</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{bookingsError}</p>
        </div>
      )}

      {/* Vaccines Error Display */}
      {vaccinesError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Error fetching vaccines</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{vaccinesError}</p>
        </div>
      )}

      {/* Vaccines Display */}
      {vaccines.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Vaccines ({vaccines.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Complete vaccine inventory
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaccines.map((vaccine, index) => (
                  <div
                    key={vaccine.id || index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {vaccine.name || "Unknown Vaccine"}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">ID:</span>{" "}
                        {vaccine.id || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ₹
                        {getVaccinePrice(vaccine)}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        {getVaccineQuantity(vaccine)}
                      </div>
                      <div>
                        <span className="font-medium">Age Group:</span>{" "}
                        {vaccine.ageGroup || "N/A"}
                      </div>
                      {vaccine.Inventories &&
                        vaccine.Inventories.length > 0 && (
                          <>
                            <div>
                              <span className="font-medium">Batch:</span>{" "}
                              {vaccine.Inventories[0].batchNumber || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Expiry:</span>{" "}
                              {vaccine.Inventories[0].expiryDate
                                ? new Date(
                                    vaccine.Inventories[0].expiryDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleQuickUpdate(vaccine)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Update
                      </button>
                      <button
                        onClick={() => deleteVaccine(vaccine.id)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-800">
                        View Full Data
                      </summary>
                      <div className="mt-2 text-xs text-gray-600 bg-white p-3 rounded">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(vaccine, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Display - Grouped by Date - Extended Height */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Bookings ({bookings.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Grouped by date, latest first
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-[80vh] overflow-y-auto">
              {sortedDateKeys.map((dateKey) => (
                <div key={dateKey} className="mb-6 last:mb-0">
                  {/* Date Header */}
                  <div className="sticky top-0 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 z-10">
                    <h4 className="font-medium text-gray-900 text-center">
                      {dateKey}
                    </h4>
                    <p className="text-sm text-gray-500 text-center">
                      {groupedBookings[dateKey]?.length || 0} booking
                      {(groupedBookings[dateKey]?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Bookings for this date */}
                  <div className="space-y-3 ml-4">
                    {(groupedBookings[dateKey] || []).map((booking, index) => {
                      const { date, time } = extractDateTimeFromCreatedAt(
                        booking.createdAt
                      );
                      const vaccineName = extractVaccineName(booking);
                      const userName = extractUserName(booking.userData);

                      return (
                        <div
                          key={booking.id || index}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                ID:
                              </span>
                              <span className="ml-2 text-gray-600">
                                {booking.id || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                User:
                              </span>
                              <span className="ml-2 text-gray-600 font-medium">
                                {userName}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Time:
                              </span>
                              <span className="ml-2 text-gray-600">{time}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Vaccine:
                              </span>
                              <span className="ml-2 text-gray-600">
                                {vaccineName}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Cost:
                              </span>
                              <span className="ml-2 text-gray-600">
                                ₹{booking.totalCost || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Status:
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "InProcess"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "Booked"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.status || "N/A"}
                              </span>
                            </div>
                          </div>
                          {/* Show full booking data in collapsed format */}
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                              View Full Data
                            </summary>
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                              <div className="mb-2 text-blue-600 font-medium">
                                Available Fields:
                              </div>
                              <div className="mb-2">
                                {Object.keys(booking).map((key) => (
                                  <span
                                    key={key}
                                    className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                                  >
                                    {key}: {typeof booking[key]}{" "}
                                    {booking[key] &&
                                    booking[key].toString().length > 50
                                      ? "(long)"
                                      : `(${booking[key]})`}
                                  </span>
                                ))}
                              </div>
                              <pre className="overflow-x-auto">
                                {JSON.stringify(booking, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
