import { useState, useCallback } from "react";

export const usePCSInstructionSheetAPI = (tenantId, serviceCode, applicationNumber) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitFiche = useCallback(
    async (formData, service, state, isEdit = false, existingData = null) => {
      setIsLoading(true);
      try {
        const currentUser = Digit.UserService.getUser();
        const currentTimestamp = new Date().toISOString();

        const ficheData = isEdit && existingData
          ? {
              ...existingData,
              ...formData,
              lastEditedAt: currentTimestamp,
              lastEditedBy: currentUser?.info?.uuid,
              lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              service,
              state,
            }
          : {
              ...formData,
              submittedAt: currentTimestamp,
              submittedBy: currentUser?.info?.uuid,
              submittedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              lastEditedAt: currentTimestamp,
              lastEditedBy: currentUser?.info?.uuid,
              lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
              service,
              state,
            };

        const getReq = {
          url: `/public-service/v1/application/${serviceCode}`,
          method: "GET",
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": currentUser?.access_token,
          },
          params: { applicationNumber, tenantId },
        };
        const appResp = await Digit.CustomService.getResponse(getReq);
        const currentApplication = Array.isArray(appResp?.Application) ? appResp.Application[0] : appResp?.Application;
        if (!currentApplication) throw new Error("Application not found");

        const updateReq = {
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
              authToken: currentUser?.access_token,
            },
            Application: {
              ...currentApplication,
              workflow: { ...(currentApplication.workflow || {}), action: "" },
              additionalDetails: {
                ...currentApplication.additionalDetails,
                pcsInstructionSheet: ficheData,
              },
            },
          },
        };
        const resp = await Digit.CustomService.getResponse(updateReq);
        const updated = Array.isArray(resp?.Application) ? resp.Application[0] : resp?.Application;
        return updated?.additionalDetails?.pcsInstructionSheet || ficheData;
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
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": Digit.UserService.getUser()?.access_token,
        },
        params: { applicationNumber, tenantId },
      });
      const app = Array.isArray(resp?.Application) ? resp.Application[0] : resp?.Application;
      return app?.additionalDetails?.pcsInstructionSheet || null;
    } catch (e) {
      console.error("Error loading PCS fiche:", e);
      return null;
    }
  }, [tenantId, serviceCode, applicationNumber]);

  const uploadFile = useCallback(async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("tenantId", tenantId);
    fd.append("module", "DigitStudio");
    const resp = await Digit.CustomService.getResponse({
      url: "/filestore/v1/files",
      method: "POST",
      body: fd,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!resp?.files?.[0]?.fileStoreId) throw new Error("Upload failed");
    return {
      fileName: file.name,
      fileStoreId: resp.files[0].fileStoreId,
      documentType: file.type,
      size: file.size,
    };
  }, [tenantId]);

  const getFileUrl = useCallback(async (file) => {
    if (!file?.fileStoreId) return null;
    try {
      const resp = await Digit.CustomService.getResponse({
        url: "/filestore/v1/files/url",
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": Digit.UserService.getUser()?.access_token,
        },
        params: { tenantId, fileStoreIds: file.fileStoreId },
      });
      const url = resp?.[file.fileStoreId];
      if (!url) return null;
      return url.includes(",") ? url.split(",")[0].trim() : url;
    } catch (e) {
      return null;
    }
  }, [tenantId]);

  const downloadFile = useCallback(async (file) => {
    const url = await getFileUrl(file);
    if (url) window.open(url, "_blank");
  }, [getFileUrl]);

  return { isLoading, submitFiche, getFiche, uploadFile, getFileUrl, downloadFile };
};
