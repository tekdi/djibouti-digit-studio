import React from "react";
import { useTranslation } from "react-i18next";
import { LuUser, LuBuilding, LuPenTool, LuPhone, LuMail, LuHash, LuMapPin, LuFileText } from "react-icons/lu";
import ProjectDataView from "./ProjectDataView";

// PF-specific fiche block (Permis de Clôture). Includes closureType +
// perimeter in addition to the shared identity fields.
const FichePFProjectBlock = ({ fiche }) => {
  if (!fiche) return null;
  const rows = [
    { label: "Numéro du Permis de Construire", value: fiche.pcoNumber },
    { label: "Nom et Prénoms du Pétitionnaire", value: fiche.applicantName },
    { label: "Type de clôture", value: fiche.closureType },
    { label: "Localisation de la Parcelle", value: fiche.plotLocation },
    { label: "Numéro du Titre Foncier", value: fiche.landTitleNumber },
    { label: "Surface de la parcelle (m²)", value: fiche.plotArea },
    { label: "Périmètre de la parcelle (ml)", value: fiche.perimeter },
    { label: "Région", value: fiche.region },
  ].filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== "");
  if (rows.length === 0) return null;
  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <LuFileText className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Détails du Permis de Clôture</h3>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// PD-specific fiche block (Permis de Démolition). Adds demolitionType.
const FichePDProjectBlock = ({ fiche }) => {
  if (!fiche) return null;
  const rows = [
    { label: "Numéro du Permis de Construire", value: fiche.pcoNumber },
    { label: "Nom et Prénoms du Pétitionnaire", value: fiche.applicantName },
    { label: "Type de démolition", value: fiche.demolitionType },
    { label: "Localisation de la Parcelle", value: fiche.plotLocation },
    { label: "Numéro du Titre Foncier", value: fiche.landTitleNumber },
    { label: "Surface de la parcelle (m²)", value: fiche.plotArea },
    { label: "Région", value: fiche.region },
  ].filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== "");
  if (rows.length === 0) return null;
  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <LuFileText className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Détails du Permis de Démolition</h3>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// PCS-specific fiche block. Rendered on the Demande tab for BPA_PCS
// applications when the "Fiche d'instruction — Détails du projet simplifié"
// has been filled. Same shape as the ATARR block (no CES/COS/destination,
// just plotArea + builtArea + the identity fields).
const FichePCSProjectBlock = ({ fiche }) => {
  if (!fiche) return null;
  const rows = [
    { label: "Numéro du Permis de Construire", value: fiche.pcoNumber },
    { label: "Nom et Prénoms du Pétitionnaire", value: fiche.applicantName },
    { label: "Type de Projet", value: fiche.projectType },
    { label: "Localisation de la Parcelle", value: fiche.plotLocation },
    { label: "Numéro du Titre Foncier", value: fiche.landTitleNumber },
    { label: "Surface de la parcelle (m²)", value: fiche.plotArea },
    { label: "Surface bâtie (m²)", value: fiche.builtArea },
    { label: "Région", value: fiche.region },
  ].filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== "");

  if (rows.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <LuFileText className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Détails du projet simplifié</h3>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ATARR-specific fiche block. Rendered on the Demande tab for BPA_ATARR
// applications when the "Fiche d'instruction — Détails du projet d'extension"
// has been filled from the Instruction tab. Mirrors FicheSRAProjectBlock but
// with the reduced ATARR field set (plotArea instead of CES/COS).
const FicheATARRProjectBlock = ({ fiche }) => {
  if (!fiche) return null;
  const rows = [
    { label: "Numéro du Permis de Construire", value: fiche.pcoNumber },
    { label: "Nom et Prénoms du Pétitionnaire", value: fiche.applicantName },
    { label: "Type de Projet", value: fiche.projectType },
    { label: "Localisation de la Parcelle", value: fiche.plotLocation },
    { label: "Surface de la parcelle (m²)", value: fiche.plotArea },
    { label: "Région", value: fiche.region },
    { label: "Numéro du Titre Foncier", value: fiche.landTitleNumber },
    { label: "Surface bâtie (m²)", value: fiche.builtArea },
  ].filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== "");

  if (rows.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <LuFileText className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Détails du projet d'extension</h3>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Block rendered from the SRA Fiche d'instruction. Replaces the raw
// `landandProjectDesignDetails` / `projectDetails` block on the Demande tab
// so the reviewer sees the SRA-curated values rather than the applicant's
// initial submission data.
const FicheSRAProjectBlock = ({ fiche }) => {
  if (!fiche) return null;

  // Order requested:
  //   1) Numéro du Permis de Construire
  //   2) Nom et Prénoms du Pétitionnaire
  //   3) Type de Projet
  //   4) Localisation de la Parcelle
  //   5) Région
  //   6) Numéro du Titre Foncier
  //   7) Coefficient d'Emprise au Sol (C.E.S)
  //   8) Coefficient d'Occupation du Sol (C.O.S)
  //   9) Destination du Projet
  const rows = [
    { label: "Numéro du Permis de Construire", value: fiche.pcoNumber },
    { label: "Nom et Prénoms du Pétitionnaire", value: fiche.applicantName },
    { label: "Type de Projet", value: fiche.projectType },
    { label: "Localisation de la Parcelle", value: fiche.plotLocation },
    { label: "Région", value: fiche.region },
    { label: "Numéro du Titre Foncier", value: fiche.landTitleNumber },
    { label: "Coefficient d'Emprise au Sol (C.E.S) %", value: fiche.ces },
    { label: "Coefficient d'Occupation du Sol (C.O.S) %", value: fiche.cos },
    { label: "Surface bâtie (m²)", value: fiche.builtArea },
    { label: "Destination du Projet", value: fiche.destination },
  ].filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== "");

  if (rows.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <LuFileText className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Détails du projet</h3>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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

        {/* RIGHT: Service-specific data blocks. When the SRA Fiche d'instruction
            has been filled, its fields replace the "Détails du projet" block
            sourced from the raw submission data — the reviewer sees the curated
            values. */}
        <div className="space-y-6">
          <FicheSRAProjectBlock fiche={response?.additionalDetails?.instructionSheet} />
          <FicheATARRProjectBlock fiche={response?.additionalDetails?.atarrInstructionSheet} />
          <FichePCSProjectBlock fiche={response?.additionalDetails?.pcsInstructionSheet} />
          <FichePFProjectBlock fiche={response?.additionalDetails?.pfInstructionSheet} />
          <FichePDProjectBlock fiche={response?.additionalDetails?.pdInstructionSheet} />
          <ProjectDataView
            serviceCode={serviceCode}
            data={applicationData}
            status={workflowDetails?.processInstances?.[0]?.state?.state}
            applicationNumber={response?.applicationNumber}
            businessService={response?.businessService?.toUpperCase()}
            singleColumn={true}
            hideProjectDetailsBlock={
              !!response?.additionalDetails?.instructionSheet ||
              !!response?.additionalDetails?.atarrInstructionSheet ||
              !!response?.additionalDetails?.pcsInstructionSheet ||
              !!response?.additionalDetails?.pfInstructionSheet ||
              !!response?.additionalDetails?.pdInstructionSheet
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
