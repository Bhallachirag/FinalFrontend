import React, { useState } from "react";
import { Heart, ShoppingBag, Star, Check, ShieldCheck, Sparkles, Package, Shield } from "lucide-react";

// Theme styling for the pharmaceutical vaccine box packaging
const getVaccineBoxTheme = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("fluarix") || lower.includes("influvac") || lower.includes("fluquadri") || lower.includes("vaxiflu")) {
    return {
      gradient: "from-sky-600 via-sky-700 to-indigo-800",
      badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
      accentText: "text-sky-700",
      border: "border-sky-200",
      category: "INFLUENZA VACCINE IP",
      specs: "0.5ml Pre-filled Syringe",
      brandTag: "GSK / ABBOTT"
    };
  }
  if (lower.includes("gardasil") || lower.includes("cervavac")) {
    return {
      gradient: "from-purple-600 via-purple-700 to-fuchsia-800",
      badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
      accentText: "text-purple-700",
      border: "border-purple-200",
      category: "HPV VACCINE (RECOMBINANT)",
      specs: "0.5ml Single Dose Vial",
      brandTag: "MSD / SERUM INST"
    };
  }
  if (lower.includes("shingrix")) {
    return {
      gradient: "from-amber-600 via-amber-700 to-orange-800",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      accentText: "text-amber-700",
      border: "border-amber-200",
      category: "HERPES ZOSTER VACCINE",
      specs: "2-Vial Antigen + Adjuvant",
      brandTag: "GLAXOSMITHKLINE"
    };
  }
  if (lower.includes("prevenar") || lower.includes("pneumovax")) {
    return {
      gradient: "from-emerald-600 via-emerald-700 to-teal-800",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentText: "text-emerald-700",
      border: "border-emerald-200",
      category: "PNEUMOCOCCAL VACCINE",
      specs: "0.5ml Suspension Syringe",
      brandTag: "PFIZER / MSD"
    };
  }
  if (lower.includes("cv-19") || lower.includes("covid")) {
    return {
      gradient: "from-rose-600 via-rose-700 to-red-800",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      accentText: "text-rose-700",
      border: "border-rose-200",
      category: "COVID-19 IMMUNIZATION",
      specs: "Single Dose Injection",
      brandTag: "BIOLOGICAL E"
    };
  }
  return {
    gradient: "from-teal-600 via-teal-700 to-emerald-800",
    badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
    accentText: "text-teal-700",
    border: "border-teal-200",
    category: "SPECIALIZED VACCINE IP",
    specs: "0.5ml Pre-filled Syringe",
    brandTag: "HEALTHCARE IP"
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

  const theme = getVaccineBoxTheme(vaccine.name);

  const stockStatus = inventory.quantity > 10
    ? { label: "In Stock", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" }
    : inventory.quantity > 0
    ? { label: "Low Stock", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" }
    : { label: "Out of Stock", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" };

  return (
    <div className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200/80 flex flex-col justify-between">

      {/* Clean White Outer Area around the Inner Vaccine Box */}
      <div className="p-3.5 bg-white">
        
        {/* Realistic Vaccine Medicine Packaging Box (Dabba Look) */}
        <div className={`relative bg-gradient-to-b from-slate-50 via-white to-slate-50 rounded-2xl border-2 ${theme.border} shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 select-none`}>
          
          {/* Top Box Pharma Header Stripe */}
          <div className={`bg-gradient-to-r ${theme.gradient} text-white px-3.5 py-2 flex items-center justify-between shadow-sm`}>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] font-black tracking-widest uppercase">{theme.category}</span>
            </div>
            <span className="text-[8px] font-mono font-bold opacity-90 px-1.5 py-0.5 bg-white/20 rounded">Rx</span>
          </div>

          {/* Center Box Content - Vaccine Name on top of Medicine Box */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 text-center space-y-2">
            
            {/* Medicine Box Sub-tag */}
            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[9px] font-black tracking-wide ${theme.badgeBg}`}>
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>COLD CHAIN 2°C - 8°C</span>
            </div>

            {/* Vaccine Name printed on top of the packaging box */}
            <h3 className="text-base font-black text-slate-900 leading-snug tracking-tight px-1 line-clamp-2">
              {vaccine.name}
            </h3>

            {/* Dose / Spec Details */}
            <p className="text-[10px] font-semibold text-slate-400">
              {theme.specs}
            </p>

          </div>

          {/* Bottom Box Footer Stripe (Batch & Authenticity) */}
          <div className="bg-slate-100/90 border-t border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="font-bold">BATCH: {inventory.batchNumber || 'BTH001'}</span>
            <span className={`font-black uppercase ${theme.accentText}`}>VERIFIED VACCINE</span>
          </div>

        </div>

        {/* Content & Pricing Details below the Box */}
        <div className="mt-4 px-1 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
              ))}
              <span className="text-[10px] font-bold text-slate-400 ml-1">(4.9)</span>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stockStatus.bg} ${stockStatus.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
              <span>{stockStatus.label}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">
              ₹{inventory.price.toLocaleString('en-IN')}
            </span>
            {vaccine.mrp > inventory.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{vaccine.mrp.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Add to Cart Button */}
      <div className="p-3.5 pt-0 bg-white">
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