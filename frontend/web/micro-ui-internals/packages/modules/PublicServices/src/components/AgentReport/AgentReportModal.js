import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FileUploadSection } from "./components/FileUploadSection";
import { ModalHeader } from "./components/ModalHeader";
import { useAgentReportForm } from "./hooks/useAgentReportForm";
import { useAgentReportAPI } from "./hooks/useAgentReportAPI";

const AgentReportModal = ({
  isOpen,
  onClose,
  applicationNumber,
  service,
  serviceCode,
  state,
  onSuccess,
  isViewMode = false,
  existingChecklistData = null,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { formData, errors, uploadingFiles, handleInputChange, handleFileUpload, removeFile, validateForm, setFormData } = useAgentReportForm();

  const { isLoading, submitChecklist, downloadFile, getFileUrl } = useAgentReportAPI(tenantId, serviceCode, applicationNumber);

  // Check if checklist is already submitted
  useEffect(() => {
    if (isOpen) {
      // If we have existing data and we're in view mode, use it directly
      if (isViewMode && existingChecklistData) {
        setFormData(existingChecklistData);
      } else {
        // Otherwise fetch from API
        checkExistingChecklist();
      }
      // Reset edit mode when modal opens
      setIsEditMode(false);
    }
  }, [isOpen, applicationNumber, isViewMode, existingChecklistData, setFormData]);

  const checkExistingChecklist = async () => {
    if (!applicationNumber || !serviceCode) return;

    try {
      if (!tenantId) {
        return;
      }

      const request = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        params: {
          applicationNumber,
          tenantId: tenantId,
        },
      };

      const response = await Digit.CustomService.getResponse(request);

      const application = response?.Application?.[0];

      if (application?.additionalDetails?.agentChecklist) {
        setFormData(application.additionalDetails.agentChecklist);
      }
      // No existing checklist found - this is expected for new submissions
    } catch (error) {
      console.error("Error checking existing checklist:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Échec du chargement des données de liste de contrôle existantes");
      }
    }
  };

  const onSubmitChecklist = async () => {
    if (!validateForm()) return;

    try {
      // Check if this is an edit (existing data present) or new submission
      const isEdit = Boolean(existingChecklistData);

      await submitChecklist(formData, service, state, isEdit, existingChecklistData);

      // Show success message
      if (Digit.Toast) {
        Digit.Toast.success(isEdit ? "Liste de contrôle mise à jour avec succès" : "Liste de contrôle soumise avec succès");
      }

      // Close modal and notify parent
      onClose();
      if (onSuccess) {
        onSuccess();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting checklist:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Échec de la soumission de la liste de contrôle");
      }
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <React.Fragment>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes modalBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalContent {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-[modalBackdrop_0.3s_ease-out]"
        onClick={onClose}
      >
        <div
          className="w-[750px] max-w-[95vw] max-h-[90vh] bg-white rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden animate-[modalContent_0.3s_ease-out] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full border-none bg-white/90 backdrop-blur-[10px] cursor-pointer flex items-center justify-center z-10 transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-110"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="#374151"
              />
            </svg>
          </button>

          {/* Header */}
          <ModalHeader
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            onSubmitChecklist={onSubmitChecklist}
            isLoading={isLoading}
          />

          {/* Content */}
          <div className="p-10 bg-white rounded-b-[20px] max-h-[60vh] overflow-y-auto">
            {/* Report Upload */}
            <FileUploadSection
              title="Fichiers de rapport sur site"
              fieldName="report"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              maxFiles={5}
              maxSizeMB={10}
              required={true}
              formData={formData}
              errors={errors}
              uploadingFiles={uploadingFiles}
              isViewMode={isViewMode}
              isEditMode={isEditMode}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              downloadFile={downloadFile}
              getFileUrl={getFileUrl}
            />

            {/* Notes */}
            <div className="mb-8">
              <label className="block mb-3 font-semibold text-base text-gray-800">
                Notes supplémentaires {!isViewMode && "(Optionnel)"}
              </label>
              {isViewMode && !isEditMode ? (
                <div className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl text-sm font-inherit bg-gray-50 text-gray-700 leading-relaxed">
                  {formData.notes || "Aucune note supplémentaire fournie."}
                </div>
              ) : (
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Entrez des notes supplémentaires ou des observations de votre inspection sur site..."
                  className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl text-sm font-inherit resize-y transition-all duration-200 outline-none focus:border-[#0f6769] focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
                />
              )}
            </div>

            {/* Photos Upload */}
            <FileUploadSection
              title="Photos sur site"
              fieldName="photos"
              accept=".jpg,.jpeg,.png"
              maxFiles={10}
              maxSizeMB={5}
              required={false}
              formData={formData}
              errors={errors}
              uploadingFiles={uploadingFiles}
              isViewMode={isViewMode}
              isEditMode={isEditMode}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              downloadFile={downloadFile}
              getFileUrl={getFileUrl}
            />

            {/* Action Buttons */}
            {!isViewMode && (
              <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="bg-white text-gray-500 border-2 border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 min-w-[100px] hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={onSubmitChecklist}
                  disabled={isLoading || uploadingFiles}
                  className={`bg-gradient-to-br from-[#0f6769] to-[#73836a] text-white border-none rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 min-w-[140px] shadow-[0_4px_12px_rgba(15,103,105,0.3)] ${
                    isLoading || uploadingFiles ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-[0_6px_16px_rgba(15,103,105,0.4)]'
                  }`}
                >
                  {isLoading ? "Soumission..." : "Soumettre le rapport"}
                </button>
              </div>
            )}

            {/* Close button for view mode */}
            {isViewMode && !isEditMode && (
              <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="bg-gradient-to-br from-[#0f6769] to-[#73836a] text-white border-none rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 min-w-[100px] shadow-[0_4px_12px_rgba(15,103,105,0.3)] hover:shadow-[0_6px_16px_rgba(15,103,105,0.4)]"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

AgentReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  isViewMode: PropTypes.bool,
  existingChecklistData: PropTypes.object,
};

export default AgentReportModal;
