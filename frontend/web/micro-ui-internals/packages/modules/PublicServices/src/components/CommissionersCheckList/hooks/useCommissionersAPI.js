import { useState, useCallback } from "react";

export const useCommissionersAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitCommissionersChecklist = useCallback(
    async (formData, service, state, isEdit = false, existingData = null) => {
      setIsLoading(true);

      try {
        // Get current user info
        const currentUser = Digit.UserService.getUser();
        const currentTimestamp = new Date().toISOString();

        // Prepare the commissioners checklist data
        let checklistData;

        if (isEdit && existingData) {
          // Update existing checklist - preserve original submission info
          checklistData = {
            ...existingData,
            selectedCommissioners: formData.selectedCommissioners,
            notes: formData.notes,
            lastEditedAt: currentTimestamp,
            lastEditedBy: currentUser?.info?.uuid,
            lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            service: service,
            state: state,
          };
        } else {
          // Create new checklist
          checklistData = {
            selectedCommissioners: formData.selectedCommissioners,
            notes: formData.notes,
            submittedAt: currentTimestamp,
            submittedBy: currentUser?.info?.uuid,
            submittedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            lastEditedAt: currentTimestamp,
            lastEditedBy: currentUser?.info?.uuid,
            lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
            service: service,
            state: state,
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

        // Update application with commissioners checklist data
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
                commissionersChecklist: checklistData,
              },
            },
          },
        };

        const response = await Digit.CustomService.getResponse(updateRequest);
        
        if (response && response.Application && response.Application.length > 0) {
          return checklistData;
        } else {
          throw new Error("Failed to update application with commissioners checklist");
        }
      } catch (error) {
        console.error("Error submitting commissioners checklist:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  const getCommissionersChecklist = useCallback(
    async () => {
      try {
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

        if (currentApplication && currentApplication.additionalDetails?.commissionersChecklist) {
          return currentApplication.additionalDetails.commissionersChecklist;
        }

        return null;
      } catch (error) {
        console.error("Error getting commissioners checklist:", error);
        return null;
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  return {
    isLoading,
    submitCommissionersChecklist,
    getCommissionersChecklist,
  };
};
