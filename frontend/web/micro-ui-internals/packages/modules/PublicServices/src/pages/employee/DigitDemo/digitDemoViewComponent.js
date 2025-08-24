import { Header, Loader, ViewComposer, MultiLink } from "@egovernments/digit-ui-react-components";
import { Button } from "@egovernments/digit-ui-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import { downloadStudioPDF, getPdfKeyForState, generateViewConfigFromResponse } from "../../../utils";
import WorkflowActions from "../../../components/WorkflowActions";
import ViewCheckListCards from "../CheckList/viewCheckListCards";
import { useWorkflowDetails, processBusinessServices } from "../../../utils";
import { 
  LuFileText, 
  LuBuilding, 
  LuClock, 
  LuCircleCheck, 
  LuUser, 
  LuMapPin, 
  LuCalendar,
  LuDownload,
  LuArrowLeft,
  LuCircleAlert,
  LuInfo,
  LuPrinter,
  LuChartBar,
  LuFolderOpen,
  LuCreditCard,
  LuActivity
} from "react-icons/lu";

import ApplicationDataView from "../../../components/ApplicationDataView";
import { checklistByService } from "../../../utils/templateConfig.js";

const DigitDemoViewComponent = () => {
  const { t } = useTranslation();
  const queryStrings = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedBusinessService, setSelectedBusinessService] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const userInfo = Digit.UserService.getUser();
  const { module, service } = useParams();
  const serviceCode = `${module.toUpperCase()}_${service.toUpperCase()}`;
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData?.code);
  const [matchedBusinessServices, setMatchedBusinessServices] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isCalculatioDone, setIsCalculationDone] = useState(false);
  const history = useHistory();
  const isCitizen = Digit.UserService.getType()?.toLowerCase() === "citizen";
  const checklistConfig = checklistByService.find((list) => list.service === service);
  const isCalculationFees = checklistConfig?.checklist?.includes("calculationFees");
  const shouldShowChecklist = checklistConfig && checklistConfig.checklist && checklistConfig.checklist.length > 0;

  const isDownloadButtonEnable = userInfo?.info?.roles?.some((role) => role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "BPA_ARCHITECT");

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

  // Util method to generate view config for view composer
  let config = generateViewConfigFromResponse(response, t, queryStrings?.businessService || selectedBusinessService?.code, serviceConfig);

  // Extract the required data for ApplicationDataView
  const applicationData = {
    applicants: response?.applicants || [],
    additionalDetails: response?.additionalDetails || {},
    documents: response?.documents || [],
    serviceDetails: {
      landInfo: response?.serviceDetails?.landandProjectDesignDetails?.[0] || {},
      designOffice: response?.serviceDetails?.designOfficeDetailing || []
    },
  };

  useEffect(() => {
    const costEstimationExists = response?.additionalDetails?.costEstimation;
    setIsCalculationDone(!!costEstimationExists);
  }, [data?.Application]);
  
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const handleCalculationClick = () => {
    const userDetails = Digit.UserService.getUser();
    const userType = userDetails?.info?.type?.toLowerCase();
    history.push({
      pathname: `/${window.contextPath}/${userType}/publicservices/calculation/?applicationNumber=${queryStrings?.applicationNumber}&serviceCode=${queryStrings?.serviceCode}&state=${data?.Application?.[0]?.processInstance?.[0]?.state?.state}`,
    });
  };

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

  const getStatusInfo = (state) => {
    switch (state) {
      case "PERMIT_GRANTED":
        return { 
          color: "text-green-600", 
          bgColor: "bg-green-50", 
          icon: LuCircleCheck, 
          label: "Permis Accordé",
          progress: 100
        };
      case "PERMIT_REJECTED":
        return { 
          color: "text-red-600", 
          bgColor: "bg-red-50", 
          icon: LuCircleAlert, 
          label: "Permis Rejeté",
          progress: 0
        };
      case "INITIATED":
        return { 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          icon: LuFileText, 
          label: "Brouillon",
          progress: 10
        };
      default:
        return { 
          color: "text-blue-600", 
          bgColor: "bg-blue-50", 
          icon: LuClock, 
          label: "En cours d'examen",
          progress: 60
        };
    }
  };

  const statusInfo = getStatusInfo(processInstanceState);
  const StatusIcon = statusInfo.icon;

  const getServiceInfo = (businessService) => {
    const serviceMap = {
      BPA_PCO: {
        name: "Permis de Construire Ordinaire (PCO)",
        description: "Constructions Accueillant du Public"
      },
      BPA_PCO_SIMPLE: {
        name: "Permis de Construire Ordinaire (PCO)",
        description: "Constructions Simples"
      },
      BPA_PR: {
        name: "Permis de Remblai (PR)",
        description: "Autorisation pour travaux de remblai"
      },
      BPA_PL: {
        name: "Permis de Lotir",
        description: "Division d'un terrain en plusieurs lots"
      },
      BPA_PCS: {
        name: "Permis de Construire Simplifié (PCS)",
        description: "Pour les constructions de petite taille"
      },
      BPA_PD: {
        name: "Permis de Démolir",
        description: "Autorisation de démolition"
      },
      BPA_PF: {
        name: "Permis de Clôture",
        description: "Autorisation pour construire une clôture"
      },
      BPA_PS: {
        name: "Permis de Surélévation",
        description: "Ajout d'un ou plusieurs étages"
      },
      BPA_ATARR: {
        name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
        description: "ATARR pour tous types de travaux"
      },
      BPA_CCR: {
        name: "Certificat de Conformité de Remblai (CCR)",
        description: "Validation de conformité des travaux de remblai"
      },
      BPA_CCE: {
        name: "Certificat de Conformité Électrique (CCE)",
        description: "Validation de l'installation électrique"
      },
      BPA_CCP: {
        name: "Certificat de Conformité Parasismique (CCP)",
        description: "Validation des normes parasismiques"
      },
      BPA_CCG: {
        name: "Certificat de Conformité Général (CCG)",
        description: "Validation générale de conformité"
      },
      BPA_PV: {
        name: "Procès-Verbal d'Implantation",
        description: "PV d'Implantation pour positionnement"
      },
      BPA_APE: {
        name: "Approbation de Plan d'Exécution (APE)",
        description: "Validation des plans d'exécution"
      }
    };
    return serviceMap[businessService] || {
      name: businessService,
      description: "Service administratif en ligne"
    };
  };

  const serviceInfo = getServiceInfo(response?.businessService);
  const applicant = response?.applicants?.[0];
  const projectDetails = response?.serviceDetails?.landandProjectDesignDetails?.[0];
  const designOffice = response?.serviceDetails?.designOfficeDetailing?.[0];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: "overview", label: "Aperçu", icon: LuInfo },
    { id: "project", label: "Détails du projet", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    { id: "payments", label: "Paiements", icon: LuCreditCard },
    { id: "activities", label: "Activités", icon: LuActivity }
  ];

  const renderTimeline = (timeline, isParallelWorkflow) => {
    return [...timeline].reverse().map((instance, index) => {
      const isCurrentState = index === timeline.length - 1;
      const instanceBusinessService = instance?.businessService;
      const displayAction = t(`WF_${response?.module?.toUpperCase()}_${response?.businessService?.toUpperCase()}_${instance?.performedAction}`);
      const auditCreated = instance?.auditDetails?.created;

      return (
        <div key={index} className="flex items-start mb-6">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium mr-4 ${
            isCurrentState 
              ? 'border-djibouti-primary bg-djibouti-primary text-white' 
              : 'border-gray-300 bg-white text-gray-500'
          }`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium ${
                isCurrentState ? 'text-djibouti-primary' : 'text-gray-900'
              }`}>
                {displayAction}
              </h4>
              <span className="text-xs text-gray-500">
                {auditCreated ? new Date(auditCreated).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
            {instanceBusinessService && (
              <p className="text-xs text-gray-500 mt-1">
                Service: {instanceBusinessService}
              </p>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <React.Fragment className="min-h-screen bg-gray-50">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mx-6 mt-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => history.goBack()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <LuArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {response?.applicationNumber}
                </h1>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`w-4 h-4 mr-2 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {serviceInfo.name} - {serviceInfo.description}
              </h2>
              <p className="text-gray-600">
                Demande de {serviceInfo.name} pour un projet à {projectDetails?.siteLocation || projectDetails?.region || "N/A"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <LuPrinter className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <LuDownload className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LuUser className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Demandeur</p>
              <p className="text-sm font-medium text-gray-900">{applicant?.name || "N/A"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <LuMapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">District</p>
              <p className="text-sm font-medium text-gray-900">{projectDetails?.region || "N/A"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <LuCalendar className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Soumis le</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(response?.auditDetails?.createdTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <LuClock className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Étape</p>
              <p className="text-sm font-medium text-gray-900">2/11</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-6 mt-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-djibouti-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Progress Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LuChartBar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Progression de la demande</h3>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-djibouti-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${statusInfo.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Début</span>
                    <span>En cours</span>
                    <span>Terminé</span>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-sm font-medium text-gray-900">Étape 2/11</span>
                  </div>
                </div>
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applicant Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <LuUser className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Informations du demandeur</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Nom</p>
                      <p className="text-sm font-medium text-gray-900">{applicant?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        Particulier
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Location */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <LuMapPin className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Localisation du projet</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Adresse</p>
                      <p className="text-sm font-medium text-gray-900">
                        {projectDetails?.siteLocation || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">District</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                        {projectDetails?.region || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "project" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du projet</h3>
              
              {/* Project Details */}
              {projectDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Informations générales</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Type de travail</p>
                        <p className="text-sm font-medium text-gray-900">{projectDetails.workType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Surface couverte</p>
                        <p className="text-sm font-medium text-gray-900">{projectDetails.coveredProjectArea || "N/A"} m²</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Région</p>
                        <p className="text-sm font-medium text-gray-900">{projectDetails.region || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {designOffice && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Bureau d'études</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Nom du bureau</p>
                          <p className="text-sm font-medium text-gray-900">{designOffice.nameOfDesignOffice || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Architecte</p>
                          <p className="text-sm font-medium text-gray-900">{designOffice.architectName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900">{designOffice.telephone || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {response?.documents?.map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <LuFileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.documentType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(doc.auditDetails?.lastModifiedTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements</h3>
              
              {response?.additionalDetails?.costEstimation ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Estimation des coûts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Coût total du bâtiment</p>
                      <p className="text-lg font-bold text-gray-900">
                        {response.additionalDetails.costEstimation.totalBuildingCost?.toLocaleString()} Fdj
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Taxe totale</p>
                      <p className="text-lg font-bold text-gray-900">
                        {response.additionalDetails.costEstimation.totalTax?.toLocaleString()} Fdj
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Aucune information de paiement disponible</p>
              )}
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités</h3>
              
              <div className="relative">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                
                {service == queryStrings?.businessService &&
                  Array.isArray(timelineWorkflowDetails?.timeline) &&
                  renderTimeline(timelineWorkflowDetails.timeline, false)}

                {service != queryStrings?.businessService && 
                 Array.isArray(workflowDetails?.timeline) && 
                 renderTimeline(workflowDetails.timeline, true)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Actions */}
      <div className="fixed top-20 right-6 w-80 space-y-4">
        {!isCitizen && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
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
        )}

        {!isCitizen && isCalculationFees && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Calcul des droits</h3>
            {isCalculatioDone && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-3">
                <LuCircleCheck className="w-4 h-4 mr-2" />
                Rapport terminé
              </div>
            )}
            <button
              onClick={handleCalculationClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-djibouti-primary text-djibouti-primary rounded-xl hover:bg-djibouti-primary hover:text-white transition-colors"
            >
              <LuFileText className="w-4 h-4" />
              <span>Modifier le calcul</span>
            </button>
          </div>
        )}

        {!isCitizen && shouldShowChecklist && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Liste de vérification</h3>
            <ViewCheckListCards
              applicationId={data?.Application?.[0]?.id}
              state={data?.Application?.[0]?.processInstance?.[0]?.state?.state}
              checkListCodes={checkListCodes}
            />
          </div>
        )}

        {processInstanceState === "PERMIT_GRANTED" && isDownloadButtonEnable && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <button
              onClick={handlePdfDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-djibouti-primary text-white rounded-xl hover:bg-djibouti-primary-dark transition-colors"
            >
              <LuDownload className="w-4 h-4" />
              <span>Télécharger le permis</span>
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default DigitDemoViewComponent;
