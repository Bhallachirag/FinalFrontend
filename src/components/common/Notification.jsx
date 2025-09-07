import React from "react";
import { Check, AlertTriangle, X } from "lucide-react";

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const { message, type } = notification;

  return (
    <div
      className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === "error"
          ? "bg-red-500 text-white"
          : "bg-green-500 text-white"
      }`}
    >
      <div className="flex items-center space-x-2">
        {type === "error" ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Check className="w-5 h-5" />
        )}
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;