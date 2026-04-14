import { useState } from "react";

/**
 * Save an employee comment entry to application.additionalDetails.employeeComments.
 *
 * Storage shape:
 *   additionalDetails.employeeComments: [
 *     {
 *       comment,
 *       files: [{ fileStoreId, fileName, description, ... }],
 *       updatedAt,
 *       updatedBy,           // user uuid
 *       updatedByName,
 *       updatedByRoleCode,   // primary employee role (e.g. BPA_HOD, BPA_DIRECTOR)
 *       updatedByRoleLabel,  // human-friendly role label
 *     }
 *   ]
 *
 * Each entry is keyed by `updatedBy` (user uuid), so one entry per employee.
 * Re-saving by the same user replaces their existing entry.
 */
export const useSaveEmployeeComments = (serviceCode, applicationNumber, tenantId) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const saveComment = async (comment, files, fileDescriptions, roleCode, roleLabel) => {
    setIsSaving(true);
    try {
      const user = Digit.UserService.getUser()?.info;
      const filesWithDescriptions = files.map((f) => ({
        ...f,
        description: fileDescriptions[f.fileStoreId] || "",
      }));

      const newEntry = {
        comment,
        files: filesWithDescriptions,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uuid,
        updatedByName: user?.name || user?.userName || "Utilisateur inconnu",
        updatedByRoleCode: roleCode || null,
        updatedByRoleLabel: roleLabel || null,
      };

      const getRequest = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": Digit.UserService.getUser()?.access_token,
        },
        params: { applicationNumber, tenantId },
      };

      const applicationResponse = await Digit.CustomService.getResponse(getRequest);
      const currentApplication = Array.isArray(applicationResponse?.Application)
        ? applicationResponse?.Application?.[0]
        : applicationResponse?.Application;

      if (!currentApplication) throw new Error("Application not found");

      const existing = currentApplication.additionalDetails?.employeeComments || [];
      const existingArray = Array.isArray(existing) ? existing : [existing].filter(Boolean);

      const idx = existingArray.findIndex((c) => c.updatedBy === user?.uuid);
      let updated;
      if (idx >= 0) {
        updated = [...existingArray];
        updated[idx] = newEntry;
      } else {
        updated = [...existingArray, newEntry];
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
            ...currentApplication,
            workflow: { ...(currentApplication.workflow || {}), action: "" },
            additionalDetails: {
              ...currentApplication.additionalDetails,
              employeeComments: updated,
            },
          },
        },
      };

      await Digit.CustomService.getResponse(updateRequest);

      setShowToast({ label: "Commentaire enregistré avec succès", isError: false });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error("Error saving employee comment:", e);
      setShowToast({ label: "Erreur lors de l'enregistrement du commentaire", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteComment = async (entryUuid) => {
    setIsSaving(true);
    try {
      const getRequest = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": Digit.UserService.getUser()?.access_token,
        },
        params: { applicationNumber, tenantId },
      };
      const applicationResponse = await Digit.CustomService.getResponse(getRequest);
      const currentApplication = Array.isArray(applicationResponse?.Application)
        ? applicationResponse?.Application?.[0]
        : applicationResponse?.Application;
      if (!currentApplication) throw new Error("Application not found");

      const existing = currentApplication.additionalDetails?.employeeComments || [];
      const existingArray = Array.isArray(existing) ? existing : [existing].filter(Boolean);
      const updated = existingArray.filter((c) => c.updatedBy !== entryUuid);

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
            ...currentApplication,
            workflow: { ...(currentApplication.workflow || {}), action: "" },
            additionalDetails: {
              ...currentApplication.additionalDetails,
              employeeComments: updated,
            },
          },
        },
      };
      await Digit.CustomService.getResponse(updateRequest);
      setShowToast({ label: "Commentaire supprimé", isError: false });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error("Error deleting employee comment:", e);
      setShowToast({ label: "Erreur lors de la suppression", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, showToast, setShowToast, saveComment, deleteComment };
};
