import React from "react";
import PropTypes from "prop-types";
import { LuX, LuSave, LuCheck, LuPen } from "react-icons/lu";

const ModalHeader = ({
  applicationNumber,
  isViewMode,
  isViewOnly,
  isEditMode,
  isLoading,
  existingData,
  onClose,
  setIsEditMode,
  onSubmitChecklist,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Fiche d'instruction APE</h2>
          <p className="text-sm text-white/80">Approbation de Plan d'Exécution — Dossier : {applicationNumber}</p>
        </div>

        <div className="flex items-center gap-3">
          {isViewMode && !isEditMode && existingData && !isViewOnly ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <LuPen className="h-4 w-4" />
              Modifier
            </button>
          ) : !isViewMode || isEditMode ? (
            <button
              onClick={onSubmitChecklist}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-djibouti-primary border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </span>
              ) : existingData ? (
                <span className="inline-flex items-center gap-2">
                  <LuCheck className="h-4 w-4" />
                  Mettre à jour
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LuSave className="h-4 w-4" />
                  Enregistrer
                </span>
              )}
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Fermer"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

ModalHeader.propTypes = {
  applicationNumber: PropTypes.string.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  existingData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  setIsEditMode: PropTypes.func.isRequired,
  onSubmitChecklist: PropTypes.func.isRequired,
};

export default ModalHeader;
