import React, { useState } from "react";
import {
  Heart, Syringe, ShoppingBag, Star, Check, Sparkles,
  Droplet, Dna, Zap, HeartPulse, ShieldCheck, Thermometer, Activity, Shield
} from "lucide-react";

// Helper to determine specific category icon & gradient theme for each vaccine
const getVaccineTheme = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("fluarix") || lower.includes("influvac") || lower.includes("fluquadri") || lower.includes("vaxiflu")) {
    return {
      Icon: Droplet,
      gradient: "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
      accent: "text-cyan-400",
      circleBg: "bg-cyan-500/20 border-cyan-400/30",
      tag: "INFLUENZA CARE",
      glow: "shadow-cyan-500/20"
    };
  }
  if (lower.includes("gardasil") || lower.includes("cervavac")) {
    return {
      Icon: Dna,
      gradient: "from-[#0f172a] via-[#2e1065] to-[#0f172a]",
      accent: "text-fuchsia-400",
      circleBg: "bg-fuchsia-500/20 border-fuchsia-400/30",
      tag: "HPV & CANCER PREVENTIVE",
      glow: "shadow-fuchsia-500/20"
    };
  }
  if (lower.includes("shingrix")) {
    return {
      Icon: Zap,
      gradient: "from-[#0f172a] via-[#451a03] to-[#0f172a]",
      accent: "text-amber-400",
      circleBg: "bg-amber-500/20 border-amber-400/30",
      tag: "SHINGLES IMMUNIZATION",
      glow: "shadow-amber-500/20"
    };
  }
  if (lower.includes("prevenar") || lower.includes("pneumovax")) {
    return {
      Icon: HeartPulse,
      gradient: "from-[#0f172a] via-[#064e3b] to-[#0f172a]",
      accent: "text-emerald-400",
      circleBg: "bg-emerald-500/20 border-emerald-400/30",
      tag: "PNEUMOCOCCAL PROTECTION",
      glow: "shadow-emerald-500/20"
    };
  }
  if (lower.includes("cv-19") || lower.includes("covid")) {
    return {
      Icon: ShieldCheck,
      gradient: "from-[#0f172a] via-[#4c0519] to-[#0f172a]",
      accent: "text-rose-400",
      circleBg: "bg-rose-500/20 border-rose-400/30",
      tag: "COVID-19 IMMUNITY",
      glow: "shadow-rose-500/20"
    };
  }
  return {
    Icon: Syringe,
    gradient: "from-[#0f172a] via-[#064e3b] to-[#0f172a]",
    accent: "text-emerald-400",
    circleBg: "bg-emerald-500/20 border-emerald-400/30",
    tag: "SPECIALIZED VACCINE",
    glow: "shadow-emerald-500/20"
  };
};

const VaccineCard = ({ vaccine, inventory, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercentage = vaccine.mrp > inventory.price
    ? Math.round(((vaccine.mrp - inventory.price) / vaccine.mrp) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(vaccine, inventory);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const theme = getVaccineTheme(vaccine.name);
  const { Icon } = theme;

  const stockStatus = inventory.quantity > 10
    ? { label: "In Stock", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" }
    : inventory.quantity > 0
    ? { label: "Low Stock", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" }
    : { label: "Out of Stock", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" };

  return (
    <div className="relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col justify-between">

      {/* LitLens Style Premium Header Banner */}
      <div>
        <div className={`relative bg-gradient-to-b ${theme.gradient} text-white p-6 flex flex-col items-center justify-between min-h-[220px] select-none overflow-hidden`}>
          
          {/* Top Bar: Category Tag & Sparkle Icon */}
          <div className="w-full flex items-center justify-between text-[10px] font-black tracking-widest text-slate-300 uppercase z-10">
            <span>{theme.tag}</span>
            <Sparkles className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold z-10 shadow-md">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-3 right-3 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-full hover:bg-slate-800 transition-all z-20"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-rose-500 fill-current scale-110" : "text-slate-300"}`} />
          </button>

          {/* Center Circular Glass Icon Container */}
          <div className="my-4 relative flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full ${theme.circleBg} border backdrop-blur-md flex items-center justify-center shadow-lg ${theme.glow} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-8 h-8 ${theme.accent}`} />
            </div>
          </div>

          {/* Vaccine Name right below Icon */}
          <div className="w-full text-center z-10 px-2">
            <h3 className="text-sm font-black text-white leading-tight tracking-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
              {vaccine.name}
            </h3>
          </div>

          {/* LitLens Style Divider Line */}
          <div className="w-full border-t border-slate-700/60 my-2" />

          {/* Subtitle Details below divider line */}
          <div className="w-full flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>Batch: {inventory.batchNumber || 'BTH001'}</span>
            <span className={theme.accent}>Verified</span>
          </div>

        </div>

        {/* Details Content Area */}
        <div className="p-5 space-y-3 bg-white">
          
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
            ))}
            <span className="text-[10px] font-bold text-slate-400 ml-1">(4.9)</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              ₹{inventory.price.toLocaleString('en-IN')}
            </span>
            {vaccine.mrp > inventory.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{vaccine.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${stockStatus.bg} ${stockStatus.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
            <span>{stockStatus.label} ({inventory.quantity} doses)</span>
          </div>

        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0 bg-white">
        <button
          onClick={handleAddToCart}
          disabled={inventory.quantity === 0}
          className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
            inventory.quantity === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              : added
              ? "bg-emerald-800 text-white shadow-emerald-900/20"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Added to Booking Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{inventory.quantity === 0 ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default VaccineCard;