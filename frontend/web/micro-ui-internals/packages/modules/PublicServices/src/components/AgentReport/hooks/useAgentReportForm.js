import { useState, useCallback } from "react";

export const useAgentReportForm = () => {
  const [formData, setFormData] = useState({
    report: [],
    notes: "",
    photos: []
  });
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleInputChange = useCallback((fieldName, value) => {
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
  }, [errors]);

  const uploadFileToS3 = useCallback(async (file) => {
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
  }, []);

  const handleFileUpload = useCallback(async (event, fieldName) => {
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
        Digit.Toast.success(`${files.length} fichier(s) téléchargé(s) avec succès`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Échec du téléchargement des fichiers");
      }
    } finally {
      setUploadingFiles(false);
    }
  }, [uploadFileToS3, errors]);

  const removeFile = useCallback((fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.report || formData.report.length === 0) {
      newErrors.report = "Les fichiers de rapport sont requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.report]);

  return {
    formData,
    errors,
    uploadingFiles,
    handleInputChange,
    handleFileUpload,
    removeFile,
    validateForm,
    setFormData
  };
}; 