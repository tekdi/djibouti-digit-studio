import { useState, useCallback } from "react";

export const usePDInstructionSheetAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitFiche = useCallback(
    async (formData, service, state, isEdit = false, existingData = null) => {
      setIsLoading(true);
      try {
        const currentUser = Digit.UserService.getUser();
        const nowISO = new Date().toISOString();

        const ficheData = isEdit && existingData
          ? {
              ...existingData,
              ...formData,
              lastEditedAt: nowISO,
              lastEditedBy: currentUser?.info?.uuid,
              lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              service,
              state,
            }
          : {
              ...formData,
              submittedAt: nowISO,
              submittedBy: currentUser?.info?.uuid,
              submittedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              lastEditedAt: nowISO,
              lastEditedBy: currentUser?.info?.uuid,
              lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              service,
              state,
            };

        const appResp = await Digit.CustomService.getResponse({
          url: `/public-service/v1/application/${serviceCode}`,
          method: "GET",
          headers: { "X-Tenant-Id": tenantId, "auth-token": currentUser?.access_token },
          params: { applicationNumber, tenantId },
        });
        const currentApplication = Array.isArray(appResp?.Application) ? appResp.Application[0] : appResp?.Application;
        if (!currentApplication) throw new Error("Application not found");

        const resp = await Digit.CustomService.getResponse({
          url: `/public-service/v1/application/${serviceCode}`,
          method: "PUT",
          headers: { "X-Tenant-Id": tenantId },
          body: {
            RequestInfo: {
              apiId: "Rainmaker", ver: "1.0", ts: Date.now(),
              action: "UPDATE", did: "1", key: "",
              msgId: "20170310130900|en_IN", requesterId: "",
              authToken: currentUser?.access_token,
            },
            Application: {
              ...currentApplication,
              workflow: { ...(currentApplication.workflow || {}), action: "" },
              additionalDetails: {
                ...currentApplication.additionalDetails,
                pdInstructionSheet: ficheData,
              },
            },
          },
        });
        const updated = Array.isArray(resp?.Application) ? resp.Application[0] : resp?.Application;
        return updated?.additionalDetails?.pdInstructionSheet || ficheData;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, serviceCode, applicationNumber]
  );

  const getFiche = useCallback(async () => {
    try {
      const resp = await Digit.CustomService.getResponse({
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
        params: { applicationNumber, tenantId },
      });
      const app = Array.isArray(resp?.Application) ? resp.Application[0] : resp?.Application;
      return app?.additionalDetails?.pdInstructionSheet || null;
    } catch (e) { return null; }
  }, [tenantId, serviceCode, applicationNumber]);

  return { isLoading, submitFiche, getFiche };
};
