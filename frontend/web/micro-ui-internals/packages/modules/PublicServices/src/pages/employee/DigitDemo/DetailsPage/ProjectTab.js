import React from "react";
import { useTranslation } from "react-i18next";
import { LuUser, LuBuilding, LuPenTool, LuPhone, LuMail, LuHash, LuMapPin } from "react-icons/lu";
import ProjectDataView from "./ProjectDataView";

const companyTypeMap = {
  "BPA_COMPANYTYPE_COMPANYTYPE_SARL": "SARL",
  "BPA_COMPANYTYPE_COMPANYTYPE_SA": "SA",
  "BPA_COMPANYTYPE_COMPANYTYPE_SAS": "SAS",
  "BPA_COMPANYTYPE_COMPANYTYPE_EURL": "EURL",
  "BPA_COMPANYTYPE_COMPANYTYPE_SCI": "SCI",
  "BPA_COMPANYTYPE_COMPANYTYPE_OTHER": "Autre",
};

const idTypeMap = {
  "BPA_IDENTITYTYPE_IDTYPE_NATIONALIDNUMBER": "Carte d'identité nationale",
  "BPA_IDENTITYTYPE_IDTYPE_PASSPORT": "Passeport",
  "BPA_IDENTITYTYPE_IDTYPE_DRIVERLICENSE": "Permis de conduire",
  "BPA_IDENTITYTYPE_IDTYPE_OTHER": "Autre",
};

