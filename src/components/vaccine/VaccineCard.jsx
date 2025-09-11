import React, { useState } from "react";
import { Heart, Syringe } from "lucide-react";

const VaccineCard = ({ vaccine, inventory, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage = Math.round(
    ((vaccine.mrp - inventory.price) / vaccine.mrp) * 100
  );
  const savings = vaccine.mrp - inventory.price;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {discountPercentage > 0 && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {discountPercentage}% Off
        </div>
      )}

      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
      >
        <Heart
          className={`w-5 h-5 ${
            isWishlisted ? "text-red-500 fill-current" : "text-gray-600"
          }`}
        />
      </button>

      <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center overflow-hidden">
        {vaccine.imageUrl ? (
          <img
            src={vaccine.imageUrl}
            alt={vaccine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br bg-green-400 rounded-2xl flex items-center justify-center">
            <Syringe className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {vaccine.name}
        </h3>

        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{inventory.price}
          </span>
          {vaccine.mrp > inventory.price && (
            <>
              <span className="text-lg text-gray-500 line-through">
                ₹{vaccine.mrp}
              </span>
              <span className="text-green-600 font-semibold">
                Save ₹{savings}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                inventory.quantity > 10
                  ? "bg-green-500"
                  : inventory.quantity > 0
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                inventory.quantity > 10
                  ? "text-green-600"
                  : inventory.quantity > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {inventory.quantity > 10
                ? "In Stock"
                : inventory.quantity > 0
                ? "Low Stock"
                : "Out of Stock"}
            </span>
          </div>
          {/* <span className="text-sm text-gray-500">
            {inventory.quantity} available
          </span> */}
        </div>

        <button
          onClick={() => onAddToCart(vaccine, inventory)}
          disabled={inventory.quantity === 0}
          className="w-full bg-gradient-to-r bg-blue-500 text-white py-3 rounded-xl font-semibold hover:from-stone-800 hover:to-stone-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default VaccineCard;