import React, { Fragment, useRef, useState } from "react";
import { LuDownload, LuUpload, LuFileCheck2, LuEye } from "react-icons/lu";
import WorkflowActions from "../../../../components/WorkflowActions";
import { PermitPDFTemplate, generatePermitPDF } from "../../../../components/PermitPDF";
import { useSignedPermit } from "./hooks/useSignedPermit";
import { PDFPreview } from "../../../../components/ChecklistCards/Common";
import { getFileUrl } from "./utils/fileUtils";

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);

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

  const handlePreviewSignedPermit = async (signed) => {
    if (!signed?.fileStoreId) return;
    setIsOpeningPreview(true);
    try {
      const url = await getFileUrl(signed.fileStoreId, tenantId);
      if (url) setPreviewUrl({ url, name: signed.fileName });
      else if (Digit.Toast) Digit.Toast.error("Impossible de charger l'aperçu");
    } catch (err) {
      console.error("Preview error:", err);
      if (Digit.Toast) Digit.Toast.error("Erreur lors du chargement de l'aperçu");
    } finally {
      setIsOpeningPreview(false);
    }
  };

  const effectiveBusinessService = queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices?.[0]?.code;
  const isActionsDisabled = !effectiveBusinessService;

  const isPermitGranted = processInstanceState === "PERMIT_GRANTED" || processInstanceState === "CERTIFICATE_GRANTED" || processInstanceState === "CERTIFICATE_ISSUED" || processInstanceState === "APPROVED";

  const docLabel = PERMIT_LABELS[response?.businessService] || "document";
  const signedPermit = response?.additionalDetails?.signedPermit || null;
  const hasSignedPermit = Boolean(signedPermit?.fileStoreId);

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap";
  // Green emphasis variant — used for the "view signed permit" CTA so it stands out
  // once the wet-signed scan has been uploaded.
  const greenBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-500 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap";

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

          {/* View / Download SIGNED permit (once uploaded) */}
          {hasSignedPermit && (
            <Fragment>
              <button
                onClick={() => handlePreviewSignedPermit(signedPermit)}
                disabled={isOpeningPreview}
                className={greenBtn}
                title={signedPermit.fileName}
              >
                <LuEye className="h-4 w-4" />
                {isOpeningPreview ? "Ouverture..." : `Voir le ${docLabel} signé`}
              </button>
              <button
                onClick={() => downloadSignedPermit(signedPermit)}
                disabled={isDownloading}
                className={baseBtn}
                title={signedPermit.fileName}
              >
                <LuFileCheck2 className="h-4 w-4" />
                {isDownloading ? "Ouverture..." : `Télécharger le ${docLabel} signé`}
              </button>
            </Fragment>
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

      {/* Signed permit PDF preview modal */}
      {previewUrl && (
        <PDFPreview
          fileUrl={previewUrl.url}
          fileName={previewUrl.name || `${docLabel} signé`}
          onClose={() => setPreviewUrl(null)}
          onDownload={() => downloadSignedPermit(signedPermit)}
        />
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
