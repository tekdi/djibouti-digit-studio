import React, { useState, useEffect } from "react";
import { LuUpload, LuFileText, LuTrash2, LuX, LuEye, LuDownload, LuUser, LuClock, LuBuilding2 } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { PDFPreview } from "../../../../components/ChecklistCards/Common";

// Mapping des codes de rôles vers les noms complets des directions
const COMMISSIONER_ORGANIZATIONS = {
  "BPA_SDECC_COMM": {
    name: "SDECC",
    fullName: "Sous-Direction Expertise et Contrôle des Constructions",
  },
  "BPA_DGDCF_COMM": {
    name: "DGDCF",
    fullName: "Direction Générale des Domaines et de la Conservation Foncière",
  },
  "BPA_ONEAD_COMM": {
    name: "ONEAD",
    fullName: "Office National des Eaux et de l'Assainissement de Djibouti",
  },
  "BPA_DNPC_COMM": {
    name: "DNPC",
    fullName: "Direction Nationale de la Protection Civile",
  },
  "BPA_EDD_COMM": {
    name: "EDD",
    fullName: "Direction Générale de l'Électricité de Djibouti",
  },
  "BPA_INSPD_COMM": {
    name: "INSPD",
    fullName: "Institut National de la Santé Publique de Djibouti",
  },
};

