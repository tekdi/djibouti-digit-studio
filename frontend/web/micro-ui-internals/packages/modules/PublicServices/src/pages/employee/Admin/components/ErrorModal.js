import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LuCircleAlert, LuX } from "react-icons/lu";

const ErrorModal = ({ message, onClose, autoClose = false, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
        <div className="p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#22a4d9]/20 rounded-full animate-pulse" />
              <div className="relative bg-[#22a4d9] rounded-full p-3">
                <LuCircleAlert className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Erreur</h3>
          <p className="text-gray-600 text-center">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LuX className="w-5 h-5" />
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ErrorModal;

