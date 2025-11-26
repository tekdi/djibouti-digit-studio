import React, { useState } from "react";
import { LuFileText } from "react-icons/lu";
import { PDFPreview } from "../../../../components/ChecklistCards/Common";
import { checkIfCommissioner, getCurrentUserCommissionerRole, getOrganizationInfo } from "./utils/commissionerUtils";
import { useObservations } from "./hooks/useObservations";
import { useFileOperations } from "./hooks/useFileOperations";
import { useSaveObservations } from "./hooks/useSaveObservations";
import CommissionerInfoCard from "./components/CommissionerInfoCard";
import ObservationCard from "./components/ObservationCard";
import ObservationsDisplay from "./components/ObservationsDisplay";
import FileList from "./components/FileList";
import FileUploadZone from "./components/FileUploadZone";
import EmptyState from "./components/EmptyState";
import ToastNotification from "./components/ToastNotification";

const ObservationsTab = ({ response, queryStrings }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const serviceCode = queryStrings?.serviceCode;
  const applicationNumber = queryStrings?.applicationNumber;

  const userDetails = Digit.UserService.getUser();
  const isCommissioner = checkIfCommissioner(userDetails);
  const currentUserCommissionerRole = getCurrentUserCommissionerRole(userDetails);

  const {
    observations,
    setObservations,
    files,
    setFiles,
    fileDescriptions,
    setFileDescriptions,
  } = useObservations(response, isCommissioner, currentUserCommissionerRole);

  const [uploadingFiles, setUploadingFiles] = useState({});

  const {
    previewFile,
    setPreviewFile,
    loadingFiles,
    handlePreviewFile,
    handleDownloadFile,
    handleFileUpload: handleFileUploadOperation,
  } = useFileOperations(tenantId);

  const {
    isSaving,
    showToast,
    setShowToast,
    saveObservations,
  } = useSaveObservations(serviceCode, applicationNumber, tenantId, currentUserCommissionerRole);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const { errors, newFiles } = await handleFileUploadOperation(
      selectedFiles,
      setFiles,
      setUploadingFiles
    );

    if (errors.length > 0) {
      setShowToast({
        label: errors.join(", "),
        isError: true,
      });
    }

    e.target.value = "";
  };

  const handleRemoveFile = (fileStoreId) => {
    setFiles((prev) => prev.filter((f) => f.fileStoreId !== fileStoreId));
    setFileDescriptions((prev) => {
      const updated = { ...prev };
      delete updated[fileStoreId];
      return updated;
    });
  };

  const handleDescriptionChange = (fileStoreId, description) => {
    setFileDescriptions((prev) => ({
      ...prev,
      [fileStoreId]: description,
    }));
  };

  const handleSave = async () => {
    await saveObservations(observations, files, fileDescriptions);
  };

  // Get observations array
  const observationsDataRaw = response?.additionalDetails?.commissionerObservations;
  let observationsArray = [];
  
  if (observationsDataRaw) {
    if (Array.isArray(observationsDataRaw)) {
      observationsArray = observationsDataRaw;
    } else {
      observationsArray = [observationsDataRaw];
    }
  }
  
  observationsArray = observationsArray.map((obs) => {
    if (obs.updatedByRoleCode && !obs.updatedByOrganization) {
      obs.updatedByOrganization = getOrganizationInfo(obs.updatedByRoleCode);
    }
    return obs;
  });
  
  const hasObservations = observationsArray.length > 0 && observationsArray.some(
    (obs) => obs.observations || (obs.files && obs.files.length > 0)
  );

  // For non-commissioners, show only read-only view
  if (!isCommissioner) {
    return (
      <div className="space-y-6">
        {hasObservations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {observationsArray.map((observationData, index) => (
              <ObservationCard
                key={index}
                observationData={observationData}
                onPreview={handlePreviewFile}
                onDownload={handleDownloadFile}
                loadingFiles={loadingFiles}
              />
            ))}
          </div>
        ) : (
          <EmptyState isReadOnly={true} />
        )}

        {previewFile && (
          <PDFPreview
            fileUrl={previewFile.fileUrl}
            fileName={previewFile.fileName}
            onClose={() => setPreviewFile(null)}
            onDownload={() => handleDownloadFile({ fileStoreId: previewFile.fileStoreId, fileName: previewFile.fileName })}
          />
        )}
      </div>
    );
  }

  // For commissioners, show the full editable interface
  const currentUserObservation = observationsArray.find(
    (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
  );

  return (
    <div className="space-y-6">
      <ToastNotification toast={showToast} onClose={() => setShowToast(null)} />

      {currentUserObservation && (
        <CommissionerInfoCard observationData={currentUserObservation} isCurrentUser={true} />
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Observations *
        </label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Saisissez vos observations..."
          rows="8"
          className="w-full p-4 border border-gray-300 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary transition-all"
        />
      </div>

      <FileUploadZone
        onFileUpload={handleFileUpload}
        isUploading={uploadingFiles}
      />

      <FileList
        files={files}
        fileDescriptions={fileDescriptions}
        onDescriptionChange={handleDescriptionChange}
        onPreview={handlePreviewFile}
        onDownload={handleDownloadFile}
        onRemove={handleRemoveFile}
        loadingFiles={loadingFiles}
        isEditable={true}
      />

      {!isCommissioner && !hasObservations && (
        <EmptyState isReadOnly={false} />
      )}

      {isCommissioner && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving || !observations.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-djibouti-primary text-white rounded-xl font-semibold hover:bg-djibouti-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LuFileText className="h-4 w-4" />
                Enregistrer les observations
              </span>
            )}
          </button>
        </div>
      )}

      {previewFile && (
        <PDFPreview
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownloadFile({ fileStoreId: previewFile.fileStoreId, fileName: previewFile.fileName })}
        />
      )}
    </div>
  );
};

export default ObservationsTab;
