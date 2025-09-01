import React from "react";
import { Button } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
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

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
      {/* Download Button */}
      {processInstanceState === "PERMIT_GRANTED" && isDownloadButtonEnable && (
        <Button
          label={t("CS_COMMON_DOWNLOAD")}
          onClick={() => handlePdfDownload()}
          className="employee-download-btn-className"
          variation="tertiary"
          type="button"
          icon="FileDownload"
          style={{
            backgroundColor: "transparent",
          }}
        />
      )}
      
      {/* Workflow Actions */}
      <WorkflowActions
        forcedActionPrefix={`WF_${response?.businessService}_ACTION`}
        businessService={queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices?.[0]?.code}
        applicationNo={response?.applicationNumber}
        tenantId={tenantId}
        applicationDetails={response}
        serviceConfig={serviceConfig}
        url={`/public-service/v1/application/${queryStrings?.serviceCode}`}
        isDisabled={!selectedBusinessService}
        moduleCode={response?.module}
        ActionBarStyle={{
          position: "relative",
          boxShadow: "none",
          backgroundColor: "transparent",
          marginBottom: "1rem",
        }}
        MenuStyle={{
          top: "100%",
          bottom: "unset",
          backgroundColor: "#006769",
          color: "white",
        }}
        {...(matchedBusinessServices.length > 1 && {
          actionFields: [
            <Button
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
