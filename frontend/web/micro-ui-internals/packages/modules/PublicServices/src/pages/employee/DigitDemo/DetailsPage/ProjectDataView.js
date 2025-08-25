import React from "react";
import { useTranslation } from "react-i18next";
import { 
  LuUser, 
  LuBuilding, 
  LuFileText, 
  LuCircleCheck,
  LuDownload,
  LuMapPin,
  LuPhone,
  LuMail,
  LuCalendar,
  LuHash
} from "react-icons/lu";

const ProjectDataView = ({ 
  serviceCode, 
  data, 
  status, 
  applicationNumber, 
  businessService 
}) => {
  const { t } = useTranslation();

  if (!data) return null;

  const { applicants = [], additionalDetails = {}, documents = [], serviceDetails = {} } = data;

  const downloadFile = async (fileStoreId) => {
    try {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);

      if (response?.data?.[fileStoreId]) {
        window.open(response.data[fileStoreId], "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const renderValue = (value) => {
    if (!value) return "N/A";

    if (typeof value === "boolean") {
      return value ? "Oui" : "Non";
    }

    if (typeof value === "object") {
      if (value.name) {
        return t(value.name);
      }
      return value.code || "N/A";
    }

    return value;
  };

  const renderField = (label, value, icon = null) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{renderValue(value)}</span>
    </div>
  );

  const renderCheckbox = (label, checked) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
        checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );

  const renderDocument = (doc, index) => (
    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <LuFileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{t(doc?.documentType)}</p>
          <p className="text-xs text-gray-500">Document #{index + 1}</p>
        </div>
      </div>
      <button
        onClick={() => downloadFile(doc.fileStoreId)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <LuDownload className="w-4 h-4" />
        Télécharger
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Project Details */}
      {serviceDetails.landInfo && Object.keys(serviceDetails.landInfo).length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <LuBuilding className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Détails du projet</h3>
          </div>
          <div className="space-y-1">
            {renderField("Type de travail", serviceDetails.landInfo.workType, <LuBuilding className="w-4 h-4" />)}
            {renderField("Surface couverte", `${serviceDetails.landInfo.coveredProjectArea || 0} m²`, <LuMapPin className="w-4 h-4" />)}
            {renderField("Région", serviceDetails.landInfo.region, <LuMapPin className="w-4 h-4" />)}
            {renderField("Localisation", serviceDetails.landInfo.siteLocation, <LuMapPin className="w-4 h-4" />)}
            {serviceDetails.landInfo.area && renderField("Surface totale", `${serviceDetails.landInfo.area} m²`, <LuMapPin className="w-4 h-4" />)}
            {serviceDetails.landInfo.constructionCostPerSqMt && renderField("Coût par m²", `${serviceDetails.landInfo.constructionCostPerSqMt} Fdj`, <LuHash className="w-4 h-4" />)}
          </div>
        </div>
      )}

      {/* Design Office Details */}
      {serviceDetails.designOffice && serviceDetails.designOffice.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <LuBuilding className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Bureau d'études</h3>
          </div>
          {serviceDetails.designOffice.map((office, index) => (
            <div key={index} className="space-y-1">
              {renderField("Nom du bureau", office.nameOfDesignOffice, <LuBuilding className="w-4 h-4" />)}
              {renderField("Architecte", office.architectName, <LuUser className="w-4 h-4" />)}
              {renderField("Téléphone", `+253 ${office.telephone}`, <LuPhone className="w-4 h-4" />)}
              {renderField("Email", office.officeEmail, <LuMail className="w-4 h-4" />)}
              {renderField("Numéro d'enregistrement", office.registrationNo, <LuHash className="w-4 h-4" />)}
              {office.registrationNoOnProfessionalRoll && renderField("Numéro professionnel", office.registrationNoOnProfessionalRoll, <LuHash className="w-4 h-4" />)}
            </div>
          ))}
        </div>
      )}

      {/* Legal Entity Details */}
      {serviceDetails.legalEntity && serviceDetails.legalEntity.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <LuBuilding className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Entité légale</h3>
          </div>
          {serviceDetails.legalEntity.map((entity, index) => (
            <div key={index} className="space-y-1">
              {renderField("Raison sociale", entity.corporateName, <LuBuilding className="w-4 h-4" />)}
              {renderField("Type de société", entity.companyType, <LuBuilding className="w-4 h-4" />)}
              {renderField("Numéro d'enregistrement", entity.registrationNumber, <LuHash className="w-4 h-4" />)}
            </div>
          ))}
        </div>
      )}

      {/* Declarations */}
      {additionalDetails?.applicants && Object.keys(additionalDetails.applicants).length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <LuCircleCheck className="w-4 h-4 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Déclarations</h3>
          </div>
          <div className="space-y-2">
            {additionalDetails.applicants.accuracyDeclaration && renderCheckbox("Déclaration d'exactitude", true)}
            {additionalDetails.applicants.checkValidation && renderCheckbox("Validation des informations", true)}
            {additionalDetails.applicants.eligibilityDeclaration && renderCheckbox("Déclaration d'éligibilité", true)}
            {additionalDetails.applicants.taxCalculationAgreement && renderCheckbox("Accord de calcul des taxes", true)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDataView;
