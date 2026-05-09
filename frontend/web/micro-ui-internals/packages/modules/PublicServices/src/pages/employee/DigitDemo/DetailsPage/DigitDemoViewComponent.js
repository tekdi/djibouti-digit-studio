import { Loader } from "@egovernments/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkflowDetails, processBusinessServices } from "../../../../utils";
import { checklistByService } from "../../../../utils/templateConfig.js";

import ApplicationHeader from "./ApplicationHeader";
import ApplicationTabs from "./ApplicationTabs";
import MainView from "./MainView";

const DigitDemoViewComponent = () => {
  const { t } = useTranslation();
  const queryStrings = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedBusinessService, setSelectedBusinessService] = useState(null);
  const [activeTab, setActiveTab] = useState("project");
  const userInfo = Digit.UserService.getUser();
  const { module, service } = useParams();
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData?.code);
  const [matchedBusinessServices, setMatchedBusinessServices] = useState([]);

  const isCitizen = Digit.UserService.getType()?.toLowerCase() === "citizen";
  const checklistConfig = checklistByService.find((list) => list.service === service);
  const shouldShowChecklist = checklistConfig && checklistConfig.checklist && checklistConfig.checklist.length > 0;

  const isDownloadButtonEnable = true;

  // Background refetch FULLY disabled. Silent polling — especially the
  // refetch-on-window-focus default — was causing the modal forms (fiche
  // technique, checklist, instruction sheet) to re-mount mid-typing whenever
  // the agent switched tabs and came back, destroying ~10 minutes of work.
  // Refetches now happen ONLY when an explicit save fires the exposed
  // `refetch()` function.
  const NO_AUTO_REFETCH = {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: false,
  };

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
    config: { ...NO_AUTO_REFETCH },
  };
  const { isLoading, data, refetch: refetchApplication } = Digit.Hooks.useCustomAPIHook(request);
  let response = data ? data?.Application?.[0] : {};
  const processInstanceState = response?.processInstance?.[0]?.state?.state;

  const requestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
    config: { ...NO_AUTO_REFETCH },
  };

  const { isLoading: ServiceConfigLoading, data: serviceConfigData } = Digit.Hooks.useCustomAPIHook(requestCriteria);
  const serviceConfig = serviceConfigData?.mdms?.find((item) => item?.uniqueIdentifier.toLowerCase() === `${module}.${service}`.toLowerCase());

  let { data: workflowDetails, isLoading: workflowLoading, revalidate: refetchWorkflow } = useWorkflowDetails({
    tenantId: tenantId,
    id: queryStrings?.applicationNumber,
    moduleCode: queryStrings?.businessService || serviceConfig?.data?.workflow?.businessService,
    config: {
      enabled: response && serviceConfig ? true : false,
      ...NO_AUTO_REFETCH,
    },
  });

  let { data: timelineWorkflowDetails, isLoading: timelineWorkflowLoading, revalidate: refetchTimeline } = useWorkflowDetails({
    tenantId: tenantId,
    id: queryStrings?.applicationNumber,
    config: {
      enabled: response && serviceConfig ? true : false,
      ...NO_AUTO_REFETCH,
    },
  });

  const refetchAll = React.useCallback(() => {
    if (refetchApplication) refetchApplication();
    if (refetchWorkflow) refetchWorkflow();
    if (refetchTimeline) refetchTimeline();
  }, [refetchApplication, refetchWorkflow, refetchTimeline]);

  useEffect(() => {
    if (!serviceConfig || !tenantId || !queryStrings?.applicationNumber || !workflowDetails) return;
    processBusinessServices(serviceConfig, tenantId, queryStrings?.applicationNumber, workflowDetails, userRoles, t).then((matched) => {
      setMatchedBusinessServices(matched);
    });
  }, [workflowDetails]);

  useEffect(() => {
    if (matchedBusinessServices.length === 1 && !selectedBusinessService) {
      setSelectedBusinessService(matchedBusinessServices[0]);
    }
  }, [matchedBusinessServices, selectedBusinessService]);

  useEffect(() => {
    const userType = userInfo?.info?.type?.toLowerCase();
    if (
      !workflowDetails ||
      userType === "citizen" ||
      userRoles.includes("COUNTER_EMPLOYEE") ||
      userRoles.includes("BPA_DIRECTOR") ||
      userRoles.includes("BPA_SRA_SUB_DIRECTOR")
    )
      return;
  }, [userInfo, workflowDetails]);

  let checkListCodes = workflowDetails ? [`${response?.businessService}.${workflowDetails?.processInstances?.[0].state?.state}`] : [];

  if (isLoading || workflowLoading || timelineWorkflowLoading || ServiceConfigLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "80vh", paddingTop: "100px" }}>
        <Loader />
      </div>
    );
  }

  const serviceInfo = {
    name: t(response?.businessService) || "Service",
    description: "Service administratif en ligne",
  };
  const rootApplicant = response?.applicants?.[0];
  const responseDataApplicant = response?.serviceDetails?.responseData?.Application?.applicants?.[0];
  const applicant =
    rootApplicant?.name || rootApplicant?.mobileNumber
      ? rootApplicant
      : responseDataApplicant || rootApplicant;
  const projectDetails = response?.serviceDetails?.landandProjectDesignDetails?.[0];
  const designOffice = response?.serviceDetails?.designOfficeDetailing?.[0];

  return (
    <React.Fragment>
      <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:px-5 sm:py-6">
        <div className="pt-[100px]">
          <ApplicationHeader
            response={response}
            serviceInfo={serviceInfo}
            projectDetails={projectDetails}
            applicant={applicant}
            isCitizen={isCitizen}
            selectedBusinessService={selectedBusinessService}
            matchedBusinessServices={matchedBusinessServices}
            setSelectedBusinessService={setSelectedBusinessService}
            queryStrings={queryStrings}
            tenantId={tenantId}
            serviceConfig={serviceConfig}
            processInstanceState={processInstanceState}
            isDownloadButtonEnable={isDownloadButtonEnable}
            service={service}
          />
        </div>

        <ApplicationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCitizen={isCitizen}
          businessService={response?.businessService}
        />

        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <MainView
            activeTab={activeTab}
            response={response}
            applicant={applicant}
            projectDetails={projectDetails}
            designOffice={designOffice}
            documents={response?.documents}
            costEstimation={response?.additionalDetails?.costEstimation}
            timelineWorkflowDetails={timelineWorkflowDetails}
            workflowDetails={workflowDetails}
            service={service}
            queryStrings={queryStrings}
            isCitizen={isCitizen}
            shouldShowChecklist={shouldShowChecklist}
            checkListCodes={checkListCodes}
            data={data}
            serviceConfig={serviceConfig}
            selectedBusinessService={selectedBusinessService}
            refetchAll={refetchAll}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default DigitDemoViewComponent;
