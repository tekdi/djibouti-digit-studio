import { useState, useCallback, useEffect, useRef } from "react";

const createEmptyCoteRow = () => ({
  cotesRelevees: "",
  cotesDuProjet: "",
  observation: "",
});

const DEFAULT_FORM_DATA = {
  report: [],
  notes: "",
  photos: [],
  permitInfo: {
    prNumber: "",
    applicantName: "",
    terrainLocation: "",
    region: "",
    terrainSurface: "",
    landTitleNumber: "",
  },
  cotesTable: [createEmptyCoteRow()],
  technicalInfo: {
    voieReference: "",
    coteVoieNiveauMer: "",
    volumeRemblai: "",
    hauteurMaximale: "",
    nombreCouches: "",
  },
};

// Auto-save the in-progress fiche to localStorage so the agent doesn't lose
// 10+ minutes of work when:
//   - Chrome discards the inactive tab (default after ~5-10 min idle)
//   - The session token expires and the app redirects to login
//   - The agent accidentally hits F5 / closes the tab / network drops
//
// Drafts are scoped per-application; cleared after a successful submit.
const draftKey = (applicationNumber) =>
  applicationNumber ? `bpa-pr-fiche-draft:${applicationNumber}` : null;

const loadDraft = (applicationNumber) => {
  const key = draftKey(applicationNumber);
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not load fiche draft:", e);
    return null;
  }
};

const saveDraft = (applicationNumber, data) => {
  const key = draftKey(applicationNumber);
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    /* localStorage full or disabled — ignore */
  }
};

const clearDraft = (applicationNumber) => {
  const key = draftKey(applicationNumber);
  if (!key) return;
  try {
    window.localStorage.removeItem(key);
  } catch (e) { /* ignore */ }
};

export const useAgentReportForm = (applicationNumber) => {
  // Restore draft on mount if present, else default form.
  const [formData, setFormData] = useState(() => {
    const draft = loadDraft(applicationNumber);
    return draft ? { ...DEFAULT_FORM_DATA, ...draft } : { ...DEFAULT_FORM_DATA };
  });
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Persist every formData change to localStorage (scoped per application).
  // Skipped on the very first render so we don't overwrite a freshly loaded
  // draft with the default-empty form.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    saveDraft(applicationNumber, formData);
  }, [formData, applicationNumber]);

  const clearLocalDraft = useCallback(() => {
    clearDraft(applicationNumber);
  }, [applicationNumber]);

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

  const handlePermitInfoChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      permitInfo: {
        ...prev.permitInfo,
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
    handlePermitInfoChange,
    handleCoteRowChange,
    addCoteRow,
    removeCoteRow,
    clearLocalDraft,
  };
};
