import React, { useState, useEffect } from "react";
import { Card, TextBlock, Button, Loader, TextInput, TextArea } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import UploadAndDownloadDocumentHandler from "../../../../ui-components/src/hoc/UploadAndDownloadDocumentHandler";

const CustomCheckListCard = ({ applicationId, service, state, t }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    report: [],
    notes: "",
    photos: []
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { control, setValue, watch } = useForm();

  // Check if checklist is already submitted
  useEffect(() => {
    checkExistingChecklist();
  }, [applicationId]);

  const checkExistingChecklist = async () => {
    try {
      const request = {
        url: `/public-service/v1/application/${service}`,
        method: "GET",
        params: {
          applicationNumber: applicationId,
          tenantId: tenantId,
        },
      };
      
      const response = await Digit.CustomService.getResponse(request);
      const application = response?.Application?.[0];
      
      if (application?.additionalDetails?.agentChecklist) {
        setFormData(application.additionalDetails.agentChecklist);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error checking existing checklist:", error);
    }
  };

  const handleFileUpload = (files, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: files
    }));
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.report || formData.report.length === 0) {
      newErrors.report = t("REPORT_REQUIRED");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitChecklist = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare the checklist data
      const checklistData = {
        report: formData.report,
        notes: formData.notes,
        photos: formData.photos,
        submittedAt: new Date().toISOString(),
        submittedBy: Digit.UserService.getUser()?.info?.uuid,
        service: service,
        state: state
      };

      // Update application with checklist data
      const updateRequest = {
        url: `/public-service/v1/application/${service}/_update`,
        method: "POST",
        body: {
          RequestInfo: {
            apiId: "Rainmaker",
            ver: "1.0",
            ts: Date.now(),
            action: "UPDATE",
            did: "1",
            key: "",
            msgId: "20170310130900|en_IN",
            requesterId: "",
            authToken: Digit.UserService.getUser()?.access_token,
          },
          applicationNumber: applicationId,
          tenantId: tenantId,
          additionalDetails: {
            agentChecklist: checklistData
          }
        }
      };

      await Digit.CustomService.getResponse(updateRequest);
      setIsSubmitted(true);
      
      // Show success message
      Digit.Toast.success(t("CHECKLIST_SUBMITTED_SUCCESS"));
      
    } catch (error) {
      console.error("Error submitting checklist:", error);
      Digit.Toast.error(t("CHECKLIST_SUBMISSION_FAILED"));
    } finally {
      setIsLoading(false);
    }
  };

  const reportUploadConfig = {
    populators: {
      name: "report",
      allowedMaxSizeInMB: 10,
      maxFilesAllowed: 5,
      allowedFileTypes: ["pdf", "doc", "docx", "xlsx", "xls"],
      hintText: "UPLOAD_REPORT_HINT",
      showHintBelow: true,
      isMandatory: true
    },
    error: "REPORT_REQUIRED"
  };

  const photosUploadConfig = {
    populators: {
      name: "photos",
      allowedMaxSizeInMB: 5,
      maxFilesAllowed: 10,
      allowedFileTypes: ["jpg", "jpeg", "png"],
      hintText: "UPLOAD_PHOTOS_HINT",
      showHintBelow: true,
      isMandatory: false
    }
  };

  if (isSubmitted) {
    return (
      <Card type="primary" style={{ padding: "20px", marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#166534",
              backgroundColor: "#dcfce7",
              padding: "0.25rem 0.5rem",
              borderRadius: "9999px",
            }}
          >
            {t("CHECKLIST_COMPLETED")}
          </span>
        </div>
        
        <h2 style={{ color: "black", fontSize: "24px", fontWeight: "700", marginBottom: "1rem" }}>
          {t("AGENT_FIELD_REPORT")}
        </h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <strong>{t("REPORT_FILES")}:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            {formData.report?.map((file, index) => (
              <div key={index} style={{ fontSize: "14px", color: "#666" }}>
                • {file[0]} {/* file name */}
              </div>
            ))}
          </div>
        </div>
        
        {formData.notes && (
          <div style={{ marginBottom: "1rem" }}>
            <strong>{t("NOTES")}:</strong>
            <div style={{ marginTop: "0.5rem", fontSize: "14px", color: "#666" }}>
              {formData.notes}
            </div>
          </div>
        )}
        
        {formData.photos?.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <strong>{t("PHOTOS")}:</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {formData.photos?.map((photo, index) => (
                <div key={index} style={{ fontSize: "14px", color: "#666" }}>
                  • {photo[0]} {/* photo name */}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ fontSize: "12px", color: "#999", marginTop: "1rem" }}>
          {t("SUBMITTED_ON")}: {new Date(formData.submittedAt).toLocaleString()}
        </div>
      </Card>
    );
  }

  return (
    <Card type="primary" style={{ padding: "20px", marginBottom: "15px" }}>
      <h2 style={{ color: "black", fontSize: "24px", fontWeight: "700", marginBottom: "1.5rem" }}>
        {t("AGENT_FIELD_REPORT")}
      </h2>
      
      {/* Report Upload */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          {t("FIELD_REPORT")} <span style={{ color: "red" }}>*</span>
        </label>
        <UploadAndDownloadDocumentHandler
          config={reportUploadConfig}
          Controller={Controller}
          control={control}
          register={() => {}}
          formData={formData}
          errors={errors}
          localePrefix="BPA"
          flow="WORKFLOW"
        />
        {errors.report && (
          <div style={{ color: "red", fontSize: "12px", marginTop: "0.25rem" }}>
            {errors.report}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          {t("NOTES")} ({t("OPTIONAL")})
        </label>
        <TextArea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder={t("ENTER_NOTES_PLACEHOLDER")}
          style={{ width: "100%", minHeight: "100px" }}
        />
      </div>

      {/* Photos Upload */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          {t("PHOTOS")} ({t("OPTIONAL")})
        </label>
        <UploadAndDownloadDocumentHandler
          config={photosUploadConfig}
          Controller={Controller}
          control={control}
          register={() => {}}
          formData={formData}
          errors={errors}
          localePrefix="BPA"
          flow="WORKFLOW"
        />
      </div>

      {/* Submit Button */}
      <Button
        label={isLoading ? t("SUBMITTING") : t("SUBMIT_CHECKLIST")}
        onClick={onSubmitChecklist}
        disabled={isLoading}
        style={{
          width: "100%",
          backgroundColor: "#006769",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isLoading ? "not-allowed" : "pointer"
        }}
      />
    </Card>
  );
};

export default CustomCheckListCard; 