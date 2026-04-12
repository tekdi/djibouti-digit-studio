import { useState, useCallback } from "react";

export const useInstructionSheetAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitInstructionSheet = useCallback(
    async (formData, service, state, isEdit = false, existingData = null) => {
      setIsLoading(true);

      try {
        // Get current user info
        const currentUser = Digit.UserService.getUser();
        const currentTimestamp = new Date().toISOString();

        // Prepare the instruction sheet data
        let instructionSheetData;

        // Create history entry
        const historyEntry = {
          timestamp: currentTimestamp,
          editedBy: currentUser?.info?.uuid,
          editedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
          changes: {
            finalOpinion: formData.finalOpinion,
            finalComments: formData.finalComments,
          },
        };

        if (isEdit && existingData) {
          // Update existing sheet - preserve original submission info and add to history
          const existingHistory = existingData.history || [];
          instructionSheetData = {
            ...existingData,
            applicantName: formData.applicantName,
            projectType: formData.projectType,
            plotLocation: formData.plotLocation,
            documents: formData.documents,
            conformity: formData.conformity,
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
          // Create new sheet
          instructionSheetData = {
            applicantName: formData.applicantName,
            projectType: formData.projectType,
            plotLocation: formData.plotLocation,
            documents: formData.documents,
            conformity: formData.conformity,
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

        // First, get the current application data
        const getApplicationRequest = {
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

        const applicationResponse = await Digit.CustomService.getResponse(getApplicationRequest);
        const currentApplication = Array.isArray(applicationResponse?.Application)
          ? applicationResponse?.Application?.[0]
          : applicationResponse?.Application;

        if (!currentApplication) {
          throw new Error("Application not found");
        }

        // Update application with instruction sheet data
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
              ...currentApplication,
              workflow: { ...(currentApplication.workflow || {}), action: "" },
              additionalDetails: {
                ...currentApplication.additionalDetails,
                instructionSheet: instructionSheetData,
              },
            },
          },
        };

        const response = await Digit.CustomService.getResponse(updateRequest);

        const updatedApplication = Array.isArray(response?.Application)
          ? response?.Application?.[0]
          : response?.Application;

        if (updatedApplication) {
          // prefer echo from backend if it returns additionalDetails
          const echoed = updatedApplication?.additionalDetails?.instructionSheet;
          return echoed || instructionSheetData;
        }
        throw new Error("Failed to update application with instruction sheet");
      } catch (error) {
        console.error("Error submitting instruction sheet:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  const getInstructionSheet = useCallback(
    async () => {
      try {
        const getApplicationRequest = {
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

        const applicationResponse = await Digit.CustomService.getResponse(getApplicationRequest);
        const currentApplication = Array.isArray(applicationResponse?.Application)
          ? applicationResponse?.Application?.[0]
          : applicationResponse?.Application;

        if (currentApplication && currentApplication.additionalDetails?.instructionSheet) {
          return currentApplication.additionalDetails.instructionSheet;
        }

        return null;
      } catch (error) {
        console.error("Error getting instruction sheet:", error);
        return null;
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  const getFileUrl = useCallback(
    async (fileStoreId) => {
      if (!fileStoreId) return null;

      try {
        // Get the file URL from filestore service
        const response = await Digit.CustomService.getResponse({
          url: `/filestore/v1/files/url`,
          method: "GET",
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": Digit.UserService.getUser()?.access_token,
          },
          params: {
            tenantId: tenantId,
            fileStoreIds: fileStoreId,
          },
        });

        console.log("File URL response:", response);

        // The response can be either:
        // 1. Direct map: { fileStoreId: "url" }
        // 2. Or wrapped in fileStoreIds array: { fileStoreIds: [{ id: "fileStoreId", url: "url" }] }
        
        let urlString = null;

        // Try direct access first
        if (response && response[fileStoreId]) {
          urlString = response[fileStoreId];
        }
        // Try fileStoreIds array
        else if (response && response.fileStoreIds && Array.isArray(response.fileStoreIds)) {
          const fileInfo = response.fileStoreIds.find((item) => item.id === fileStoreId);
          if (fileInfo && fileInfo.url) {
            urlString = fileInfo.url;
          }
        }

        if (urlString) {
          // If the response contains multiple URLs separated by commas, take the first one
          if (urlString.includes(",")) {
            const urls = urlString.split(",");
            return urls[0].trim(); // Return the first URL (original file)
          }

          return urlString; // Return the single URL
        }

        console.warn("File URL not found in response for fileStoreId:", fileStoreId);
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

