import { useState, useCallback } from "react";

const createEmptyCoteRow = () => ({
  cotesRelevees: "",
  cotesDuProjet: "",
  observation: "",
});

const DEFAULT_FORM_DATA = {
  report: [],
  notes: "",
  photos: [],
  cotesTable: [createEmptyCoteRow()],
  technicalInfo: {
    voieReference: "",
    coteVoieNiveauMer: "",
    volumeRemblai: "",
    hauteurMaximale: "",
    nombreCouches: "",
  },
};

export const useAgentReportForm = () => {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleInputChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  }, [errors]);

  const handleTechnicalInfoChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      technicalInfo: {
        ...prev.technicalInfo,
        [fieldName]: value,
      },
    }));
  }, []);

  const handleCoteRowChange = useCallback((index, fieldName, value) => {
    setFormData(prev => {
      const newTable = [...prev.cotesTable];
      newTable[index] = { ...newTable[index], [fieldName]: value };
      return { ...prev, cotesTable: newTable };
    });
  }, []);

  const addCoteRow = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      cotesTable: [...prev.cotesTable, createEmptyCoteRow()],
    }));
  }, []);

  const removeCoteRow = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      cotesTable: prev.cotesTable.filter((_, i) => i !== index),
    }));
  }, []);

  const uploadFileToS3 = useCallback(async (file) => {
    try {
      const tenantId = Digit?.ULBService?.getCurrentTenantId();

      if (!tenantId) {
        throw new Error("Tenant ID not available");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);
      formData.append("module", "DigitStudio");

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  return {
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
  };
};
