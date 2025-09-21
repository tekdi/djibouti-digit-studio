import React from "react";
import { Button } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { 
  LuFileText, 
  LuDownload, 
  LuCircleCheck 
} from "react-icons/lu";
import WorkflowActions from "../../../../components/WorkflowActions";
import ViewCheckListCards from "../../CheckList/viewCheckListCards";
import { downloadStudioPDF, getPdfKeyForState } from "../../../../utils";

const SidebarActions = ({
  isCitizen,
  selectedBusinessService,
  matchedBusinessServices,
  setSelectedBusinessService,
  response,
  queryStrings,
  tenantId,
  serviceConfig,
  isCalculationFees,
  isCalculatioDone,
  handleCalculationClick,
  shouldShowChecklist,
  checkListCodes,
  data,
  processInstanceState,
  isDownloadButtonEnable,
  renderTimeline,
  timelineWorkflowDetails,
  workflowDetails,
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
    <div style={{ width: "35%", marginRight: "10px" }}>
      {/* Checklist Cards */}
      {!isCitizen && shouldShowChecklist && (
        <div
          style={{
            boxShadow: "1px 5px 7px 2px rgb(207, 205, 205)",
            borderRadius: "1rem",
            marginBottom: "15px",
            marginTop: "10px",
            backgroundColor: "rgba(255, 255, 255, var(--bg-opacity))",
          }}
        >
          <ViewCheckListCards
            applicationId={data?.Application?.[0]?.id}
            state={data?.Application?.[0]?.processInstance?.[0]?.state?.state}
            checkListCodes={checkListCodes}
          />
        </div>
      )}

      {/* Action Buttons and Download */}
      <div
        style={{
          borderRadius: "1rem",
          width: "fit-content",
          position: "absolute",
          top: "90px",
          right: "10px",
          display: "flex",
          gap: "10px",
          height: "70px",
        }}
      >
        {processInstanceState === "PERMIT_GRANTED" && isDownloadButtonEnable && (
          <Button
            label={t("CS_COMMON_DOWNLOAD")}
            onClick={() => handlePdfDownload()}
            className="employee-download-btn-className"
            variation="tertiary"
            type="button"
            icon="FileDownload"
            style={{
              marginTop: "15px",
              backgroundColor: "transparent",
            }}
          />
        )}
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
            backgroundColor: "#22a4d9",
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

      {/* Calculation Section */}
      {!isCitizen && isCalculationFees && (
        <div
          style={{
            borderRadius: "1rem",
            boxShadow:
              "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px",
            padding: "1.5rem",
            backgroundColor: "white",
          }}
        >
          {isCalculatioDone && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#166534",
                backgroundColor: "#dcfce7",
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              {t("REPORT_DONE")}
            </span>
          )}
          <h2
            style={{
              fontSize: "40px",
              fontWeight: 700,
              marginTop: "1rem",
              wordBreak: "break-word",
            }}
          >
            {t("CALCULATION_OF_RIGHTS")}
          </h2>
          <button
            onClick={handleCalculationClick}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              border: "1px solid #22a4d9",
              color: "#22a4d9",
              fontWeight: 500,
              fontSize: "16px",
              padding: "0.5rem 0",
              borderRadius: "0.5rem",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            {t("EDIT")}
          </button>
        </div>
      )}

      {/* Timeline/Activities Section */}
      <div
        style={{
          marginTop: "1rem",
          borderRadius: "1rem",
          boxShadow:
            "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px",
          padding: "1.5rem",
          backgroundColor: "white",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>{t("TRACK_REQUEST")}</h2>

        <div style={{ position: "relative", paddingLeft: "2rem" }}>
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "43px",
              height: "calc(100% - 70px)",
              width: "2px",
              backgroundColor: "#d1d5db",
            }}
          />

          {service == queryStrings?.businessService &&
            Array.isArray(timelineWorkflowDetails?.timeline) &&
            renderTimeline(timelineWorkflowDetails.timeline, false)}

          {service != queryStrings?.businessService && 
           Array.isArray(workflowDetails?.timeline) && 
           renderTimeline(workflowDetails.timeline, true)}
        </div>
      </div>
    </div>
  );
};

export default SidebarActions;
