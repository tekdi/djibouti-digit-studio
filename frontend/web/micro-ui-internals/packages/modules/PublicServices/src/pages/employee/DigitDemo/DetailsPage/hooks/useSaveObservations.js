import { useState } from "react";
import { getOrganizationInfo } from "../utils/commissionerUtils";

export const useSaveObservations = (
  serviceCode,
  applicationNumber,
  tenantId,
  currentUserCommissionerRole
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const saveObservations = async (observations, files, fileDescriptions) => {
    setIsSaving(true);

    try {
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

      const existingObservations = currentApplication.additionalDetails?.commissionerObservations || [];
      let updatedObservationsArray;

      if (Array.isArray(existingObservations)) {
        const existingIndex = existingObservations.findIndex(
          (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
        );

        if (existingIndex >= 0) {
          updatedObservationsArray = [...existingObservations];
          updatedObservationsArray[existingIndex] = newObservationEntry;
        } else {
          updatedObservationsArray = [...existingObservations, newObservationEntry];
        }
      } else {
        updatedObservationsArray = [existingObservations, newObservationEntry].filter(Boolean);
      }

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

  return {
    isSaving,
    showToast,
    setShowToast,
    saveObservations,
  };
};

