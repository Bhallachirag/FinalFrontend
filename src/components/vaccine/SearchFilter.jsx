import React, { useState } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";

const SearchFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ priceRange: "", availability: "", sortBy: "" });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleFilter = (type, value) => {
    const newFilters = { ...activeFilters, [type]: value };
    setActiveFilters(newFilters);
    onFilter(type, value);
  };

  const clearFilter = (type) => {
    const newFilters = { ...activeFilters, [type]: "" };
    setActiveFilters(newFilters);
    onFilter(type, "");
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const priceOptions = [
    { value: "", label: "All Prices" },
    { value: "0-1000", label: "Under ₹1,000" },
    { value: "1000-3000", label: "₹1,000 – ₹3,000" },
    { value: "3000-5000", label: "₹3,000 – ₹5,000" },
    { value: "5000+", label: "Above ₹5,000" },
  ];
  const availOptions = [
    { value: "", label: "All" },
    { value: "inStock", label: "In Stock" },
    { value: "lowStock", label: "Low Stock" },
  ];
  const sortOptions = [
    { value: "", label: "Default" },
    { value: "priceLowToHigh", label: "Price: Low to High" },
    { value: "priceHighToLow", label: "Price: High to Low" },
    { value: "nameAZ", label: "Name: A–Z" },
  ];

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search vaccines by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm shadow-sm transition-all duration-200"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-5 py-3.5 rounded-2xl border font-medium text-sm transition-all duration-200 shadow-sm ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {activeFilters.priceRange && (
            <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
              <span>Price: {priceOptions.find(o => o.value === activeFilters.priceRange)?.label}</span>
              <button onClick={() => clearFilter("priceRange")} className="hover:text-blue-900 ml-1"><X className="w-3 h-3" /></button>
            </div>
          )}
          {activeFilters.availability && (
            <div className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
              <span>{availOptions.find(o => o.value === activeFilters.availability)?.label}</span>
              <button onClick={() => clearFilter("availability")} className="hover:text-emerald-900 ml-1"><X className="w-3 h-3" /></button>
            </div>
          )}
          {activeFilters.sortBy && (
            <div className="flex items-center space-x-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs px-3 py-1.5 rounded-full font-medium">
              <span>{sortOptions.find(o => o.value === activeFilters.sortBy)?.label}</span>
              <button onClick={() => clearFilter("sortBy")} className="hover:text-purple-900 ml-1"><X className="w-3 h-3" /></button>
            </div>
          )}
          <button
            onClick={() => { setActiveFilters({ priceRange: "", availability: "", sortBy: "" }); ["priceRange","availability","sortBy"].forEach(t => onFilter(t, "")); }}
            className="text-xs text-gray-500 hover:text-red-500 underline transition-colors px-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-lg shadow-gray-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range</label>
              <div className="space-y-1.5">
                {priceOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilter("priceRange", opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeFilters.priceRange === opt.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Availability</label>
              <div className="space-y-1.5">
                {availOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilter("availability", opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeFilters.availability === opt.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
              <div className="space-y-1.5">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilter("sortBy", opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeFilters.sortBy === opt.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;