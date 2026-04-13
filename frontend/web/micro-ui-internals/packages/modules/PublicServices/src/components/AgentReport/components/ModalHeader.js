import React from "react";
import PropTypes from "prop-types";
import { LuX, LuFileText } from "react-icons/lu";

export const ModalHeader = ({ isViewMode, isViewOnly, isEditMode, setIsEditMode, onSubmitChecklist, isLoading, onClose }) => {
  return (
    <div className="relative flex justify-between items-center bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark p-4 text-white border-b border-white/10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <LuFileText className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Rapport d'inspection sur site</h2>
          <p className="text-white/90 mt-1">
            {isViewMode ? "Voir les détails d'inspection sur site soumis" : "Soumettre vos détails d'inspection sur site complets"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isViewMode && (
          <button
            onClick={onSubmitChecklist}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isLoading ? "bg-white/30 text-white/50 cursor-not-allowed" : "bg-white text-djibouti-primary hover:bg-white/90"
            }`}
          >
            {isLoading ? "Soumission..." : "Soumettre le rapport"}
          </button>
        )}

        {isViewMode && !isEditMode && !isViewOnly && (
          <button
            onClick={() => setIsEditMode(true)}
            className="px-6 py-2.5 rounded-xl font-semibold bg-white text-djibouti-primary hover:bg-white/90 transition-all duration-200"
          >
            Modifier le rapport
          </button>
        )}

        {isViewMode && isEditMode && (
          <div className="flex gap-3">
            <button
              onClick={onSubmitChecklist}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                isLoading ? "bg-white/30 text-white/50 cursor-not-allowed" : "bg-white text-djibouti-primary hover:bg-white/90"
              }`}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              className="px-6 py-2.5 rounded-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200"
        >
          <LuX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

ModalHeader.propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  setIsEditMode: PropTypes.func.isRequired,
  onSubmitChecklist: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
