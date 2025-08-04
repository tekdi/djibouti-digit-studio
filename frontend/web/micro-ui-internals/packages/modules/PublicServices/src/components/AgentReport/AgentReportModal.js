import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, TextArea } from "@egovernments/digit-ui-components";
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
        Digit.Toast.error("Failed to load existing checklist data");
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
        Digit.Toast.success(isEdit ? "Checklist updated successfully" : "Checklist submitted successfully");
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
        Digit.Toast.error("Failed to submit checklist");
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
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "modalBackdrop 0.3s ease-out",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "750px",
            maxWidth: "95vw",
            maxHeight: "90vh",
            backgroundColor: "white",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
            animation: "modalContent 0.3s ease-out",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 1)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              e.target.style.transform = "scale(1)";
            }}
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
          <div
            style={{
              padding: "40px",
              background: "white",
              borderRadius: "0 0 20px 20px",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            {/* Report Upload */}
            <FileUploadSection
              title="Field Report Files"
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
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#1f2937",
                }}
              >
                Additional Notes {!isViewMode && "(Optional)"}
              </label>
              {isViewMode && !isEditMode ? (
                <div
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "#f9fafb",
                    color: "#374151",
                    lineHeight: "1.5",
                  }}
                >
                  {formData.notes || "No additional notes provided."}
                </div>
              ) : (
                <TextArea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Enter any additional notes or observations from your field inspection..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0f6769";
                    e.target.style.boxShadow = "0 0 0 3px rgba(15, 103, 105, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              )}
            </div>

            {/* Photos Upload */}
            <FileUploadSection
              title="Field Photos"
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
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "flex-end",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <Button
                  label="Cancel"
                  onClick={onClose}
                  variation="secondary"
                  style={{
                    backgroundColor: "white",
                    color: "#6b7280",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minWidth: "100px",
                  }}
                />
                <Button
                  label={isLoading ? "Submitting..." : "Submit Report"}
                  onClick={onSubmitChecklist}
                  disabled={isLoading || uploadingFiles}
                  variation="primary"
                  style={{
                    background: "linear-gradient(135deg, #0f6769 0%, #73836a 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isLoading || uploadingFiles ? "not-allowed" : "pointer",
                    opacity: isLoading || uploadingFiles ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    minWidth: "140px",
                    boxShadow: "0 4px 12px rgba(15, 103, 105, 0.3)",
                  }}
                />
              </div>
            )}

            {/* Close button for view mode */}
            {isViewMode && !isEditMode && (
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "flex-end",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <Button
                  label="Close"
                  onClick={onClose}
                  variation="primary"
                  style={{
                    background: "linear-gradient(135deg, #0f6769 0%, #73836a 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minWidth: "100px",
                    boxShadow: "0 4px 12px rgba(15, 103, 105, 0.3)",
                  }}
                />
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
