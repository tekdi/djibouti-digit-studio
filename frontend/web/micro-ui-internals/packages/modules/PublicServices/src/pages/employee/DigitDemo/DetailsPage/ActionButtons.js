import React, { useRef, useState } from "react";
import { LuDownload, LuUpload, LuFileCheck2 } from "react-icons/lu";
import WorkflowActions from "../../../../components/WorkflowActions";
import { PermitPDFTemplate, generatePermitPDF } from "../../../../components/PermitPDF";
import { useSignedPermit } from "./hooks/useSignedPermit";

const PERMIT_LABELS = {
  BPA_PCO: "Permis de Construire",
  BPA_PCO_SIMPLE: "Permis de Construire",
  BPA_PR: "Permis de Remblai",
  BPA_PL: "Permis de Lotir",
  BPA_PCS: "Permis de Construire Simplifié",
  BPA_PD: "Permis de Démolir",
  BPA_PF: "Permis de Clôture",
  BPA_PS: "Permis de Surélévation",
  BPA_ATARR: "Autorisation de Travaux",
  BPA_CCR: "Certificat de Conformité de Remblai",
  BPA_CCE: "Certificat de Conformité Électrique",
  BPA_CCP: "Certificat de Conformité Parasismique",
  BPA_CCG: "Certificat de Conformité Général",
  BPA_PV: "Procès-Verbal d'Implantation",
  BPA_APE: "Approbation du Plan d'Exécution",
};

const ActionButtons = ({
  isCitizen,
  selectedBusinessService,
  matchedBusinessServices,
  setSelectedBusinessService,
  response,
  queryStrings,
  tenantId,
  serviceConfig,
  processInstanceState,
  isDownloadButtonEnable,
  service
}) => {
  const pdfRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showPdfTemplate, setShowPdfTemplate] = useState(false);

  const { isUploading, isDownloading, uploadSignedPermit, downloadSignedPermit } = useSignedPermit(
    queryStrings?.serviceCode,
    response?.applicationNumber,
    tenantId
  );

  const handlePdfDownload = async () => {
    setShowPdfTemplate(true);
    setTimeout(async () => {
      await generatePermitPDF(
        pdfRef,
        `permis-${response?.applicationNumber || "document"}.pdf`
      );
      setShowPdfTemplate(false);
    }, 500);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadSignedPermit(file);
    e.target.value = "";
  };

  const effectiveBusinessService = queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices?.[0]?.code;
  const isActionsDisabled = !effectiveBusinessService;

  const isPermitGranted = processInstanceState === "PERMIT_GRANTED" || processInstanceState === "CERTIFICATE_GRANTED" || processInstanceState === "CERTIFICATE_ISSUED" || processInstanceState === "APPROVED";

  const docLabel = PERMIT_LABELS[response?.businessService] || "document";
  const signedPermit = response?.additionalDetails?.signedPermit || null;
  const hasSignedPermit = Boolean(signedPermit?.fileStoreId);

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap";

  return (
    <div className="flex items-start gap-3">
      {/* Permit-related buttons stacked vertically so long French labels
          don't overflow the header on smaller widths. */}
      {isPermitGranted && (
        <div className="flex flex-col items-stretch gap-2">
          {/* Download UNSIGNED (auto-generated) permit — for employees */}
          {isDownloadButtonEnable && (
            <button onClick={handlePdfDownload} className={baseBtn}>
              <LuDownload className="h-4 w-4" />
              {`Télécharger le ${docLabel} (non signé)`}
            </button>
          )}

          {/* Upload SIGNED permit — for employees */}
          <button onClick={handleUploadClick} disabled={isUploading} className={baseBtn}>
            <LuUpload className="h-4 w-4" />
            {isUploading
              ? "Téléchargement..."
              : hasSignedPermit
                ? `Remplacer le ${docLabel} signé`
                : `Téléverser le ${docLabel} signé`}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Download SIGNED permit (once uploaded) */}
          {hasSignedPermit && (
            <button
              onClick={() => downloadSignedPermit(signedPermit)}
              disabled={isDownloading}
              className={baseBtn}
              title={signedPermit.fileName}
            >
              <LuFileCheck2 className="h-4 w-4" />
              {isDownloading ? "Ouverture..." : `Télécharger le ${docLabel} signé`}
            </button>
          )}
        </div>
      )}

      {/* Hidden PDF Template for rendering */}
      {showPdfTemplate && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <PermitPDFTemplate
            ref={pdfRef}
            response={response}
            businessService={response?.businessService}
          />
        </div>
      )}

      {/* Workflow Actions —
          Note: we intentionally do NOT render a "Business Service" selector here
          even when multiple parallel branches exist. The ViewScreen URL is already
          resolved to the correct branch for the logged-in user via
          resolveBusinessServiceForUser() in the applications list / dashboard / search,
          so a manual branch switcher would only let users land on a branch where they
          cannot act (and fail the WorkflowService access check). Keep this as a single
          Action button matching the rest of the app. */}
      <WorkflowActions
        forcedActionPrefix={`WF_${response?.businessService}_ACTION`}
        businessService={effectiveBusinessService}
        applicationNo={response?.applicationNumber}
        tenantId={tenantId}
        applicationDetails={response}
        serviceConfig={serviceConfig}
        url={`/public-service/v1/application/${queryStrings?.serviceCode}`}
        isDisabled={isActionsDisabled}
        moduleCode={response?.module}
        ActionBarStyle={{
          position: "relative",
          boxShadow: "none",
          backgroundColor: "transparent",
          padding: 0,
          margin: 0,
          zIndex: "auto",
        }}
        MenuStyle={{
          top: "100%",
          bottom: "unset",
          backgroundColor: "#22a4d9",
          color: "white",
          right: 0,
          left: "auto",
        }}
      />
    </div>
  );
};

export default ActionButtons;
