import { Header, Loader, ViewComposer, MultiLink } from "@egovernments/digit-ui-react-components";
import { Button } from "@egovernments/digit-ui-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { downloadStudioPDF, generateViewConfigFromResponse } from "../../../utils";
import WorkflowActions from "../../../components/WorkflowActions";
import ViewCheckListCards from "../CheckList/viewCheckListCards";
import { useWorkflowDetails, processBusinessServices } from "../../../utils";

import ApplicationDataView from "../../../components/ApplicationDataView";

const DigitDemoViewComponent = () => {
  const { t } = useTranslation();
  const queryStrings = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedBusinessService, setSelectedBusinessService] = useState(null);
  const userInfo = Digit.UserService.getUser();
  const { module, service } = useParams();
  const serviceCode = `${module.toUpperCase()}_${service.toUpperCase()}`;
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData?.code);
  const [matchedBusinessServices, setMatchedBusinessServices] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  //to get the fetched application details
  const request = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
    params: {
      applicationNumber: queryStrings?.applicationNumber,
      tenantId: tenantId,
    },
  };
  const { isLoading, data } = Digit.Hooks.useCustomAPIHook(request);
  let response = data ? data?.Application?.[0] : {};
  const processInstanceState = response?.processInstance?.[0]?.state?.state;

  //To fetch the service config for the module and service
  const requestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
  };

  const { isLoading: ServiceConfigLoading, data: serviceConfigData } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const serviceConfig = serviceConfigData?.mdms?.find((item) => item?.uniqueIdentifier.toLowerCase() === `${module}.${service}`.toLowerCase());

  //To fetch the workflow details for the application to handle parallel workflow
  let { data: workflowDetails, isLoading: workflowLoading } = useWorkflowDetails({
    tenantId: tenantId,
    id: queryStrings?.applicationNumber,
    moduleCode: queryStrings?.businessService || serviceConfig?.data?.workflow?.businessService,
    //moduleCode: "NewTL",
    config: {
      enabled: response && serviceConfig ? true : false,
      cacheTime: 0,
    },
  });

  // Util method to generate view config for view composer
  let config = generateViewConfigFromResponse(response, t, queryStrings?.businessService || selectedBusinessService?.code, serviceConfig);

  // Extract the required data for ApplicationDataView
  const applicationData = {
    applicants: response?.applicants || [],
    additionalDetails: response?.additionalDetails || {},
    documents: response?.documents || [],
    serviceDetails: {
      landInfo: response?.serviceDetails?.landandProjectDesignDetails?.[0] || {},
      designOffice: response?.serviceDetails?.designOfficeDetailing?.[0] || {},
    },
  };

  useEffect(() => {
    // Guard clause to avoid calling with missing inputs
    if (!serviceConfig || !tenantId || !queryStrings?.applicationNumber || !workflowDetails) return;

    //To get the eligible business service for the current state of the application
    processBusinessServices(serviceConfig, tenantId, queryStrings?.applicationNumber, workflowDetails, userRoles, t).then((matched) => {
      setMatchedBusinessServices(matched);
    });
  }, [workflowDetails]);

  // Auto select business service if there's only one match
  useEffect(() => {
    if (matchedBusinessServices.length === 1 && !selectedBusinessService) {
      setSelectedBusinessService(matchedBusinessServices[0]);
    }
  }, [matchedBusinessServices, selectedBusinessService]);

  // To get the checklist codes for the application
  let checkListCodes = workflowDetails ? [`${response?.businessService}.${workflowDetails?.processInstances[0].state?.state}`] : [];
  if (isLoading || workflowLoading || ServiceConfigLoading) {
    return <Loader />;
  }

  // Generate PDF download options from config
  const generateDownloadOptions = () => {
    return serviceConfig?.data?.pdf
      .filter((obj) => obj?.states?.includes(response?.workflowStatus))
      .map((obj) => ({
        // icon: <WhatsappIcon />, // Uncomment and customize if needed
        label: t(`STUDIO_${obj.type.toUpperCase()}`),
        onClick: () => {
          setShowOptions(!showOptions);
          HandleDownloadPdf(obj.key);
        },
      }));
  };

  const HandleDownloadPdf = (key) => {
    downloadStudioPDF(
      "pdf/generatepdf",
      { applicationNumber: queryStrings?.applicationNumber, tenantId, serviceCode: queryStrings?.serviceCode, pdfKey: key },
      `Application-${queryStrings?.applicationNumber}.pdf`
    );
  };

  const handleCalculationClick = () => {
    history.push({
      pathname: `/${window.contextPath}/employee/publicservices/calculation/?applicationNumber=${queryStrings?.applicationNumber}&serviceCode=${queryStrings?.serviceCode}&state=${data?.Application?.[0]?.processInstance?.[0]?.state?.state}`,
    });
  };

  const handleTemplateDownload = async () => {
    try {
      const params = {
        tenantId,
        serviceCode: queryStrings?.serviceCode,
        applicationNumber: queryStrings?.applicationNumber,
        pdfKey: "pco-permit",
      };

      let url = `/studio-pdf/public-service/download/pdf`;
      try {
        const response = await Digit.CustomService.getResponse({
          url,
          params,
          method: "POST",
          useCache: false,
          userDownload: true,
          headers: {
            Accept: "application/pdf",
          },
        });

        const downloadPdf = (blob, fileName) => {
          if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              var base64data = reader.result;
              window.mSewaApp.downloadBase64File(base64data, fileName);
            };
          } else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(link.href), 7000);
          }
        };

        downloadPdf(new Blob([response.data], { type: "application/pdf" }), `${queryStrings?.applicationNumber}_receipt.pdf`);
      } catch (err) {
        console.error(err);
        Digit.Toast.error(t("TEMPLATE_DOWNLOAD_FAILED"));
      }
    } catch (err) {
      console.error("Template download error", err);
    }
  };

  return (
    <React.Fragment>
      {/* {
        <div className={"employee-application-details"} style={{ alignItems: "center", marginBottom: "24px" }}>
          <Header className="works-header-view" styles={{ marginLeft: "0px", paddingTop: "10px" }}>
            {t(`${response?.module.toUpperCase()}_${response?.businessService?.toUpperCase()}_APPLICATION_DETAILS`)}
          </Header>
          <MultiLink
            onHeadClick={() => setShowOptions(!showOptions)}
            className="multilink-block-wrapper divToBeHidden"
            label={t("CS_COMMON_DOWNLOAD")}
            displayOptions={showOptions}
            options={generateDownloadOptions()}
          />
          <Button
            label={t("CS_COMMON_DOWNLOAD")}
            onClick={() => HandleDownloadPdf()}
            className={"employee-download-btn-className"}
            variation={"teritiary"}
            type="button"
            icon={"FileDownload"}
          />

        </div>
      } */}
      <div style={{ width: "100%", display: "flex", marginTop: "20px" }}>
        <div style={{ width: "65%", margin: "0px 30px 0 5px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              boxShadow: "1px 5px 7px 2pxrgb(247, 24, 24)",
              borderRadius: "1rem",
              padding: "10px",
              backgroundColor: "0 1px 2px 0 rgba(0, 0, 0, 0.16)",
            }}
          >
            {/* <ViewComposer data={config} isLoading={false} /> */}
            <ApplicationDataView
              serviceCode={serviceCode}
              status={config?.apiResponse?.processInstance[0]?.state.state}
              businessService={response?.businessService?.toUpperCase()}
              applicationNumber={config?.apiResponse?.applicationNumber}
              data={applicationData}
            />
          </div>
        </div>
        <div style={{ width: "35%", marginRight: "10px" }}>
          <div
            style={{
              boxShadow: "1px 5px 7px 2pxrgb(207, 205, 205)",
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
            {processInstanceState === "PERMIT_GRANTED" && (
              <Button
                label={t("CS_COMMON_DOWNLOAD")}
                onClick={() => handleTemplateDownload()}
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
              businessService={queryStrings?.businessService || selectedBusinessService?.code || matchedBusinessServices[0]?.code}
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
          <div
            style={{
              borderRadius: "1rem",
              boxShadow:
                "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px",
              padding: "1.5rem",
              backgroundColor: "white",
            }}
          >
            {/* <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#166534',
                backgroundColor: '#dcfce7',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {t("READY")}
            </span> */}
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
            {/* <p
              style={{
                color: '#4b5563',
                marginTop: '0.25rem',
              }}
            >
              {t("CREATE_THE_PAYMENT_RECEIPT_FOR_THE_CITIZEN")}
            </p> */}
            <button
              onClick={handleCalculationClick}
              style={{
                marginTop: "1.5rem",
                width: "100%",
                border: "1px solid #006769",
                color: "#006769",
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

              {[...workflowDetails?.timeline].reverse().map((instance, index) => {
                const isCurrentState = index === workflowDetails?.timeline?.length - 1;
                return (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div
                      style={{
                        height: "1.5rem",
                        width: "1.5rem",
                        borderRadius: "9999px",
                        border: `2px solid ${isCurrentState ? "#C84C0E" : "#d1d5db"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: isCurrentState ? "#C84C0E" : "white",
                        color: isCurrentState ? "white" : "inherit",
                        marginRight: "0.75rem",
                        flexShrink: 0,
                        zIndex: "999",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        minWidth: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "16px",
                          color: isCurrentState ? "#C84C0E" : "#505A5F",
                          fontWeight: "400",
                          marginTop: "5px",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                          fontFamily: "Inter",
                        }}
                      >
                        {t(`WF_${response?.module?.toUpperCase()}_${response?.businessService?.toUpperCase()}_${instance?.performedAction}`)}
                        <span
                          style={{
                            color: isCurrentState ? "#C84C0E" : "#6b7280",
                            display: "inline-block",
                            fontFamily: "Inter",
                          }}
                        >
                          {" "}
                          ({instance?.auditDetails?.created})
                        </span>
                      </p>
                      {instance?.comment && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            border: "1px solid #e5e7eb",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#505A5F",
                            backgroundColor: "#f9fafb",
                            wordBreak: "break-word",
                            fontFamily: "Inter",
                          }}
                        >
                         <p
                            style={{
                              marginTop: "5px",
                              color: "black",
                              fontFamily: "Inter",
                            }}
                          >
                            {t("COMMENT")}
                          </p>
                          "{instance?.comment}"
                        </div>
                      )}
                      {instance?.assignes?.length > 0 && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            color: isCurrentState ? "#C84C0E" : "#6b7280",
                            wordBreak: "break-word",
                            fontFamily: "Inter",
                          }}
                        >
                          {t("ASSIGNED_TO")}: {instance?.assignes?.map((assignee) => assignee?.name).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default DigitDemoViewComponent;
