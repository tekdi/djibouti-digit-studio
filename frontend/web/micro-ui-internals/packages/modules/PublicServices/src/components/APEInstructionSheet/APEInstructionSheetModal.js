import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "@egovernments/digit-ui-components";
import { useAPEInstructionSheetAPI } from "./hooks/useAPEInstructionSheetAPI";
import { DOCUMENTS_LIST } from "./documentsData";
import {
  ModalHeader,
  GeneralInfoSection,
  DocumentsTable,
  SignaturesSection,
  ObservationsSection,
  FinalCommentsAndOpinion,
} from "./components";

const buildEmptyDocuments = () =>
  DOCUMENTS_LIST.map((doc) => ({
    id: doc.id,
    observations: [],
    comments: "",
    modifiedFiles: "",
  }));

const APEInstructionSheetModal = ({
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
    // I. Informations générales
    generalInfo: {},
    // II. Documents
    documents: buildEmptyDocuments(),
    // III. Signatures
    signatures: {},
    // IV. Observations ingénieur SDECC
    engineerObservations: "",
    // V. Observations chef SCC Privée
    chefObservations: "",
    // Final
    finalComments: "",
    finalOpinion: "",
  });

  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, submitInstructionSheet, getFileUrl, downloadFile } = useAPEInstructionSheetAPI(
    tenantId,
    serviceCode,
    applicationNumber
  );

  const getColorClass = (color) => {
    const map = {
      emerald: "text-emerald-700",
      red: "text-red-700",
      amber: "text-amber-700",
      gray: "text-gray-700",
      blue: "text-blue-700",
    };
    return map[color] || "text-gray-700";
  };

  useEffect(() => {
    if (existingData) {
      setFormData({
        generalInfo: existingData.generalInfo || {},
        documents: existingData.documents || buildEmptyDocuments(),
        signatures: existingData.signatures || {},
        engineerObservations: existingData.engineerObservations || "",
        chefObservations: existingData.chefObservations || "",
        finalComments: existingData.finalComments || "",
        finalOpinion: existingData.finalOpinion || "",
      });
    }
  }, [existingData]);

  const isDisabled = isViewMode && !isEditMode;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleGeneralInfoChange = (key, value) => {
    setFormData((prev) => ({ ...prev, generalInfo: { ...prev.generalInfo, [key]: value } }));
  };

  const handleSignatureChange = (rowKey, value) => {
    setFormData((prev) => ({ ...prev, signatures: { ...prev.signatures, [rowKey]: value } }));
  };

  const handleDocumentChange = (docId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        String(doc.id) === String(docId) ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  const handleObservationToggle = (docId, observationValue) => {
    // Single-select: replace the row's observations with this single value,
    // or clear if re-clicking the active option.
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
        if (String(doc.id) !== String(docId)) return doc;
        const isSel = (doc.observations || []).includes(observationValue);
        return { ...doc, observations: isSel ? [] : [observationValue] };
      }),
    }));
  };

  const handleFileUpload = async (docId, files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const maxSizeMB = 50;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowed = ["pdf", "dwg", "pln"];
    if (!allowed.includes(ext)) {
      setShowToast({ label: `Format non accepté (${ext}). PDF / DWG / PLN uniquement`, isError: true });
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setShowToast({ label: `Taille max ${maxSizeMB}MB`, isError: true });
      return;
    }
    setUploadingFiles((prev) => ({ ...prev, [docId]: true }));
    try {
      const res = await Digit.UploadServices.Filestorage("DIGIT_DJIBOUTI_FILES", file, tenantId);
      if (res?.data?.files?.[0]?.fileStoreId) {
        const fsid = res.data.files[0].fileStoreId;
        handleDocumentChange(docId, "modifiedFiles", fsid);
        setShowToast({ label: "Fichier téléchargé avec succès", isError: false });
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setShowToast({ label: "Erreur lors du téléchargement", isError: true });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const removeFile = (docId) => handleDocumentChange(docId, "modifiedFiles", "");

  const validateForm = () => {
    const e = {};
    if (!formData.finalOpinion) e.finalOpinion = "L'approbation est obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmitChecklist = async () => {
    if (!validateForm()) {
      setShowToast({ label: "Veuillez compléter l'approbation finale", isError: true });
      return;
    }
    try {
      await submitInstructionSheet(formData, service, state, !!existingData, existingData);
      setShowToast({
        label: existingData ? "Fiche mise à jour avec succès" : "Fiche enregistrée avec succès",
        isError: false,
      });
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      console.error("Error submitting APE instruction sheet:", err);
      setShowToast({ label: "Erreur lors de la soumission de la fiche", isError: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      {showToast && (
        <Toast label={showToast.label} isError={showToast.isError} onClose={() => setShowToast(null)} />
      )}
      <div className="flex flex-col h-full bg-white" onClick={(e) => e.stopPropagation()}>
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

        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          <GeneralInfoSection
            values={formData.generalInfo}
            onChange={handleGeneralInfoChange}
            isDisabled={isDisabled}
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
          />

          <SignaturesSection
            values={formData.signatures}
            onChange={handleSignatureChange}
            isDisabled={isDisabled}
          />

          <ObservationsSection
            engineerObservations={formData.engineerObservations}
            chefObservations={formData.chefObservations}
            onEngineerChange={(v) => handleInputChange("engineerObservations", v)}
            onChefChange={(v) => handleInputChange("chefObservations", v)}
            isDisabled={isDisabled}
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

APEInstructionSheetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  existingData: PropTypes.object,
};

export default APEInstructionSheetModal;
