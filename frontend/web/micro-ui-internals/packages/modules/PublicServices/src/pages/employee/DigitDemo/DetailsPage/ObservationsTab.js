import React, { useState, useEffect } from "react";
import { LuFileText } from "react-icons/lu";
import { PDFPreview } from "../../../../components/ChecklistCards/Common";
import { checkIfCommissioner, getCurrentUserCommissionerRole, getOrganizationInfo, COMMISSIONER_ORGANIZATIONS } from "./utils/commissionerUtils";
import { useObservations } from "./hooks/useObservations";
import { useFileOperations } from "./hooks/useFileOperations";
import { useSaveObservations } from "./hooks/useSaveObservations";
import CommissionerInfoCard from "./components/CommissionerInfoCard";
import ObservationCard from "./components/ObservationCard";
import ObservationsDisplay from "./components/ObservationsDisplay";
import FileList from "./components/FileList";
import FileUploadZone from "./components/FileUploadZone";
import EmptyState from "./components/EmptyState";
import ToastNotification from "./components/ToastNotification";

// Map of workflow actions to verdict labels.
// These are the actions a commissioner can perform in a parallel workflow.
const VERDICT_ACTIONS = {
  CONFORM_APPLICATION: { verdict: "CONFORME", label: "Avis Favorable", color: "emerald" },
  APPROVE: { verdict: "CONFORME", label: "Avis Favorable", color: "emerald" },
  APPROVE_APPLICATION: { verdict: "CONFORME", label: "Avis Favorable", color: "emerald" },
  NON_CONFORM: { verdict: "NON_CONFORME", label: "Avis Défavorable", color: "red" },
  NON_CONFORM_APPLICATION: { verdict: "NON_CONFORME", label: "Avis Défavorable", color: "red" },
  REJECT_APPLICATION: { verdict: "NON_CONFORME", label: "Avis Défavorable", color: "red" },
  REJECT: { verdict: "NON_CONFORME", label: "Avis Défavorable", color: "red" },
};

// Commissioner role codes. Kept in sync with COMMISSIONER_ORGANIZATIONS in
// utils/commissionerUtils.js — missing any one here silently drops that
// commissioner's avis from the Avis tab (regression: BPA_DNPC_COMM was
// missing and DNPC's CONFORM_APPLICATION never got mapped to a verdict,
// so the card stayed "En attente" even after the avis was given).
const COMMISSIONER_ROLE_CODES = new Set(Object.keys(COMMISSIONER_ORGANIZATIONS));

/**
 * Given the two workflow detail objects, build a map:
 *   { [roleCode]: { verdict, label, color, timestamp, comment } }
 * by scanning all known process instance / timeline entries.
 */
const buildVerdictsByRole = (timelineWorkflowDetails, workflowDetails, responseProcessInstance) => {
  const verdicts = {};

  const collect = (entry) => {
    if (!entry) return;
    const action = entry.performedAction || entry.action;
    const verdictDef = VERDICT_ACTIONS[action];
    if (!verdictDef) return;

    const assignerRoles = entry?.assigner?.roles || [];
    const commissionerRole = assignerRoles.find((r) => COMMISSIONER_ROLE_CODES.has(r?.code));
    if (!commissionerRole) return;

    const existing = verdicts[commissionerRole.code];
    const timestamp =
      entry?.auditDetails?.lastModifiedEpoch ||
      entry?.auditDetails?.lastModifiedTime ||
      entry?.auditDetails?.createdTime ||
      0;

    // Keep the most recent verdict for each role
    if (!existing || timestamp >= (existing.timestamp || 0)) {
      verdicts[commissionerRole.code] = {
        verdict: verdictDef.verdict,
        label: verdictDef.label,
        color: verdictDef.color,
        timestamp,
        comment: entry?.comment || "",
      };
    }
  };

  const sources = [
    timelineWorkflowDetails?.timeline,
    timelineWorkflowDetails?.processInstances,
    workflowDetails?.timeline,
    workflowDetails?.processInstances,
    Array.isArray(responseProcessInstance) ? responseProcessInstance : null,
  ];

  sources.forEach((list) => {
    if (Array.isArray(list)) list.forEach(collect);
  });

  return verdicts;
};