const InfoField = ({ label, value, icon: Icon }) => {
  if (!value || value === "N/A" || value === 0 || value === "0") return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, iconBg, iconColor, title }) => (
  <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
    <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
    </div>
    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
  </div>
);

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

  // Applicant info
  const rootApplicant = response?.applicants?.[0];
  const responseApplicant = response?.serviceDetails?.responseData?.Application?.applicants?.[0];
  const applicant = (responseApplicant?.name ? responseApplicant : rootApplicant) || {};
  const additionalApplicant = response?.additionalDetails?.applicants || {};

  // Architect info
  const rdProcessInstances = response?.serviceDetails?.responseData?.Application?.processInstance || [];
  const draftPi = rdProcessInstances.find(pi => pi.action === "DRAFT") || rdProcessInstances[0];
  const submitter = draftPi?.assigner;
  const isArchitectSubmission = submitter?.roles?.some(r => r.code === "BPA_ARCHITECT");

  // Company info
  const legalEntity = response?.serviceDetails?.legalEntityDetails?.[0];
  const hasCompany = legalEntity?.corporateName;

  // Design office
  const designOffice = response?.serviceDetails?.designOfficeDetailing?.[0];
  const hasArchitectOrDesignOffice = isArchitectSubmission || designOffice;

  const applicationData = {
    applicants: response?.applicants || [],
    additionalDetails: response?.additionalDetails || {},
    documents: response?.documents || [],
    serviceDetails: {
      landandProjectDesignDetails: response?.serviceDetails?.landandProjectDesignDetails || [],
      designOfficeDetailing: response?.serviceDetails?.designOfficeDetailing || [],
      legalEntityDetails: response?.serviceDetails?.legalEntityDetails || [],
      originalPermitDetails: response?.serviceDetails?.originalPermitDetails || [],
      conformityCertificatesDetails: response?.serviceDetails?.conformityCertificatesDetails || [],
      terrainDetails: response?.serviceDetails?.terrainDetails || [],
      demolitionDetails: response?.serviceDetails?.demolitionDetails || [],
      projectFileDetails: response?.serviceDetails?.projectFileDetails || [],
      elevationDetails: response?.serviceDetails?.elevationDetails || [],
      layoutDetails: response?.serviceDetails?.layoutDetails || [],
      constructionDetails: response?.serviceDetails?.constructionDetails || [],
      simpleConstructionDetails: response?.serviceDetails?.simpleConstructionDetails || [],
      terrainVerificationDetails: response?.serviceDetails?.terrainVerificationDetails || [],
      testResultsDetails: response?.serviceDetails?.testResultsDetails || [],
      propertyDetails: response?.serviceDetails?.propertyDetails || [],
      projectDetails: response?.serviceDetails?.projectDetails || [],
    },
  };

  return (
    <div>
      {/* Top row: Informations du demandeur (left) + service-specific blocks (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Single card with Demandeur + Company + Architect sections */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          {/* Demandeur section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <LuUser className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informations du demandeur</h3>
          </div>
          <InfoField label="Nom et prénom" value={applicant.name} icon={LuUser} />
          <InfoField label="Téléphone" value={applicant.mobileNumber ? `${applicant.prefix ? `+${applicant.prefix} ` : "+253 "}${applicant.mobileNumber}` : null} icon={LuPhone} />
          <InfoField label="Email" value={applicant.emailId !== "user1@example.com" ? applicant.emailId : null} icon={LuMail} />
          <InfoField label="Pièce d'identité" value={idTypeMap[additionalApplicant.idType] || additionalApplicant.idType} icon={LuHash} />
          <InfoField label="N° pièce d'identité" value={additionalApplicant.nationalIdNumber} icon={LuHash} />
          <InfoField label="Adresse" value={additionalApplicant.address} icon={LuMapPin} />

          {/* Company section */}
          {hasCompany && (
            <React.Fragment>
              <SectionTitle icon={LuBuilding} iconBg="bg-amber-100" iconColor="text-amber-600" title="Entreprise / Personne morale" />
              <InfoField label="Raison sociale" value={legalEntity.corporateName} icon={LuBuilding} />
              <InfoField label="Forme juridique" value={companyTypeMap[legalEntity.companyType] || t(legalEntity.companyType)} icon={LuHash} />
              <InfoField label="N° d'immatriculation" value={legalEntity.registrationNumber} icon={LuHash} />
              {legalEntity.otherCompanyType && (
                <InfoField label="Autre type" value={legalEntity.otherCompanyType} icon={LuHash} />
              )}
            </React.Fragment>
          )}

          {/* Architect / Design office section */}
          {hasArchitectOrDesignOffice && (
            <React.Fragment>
              <SectionTitle icon={LuPenTool} iconBg="bg-violet-100" iconColor="text-violet-600" title="Architecte / Cabinet" />
              {isArchitectSubmission && submitter && (
                <React.Fragment>
                  <InfoField label="Nom" value={submitter.name} icon={LuUser} />
                  <InfoField label="Téléphone" value={submitter.mobileNumber ? `+253 ${submitter.mobileNumber}` : null} icon={LuPhone} />
                  <InfoField label="Email" value={submitter.emailId} icon={LuMail} />
                </React.Fragment>
              )}
              {designOffice && (
                <React.Fragment>
                  {!isArchitectSubmission && <InfoField label="Architecte" value={designOffice.architectName} icon={LuUser} />}
                  <InfoField label="Bureau d'études" value={designOffice.nameOfDesignOffice} icon={LuBuilding} />
                  {!isArchitectSubmission && <InfoField label="Téléphone" value={designOffice.telephone ? `+253 ${designOffice.telephone}` : null} icon={LuPhone} />}
                  <InfoField label="Email du bureau" value={designOffice.officeEmail} icon={LuMail} />
                  <InfoField label="N° d'inscription" value={designOffice.registrationNo} icon={LuHash} />
                  <InfoField label="N° tableau professionnel" value={designOffice.registrationNoOnProfessionalRoll} icon={LuHash} />
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>

        {/* RIGHT: Service-specific data blocks (first block only to pair with left) */}
        <div>
          <ProjectDataView
            serviceCode={serviceCode}
            data={applicationData}
            status={workflowDetails?.processInstances?.[0]?.state?.state}
            applicationNumber={response?.applicationNumber}
            businessService={response?.businessService?.toUpperCase()}
            singleColumn={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
