import React from "react";
import { useTranslation } from "react-i18next";
import ProjectDataView from "./ProjectDataView";

const ProjectTab = ({ 
  response, 
  serviceConfig, 
  queryStrings, 
  selectedBusinessService,
  workflowDetails 
}) => {
  const { t } = useTranslation();
  const { module, service } = queryStrings;
  const serviceCode = `${module?.toUpperCase()}_${service?.toUpperCase()}`;

  // Extract the required data for ProjectDataView
  const applicationData = {
    applicants: response?.applicants || [],
    additionalDetails: response?.additionalDetails || {},
    documents: response?.documents || [],
    serviceDetails: {
      landInfo: response?.serviceDetails?.landandProjectDesignDetails?.[0] || {},
      designOffice: response?.serviceDetails?.designOfficeDetailing || [],
      legalEntity: response?.serviceDetails?.legalEntityDetails || []
    },
  };

  return (
    <div className="space-y-6">      
      <ProjectDataView
        serviceCode={serviceCode}
        data={applicationData}
        status={workflowDetails?.processInstances?.[0]?.state?.state}
        applicationNumber={response?.applicationNumber}
        businessService={response?.businessService?.toUpperCase()}
      />
    </div>
  );
};

export default ProjectTab;