const ObservationsTab = ({ response, queryStrings, timelineWorkflowDetails, workflowDetails }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const serviceCode = queryStrings?.serviceCode;
  const applicationNumber = queryStrings?.applicationNumber;

  // Fetch the FULL process-instance history for this business id across every
  // business-service (main + parallel commissioner sub-workflows). The shared
  // timelineWorkflowDetails prop is scoped to the main BPA service and misses
  // the CONFORM_APPLICATION rows that live in BPA_PCO_DGDCF / BPA_PCO_DNPC /
  // etc, which is why commissioner avis + comments weren't surfacing here.
  const [parallelProcessInstances, setParallelProcessInstances] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      if (!applicationNumber) return;
      try {
        const resp = await Digit.CustomService.getResponse({
          url: "/egov-workflow-v2/egov-wf/process/_search",
          method: "POST",
          params: {
            tenantId,
            businessIds: applicationNumber,
            history: true,
          },
          body: {
            RequestInfo: {
              apiId: "Rainmaker",
              authToken: Digit.UserService.getUser()?.access_token,
            },
          },
        });
        if (!cancelled) {
          setParallelProcessInstances(Array.isArray(resp?.ProcessInstances) ? resp.ProcessInstances : []);
        }
      } catch (e) {
        console.error("Failed to load full workflow timeline for commissioner avis:", e);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [applicationNumber, tenantId]);

  const userDetails = Digit.UserService.getUser();
  const isCommissioner = checkIfCommissioner(userDetails);
  const currentUserCommissionerRole = getCurrentUserCommissionerRole(userDetails);

  const {
    observations,
    setObservations,
    files,
    setFiles,
    fileDescriptions,
    setFileDescriptions,
  } = useObservations(response, isCommissioner, currentUserCommissionerRole);

  const [uploadingFiles, setUploadingFiles] = useState({});

  const {
    previewFile,
    setPreviewFile,
    loadingFiles,
    handlePreviewFile,
    handleDownloadFile,
    handleFileUpload: handleFileUploadOperation,
  } = useFileOperations(tenantId);

  const {
    isSaving,
    showToast,
    setShowToast,
    saveObservations,
  } = useSaveObservations(serviceCode, applicationNumber, tenantId, currentUserCommissionerRole);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const { errors, newFiles } = await handleFileUploadOperation(
      selectedFiles,
      setFiles,
      setUploadingFiles
    );

    if (errors.length > 0) {
      setShowToast({
        label: errors.join(", "),
        isError: true,
      });
    }

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

  const handleSave = async () => {
    await saveObservations(observations, files, fileDescriptions);
  };

  // Get observations array
  const observationsDataRaw = response?.additionalDetails?.commissionerObservations;
  let observationsArray = [];
  
  if (observationsDataRaw) {
    if (Array.isArray(observationsDataRaw)) {
      observationsArray = observationsDataRaw;
    } else {
      observationsArray = [observationsDataRaw];
    }
  }
  
  observationsArray = observationsArray.map((obs) => {
    if (obs.updatedByRoleCode && !obs.updatedByOrganization) {
      obs.updatedByOrganization = getOrganizationInfo(obs.updatedByRoleCode);
    }
    return obs;
  });
  
  const hasObservations = observationsArray.length > 0 && observationsArray.some(
    (obs) => obs.observations || (obs.files && obs.files.length > 0)
  );

  // Build commissioner verdict map (CONFORME / NON_CONFORME) from workflow
  // history. Also include the cross-service parallelProcessInstances list so
  // that CONFORM_APPLICATION / NON_CONFORM_APPLICATION rows from each
  // commissioner sub-workflow (BPA_PCO_DGDCF, BPA_PCO_DNPC, …) are counted.
  const verdictsByRole = buildVerdictsByRole(
    { ...(timelineWorkflowDetails || {}), processInstances: parallelProcessInstances.length
        ? [...(timelineWorkflowDetails?.processInstances || []), ...parallelProcessInstances]
        : timelineWorkflowDetails?.processInstances },
    workflowDetails,
    response?.processInstance
  );

  // Build one card per commissioner this application was sent to.
  // Cards show status = PENDING / FAVORABLE / DEFAVORABLE even when the commissioner
  // has not added an observation or files. This gives a quick at-a-glance view.
  // selectedCommissioners is a list of short names ("SDECC", "DGDCF", ...), which we
  // map to the role code ("BPA_SDECC_COMM", ...).
  const selectedCommissioners =
    response?.additionalDetails?.commissionersChecklist?.selectedCommissioners || [];
  const shortNameToRoleCode = Object.entries(COMMISSIONER_ORGANIZATIONS).reduce((acc, [roleCode, org]) => {
    acc[org.name] = roleCode;
    return acc;
  }, {});
  const selectedRoleCodes = selectedCommissioners
    .map((shortName) => shortNameToRoleCode[shortName])
    .filter(Boolean);
  // Also include any role that already has an observation or verdict, in case the
  // selectedCommissioners list is out of date.
  observationsArray.forEach((obs) => {
    if (obs.updatedByRoleCode && !selectedRoleCodes.includes(obs.updatedByRoleCode)) {
      selectedRoleCodes.push(obs.updatedByRoleCode);
    }
  });
  Object.keys(verdictsByRole).forEach((roleCode) => {
    if (!selectedRoleCodes.includes(roleCode)) selectedRoleCodes.push(roleCode);
  });

  const cardsForAllCommissioners = selectedRoleCodes.map((roleCode) => {
    const org = getOrganizationInfo(roleCode);
    const observation = observationsArray.find((o) => o.updatedByRoleCode === roleCode);
    return {
      roleCode,
      observationData: observation || {
        updatedByRoleCode: roleCode,
        updatedByOrganization: org,
        updatedByName: org.fullName,
        observations: "",
        files: [],
      },
      verdict: verdictsByRole[roleCode],
    };
  });

  // For non-commissioners, show only read-only view — but always render a card for
  // every selected commissioner so the reviewer can see the overall state.
  if (!isCommissioner) {
    return (
      <div className="space-y-6">
        {cardsForAllCommissioners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cardsForAllCommissioners.map(({ roleCode, observationData, verdict }) => (
              <ObservationCard
                key={roleCode}
                observationData={observationData}
                verdict={verdict}
                onPreview={handlePreviewFile}
                onDownload={handleDownloadFile}
                loadingFiles={loadingFiles}
              />
            ))}
          </div>
        ) : (
          <EmptyState isReadOnly={true} />
        )}

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
  const currentUserObservation = observationsArray.find(
    (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
  );

  return (
    <div className="space-y-6">
      <ToastNotification toast={showToast} onClose={() => setShowToast(null)} />

      {currentUserObservation && (
        <CommissionerInfoCard
          observationData={currentUserObservation}
          verdict={verdictsByRole[currentUserObservation.updatedByRoleCode]}
          isCurrentUser={true}
        />
      )}

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

      <FileUploadZone
        onFileUpload={handleFileUpload}
        isUploading={uploadingFiles}
      />

      <FileList
        files={files}
        fileDescriptions={fileDescriptions}
        onDescriptionChange={handleDescriptionChange}
        onPreview={handlePreviewFile}
        onDownload={handleDownloadFile}
        onRemove={handleRemoveFile}
        loadingFiles={loadingFiles}
        isEditable={true}
      />

      {!isCommissioner && !hasObservations && (
        <EmptyState isReadOnly={false} />
      )}

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
