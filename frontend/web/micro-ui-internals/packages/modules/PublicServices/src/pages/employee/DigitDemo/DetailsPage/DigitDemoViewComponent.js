import { Loader } from "@egovernments/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkflowDetails, processBusinessServices } from "../../../../utils";
import { checklistByService } from "../../../../utils/templateConfig.js";

// Import refactored components
import ApplicationHeader from "./ApplicationHeader";
import ApplicationTabs from "./ApplicationTabs";
import MainView from "./MainView";
import ActionButtons from "./ActionButtons";

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
  const history = useHistory();
  const isCitizen = Digit.UserService.getType()?.toLowerCase() === "citizen";
  const checklistConfig = checklistByService.find((list) => list.service === service);
  const shouldShowChecklist = checklistConfig && checklistConfig.checklist && checklistConfig.checklist.length > 0;

  const isDownloadButtonEnable = userInfo?.info?.roles?.some(
    (role) => role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "BPA_ARCHITECT"
  );

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
    config: {
      cacheTime: 0,
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
    config: {
      enabled: response && serviceConfig ? true : false,
      cacheTime: 0,
    },
  });

  let { data: timelineWorkflowDetails, isLoading: timelineWorkflowLoading } = useWorkflowDetails({
    tenantId: tenantId,
    id: queryStrings?.applicationNumber,
    config: {
      enabled: response && serviceConfig ? true : false,
      cacheTime: 0,
    },
  });


  // Extract the required data for ApplicationDataView
  const applicationData = {
    applicants: response?.applicants || [],
    additionalDetails: response?.additionalDetails || {},
    documents: response?.documents || [],
    serviceDetails: {
      landInfo: response?.serviceDetails?.landandProjectDesignDetails?.[0] || {},
      designOffice: response?.serviceDetails?.designOfficeDetailing || [],
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

    const loggedUser = userInfo?.info?.uuid;
    const latestProcessInstance = workflowDetails?.processInstances?.[0]; //extracting the latest process instance object
    const assigneeUuids = latestProcessInstance?.assignes?.map((assignee) => assignee.uuid) || [];

    // Redirecting to the inbox page if the logged in user has no actions available for the particular application
    if (!assigneeUuids?.includes(loggedUser)) {
      history.push({
        pathname: `/${window.contextPath}/${userType}/publicservices/${module}/Inbox`,
      });
    }
  }, [userInfo, workflowDetails]);

  // To get the checklist codes for the application
  let checkListCodes = workflowDetails ? [`${response?.businessService}.${workflowDetails?.processInstances?.[0].state?.state}`] : [];

  if (isLoading || workflowLoading || timelineWorkflowLoading || ServiceConfigLoading) {
    return <Loader />;
  }


 
  const serviceInfo = {
    name: t(response?.businessService) || "Service",
    description: "Service administratif en ligne"
  };
  const applicant = response?.applicants?.[0];
  const projectDetails = response?.serviceDetails?.landandProjectDesignDetails?.[0];
  const designOffice = response?.serviceDetails?.designOfficeDetailing?.[0];

  return (
    <React.Fragment>
      <div className="max-w-7xl mx-auto p-10 pt-5">
        <div className="mt-4 flex flex-col gap-4">
          {/* Header Card */}
          <ApplicationHeader 
            response={response}
            serviceInfo={serviceInfo}
            projectDetails={projectDetails}
            applicant={applicant}
          />

          {/* Tabs */}
          <ApplicationTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCitizen={isCitizen}
          />

          {/* Content Area */}
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
          />
        </div>

        {/* Floating Action Buttons */}
        <ActionButtons
          isCitizen={isCitizen}
          selectedBusinessService={selectedBusinessService}
          matchedBusinessServices={matchedBusinessServices}
          setSelectedBusinessService={setSelectedBusinessService}
          response={response}
          queryStrings={queryStrings}
          tenantId={tenantId}
          serviceConfig={serviceConfig}
          processInstanceState={processInstanceState}
          isDownloadButtonEnable={isDownloadButtonEnable}
          service={service}
        />
      </div>
    </React.Fragment>
  );
};

export default DigitDemoViewComponent;
