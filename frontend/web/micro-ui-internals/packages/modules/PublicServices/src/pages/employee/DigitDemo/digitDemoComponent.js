import { FormComposerV2, Stepper, Toast } from "@egovernments/digit-ui-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { generateFormConfig } from "../../../utils/generateFormConfigFromSchemaUtil";
import { transformToApplicationPayload } from "../../../utils";
import { Loader } from "@egovernments/digit-ui-react-components";
import SummaryView from "../../../components/SummaryView";

// Add styles for disabled inputs
const disabledInputStyles = `
  input:disabled, textarea:disabled, select:disabled {
    background-color: #f0f0f0 !important;
    color: #888 !important;
    cursor: not-allowed !important;
    border: 1px solid #ddd !important;
    opacity: 0.7 !important;
  }
`;

const DigitDemoComponent = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);
  const { module, service } = useParams();
  const serviceCode = `${module.toUpperCase()}_${service.toUpperCase()}`;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();

  // Get persisted state from localStorage
  const savedStep = parseInt(localStorage.getItem("currentStep"), 10) || 1;
  const savedFormData = JSON.parse(localStorage.getItem("formData") || "{}");

  const [currentStep, setCurrentStep] = useState(savedStep);
  const [formData, setFormData] = useState(savedFormData);
  const [sessionData, setSessionData] = useState(savedFormData);
  const [responseData, setResponseData] = useState("");

  // Fetch service configuration from MDMS
  const requestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
  };
  const { isLoading: moduleListLoading, data } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const config = data?.mdms?.find((item) => item?.uniqueIdentifier.toLowerCase() === `${module}.${service}`.toLowerCase());

  // Fetch workflow details if available
  const workflowrequestCriteria = {
    url: "/egov-workflow-v2/egov-wf/businessservice/_search",
    params: {
      tenantId: tenantId,
      businessServices: config?.data?.workflow?.businessService,
    },
    config: {
      enabled: Boolean(config?.data?.workflow?.businessService),
    },
  };

  const { isLoading: workflowDetailsLoading, data: workflowDetails } = Digit.Hooks.useCustomAPIHook(workflowrequestCriteria);

  const Updatedconfig = {
    ServiceConfiguration: [config?.data],
    tenantId,
    module,
  };

  //logic to handle steps in apply screen flow
  const rawConfig = generateFormConfig(Updatedconfig, module.toUpperCase(), service?.toUpperCase());
  const steps = rawConfig.map((config) => config.head || config.label || "Untitled Section");
  const currentFormConfig = rawConfig[currentStep - 1];
  const schemaCode = queryStrings?.serviceCode;
  const isLastStep = currentStep === rawConfig.length;

  const mutation = Digit.Hooks.useCustomAPIMutationHook({
    url: `/public-service/v1/application/${schemaCode}`,
    method: isLastStep ? "PUT" : "POST",
    headers: { "x-tenant-id": tenantId },
    config: {
      enable: true,
    },
  });

  useEffect(() => {
    if (currentFormConfig?.name === "landandProjectDesignDetails") {
      const styleEl = document.createElement("style");
      styleEl.innerHTML = disabledInputStyles;
      document.head.appendChild(styleEl);

      // Cleanup function
      return () => {
        document.head.removeChild(styleEl);
      };
    }
    // Even if the condition is false, return a cleanup function (no-op)
    return () => {};
  }, [currentFormConfig]);

  //this to maintain the current state of the application entered by user
  const persistData = (updatedFormData, updatedStep) => {
    localStorage.setItem("formData", JSON.stringify(updatedFormData));
    localStorage.setItem("currentStep", updatedStep.toString());
    sessionStorage.setItem("formData", JSON.stringify(updatedFormData));
    setSessionData(updatedFormData);
  };
  const onSubmit = async (data) => {
    const sectionName = currentFormConfig?.name || `section_${currentStep}`;
    const updatedFormData = ["multiChildForm", "documents"].includes(currentFormConfig?.type)
      ? { ...formData, ...data }
      : { ...formData, [sectionName]: data };

    const docStep = rawConfig.findIndex((item) => item.type === "documents");
    const beforeDocStep = currentStep === docStep;

    setFormData(updatedFormData);
    persistData(updatedFormData, currentStep);

    // If we have an ID and it's not the last step, just move to next step
    if (responseData?.Application?.id && !isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistData(updatedFormData, nextStep);
      return;
    }

    // Only make API call if it's beforeDocStep (first time) or last step
    if (beforeDocStep || isLastStep) {
      await mutation.mutate(
        {
          body: isLastStep
            ? transformToApplicationPayload(updatedFormData, Updatedconfig, service, tenantId, config, workflowDetails, isLastStep, responseData)
            : transformToApplicationPayload(updatedFormData, Updatedconfig, service, tenantId, config, workflowDetails),
        },
        {
          onSuccess: (data) => {
            setResponseData(data);
            setFormData({ ...formData, applicationNumber: data?.Application?.applicationNumber });
            localStorage.removeItem("formData");
            localStorage.removeItem("currentStep");
            sessionStorage.removeItem("formData");

            if (!isLastStep) {
              setCurrentStep(currentStep + 1);
            } else {
              const userDetails = Digit.UserService.getUser();
              const userType = userDetails?.info?.type?.toLowerCase();
              history.push({
                pathname: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/response`,
                search: `?serviceCode=${schemaCode}&isSuccess=true`,
                state: {
                  message: "COMMON_APPLICATION_CREATED",
                  showID: true,
                  applicationNumber: data?.Application?.applicationNumber,
                  redirectionUrl: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/ViewScreen?applicationNumber=${data?.Application?.applicationNumber}&serviceCode=${schemaCode}`,
                },
              });
            }
          },
          onError: () => {
            history.push({
              pathname: `/${window.contextPath}/employee/publicservices/${module}/${service}/response`,
              search: "?isSuccess=false",
              state: {
                message: "COMMON_APPLICATION_FAILED",
                showID: false,
              },
            });
          },
        }
      );
    } else {
      // If not beforeDocStep or lastStep, just move to next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistData(updatedFormData, nextStep);
    }
  };

  const onPrevious = async () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onStepperClick = (stepIndex) => {
    const clickedStepIndex = stepIndex + 1;
    const clickedHead = rawConfig[stepIndex].name;
    if (Object.keys(formData).includes(clickedHead)) {
      setCurrentStep(clickedStepIndex);
      localStorage.setItem("currentStep", clickedStepIndex.toString());
    }
  };

  if (currentFormConfig && currentFormConfig?.name === "landandProjectDesignDetails") {
    // Safely access nested properties
    const landDetails = formData.landandProjectDesignDetails && formData.landandProjectDesignDetails[0];

    if (landDetails && landDetails.definitiveLandTitle && landDetails.definitiveLandTitle.code) {
      // Safely convert to uppercase
      const definitiveLandTitleCode = landDetails.definitiveLandTitle.code.toUpperCase();
      const registrationCertificate =
        landDetails.registrationCertificate && landDetails.registrationCertificate.code ? landDetails.registrationCertificate.code.toUpperCase() : "";
      const workType = landDetails.workType?.code?.toUpperCase();

      // Only proceed if currentFormConfig and its body exist
      if (currentFormConfig && currentFormConfig.body) {
        // Create a new copy of the body array
        currentFormConfig.body = currentFormConfig.body.map((field) => {
          if (field && field.populators && field.populators.name === "tfNo") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: definitiveLandTitleCode === "NO",
                required: definitiveLandTitleCode !== "NO",
              },
            };
          } else if (field && field.populators && field.populators.name === "noOfUnits") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: workType === "OTHERS" || workType !== "HOUSING",
                required:
                  workType !== "HOUSING" && workType !== "OTHERS" ? false : workType !== "OTHERS" ? true : workType === "HOUSING" ? true : false,
              },
            };
          } else if (field && field.populators && field.populators.name === "detailsOnOtherType") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: workType === "HOUSING" || workType !== "OTHERS",
                required:
                  workType !== "HOUSING" && workType !== "OTHERS" ? false : workType !== "HOUSING" ? true : workType === "OTHERS" ? true : false,
              },
            };
          }
          return field;
        });
      }
    }
  }

  const onFormValueChange = (_, updatedData) => {
    const sectionName = currentFormConfig.name || `section_${currentStep}`;
    const updatedSectionData = updatedData[sectionName] || updatedData;
    const sessionSectionData = sessionData?.[sectionName];
    const hasChanged = JSON.stringify(sessionSectionData) !== JSON.stringify(updatedSectionData);

    if (hasChanged) {
      const updatedFormData = { ...formData, [sectionName]: updatedSectionData };
      setFormData(updatedFormData);
      persistData(updatedFormData, currentStep);
    }
  };

  const closeToast = () => setShowToast(false);

  if (moduleListLoading || workflowDetailsLoading) return <Loader />;

  const isSummaryStep = currentStep === rawConfig?.length; // Summary is the 5th step

  return (
    <React.Fragment>
      <Stepper customSteps={steps} currentStep={currentStep} onStepClick={onStepperClick} activeSteps={currentStep} />
      {isSummaryStep ? (
        <div className="summary-container">
          <SummaryView serviceCode={serviceCode} formData={formData} steps={steps} t={t} onSubmit={onSubmit} onPrevious={onPrevious} />
        </div>
      ) : (
        <FormComposerV2
          key={`${currentStep}-${currentFormConfig?.name}`}
          heading={t(`${serviceCode}_HEADING`)}
          label={currentStep === steps.length - 1 ? t(`${serviceCode}_SUBMIT`) : t(`${serviceCode}_NEXT`)}
          config={[
            {
              ...currentFormConfig,
              body: currentFormConfig?.body?.filter((a) => !a.hideInEmployee),
            },
          ]}
          fieldStyle={{ marginRight: 0 }}
          currentStep={currentStep}
          defaultValues={
            currentFormConfig?.type === "multiChildForm"
              ? { ...formData }
              : { ...(formData[currentFormConfig?.name || `section_${currentStep}`] || {}) }
          }
          onSubmit={onSubmit}
          onPrevious={onPrevious}
          onFormValueChange={onFormValueChange}
        />
      )}
      {showToast && (
        <Toast style={{ zIndex: "10000" }} error={showToast?.error} label={t(showToast?.message)} onClose={closeToast} isDleteBtn={true} />
      )}
    </React.Fragment>
  );
};

export default DigitDemoComponent;
