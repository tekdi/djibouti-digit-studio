import { useState, useCallback } from "react";

export const useAPEInstructionSheetAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitInstructionSheet = useCallback(
    async (formData, service, state, isEdit = false, existingData = null) => {
      setIsLoading(true);

      try {
        const currentUser = Digit.UserService.getUser();
        const currentTimestamp = new Date().toISOString();

        let instructionSheetData;

        const historyEntry = {
          timestamp: currentTimestamp,
          editedBy: currentUser?.info?.uuid,
          editedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
          changes: {
            documents: formData.documents,
            finalComments: formData.finalComments,
            finalOpinion: formData.finalOpinion,
          },
        };

        if (isEdit && existingData) {
          const existingHistory = existingData.history || [];
          instructionSheetData = {
            ...existingData,
            documents: formData.documents,
            finalComments: formData.finalComments,
            finalOpinion: formData.finalOpinion,
            lastEditedAt: currentTimestamp,
            lastEditedBy: currentUser?.info?.uuid,
            lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            service: service,
            state: state,
            history: [...existingHistory, historyEntry],
          };
        } else {
          instructionSheetData = {
            documents: formData.documents,
            finalComments: formData.finalComments,
            finalOpinion: formData.finalOpinion,
            submittedAt: currentTimestamp,
            submittedBy: currentUser?.info?.uuid,
            submittedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            lastEditedAt: currentTimestamp,
            lastEditedBy: currentUser?.info?.uuid,
            lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            service: service,
            state: state,
            action: "SUBMIT",
            history: [historyEntry],
          };
        }

        const getApplicationRequest = {
          url: `/public-service/v1/application/${serviceCode}`,
          method: "GET",
          headers: { "X-Tenant-Id": tenantId },
          params: { applicationNumber, tenantId },
        };

        const applicationResponse = await Digit.CustomService.getResponse(getApplicationRequest);
        const currentApplication = Array.isArray(applicationResponse?.Application)
          ? applicationResponse?.Application?.[0]
          : applicationResponse?.Application;

        if (!currentApplication) {
          throw new Error("Application not found");
        }

        const updateRequest = {
          url: `/public-service/v1/application/${serviceCode}`,
          method: "PUT",
          headers: { "X-Tenant-Id": tenantId },
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
                apeInstructionSheet: instructionSheetData,
              },
            },
          },
        };

        const response = await Digit.CustomService.getResponse(updateRequest);
        const updatedApplication = Array.isArray(response?.Application)
          ? response?.Application?.[0]
          : response?.Application;

        if (updatedApplication) {
          const echoed = updatedApplication?.additionalDetails?.apeInstructionSheet;
          return echoed || instructionSheetData;
        }
        throw new Error("Failed to update application with APE instruction sheet");
      } catch (error) {
        console.error("Error submitting APE instruction sheet:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  const getInstructionSheet = useCallback(async () => {
    try {
      const getApplicationRequest = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: { "X-Tenant-Id": tenantId },
        params: { applicationNumber, tenantId },
      };

      const applicationResponse = await Digit.CustomService.getResponse(getApplicationRequest);
      const currentApplication = Array.isArray(applicationResponse?.Application)
        ? applicationResponse?.Application?.[0]
        : applicationResponse?.Application;

      if (currentApplication && currentApplication.additionalDetails?.apeInstructionSheet) {
        return currentApplication.additionalDetails.apeInstructionSheet;
      }
      return null;
    } catch (error) {
      console.error("Error getting APE instruction sheet:", error);
      return null;
    }
  }, [tenantId, serviceCode, applicationNumber]);

  const getFileUrl = useCallback(
    async (fileStoreId) => {
      if (!fileStoreId) return null;
      try {
        const response = await Digit.CustomService.getResponse({
          url: `/filestore/v1/files/url`,
          method: "GET",
          headers: { "X-Tenant-Id": tenantId },
          params: { tenantId, fileStoreIds: fileStoreId },
        });

        let urlString = null;
        if (response && response[fileStoreId]) {
          urlString = response[fileStoreId];
        } else if (response && Array.isArray(response.fileStoreIds)) {
          const fileInfo = response.fileStoreIds.find((item) => item.id === fileStoreId);
          if (fileInfo && fileInfo.url) urlString = fileInfo.url;
        }

        if (urlString) {
          if (urlString.includes(",")) return urlString.split(",")[0].trim();
          return urlString;
        }
        return null;
      } catch (error) {
        console.error("Error getting file URL:", error);
        return null;
      }
    },
    [tenantId]
  );

  const downloadFile = useCallback(
    async (fileStoreId) => {
      if (!fileStoreId) return;
      try {
        const fileUrl = await getFileUrl(fileStoreId);
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        } else if (Digit.Toast) {
          Digit.Toast.error("Impossible de télécharger le fichier");
        }
      } catch (error) {
        console.error("Error downloading file:", error);
        if (Digit.Toast) {
          Digit.Toast.error("Erreur lors du téléchargement du fichier");
        }
      }
    },
    [getFileUrl]
  );

  return {
    isLoading,
    submitInstructionSheet,
    getInstructionSheet,
    getFileUrl,
    downloadFile,
  };
};
