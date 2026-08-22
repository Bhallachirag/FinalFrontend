import React, { useState } from "react";
import { Heart, Syringe, ShoppingBag, Star, Check } from "lucide-react";

const VaccineCard = ({ vaccine, inventory, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercentage = vaccine.mrp > inventory.price
    ? Math.round(((vaccine.mrp - inventory.price) / vaccine.mrp) * 100)
    : 0;
  const savings = vaccine.mrp - inventory.price;

  const handleAddToCart = () => {
    onAddToCart(vaccine, inventory);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const stockStatus = inventory.quantity > 10
    ? { label: "In Stock", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" }
    : inventory.quantity > 0
    ? { label: "Low Stock", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" }
    : { label: "Out of Stock", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" };

  return (
    <div className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col justify-between">

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3.5 left-3.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold z-10 shadow-md">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all z-10 shadow-sm"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-current scale-110" : "text-gray-400"}`} />
      </button>

      {/* Image Area */}
      <div>
        <div className="relative h-44 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-100 flex items-center justify-center overflow-hidden">
          {vaccine.imageUrl ? (
            <img
              src={vaccine.imageUrl}
              alt={vaccine.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <Syringe className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          
          <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-1">
            {vaccine.name}
          </h3>

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
            <span>{stockStatus.label}</span>
          </div>

        </div>
      </div>

      {/* Button */}
      <div className="p-5 pt-0">
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