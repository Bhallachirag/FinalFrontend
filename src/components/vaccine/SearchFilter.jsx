import React, { useState } from "react";
import { Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

const SearchFilter = ({ onSearch, onFilter, children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({ priceRange: "", availability: "", sortBy: "" });
  const [openSections, setOpenSections] = useState({ priceRange: true, availability: true, sortBy: true });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => { setSearchTerm(""); onSearch(""); };

  const handleFilter = (type, value) => {
    const newVal = activeFilters[type] === value ? "" : value;
    const updated = { ...activeFilters, [type]: newVal };
    setActiveFilters(updated);
    onFilter(type, newVal);
  };

  const clearAll = () => {
    setActiveFilters({ priceRange: "", availability: "", sortBy: "" });
    ["priceRange", "availability", "sortBy"].forEach(t => onFilter(t, ""));
  };

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  const priceOptions = [
    { value: "0-1000", label: "Under ₹1,000" },
    { value: "1000-3000", label: "₹1,000 – ₹3,000" },
    { value: "3000-5000", label: "₹3,000 – ₹5,000" },
    { value: "5000+", label: "Above ₹5,000" },
  ];
  const availOptions = [
    { value: "inStock", label: "In Stock" },
    { value: "lowStock", label: "Low Stock" },
  ];
  const sortOptions = [
    { value: "priceLowToHigh", label: "Price: Low to High" },
    { value: "priceHighToLow", label: "Price: High to Low" },
    { value: "nameAZ", label: "Name: A – Z" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">

      {/* LEFT: Amazon-style Filter Sidebar */}
      <div className="w-full lg:w-60 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Filter Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">Filters</span>
              {activeCount > 0 && (
                <span className="text-xs font-bold bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {/* Price Range Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("priceRange")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span>Price Range</span>
              {openSections.priceRange ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.priceRange && (
              <div className="px-4 pb-3 space-y-2.5">
                {priceOptions.map(opt => (
                  <label key={opt.value} className="flex items-center space-x-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={activeFilters.priceRange === opt.value}
                      onChange={() => handleFilter("priceRange", opt.value)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <span className={"text-sm transition-colors " + (activeFilters.priceRange === opt.value ? "text-emerald-700 font-semibold" : "text-slate-600 group-hover:text-slate-900")}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("availability")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span>Availability</span>
              {openSections.availability ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.availability && (
              <div className="px-4 pb-3 space-y-2.5">
                {availOptions.map(opt => (
                  <label key={opt.value} className="flex items-center space-x-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeFilters.availability === opt.value}
                      onChange={() => handleFilter("availability", opt.value)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <span className={"text-sm transition-colors " + (activeFilters.availability === opt.value ? "text-emerald-700 font-semibold" : "text-slate-600 group-hover:text-slate-900")}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Section */}
          <div>
            <button
              onClick={() => toggleSection("sortBy")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span>Sort By</span>
              {openSections.sortBy ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.sortBy && (
              <div className="px-4 pb-3 space-y-2.5">
                {sortOptions.map(opt => (
                  <label key={opt.value} className="flex items-center space-x-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={activeFilters.sortBy === opt.value}
                      onChange={() => handleFilter("sortBy", opt.value)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <span className={"text-sm transition-colors " + (activeFilters.sortBy === opt.value ? "text-emerald-700 font-semibold" : "text-slate-600 group-hover:text-slate-900")}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT: Search Bar + Active Filter Chips */}
      <div className="flex-1 flex flex-col gap-3">

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="text"
            placeholder="Search vaccines by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm shadow-sm transition-all"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Filter Pills */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-medium">Active filters:</span>
            {activeFilters.priceRange && (
              <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                {priceOptions.find(o => o.value === activeFilters.priceRange)?.label}
                <button onClick={() => handleFilter("priceRange", activeFilters.priceRange)} className="hover:text-red-500 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeFilters.availability && (
              <span className="flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                {availOptions.find(o => o.value === activeFilters.availability)?.label}
                <button onClick={() => handleFilter("availability", activeFilters.availability)} className="hover:text-red-500 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeFilters.sortBy && (
              <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                {sortOptions.find(o => o.value === activeFilters.sortBy)?.label}
                <button onClick={() => handleFilter("sortBy", activeFilters.sortBy)} className="hover:text-red-500 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAll} className="text-xs text-red-500 font-semibold hover:underline transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* Vaccine List Children */}
        <div className="w-full">
          {children}
        </div>

      </div>

    </div>
  );
};

export default SearchFilter;