// ObservationsTab component for commissioners - no fragments used
const ObservationsTab = ({ response, queryStrings }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const serviceCode = queryStrings?.serviceCode;
  const applicationNumber = queryStrings?.applicationNumber;

  // Check if current user is a commissioner (can edit)
  const userDetails = Digit.UserService.getUser();
  const isCommissioner = userDetails?.info?.roles?.some((role) => 
    role.code === "BPA_SDECC_COMM" || 
    role.code === "BPA_DGDCF_COMM" || 
    role.code === "BPA_ONEAD_COMM" || 
    role.code === "BPA_DNPC_COMM" || 
    role.code === "BPA_EDD_COMM" || 
    role.code === "BPA_INSPD_COMM"
  );

  // Get current user's commissioner role code
  const currentUserCommissionerRole = userDetails?.info?.roles?.find((role) => 
    COMMISSIONER_ORGANIZATIONS[role.code]
  )?.code;

  // Get organization info from role code
  const getOrganizationInfo = (roleCode) => {
    return COMMISSIONER_ORGANIZATIONS[roleCode] || { name: "Inconnu", fullName: "Organisation inconnue" };
  };

  const [observations, setObservations] = useState("");
  const [files, setFiles] = useState([]);
  const [fileDescriptions, setFileDescriptions] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState({});

  // Load existing data
  useEffect(() => {
    if (response?.additionalDetails?.commissionerObservations) {
      const data = response.additionalDetails.commissionerObservations;
      
      // Check if it's an array (new format) or object (old format for backward compatibility)
      if (Array.isArray(data)) {
        // New format: array of observations
        // Find current user's observation if they are a commissioner
        if (isCommissioner && currentUserCommissionerRole) {
          const userObservation = data.find(
            (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
          );
          
          if (userObservation) {
            setObservations(userObservation.observations || "");
            
            if (userObservation.files && Array.isArray(userObservation.files)) {
              setFiles(userObservation.files);
              const descriptions = {};
              userObservation.files.forEach((file) => {
                if (file.description) {
                  descriptions[file.fileStoreId] = file.description;
                }
              });
              setFileDescriptions(descriptions);
            }
          }
        }
      } else {
        // Old format: single observation object (backward compatibility)
        setObservations(data.observations || "");
        
        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
          const descriptions = {};
          data.files.forEach((file) => {
            if (file.description) {
              descriptions[file.fileStoreId] = file.description;
            }
          });
          setFileDescriptions(descriptions);
        }
      }
    }
  }, [response, isCommissioner, currentUserCommissionerRole]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const maxSizeMB = 10;
    const newFiles = [];
    const errors = [];

    for (const file of selectedFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: La taille ne doit pas dépasser ${maxSizeMB}MB`);
        continue;
      }

      setUploadingFiles((prev) => ({ ...prev, [file.name]: true }));

      try {
        const uploadResponse = await Digit.UploadServices.Filestorage(
          "DIGIT_DJIBOUTI_FILES",
          file,
          tenantId
        );

        if (uploadResponse?.data?.files?.[0]?.fileStoreId) {
          const fileData = {
            fileStoreId: uploadResponse.data.files[0].fileStoreId,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            description: "",
          };
          newFiles.push(fileData);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        errors.push(`${file.name}: Erreur lors du téléchargement`);
      } finally {
        setUploadingFiles((prev) => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
      }
    }

    if (errors.length > 0) {
      setShowToast({
        label: errors.join(", "),
        isError: true,
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      if (Digit.Toast) {
        Digit.Toast.success(`${newFiles.length} fichier(s) téléchargé(s) avec succès`);
      }
    }

    // Reset file input
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

  const getFileUrl = async (fileStoreId) => {
    if (!fileStoreId) return null;

    try {
      const response = await Digit.CustomService.getResponse({
        url: `/filestore/v1/files/url`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
        },
        params: {
          tenantId: tenantId,
          fileStoreIds: fileStoreId,
        },
      });

      let urlString = null;

      if (response && response[fileStoreId]) {
        urlString = response[fileStoreId];
      } else if (response && response.fileStoreIds && Array.isArray(response.fileStoreIds)) {
        const fileInfo = response.fileStoreIds.find((item) => item.id === fileStoreId);
        if (fileInfo && fileInfo.url) {
          urlString = fileInfo.url;
        }
      }

      if (urlString) {
        if (urlString.includes(",")) {
          const urls = urlString.split(",");
          return urls[0].trim();
        }
        return urlString;
      }

      return null;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  };

  const handlePreviewFile = async (file) => {
    if (!file.fileStoreId) return;
    
    setLoadingFiles((prev) => ({ ...prev, [`preview_${file.fileStoreId}`]: true }));
    
    try {
      const fileUrl = await getFileUrl(file.fileStoreId);
      if (fileUrl) {
        // Check if it's a PDF
        const isPdf = file.fileName.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          setPreviewFile({
            fileStoreId: file.fileStoreId,
            fileUrl,
            fileName: file.fileName,
          });
        } else {
          if (Digit.Toast) {
            Digit.Toast.info("La prévisualisation n'est disponible que pour les fichiers PDF");
          }
        }
      } else {
        if (Digit.Toast) {
          Digit.Toast.error("Impossible de charger le fichier");
        }
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors de la prévisualisation du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`preview_${file.fileStoreId}`]: false }));
    }
  };

  const handleDownloadFile = async (file) => {
    if (!file.fileStoreId) return;
    
    setLoadingFiles((prev) => ({ ...prev, [`download_${file.fileStoreId}`]: true }));
    
    try {
      const fileUrl = await getFileUrl(file.fileStoreId);
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        if (Digit.Toast) {
          Digit.Toast.error("Impossible de télécharger le fichier");
        }
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors du téléchargement du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`download_${file.fileStoreId}`]: false }));
    }
  };

  const isPdfFile = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare files with descriptions
      const filesWithDescriptions = files.map((file) => ({
        ...file,
        description: fileDescriptions[file.fileStoreId] || "",
      }));

      const newObservationEntry = {
        observations,
        files: filesWithDescriptions,
        updatedAt: new Date().toISOString(),
        updatedBy: Digit.UserService.getUser()?.info?.uuid,
        updatedByName: Digit.UserService.getUser()?.info?.name || Digit.UserService.getUser()?.info?.userName || "Utilisateur inconnu",
        updatedByRoleCode: currentUserCommissionerRole || null,
        updatedByOrganization: currentUserCommissionerRole ? getOrganizationInfo(currentUserCommissionerRole) : null,
      };

      // Get current application
      const getRequest = {
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

      const applicationResponse = await Digit.CustomService.getResponse(getRequest);
      const currentApplication = Array.isArray(applicationResponse?.Application)
        ? applicationResponse?.Application?.[0]
        : applicationResponse?.Application;

      if (!currentApplication) {
        throw new Error("Application not found");
      }

      // Get existing observations array or create new one
      const existingObservations = currentApplication.additionalDetails?.commissionerObservations || [];
      let updatedObservationsArray;

      if (Array.isArray(existingObservations)) {
        // Check if current user already has an observation
        const existingIndex = existingObservations.findIndex(
          (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
        );

        if (existingIndex >= 0) {
          // Update existing observation
          updatedObservationsArray = [...existingObservations];
          updatedObservationsArray[existingIndex] = newObservationEntry;
        } else {
          // Add new observation
          updatedObservationsArray = [...existingObservations, newObservationEntry];
        }
      } else {
        // Old format: convert single object to array
        updatedObservationsArray = [existingObservations, newObservationEntry].filter(Boolean);
      }

      // Update application
      const updateRequest = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "PUT",
        headers: {
          "X-Tenant-Id": tenantId,
        },
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
          Application: {
            ...(() => {
              const { workflow, ...applicationWithoutWorkflow } = currentApplication;
              return applicationWithoutWorkflow;
            })(),
            additionalDetails: {
              ...currentApplication.additionalDetails,
              commissionerObservations: updatedObservationsArray,
            },
          },
        },
      };

      await Digit.CustomService.getResponse(updateRequest);

      setShowToast({
        label: "Observations enregistrées avec succès",
        isError: false,
      });

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saving observations:", error);
      setShowToast({
        label: "Erreur lors de l'enregistrement des observations",
        isError: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get observations array
  const observationsDataRaw = response?.additionalDetails?.commissionerObservations;
  let observationsArray = [];
  
  // Convert to array format if needed (backward compatibility)
  if (observationsDataRaw) {
    if (Array.isArray(observationsDataRaw)) {
      observationsArray = observationsDataRaw;
    } else {
      // Old format: single object, convert to array
      observationsArray = [observationsDataRaw];
    }
  }
  
  // Enrich each observation with organization info if missing
  observationsArray = observationsArray.map((obs) => {
    if (obs.updatedByRoleCode && !obs.updatedByOrganization) {
      obs.updatedByOrganization = getOrganizationInfo(obs.updatedByRoleCode);
    }
    return obs;
  });
  
  const hasObservations = observationsArray.length > 0 && observationsArray.some(
    (obs) => obs.observations || (obs.files && obs.files.length > 0)
  );

  // For non-commissioners, show only a beautiful read-only card
  if (!isCommissioner) {
    return (
      <div className="space-y-6">
        {hasObservations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {observationsArray.map((observationData, index) => {
              // Get commissioner name for title
              const commissionerName = observationData.updatedByOrganization 
                ? observationData.updatedByOrganization.fullName 
                : observationData.updatedByName || "Commissaire inconnu";
              
              return (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                {/* Header with Commissioner Info */}
                <div className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5 border-b border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-djibouti-primary/20 rounded-lg">
                      <LuBuilding2 className="h-6 w-6 text-djibouti-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 text-gray-900">
                        {commissionerName}
                      </h2>
                      {observationData.updatedByOrganization && (
                        <p className="text-xs text-gray-600">
                          ({observationData.updatedByOrganization.name})
                        </p>
                      )}
                      {observationData.updatedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <LuClock className="h-3 w-3" />
                          <span>
                            {new Date(observationData.updatedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observations Content */}
                <div className="p-6 space-y-6 flex-1">
                  {/* Observations Text */}
                  {observationData.observations && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <LuFileText className="h-4 w-4 text-djibouti-primary" />
                        Observations
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {observationData.observations}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Files Section */}
                  {observationData.files && observationData.files.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <LuFileText className="h-4 w-4 text-djibouti-primary" />
                        Fichiers partagés ({observationData.files.length})
                      </h3>
                      <div className="space-y-3">
                        {observationData.files.map((file) => (
                      <div
                        key={file.fileStoreId}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-djibouti-primary/30 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-djibouti-primary/10 rounded-lg">
                            <LuFileText className="h-5 w-5 text-djibouti-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.fileName}
                                </p>
                                {file.fileSize && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(file.fileSize / 1024).toFixed(2)} KB
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isPdfFile(file.fileName) && (
                                  <button
                                    onClick={() => handlePreviewFile(file)}
                                    disabled={loadingFiles[`preview_${file.fileStoreId}`]}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Prévisualiser"
                                  >
                                    {loadingFiles[`preview_${file.fileStoreId}`] ? (
                                      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <LuEye className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  disabled={loadingFiles[`download_${file.fileStoreId}`]}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Télécharger"
                                >
                                  {loadingFiles[`download_${file.fileStoreId}`] ? (
                                    <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <LuDownload className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            {file.description && (
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 mb-1">Description :</p>
                                <p className="text-xs text-gray-700">{file.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <LuFileText className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun retour d'avis pour le moment
                </h3>
                <p className="text-sm text-gray-500">
                  Les commissaires n'ont pas encore soumis leurs observations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
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
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`p-4 rounded-lg ${
            showToast.isError
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{showToast.label}</span>
            <button
              onClick={() => setShowToast(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Commissioner Info Card (if current user has existing observation) */}
      {(() => {
        const currentUserObservation = observationsArray.find(
          (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
        );
        
        return currentUserObservation ? (
          <div className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5 rounded-xl p-6 border border-djibouti-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-djibouti-primary/20 rounded-lg">
                <LuBuilding2 className="h-6 w-6 text-djibouti-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Votre observation
                  </h3>
                  {currentUserObservation.updatedByOrganization ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {currentUserObservation.updatedByOrganization.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({currentUserObservation.updatedByOrganization.name})
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {currentUserObservation.updatedByName || "Commissaire inconnu"}
                    </p>
                  )}
                </div>
                {currentUserObservation.updatedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LuClock className="h-4 w-4" />
                    <span>
                      Dernière modification : {new Date(currentUserObservation.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Observations Textarea */}
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

      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Fichiers à téléverser {isCommissioner && "(facultatif)"}
          </label>
        </div>

        {/* File Upload Button - Only for commissioners */}
        {isCommissioner && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-djibouti-primary transition-colors">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-djibouti-primary/10 rounded-full">
                  <LuUpload className="h-6 w-6 text-djibouti-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Cliquez pour téléverser ou glissez-déposez
                </span>
                <span className="text-xs text-gray-500">
                  Formats acceptés : PDF, images, documents (max 10MB par fichier)
                </span>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
          </div>
        )}

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={file.fileStoreId}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-djibouti-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuFileText className="h-5 w-5 text-djibouti-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPdfFile(file.fileName) && (
                          <button
                            onClick={() => handlePreviewFile(file)}
                            disabled={loadingFiles[`preview_${file.fileStoreId}`]}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Prévisualiser"
                          >
                            {loadingFiles[`preview_${file.fileStoreId}`] ? (
                              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <LuEye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadFile(file)}
                          disabled={loadingFiles[`download_${file.fileStoreId}`]}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Télécharger"
                        >
                          {loadingFiles[`download_${file.fileStoreId}`] ? (
                            <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <LuDownload className="h-4 w-4" />
                          )}
                        </button>
                        {isCommissioner && (
                          <button
                            onClick={() => handleRemoveFile(file.fileStoreId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <LuTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description du fichier :
                      </label>
                      {isCommissioner ? (
                        <textarea
                          value={fileDescriptions[file.fileStoreId] || ""}
                          onChange={(e) =>
                            handleDescriptionChange(file.fileStoreId, e.target.value)
                          }
                          placeholder="Ajoutez une description pour ce fichier..."
                          rows="2"
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary transition-all"
                        />
                      ) : (
                        <div className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[60px]">
                          {fileDescriptions[file.fileStoreId] || (
                            <span className="text-gray-400 italic">Aucune description</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploading indicator */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700">
                Téléversement en cours...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Save Button - Only for commissioners */}
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

      {/* Read-only message for non-commissioners */}
      {!isCommissioner && !hasObservations && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <LuEye className="h-8 w-8 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              Mode lecture seule
            </p>
            <p className="text-xs text-blue-700">
              Seuls les commissaires peuvent ajouter ou modifier des observations
            </p>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
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

