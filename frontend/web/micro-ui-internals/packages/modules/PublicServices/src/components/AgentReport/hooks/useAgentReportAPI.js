import { useState, useCallback } from "react";

export const useAgentReportAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitChecklist = useCallback(async (formData, service, state, isEdit = false, existingData = null) => {
    setIsLoading(true);
    
    try {
      // Get current user info
      const currentUser = Digit.UserService.getUser();
      const currentTimestamp = new Date().toISOString();

      // Prepare the checklist data
      let checklistData;
      
      if (isEdit && existingData) {
        // Update existing report - preserve original submission info
        checklistData = {
          ...existingData,
          report: formData.report,
          notes: formData.notes,
          photos: formData.photos,
          lastEditedAt: currentTimestamp,
          lastEditedBy: currentUser?.info?.uuid,
          lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || 'Unknown User',
          service: service,
          state: state
        };
      } else {
        // Create new report
        checklistData = {
          report: formData.report,
          notes: formData.notes,
          photos: formData.photos,
          submittedAt: currentTimestamp,
          submittedBy: currentUser?.info?.uuid,
          submittedByName: currentUser?.info?.name || currentUser?.info?.userName || 'Unknown User',
          lastEditedAt: currentTimestamp,
          lastEditedBy: currentUser?.info?.uuid,
          lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || 'Unknown User',
          service: service,
          state: state
        };
      }

      // First, get the current application data
      const getApplicationRequest = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
        },
        params: {
          applicationNumber,
          tenantId: tenantId,
        },
      };
      
      const applicationResponse = await Digit.CustomService.getResponse(getApplicationRequest);
      const currentApplication = applicationResponse?.Application?.[0];
      
      if (!currentApplication) {
        throw new Error("Application not found");
      }

      console.log("=== DEBUG: Current Application ===");
      console.log("Application Status:", currentApplication.status);
      console.log("Application Workflow:", currentApplication.workflow);
      console.log("Application Business Service:", currentApplication.businessService);
      console.log("Application Module:", currentApplication.module);

      // Update application with checklist data
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
              agentChecklist: checklistData
            }
          }
        }
      };

      await Digit.CustomService.getResponse(updateRequest);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, serviceCode, applicationNumber]);

  const downloadFile = useCallback(async (file) => {
    try {
      if (!file.fileStoreId) {
        throw new Error("File ID not available");
      }

      // Get the file URL from filestore service
      const response = await Digit.CustomService.getResponse({
        url: `/filestore/v1/files/url`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
        },
        params: {
          tenantId: tenantId,
          fileStoreIds: file.fileStoreId,
        },
      });

      if (response && response[file.fileStoreId]) {
        const fileUrl = response[file.fileStoreId];
        
        if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
          // For mobile app - fetch the file and convert to base64
          const fileResponse = await fetch(fileUrl);
          const blob = await fileResponse.blob();
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            var base64data = reader.result;
            window.mSewaApp.downloadBase64File(base64data, file.fileName);
          };
        } else {
          // For web browser - open in new tab or download
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = file.fileName;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      } else {
        throw new Error("File URL not found in response");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Failed to download file");
      }
    }
  }, [tenantId]);

  const getFileUrl = useCallback(async (file) => {
    if (!file.fileStoreId) return null;
    
    try {
      // Get the file URL from filestore service
      const response = await Digit.CustomService.getResponse({
        url: `/filestore/v1/files/url`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
        },
        params: {
          tenantId: tenantId,
          fileStoreIds: file.fileStoreId,
        },
      });

      if (response && response[file.fileStoreId]) {
        const urlString = response[file.fileStoreId];
        
        // If the response contains multiple URLs separated by commas, take the first one
        if (urlString.includes(',')) {
          const urls = urlString.split(',');
          return urls[0].trim(); // Return the first URL (original image)
        }
        
        return urlString; // Return the single URL
      }
      return null;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }, [tenantId]);

  return {
    isLoading,
    submitChecklist,
    downloadFile,
    getFileUrl
  };
}; 