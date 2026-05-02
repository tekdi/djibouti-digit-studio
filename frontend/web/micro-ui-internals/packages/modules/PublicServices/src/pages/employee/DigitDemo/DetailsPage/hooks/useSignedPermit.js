import { useState } from "react";
import { getFileUrl } from "../utils/fileUtils";

/**
 * Manages the signed-permit upload/download flow.
 *
 * Storage shape on the application record:
 *   additionalDetails.signedPermit = {
 *     fileStoreId,
 *     fileName,
 *     uploadedAt,
 *     uploadedBy,
 *     uploadedByName,
 *   }
 *
 * The "unsigned" permit is regenerated on the fly from the application data
 * (see PermitPDF). The signed scan is the physical document the employee
 * uploads back into the platform after wet-signing it.
 */
export const useSignedPermit = (serviceCode, applicationNumber, tenantId) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchApplication = async () => {
    const res = await Digit.CustomService.getResponse({
      url: `/public-service/v1/application/${serviceCode}`,
      method: "GET",
      headers: {
        "X-Tenant-Id": tenantId,
        "auth-token": Digit.UserService.getUser()?.access_token,
      },
      params: { applicationNumber, tenantId },
    });
    const app = Array.isArray(res?.Application) ? res.Application[0] : res?.Application;
    if (!app) throw new Error("Application not found");
    return app;
  };

  const uploadSignedPermit = async (file) => {
    if (!file) return;
    const maxSizeMB = 15;
    if (file.size > maxSizeMB * 1024 * 1024) {
      if (Digit.Toast) Digit.Toast.error(`La taille ne doit pas dépasser ${maxSizeMB} MB`);
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("tenantId", tenantId);
      fd.append("module", "DigitStudio");

      const uploadRes = await Digit.CustomService.getResponse({
        url: "/filestore/v1/files",
        method: "POST",
        body: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileStoreId = uploadRes?.files?.[0]?.fileStoreId;
      if (!fileStoreId) throw new Error("Upload failed");

      const user = Digit.UserService.getUser()?.info;
      const signedPermit = {
        fileStoreId,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.uuid || null,
        uploadedByName: user?.name || user?.userName || null,
      };

      const currentApplication = await fetchApplication();

      await Digit.CustomService.getResponse({
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
            ...currentApplication,
            workflow: { ...(currentApplication.workflow || {}), action: "" },
            additionalDetails: {
              ...currentApplication.additionalDetails,
              signedPermit,
            },
          },
        },
      });

      if (Digit.Toast) Digit.Toast.success("Permis signé téléchargé avec succès");
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      console.error("Error uploading signed permit:", e);
      if (Digit.Toast) Digit.Toast.error("Erreur lors du téléchargement du permis signé");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSignedPermit = async (signedPermit) => {
    if (!signedPermit?.fileStoreId) return;
    setIsDownloading(true);
    try {
      const url = await getFileUrl(signedPermit.fileStoreId, tenantId);
      if (!url) {
        if (Digit.Toast) Digit.Toast.error("Impossible de récupérer le permis signé");
        return;
      }
      // Open in a new tab so the user can save from there. We can't force a
      // true download here: S3 doesn't expose CORS (so we can't fetch+blob)
      // and the HTML `download` attribute is ignored for cross-origin URLs.
      // For a one-click download, the backend must serve the file with
      // `Content-Disposition: attachment` (or sign the URL with
      // `response-content-disposition=attachment`).
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Error downloading signed permit:", e);
      if (Digit.Toast) Digit.Toast.error("Erreur lors du téléchargement du permis signé");
    } finally {
      setIsDownloading(false);
    }
  };

  return { isUploading, isDownloading, uploadSignedPermit, downloadSignedPermit };
};
