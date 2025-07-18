import React, { useState, useEffect } from "react";
import { Card, Button, Modal, TextInput, TextArea } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";

const CustomCheckListModal = ({ isOpen, onClose, applicationId, service, state, t, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    report: [],
    notes: "",
    photos: []
  });
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // Check if checklist is already submitted
  useEffect(() => {
    if (isOpen) {
      checkExistingChecklist();
    }
  }, [isOpen, applicationId]);

  const checkExistingChecklist = async () => {
    if (!applicationId || !service) return;
    
    try {
      const tenantId = Digit?.ULBService?.getCurrentTenantId();
      
      if (!tenantId) {
        console.warn("Tenant ID not available");
        return;
      }

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
      }
    } catch (error) {
      console.error("Error checking existing checklist:", error);
    }
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

  const uploadFileToS3 = async (file) => {
    try {
      const tenantId = Digit?.ULBService?.getCurrentTenantId();
      
      if (!tenantId) {
        throw new Error("Tenant ID not available");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);
      formData.append("module", "DigitStudio");

      // Upload to S3
      const response = await Digit.CustomService.getResponse({
        url: "/filestore/v1/files",
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response?.files?.[0]?.fileStoreId) {
        throw new Error("Upload response invalid");
      }

      return {
        fileName: file.name,
        fileStoreId: response.files[0].fileStoreId,
        documentType: file.type,
        size: file.size
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (event, fieldName) => {
    const files = Array.from(event.target.files);
    setUploadingFiles(true);

    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        const uploadedFile = await uploadFileToS3(file);
        uploadedFiles.push(uploadedFile);
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ...uploadedFiles]
      }));

      // Clear error when files are uploaded
      if (errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: null
        }));
      }

      if (Digit.Toast) {
        Digit.Toast.success(`${files.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Failed to upload files");
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.report || formData.report.length === 0) {
      newErrors.report = "Report files are required";
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
      
      // Show success message
      if (Digit.Toast) {
        Digit.Toast.success("Checklist submitted successfully");
      }
      
      // Close modal and notify parent
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error submitting checklist:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Failed to submit checklist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadSection = ({ title, fieldName, accept, maxFiles, maxSizeMB, required = false }) => (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
        {title} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      
      <input
        type="file"
        multiple
        accept={accept}
        onChange={(e) => handleFileUpload(e, fieldName)}
        disabled={uploadingFiles}
        style={{ 
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "14px",
          marginBottom: "0.5rem"
        }}
      />
      
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "0.5rem" }}>
        Accepted formats: {accept.replace(/\./g, "").toUpperCase()} (Max {maxFiles} files, {maxSizeMB}MB each)
        {uploadingFiles && <span style={{ color: "#006769", marginLeft: "0.5rem" }}>Uploading...</span>}
      </div>

      {errors[fieldName] && (
        <div style={{ color: "red", fontSize: "12px", marginBottom: "0.5rem" }}>
          {errors[fieldName]}
        </div>
      )}

      {formData[fieldName] && formData[fieldName].length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <strong>Uploaded files:</strong>
          {formData[fieldName].map((file, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "4px 8px",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              marginTop: "4px"
            }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                • {file.fileName} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={() => removeFile(fieldName, index)}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agent Field Report"
      style={{
        width: "600px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflow: "auto"
      }}
    >
      <div style={{ padding: "20px" }}>
        <h2 style={{ color: "black", fontSize: "20px", fontWeight: "700", marginBottom: "1.5rem" }}>
          Field Inspection Report
        </h2>
        
        {/* Report Upload */}
        <FileUploadSection
          title="Field Report Files"
          fieldName="report"
          accept=".pdf,.doc,.docx,.xlsx,.xls"
          maxFiles={5}
          maxSizeMB={10}
          required={true}
        />

        {/* Notes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Additional Notes (Optional)
          </label>
          <TextArea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Enter any additional notes or observations from your field inspection..."
            style={{ 
              width: "100%", 
              minHeight: "100px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        {/* Photos Upload */}
        <FileUploadSection
          title="Field Photos"
          fieldName="photos"
          accept=".jpg,.jpeg,.png"
          maxFiles={10}
          maxSizeMB={5}
          required={false}
        />

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
          <Button
            label="Cancel"
            onClick={onClose}
            variation="secondary"
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          />
          <Button
            label={isLoading ? "Submitting..." : "Submit Report"}
            onClick={onSubmitChecklist}
            disabled={isLoading || uploadingFiles}
            variation="primary"
            style={{
              backgroundColor: "#006769",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: (isLoading || uploadingFiles) ? "not-allowed" : "pointer",
              opacity: (isLoading || uploadingFiles) ? 0.7 : 1
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CustomCheckListModal; 