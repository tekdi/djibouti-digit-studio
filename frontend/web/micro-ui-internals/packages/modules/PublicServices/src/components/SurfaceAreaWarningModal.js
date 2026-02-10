import React from "react";
import { LuTriangleAlert, LuBuilding2, LuPhone, LuX, LuInfo } from "react-icons/lu";

/**
 * Modal for BPA_PCO_SIMPLE surface area warning
 * Shown when coveredProjectArea exceeds 200m²
 */
const SurfaceAreaWarningModal = ({ isOpen, onClose, coveredArea }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full animate-scaleIn overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <LuX className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header with Warning Icon */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 pt-8 pb-12">
          <div className="flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <LuTriangleAlert className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Surface totale bâtie dépassée
            </h2>
            
            {/* Current Value Badge */}
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                <LuInfo className="w-4 h-4" />
                Votre surface : {coveredArea} m² (max. 200 m²)
              </span>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 text-center leading-relaxed">
                Pour une <strong>surface totale bâtie supérieure à 200 m²</strong>, vous devez faire appel à un professionnel agréé pour soumettre votre demande.
              </p>
            </div>

            {/* Professional Options */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <LuBuilding2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bureau d'études</h3>
                  <p className="text-sm text-gray-600">Ingénierie et conception technique</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="bg-emerald-500 p-3 rounded-xl">
                  <LuBuilding2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cabinet d'architecture</h3>
                  <p className="text-sm text-gray-600">Conception architecturale et permis</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <LuPhone className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Contactez un <strong>bureau d'études</strong> ou un <strong>cabinet d'architecture agréé</strong> qui soumettra la demande en votre nom avec les plans et documents techniques requis.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
};

export default SurfaceAreaWarningModal;
