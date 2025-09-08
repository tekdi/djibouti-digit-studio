import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LuX, LuUsers, LuCircleCheck } from "react-icons/lu";
import { useCommissionersAPI } from "./hooks/useCommissionersAPI";

const CommissionersCheckListModal = ({
  isOpen,
  onClose,
  applicationNumber,
  service,
  serviceCode,
  state,
  onSuccess,
  isViewMode = false,
  existingData = null,
  commissioners = []
}) => {
  const [selectedCommissioners, setSelectedCommissioners] = useState([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const { isLoading: isSubmitting, submitCommissionersChecklist } = useCommissionersAPI(
    Digit.ULBService.getCurrentTenantId(),
    serviceCode,
    applicationNumber
  );

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (isViewMode && existingData) {
        setSelectedCommissioners(existingData.selectedCommissioners || []);
        setNotes(existingData.notes || "");
      } else {
        setSelectedCommissioners([]);
        setNotes("");
      }
      setErrors({});
    }
  }, [isOpen, isViewMode, existingData]);

  const handleCommissionerToggle = (commissionerId) => {
    if (isViewMode) return; // Don't allow changes in view mode
    
    setSelectedCommissioners(prev => {
      if (prev.includes(commissionerId)) {
        return prev.filter(id => id !== commissionerId);
      } else {
        return [...prev, commissionerId];
      }
    });
  };

  const handleSubmit = async () => {
    if (isViewMode) return;

    // Validation
    const newErrors = {};
    if (selectedCommissioners.length === 0) {
      newErrors.commissioners = "Veuillez sélectionner au moins un commissaire";
    }
    if (notes.trim().length < 10) {
      newErrors.notes = "Veuillez fournir des notes détaillées (minimum 10 caractères)";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const formData = {
        selectedCommissioners,
        notes: notes.trim()
      };

      await submitCommissionersChecklist(formData, service, state, isViewMode, existingData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting commissioners checklist:", error);
      setErrors({ submit: "Erreur lors de la soumission. Veuillez réessayer." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {isViewMode ? "Sélection des Commissaires" : "Sélectionner les Commissaires"}
                </h2>
                <p className="text-white/80 text-sm">
                  {isViewMode ? "Consultez la sélection des commissaires" : "Sélectionnez les commissaires requis pour ce projet"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <LuX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Commissioners Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Commissaires Disponibles
            </h3>
            {errors.commissioners && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.commissioners}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commissioners.map((commissioner) => {
                const isSelected = selectedCommissioners.includes(commissioner.id);
                const IconComponent = commissioner.icon;
                
                return (
                  <div
                    key={commissioner.id}
                    onClick={() => handleCommissionerToggle(commissioner.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    } ${isViewMode ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${commissioner.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${commissioner.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {commissioner.name}
                          </h4>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <LuCircleCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {commissioner.fullName}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {commissioner.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notes et Commentaires
            </h3>
            {errors.notes && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.notes}</p>
              </div>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isViewMode}
              placeholder="Expliquez pourquoi ces commissaires ont été sélectionnés et toute information pertinente..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">
                Minimum 10 caractères requis
              </span>
              <span className="text-xs text-gray-500">
                {notes.length}/500
              </span>
            </div>
          </div>

          {/* Selected Summary */}
          {selectedCommissioners.length > 0 && (
            <div className="mb-8 p-5 bg-primary/5 rounded-xl border border-primary/10">
              <h4 className="text-sm font-semibold text-primary mb-3">
                Commissaires Sélectionnés ({selectedCommissioners.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCommissioners.map((commissionerId) => {
                  const commissioner = commissioners.find(c => c.id === commissionerId);
                  if (!commissioner) return null;
                  
                  const IconComponent = commissioner.icon;
                  return (
                    <span
                      key={commissionerId}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-primary/20 text-primary text-sm font-medium rounded-lg"
                    >
                      <IconComponent className="w-4 h-4" />
                      {commissioner.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50/50 px-6 py-5 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {isViewMode ? "Fermer" : "Annuler"}
          </button>
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCommissioners.length === 0}
              className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium ${
                isSubmitting || selectedCommissioners.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isSubmitting ? "Soumission..." : "Soumettre la sélection"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

CommissionersCheckListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool,
  existingData: PropTypes.object,
  commissioners: PropTypes.array
};

export default CommissionersCheckListModal;
