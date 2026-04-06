import React, { useRef, useState } from "react";
import { Button } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { LuDownload } from "react-icons/lu";
import WorkflowActions from "../../../../components/WorkflowActions";
import { PermitPDFTemplate, generatePermitPDF } from "../../../../components/PermitPDF";

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
  const { t } = useTranslation();
  const history = useHistory();
  const pdfRef = useRef(null);
  const [showPdfTemplate, setShowPdfTemplate] = useState(false);

  const handlePdfDownload = async () => {
    setShowPdfTemplate(true);
    // Wait for React to render the template
    setTimeout(async () => {
      await generatePermitPDF(
        pdfRef,
        `permis-${response?.applicationNumber || "document"}.pdf`
      );
      setShowPdfTemplate(false);
    }, 500);
  };

  const effectiveBusinessService = queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices?.[0]?.code;
  const isActionsDisabled = !effectiveBusinessService;

  const isPermitGranted = processInstanceState === "PERMIT_GRANTED" || processInstanceState === "CERTIFICATE_GRANTED" || processInstanceState === "CERTIFICATE_ISSUED" || processInstanceState === "APPROVED";

  return (
    <div className="flex items-center gap-3">
      {/* Download Button */}
      {isPermitGranted && isDownloadButtonEnable && (
        <button
          onClick={handlePdfDownload}
          className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30"
        >
          <LuDownload className="h-4 w-4" />
          Télécharger le permis
        </button>
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

      {/* Workflow Actions */}
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
        {...(matchedBusinessServices.length > 1 && {
          actionFields: [
            <Button
              key="business-service-selector"
              t={t}
              type={"actionButton"}
              options={matchedBusinessServices}
              label={"Business Service"}
              variation={"primary"}
              optionsKey={"displayname"}
              isSearchable={false}
              onOptionSelect={(value) => setSelectedBusinessService(value)}
              menuStyle={{
                top: "100%",
                bottom: "unset",
              }}
            />,
          ],
        })}
      />
    </div>
  );
};

export default ActionButtons;
