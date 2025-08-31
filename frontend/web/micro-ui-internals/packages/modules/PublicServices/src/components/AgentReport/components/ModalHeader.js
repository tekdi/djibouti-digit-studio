import React from "react";
import PropTypes from "prop-types";

export const ModalHeader = ({ isViewMode, isEditMode, setIsEditMode, onSubmitChecklist, isLoading }) => {
  return (
    <div className="p-0 bg-gradient-to-br from-[#0f6769] to-[#73836a] rounded-t-[20px] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-[60px] -right-[60px] w-[120px] h-[120px] rounded-full bg-white/10 backdrop-blur-[10px]" />
      <div className="absolute -bottom-[40px] -left-[40px] w-[80px] h-[80px] rounded-full bg-white/10 backdrop-blur-[10px]" />
      <div className="absolute top-1/2 right-[10%] w-[40px] h-[40px] rounded-full bg-white/5 backdrop-blur-[10px]" />
      
      <div className="p-10 pb-8 relative z-10">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-white text-3xl font-bold m-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Rapport d'inspection sur site
            </h2>
            <p className="text-white/90 text-base mt-2 mb-0 font-normal">
              {isViewMode ? "Voir les détails d'inspection sur site soumis" : "Soumettre vos détails d'inspection sur site complets"}
            </p>
          </div>
          
          {/* Edit button for view mode */}
          {isViewMode && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-white/20 border-2 border-white/30 text-white rounded-xl px-5 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 backdrop-blur-[10px] flex items-center gap-2 hover:bg-white/30 hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
              </svg>
              Modifier le rapport
            </button>
          )}
          
          {/* Save/Cancel buttons for edit mode */}
          {isViewMode && isEditMode && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditMode(false)}
                className="bg-white/10 border-2 border-white/20 text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-white/20"
              >
                Annuler
              </button>
              <button
                onClick={onSubmitChecklist}
                disabled={isLoading}
                className={`bg-white/90 border-none text-[#0f6769] rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white'
                }`}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ModalHeader.propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  setIsEditMode: PropTypes.func.isRequired,
  onSubmitChecklist: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
}; 