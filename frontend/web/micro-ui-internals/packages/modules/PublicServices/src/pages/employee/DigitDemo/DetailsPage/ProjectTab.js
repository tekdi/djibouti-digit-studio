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
      // Map the data to match the field definitions in dataValues files
      landandProjectDesignDetails: response?.serviceDetails?.landandProjectDesignDetails || [],
      designOfficeDetailing: response?.serviceDetails?.designOfficeDetailing || [],
      legalEntityDetails: response?.serviceDetails?.legalEntityDetails || [],
      // For P13 (BPA_CCG) - Certificate of Conformity
      originalPermitDetails: response?.serviceDetails?.originalPermitDetails || [],
      conformityCertificatesDetails: response?.serviceDetails?.conformityCertificatesDetails || []
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
