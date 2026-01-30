import React from "react";
import { Button } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { LuDownload } from "react-icons/lu";
import WorkflowActions from "../../../../components/WorkflowActions";
import { downloadStudioPDF, getPdfKeyForState } from "../../../../utils";

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

  const handlePdfDownload = async () => {
    downloadStudioPDF(
      "pdf",
      {
        tenantId,
        serviceCode: queryStrings?.serviceCode,
        applicationNumber: queryStrings?.applicationNumber,
        pdfKey: getPdfKeyForState(serviceConfig?.data?.pdf, processInstanceState),
      },
      `permit-${queryStrings?.applicationNumber}.pdf`
    );
  };

  const effectiveBusinessService = queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices?.[0]?.code;
  const isActionsDisabled = !effectiveBusinessService;

  return (
    <div className="flex items-center gap-3">
      {/* Download Button */}
      {processInstanceState === "PERMIT_GRANTED" && isDownloadButtonEnable && (
        <button
          onClick={() => handlePdfDownload()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30"
        >
          <LuDownload className="h-4 w-4" />
          {t("CS_COMMON_DOWNLOAD")}
        </button>
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
