import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FileUploadSection } from "./components/FileUploadSection";
import { ModalHeader } from "./components/ModalHeader";
import { CotesTableSection } from "./components/CotesTableSection";
import { TechnicalInfoSection } from "./components/TechnicalInfoSection";
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
  isViewOnly = false,
  existingChecklistData = null,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const {
    formData,
    errors,
    uploadingFiles,
    handleInputChange,
    handleFileUpload,
    removeFile,
    validateForm,
    setFormData,
    handleTechnicalInfoChange,
    handleCoteRowChange,
    addCoteRow,
    removeCoteRow,
  } = useAgentReportForm();

  const { isLoading, submitChecklist, downloadFile, getFileUrl } = useAgentReportAPI(tenantId, serviceCode, applicationNumber);

  useEffect(() => {
    if (isOpen) {
      if (isViewMode && existingChecklistData) {
        setFormData(existingChecklistData);
      } else {
        checkExistingChecklist();
      }
      setIsEditMode(false);
    }
  }, [isOpen, applicationNumber, isViewMode, existingChecklistData, setFormData]);

  const checkExistingChecklist = async () => {
    if (!applicationNumber || !serviceCode) return;

    try {
      if (!tenantId) return;

      const request = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": Digit.UserService.getUser()?.access_token,
        },
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
      const isEdit = Boolean(existingChecklistData);
      await submitChecklist(formData, service, state, isEdit, existingChecklistData);

      if (Digit.Toast) {
        Digit.Toast.success(isEdit ? "Liste de contrôle mise à jour avec succès" : "Liste de contrôle soumise avec succès");
      }

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          isViewMode={isViewMode}
          isViewOnly={isViewOnly}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          onSubmitChecklist={onSubmitChecklist}
          isLoading={isLoading}
          onClose={onClose}
        />

        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          {/* Côtes PR Table */}
          <CotesTableSection
            cotesTable={formData.cotesTable || []}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            handleCoteRowChange={handleCoteRowChange}
            addCoteRow={addCoteRow}
            removeCoteRow={removeCoteRow}
          />

          {/* Technical Info */}
          <TechnicalInfoSection
            technicalInfo={formData.technicalInfo || {}}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            handleTechnicalInfoChange={handleTechnicalInfoChange}
          />

          {/* Notes */}
          <div className="mb-8">
            <label className="block mb-3 font-semibold text-base text-gray-800">
              Notes d'inspection {!isViewMode && "(Optionnel)"}
            </label>
            {isViewMode && !isEditMode ? (
              <div className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 leading-relaxed">
                {formData.notes || "Aucune note supplémentaire fournie."}
              </div>
            ) : (
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Entrez des notes supplémentaires ou des observations de votre inspection sur site..."
                className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl text-sm resize-y transition-all duration-200 outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20"
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
        </div>
      </div>
    </div>
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
