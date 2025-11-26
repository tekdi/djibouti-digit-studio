import React from "react";
import { LuX } from "react-icons/lu";

const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      className={`p-4 rounded-lg ${
        toast.isError
          ? "bg-red-50 border border-red-200 text-red-700"
          : "bg-green-50 border border-green-200 text-green-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{toast.label}</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;

