import { FormComposerV2, Stepper, Toast } from "@egovernments/digit-ui-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import { generateFormConfig } from "../../../utils/generateFormConfigFromSchemaUtil";
import { transformToApplicationPayload } from "../../../utils";
import Loader from "../../../../../../ui-components/src/atoms/Loader";
import SummaryView from "../../../components/SummaryView";
import { assigneeMapping } from "../../../utils/templateConfig";

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

const DigitDemoComponent = ({ editdata }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);
  const { module, service } = useParams();
  const serviceCode = `${module.toUpperCase()}_${service.toUpperCase()}`;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();

  // Get service title from servicesData
  const getServiceTitle = () => {
    const servicesData = {
      BPA_PCO: "Permis de Construire Ordinaire (PCO) - Établissements Recevant du Public",
      BPA_PCO_SIMPLE: "Permis de Construire Ordinaire (PCO) - Constructions Simples",
      BPA_PCS: "Permis de Construire Simplifié (PCS)",
      BPA_PL: "Permis de Lotir",
      BPA_PD: "Permis de Démolir",
      BPA_PF: "Permis de Fonctionner",
      BPA_ATARR: "Autorisation de Travaux d'Arrondissement",
      BPA_PR: "Permis de Remblai (PR)",
      BPA_APE: "Approbation de Plan d'Exécution (APE)",
      BPA_PV: "P.V d'implantation",
      BPA_PS: "Permis de Surélévation",
      BPA_CCR: "Certificat de Conformité de Remblai (CCR)",
      BPA_CCE: "Certificat de Conformité Électrique (CCE)",
      BPA_CCP: "Certificat de Conformité Parasismique (CCP)",
      BPA_CCG: "Certificat de Conformité Général (CCG)",
    };
    // Fix the service code issue - remove the duplicate BPA_ prefix
    const cleanServiceCode = serviceCode.replace("BPA_BPA_", "BPA_");
    return servicesData[cleanServiceCode] || cleanServiceCode;
  };

  // Get persisted state from localStorage
  const savedStep = parseInt(localStorage.getItem("currentStep"), 10) || 1;
  const savedFormData = JSON.parse(localStorage.getItem("formData") || "{}");
  
  // Clear personType from saved form data to start fresh
  if (savedFormData.applicantDetails && savedFormData.applicantDetails[0]) {
    delete savedFormData.applicantDetails[0].personType;
  }

  const [currentStep, setCurrentStep] = useState(savedStep);
  const [formData, setFormData] = useState(savedFormData);
  const [sessionData, setSessionData] = useState(savedFormData);
  const [responseData, setResponseData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const permit = assigneeMapping?.find((item) => item.permit === service);
  const role = permit?.role || null;

  let { isLoading: isLoadingHrmsSearch, data: assigneeOptions } = Digit.Hooks.hrms.useHRMSSearch(
    { roles: role, isActive: true },
    tenantId,
    null,
    null,
    { enabled: role != null }
  );

  useEffect(() => {
    //useEffect to set the prevfilled data
    if (window.location.href.includes("Edit")) {
      localStorage.setItem("formData", JSON.stringify(editdata));
      setFormData(editdata);
    }
  }, [editdata]);


  // Fetch service configuration from MDMS
  const requestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
        filters: {
          module: module,
        },
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
  let currentFormConfig = rawConfig[currentStep - 1];
  const schemaCode = queryStrings?.serviceCode;

  // Filter fields based on personType selection for applicantDetails step
  if (currentFormConfig && currentFormConfig?.name === "applicantDetails") {
    const applicantDetails = formData.applicantDetails && formData.applicantDetails[0];
    const personTypeValue = applicantDetails?.personType;
    const personType = typeof personTypeValue === 'string' 
      ? personTypeValue.toUpperCase() 
      : personTypeValue?.code?.toUpperCase() || '';

    // Create a copy of the form config to avoid mutating the original
    currentFormConfig = {
      ...currentFormConfig,
      body: currentFormConfig.body ? [...currentFormConfig.body] : []
    };

    // Filter fields based on personType
    if (currentFormConfig.body) {
      
      currentFormConfig.body = currentFormConfig.body.filter(field => {
        const fieldName = field?.populators?.name; // Use the populators name from config
        
        // Always show personType field
        if (fieldName === 'personType') {
          return true;
        }
        
        // If no personType selected, hide all fields including section headers
        if (!personType) {
          return false;
        }

        // Show section headers only for legal entities
        if (field?.type === 'section') {
          return personType === "LEGAL_ENTITY";
        }

        // Show fields based on personType selection
        if (personType === "INDIVIDUAL") {
          // Show individual fields (no section headers for individuals)
          const individualFields = [
            'wayToAddress',
            'name',
            'address',
            'idType',
            'nationalIdNumber',
            'mobileNumber',
            // 'eligibilityDeclaration',
            // 'accuracyDeclaration',
            // 'taxCalculationAgreement',
            // 'checkValidation'
          ];
          return individualFields.includes(fieldName);
        } else if (personType === "LEGAL_ENTITY") {
          // Show legal entity fields in correct order
          const legalEntityFields = [
            // Section headers
            'companyInfoHeader',
            'representativeInfoHeader',
            // Company information first (including address and phone)
            'corporateName',
            'companyType',
            'registrationNumber',
            'adresseSiege',
            'telephone',
            // Representative's personal information (same field names as individual for API)
            'qualiteRepresentant',
            'wayToAddress',
            'name',
            'address',
            'idType',
            'nationalIdNumber',
            'mobileNumber',
            // Common fields
            // 'eligibilityDeclaration',
            // 'accuracyDeclaration',
            // 'taxCalculationAgreement',
            // 'checkValidation'
          ];
          
          // Show otherCompanyType only when companyType is OTHER
          if (fieldName === 'otherCompanyType') {
            const companyTypeValue = applicantDetails?.companyType;
            const companyType = typeof companyTypeValue === 'string'
              ? companyTypeValue.toUpperCase()
              : companyTypeValue?.code?.toUpperCase() || '';
            return companyType === "OTHER";
          }
          
          return legalEntityFields.includes(fieldName);
        }

        return false;
      });
    }
  }
  const isLastStep = currentStep === rawConfig.length;
  const applicationNumber = queryStrings?.applicationNumber;

  const mutation = Digit.Hooks.useCustomAPIMutationHook({
    url: `/public-service/v1/application/${schemaCode}`,
    method: isLastStep || applicationNumber ? "PUT" : "POST",
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
      const userDetails = Digit.UserService.getUser();
      const userType = userDetails?.info?.type?.toLowerCase();
      setIsLoading(true);
      await mutation.mutate(
        {
          body:
            isLastStep || applicationNumber
              ? transformToApplicationPayload(
                  updatedFormData,
                  Updatedconfig,
                  service,
                  tenantId,
                  config,
                  workflowDetails,
                  isLastStep,
                  applicationNumber,
                  queryStrings?.action,
                  assigneeOptions?.Employees
                )
              : transformToApplicationPayload(updatedFormData, Updatedconfig, service, tenantId, config, workflowDetails, queryStrings?.action),
        },
        {
          onSuccess: (data) => {
            setIsLoading(false);
            setResponseData(data);
            setFormData({ ...formData, applicationNumber: data?.Application?.applicationNumber, responseData: data });
            localStorage.removeItem("formData");
            localStorage.removeItem("currentStep");
            sessionStorage.removeItem("formData");

            if (!isLastStep) {
              setCurrentStep(currentStep + 1);
            } else {
              history.push({
                pathname: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/response`,
                search: `?isSuccess=true&applicationNumber=${data?.Application?.applicationNumber}&serviceCode=${schemaCode}`,
                state: {
                  message: "COMMON_APPLICATION_CREATED",
                  showID: true,
                  applicationNumber: data?.Application?.applicationNumber,
                  config: config,
                  workflowStatus: data?.Application?.processInstance[0]?.state?.state,
                  redirectionUrl: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/ViewScreen?applicationNumber=${data?.Application?.applicationNumber}&serviceCode=${schemaCode}`,
                },
              });
            }
          },
          onError: () => {
            setIsLoading(false);
            localStorage.removeItem("formData");
            localStorage.removeItem("currentStep");
            sessionStorage.removeItem("formData");

            history.push({
              pathname: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/response`,
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

    if (landDetails) {
      // Safely convert to uppercase
      const definitiveLandTitleCode = landDetails?.definitiveLandTitle?.code?.toUpperCase();
      const intededUse = landDetails.intededUse?.code?.toUpperCase();
      const demolitionType = landDetails?.demolitionType?.code?.toUpperCase();

      // Only proceed if currentFormConfig and its body exist
      if (currentFormConfig && currentFormConfig.body) {
        // Create a new copy of the body array
        currentFormConfig.body = currentFormConfig.body.map((field) => {
          if (field?.populators?.name === "tfNo") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: !definitiveLandTitleCode || definitiveLandTitleCode === "NO",
                required: definitiveLandTitleCode && definitiveLandTitleCode !== "NO",
              },
            };
          } else if (field?.populators?.name === "otherOnDemolitionType") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: !demolitionType || demolitionType !== "OTHER",
                required: demolitionType && demolitionType === "OTHER",
              },
            };
          } else if (field?.populators?.name === "noOfUnits") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: !intededUse || intededUse !== "HOUSING",
                required: intededUse && intededUse === "HOUSING",
              },
            };
          } else if (field?.populators?.name === "detailsOnOtherType") {
            return {
              ...field,
              populators: {
                ...field.populators,
                disable: !intededUse || intededUse !== "OTHERS",
                required: intededUse && intededUse === "OTHERS",
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

  // Handle back button click
  const handleBackToServiceDetails = () => {
    const userType = Digit.UserService.getUser()?.info?.type?.toLowerCase();
    history.push(`/${window.contextPath}/${userType}/publicservices/service/${service}`);
  };

  if (moduleListLoading || workflowDetailsLoading || isLoadingHrmsSearch) return <Loader />;

  if (isLoading) return <Loader />;

  const isSummaryStep = currentStep === rawConfig?.length; // Summary is the 5th step

  return (
    <React.Fragment>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Beautiful Modern Header */}
        <div className="bg-gradient-djibouti-light rounded-2xl p-4 mb-8 shadow-lg">
          <div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                <h1 className="text-3xl font-bold text-white">Nouvelle Demande</h1>
              </div>
              <button
                onClick={handleBackToServiceDetails}
                className="flex items-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <LuArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour aux détails</span>
              </button>
            </div>

            <p className="text-xl text-white text-opacity-90 leading-relaxed max-w-3xl">{getServiceTitle()}</p>
          </div>
        </div>

        <Stepper customSteps={steps} currentStep={currentStep} onStepClick={onStepperClick} activeSteps={currentStep} />
        {isSummaryStep ? (
          <div className="summary-container">
            <SummaryView serviceCode={serviceCode} formData={formData} steps={steps} t={t} onSubmit={onSubmit} onPrevious={onPrevious} />
          </div>
        ) : (
          <FormComposerV2
            key={`${currentStep}-${currentFormConfig?.name}`}
            // heading={t(`${serviceCode}_HEADING`)}
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
      </div>
    </React.Fragment>
  );
};

export default DigitDemoComponent;
