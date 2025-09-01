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
      // Common blocks for most service types
      landandProjectDesignDetails: response?.serviceDetails?.landandProjectDesignDetails || [],
      designOfficeDetailing: response?.serviceDetails?.designOfficeDetailing || [],
      legalEntityDetails: response?.serviceDetails?.legalEntityDetails || [],
      
      // For P13 (BPA_CCG) - Certificate of Conformity
      originalPermitDetails: response?.serviceDetails?.originalPermitDetails || [],
      conformityCertificatesDetails: response?.serviceDetails?.conformityCertificatesDetails || [],
      
      // For P3 (BPA_PR) - Fill Permit
      terrainDetails: response?.serviceDetails?.terrainDetails || [],
      
      // For P6 (BPA_PD) - Demolition Permit - additional fields
      demolitionDetails: response?.serviceDetails?.demolitionDetails || [],
      
      // For P7 (BPA_PF) - Project File - additional fields
      projectFileDetails: response?.serviceDetails?.projectFileDetails || [],
      
      // For P8 (BPA_PS) - Elevation Permit - additional fields
      elevationDetails: response?.serviceDetails?.elevationDetails || [],
      
      // For P4 (BPA_PL) - Layout Permit - additional fields
      layoutDetails: response?.serviceDetails?.layoutDetails || [],
      
      // For P1 (BPA_PCO) - Construction Permit - additional fields
      constructionDetails: response?.serviceDetails?.constructionDetails || [],
      
      // For P2 (BPA_PCO_SIMPLE) - Simple Construction Permit - additional fields
      simpleConstructionDetails: response?.serviceDetails?.simpleConstructionDetails || [],
      
      // For P10 (BPA_CCR) - Backfill Verification Certificate
      terrainVerificationDetails: response?.serviceDetails?.terrainVerificationDetails || [],
      testResultsDetails: response?.serviceDetails?.testResultsDetails || [],
      
      // For P11 (BPA_CCE) - Construction Completion Certificate
      propertyDetails: response?.serviceDetails?.propertyDetails || [],
      
      // For P14 (BPA_PV) - Project Validation
      projectDetails: response?.serviceDetails?.projectDetails || []
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
