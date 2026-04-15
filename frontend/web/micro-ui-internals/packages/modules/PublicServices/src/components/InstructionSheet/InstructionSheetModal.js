import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "@egovernments/digit-ui-components";
import { useInstructionSheetAPI } from "./hooks/useInstructionSheetAPI";
import { DOCUMENTS_LIST, CONFORMITY_LIST } from "./documentsData";
import {
  ModalHeader,
  TopFieldsSection,
  DocumentsTable,
  ConformityTable,
  FinalCommentsAndOpinion,
} from "./components";

const InstructionSheetModal = ({
  isOpen,
  onClose,
  applicationNumber,
  service,
  serviceCode,
  state,
  onSuccess,
  isViewMode = false,
  isViewOnly = false,
  existingData = null,
}) => {
  const [formData, setFormData] = useState({
    pcoNumber: "",
    applicantName: "",
    projectType: "",
    plotLocation: "",
    landTitleNumber: "",
    region: "",
    ces: "",
    cos: "",
    destination: "",
    documents: DOCUMENTS_LIST.map((doc) => ({
      id: doc.id,
      observations: [],
      comments: "",
      modifiedFiles: "",
    })),
    conformity: CONFORMITY_LIST.map((item) => ({
      id: item.id,
      technicalPrescription: "",
      regulatoryPrescription: "",
      projectPrescription: "",
      observation: "",
      textInput: "",
    })),
    finalComments: "",
    finalOpinion: "",
  });

  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [applicationDocuments, setApplicationDocuments] = useState([]);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, submitInstructionSheet, getFileUrl, downloadFile } = useInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  // Fetch application documents
  useEffect(() => {
    const fetchApplicationDocuments = async () => {
      if (!applicationNumber || !serviceCode) return;

      try {
        const request = {
          url: `/public-service/v1/application/${serviceCode}`,
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": Digit.UserService.getUser()?.access_token,
          },
          method: "GET",
          params: {
            applicationNumber: applicationNumber,
            tenantId: tenantId,
          },
        };

        const response = await Digit.CustomService.getResponse(request);
        const application = Array.isArray(response?.Application)
          ? response?.Application?.[0]
          : response?.Application;

        if (application?.documents) {
          setApplicationDocuments(application.documents || []);
        }
      } catch (error) {
        console.error("Error fetching application documents:", error);
      }
    };

    if (isOpen) {
      fetchApplicationDocuments();
    }
  }, [isOpen, applicationNumber, serviceCode, tenantId]);

  // Helper function for color classes
  const getColorClass = (color) => {
    const colorMap = {
      emerald: "text-emerald-700",
      red: "text-red-700",
      amber: "text-amber-700",
      gray: "text-gray-700",
      blue: "text-blue-700",
    };
    return colorMap[color] || "text-gray-700";
  };

  useEffect(() => {
    if (existingData) {
      setFormData({
        pcoNumber: existingData.pcoNumber || "",
        applicantName: existingData.applicantName || "",
        projectType: existingData.projectType || "",
        plotLocation: existingData.plotLocation || "",
        landTitleNumber: existingData.landTitleNumber || "",
        region: existingData.region || "",
        ces: existingData.ces || "",
        cos: existingData.cos || "",
        destination: existingData.destination || "",
        documents: existingData.documents || DOCUMENTS_LIST.map((doc) => ({
          id: doc.id,
          observations: [],
          comments: "",
          modifiedFiles: "",
        })),
        conformity: existingData.conformity || CONFORMITY_LIST.map((item) => ({
          id: item.id,
          technicalPrescription: "",
          regulatoryPrescription: "",
          projectPrescription: "",
          observation: "",
          textInput: "",
        })),
        finalComments: existingData.finalComments || "",
        finalOpinion: existingData.finalOpinion || "",
      });
    }
  }, [existingData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDocumentChange = (docId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  const handleObservationToggle = (docId, observationValue) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
        if (doc.id === docId) {
          const currentObservations = doc.observations || [];
          const isSelected = currentObservations.includes(observationValue);
          
          return {
            ...doc,
            observations: isSelected
              ? currentObservations.filter((o) => o !== observationValue)
              : [...currentObservations, observationValue],
          };
        }
        return doc;
      }),
    }));
  };

  const handleConformityChange = (conformityId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      conformity: prev.conformity.map((item) =>
        item.id === conformityId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleFileUpload = async (docId, files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeMB = 10;

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setShowToast({
        label: "Seuls les fichiers PDF sont acceptés",
        isError: true,
      });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setShowToast({
        label: `La taille du fichier ne doit pas dépasser ${maxSizeMB}MB`,
        isError: true,
      });
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [docId]: true }));

    try {
      const uploadResponse = await Digit.UploadServices.Filestorage(
        "DIGIT_DJIBOUTI_FILES",
        file,
        tenantId
      );

      if (uploadResponse?.data?.files?.[0]?.fileStoreId) {
        const fileStoreId = uploadResponse.data.files[0].fileStoreId;
        handleDocumentChange(docId, "modifiedFiles", fileStoreId);
        
        setShowToast({
          label: "Fichier téléchargé avec succès",
          isError: false,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setShowToast({
        label: "Erreur lors du téléchargement du fichier",
        isError: true,
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const removeFile = (docId) => {
    handleDocumentChange(docId, "modifiedFiles", "");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.applicantName?.trim()) {
      newErrors.applicantName = "Le nom du pétitionnaire est obligatoire";
    }
    if (!formData.projectType?.trim()) {
      newErrors.projectType = "Le type de projet est obligatoire";
    }
    if (!formData.plotLocation?.trim()) {
      newErrors.plotLocation = "La localisation de la parcelle est obligatoire";
    }
    if (!formData.finalOpinion) {
      newErrors.finalOpinion = "L'avis final est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitChecklist = async () => {
    if (!validateForm()) {
      setShowToast({
        label: "Veuillez remplir tous les champs obligatoires",
        isError: true,
      });
      return;
    }

    try {
      const isEdit = Boolean(existingData);
      await submitInstructionSheet(formData, service, state, isEdit, existingData);

      if (Digit.Toast) {
        Digit.Toast.success(
          isEdit 
            ? "Fiche d'instruction mise à jour avec succès" 
            : "Fiche d'instruction créée avec succès"
        );
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Error submitting instruction sheet:", error);
      
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors de la soumission de la fiche");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col"
      onClick={onClose}
    >
      {showToast && (
        <Toast
          label={showToast.label}
          isDleteBtn={true}
          error={showToast.isError}
          onClose={() => setShowToast(null)}
        />
      )}

      <div
        className="bg-white w-full h-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          applicationNumber={applicationNumber}
          isViewMode={isViewMode}
          isViewOnly={isViewOnly}
          isEditMode={isEditMode}
          isLoading={isLoading}
          existingData={existingData}
          onClose={onClose}
          setIsEditMode={setIsEditMode}
          onSubmitChecklist={onSubmitChecklist}
        />

        {/* Content */}
        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          <TopFieldsSection
            formData={formData}
            errors={errors}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            handleInputChange={handleInputChange}
          />

          <DocumentsTable
            formData={formData}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            uploadingFiles={uploadingFiles}
            handleObservationToggle={handleObservationToggle}
            handleDocumentChange={handleDocumentChange}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
            downloadFile={downloadFile}
            getColorClass={getColorClass}
            getFileUrl={getFileUrl}
            tenantId={tenantId}
            applicationDocuments={applicationDocuments}
          />

          <ConformityTable
            formData={formData}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            handleConformityChange={handleConformityChange}
            getColorClass={getColorClass}
          />

          <FinalCommentsAndOpinion
            formData={formData}
            errors={errors}
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

InstructionSheetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool,
  existingData: PropTypes.object,
};

export default InstructionSheetModal;
