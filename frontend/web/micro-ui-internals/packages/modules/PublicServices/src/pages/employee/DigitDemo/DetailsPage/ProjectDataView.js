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
import { getServiceData } from "./dataValues";

const ProjectDataView = ({
  serviceCode,
  data,
  status,
  applicationNumber,
  businessService,
  singleColumn = false
}) => {
  const { t } = useTranslation();

  if (!data) return null;

  const { additionalDetails = {}, serviceDetails = {} } = data;
  
  // Get hardcoded data based on business service
  const hardcodedData = getServiceData(businessService);

  // Normalize Djibouti-style "BPA_<SERVICE>_LEGALSTATUS_<human text>" values
  // into the clean French label that follows the _LEGALSTATUS_ segment.
  const normalizeLegalStatus = (value) => {
    if (typeof value !== "string") return value;
    const match = value.match(/_LEGALSTATUS_(.+)$/i);
    if (!match) return value;
    const raw = match[1].trim();
    // Title case the result so "CERTIFICAT D'INSCRIPTION" -> "Certificat d'Inscription"
    return raw
      .toLocaleLowerCase("fr-FR")
      .replace(/(^|[\s'’\-])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase("fr-FR"));
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

    // Special case: legal status keys contain embedded French text with spaces/apostrophes,
    // so normal i18n lookup won't work. Strip the prefix and title-case the French value.
    if (typeof value === "string" && /_LEGALSTATUS_/i.test(value)) {
      return normalizeLegalStatus(value);
    }

    // Handle BPA_ translation keys
    if (typeof value === "string" && value.startsWith("BPA_")) {
      return t(value);
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

  // Create blocks array for grid layout
  const blocks = [];

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const icons = {
      LuUser, LuBuilding, LuFileText, LuCircleCheck, LuDownload, 
      LuMapPin, LuPhone, LuMail, LuCalendar, LuHash
    };
    return icons[iconName] || LuBuilding;
  };

  // Get color classes by color name
  const getColorClasses = (color) => {
    const colors = {
      purple: "from-purple-50 to-violet-50 border-purple-100 bg-purple-100 text-purple-600",
      orange: "from-orange-50 to-amber-50 border-orange-100 bg-orange-100 text-orange-600",
      teal: "from-teal-50 to-cyan-50 border-teal-100 bg-teal-100 text-teal-600",
      green: "from-green-50 to-emerald-50 border-green-100 bg-green-100 text-green-600",
      pink: "from-pink-50 to-rose-50 border-pink-100 bg-pink-100 text-pink-600"
    };
    return colors[color] || colors.purple;
  };

  // Blocks that are now shown in the "Informations du demandeur" card in ProjectTab,
  // so we should not duplicate them here.
  const EXCLUDED_BLOCKS = new Set(["designOfficeDetailing", "legalEntityDetails"]);

  // Render blocks based on service configuration
  if (hardcodedData && hardcodedData.blocks) {
    Object.entries(hardcodedData.blocks).forEach(([blockKey, blockConfig]) => {
      if (EXCLUDED_BLOCKS.has(blockKey)) return;

      const data = serviceDetails[blockKey];

      // Check if data exists and has any non-empty values
      const hasValidData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
      let hasAnyValues = false;

      if (hasValidData) {
        (Array.isArray(data) ? data : [data]).forEach((item) => {
          blockConfig.fields.forEach((field) => {
            const value = item[field.key];
            if (value !== undefined && value !== null && value !== '') {
              hasAnyValues = true;
            }
          });
        });
      }

      // Skip rendering entirely when there is no data to show
      if (!hasAnyValues) return;

      const colorClasses = getColorClasses(blockConfig.color);
      const IconComponent = getIconComponent(blockConfig.icon);

      blocks.push(
        <div key={blockKey} className={`bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-2xl p-6 border ${colorClasses.split(' ')[2]}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 ${colorClasses.split(' ')[3]} rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${colorClasses.split(' ')[4]}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{blockConfig.title}</h3>
          </div>

          {(Array.isArray(data) ? data : [data]).map((item, index) => (
            <div key={index} className="space-y-1">
              {blockConfig.fields.map((field, fieldIndex) => {
                const value = item[field.key];
                if (value !== undefined && value !== null && value !== '') {
                  const FieldIcon = getIconComponent(field.icon);
                  let displayValue = value;

                  if (field.prefix) displayValue = field.prefix + value;
                  if (field.suffix) displayValue = value + field.suffix;

                  return renderField(field.label, displayValue, <FieldIcon className="w-4 h-4" />);
                }
                return null;
              })}
            </div>
          ))}
        </div>
      );
    });
  }

  //
  // 
  //  Declarations Block (always show if available) TODO: Check if this is needed
  // if (additionalDetails?.applicants && Object.keys(additionalDetails.applicants).length > 0) {
  //   blocks.push(
  //     <div key="declarations" className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
  //       <div className="flex items-center gap-3 mb-4">
  //         <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
  //           <LuCircleCheck className="w-4 h-4 text-pink-600" />
  //         </div>
  //         <h3 className="text-lg font-semibold text-gray-900">Déclarations</h3>
  //       </div>
  //       <div className="space-y-2">
  //         {additionalDetails.applicants.accuracyDeclaration && renderCheckbox("Déclaration d'exactitude", true)}
  //         {additionalDetails.applicants.checkValidation && renderCheckbox("Validation des informations", true)}
  //         {additionalDetails.applicants.eligibilityDeclaration && renderCheckbox("Déclaration d'éligibilité", true)}
  //         {additionalDetails.applicants.taxCalculationAgreement && renderCheckbox("Accord de calcul des taxes", true)}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`grid grid-cols-1 ${singleColumn ? "" : "lg:grid-cols-2"} gap-6`}>
      {blocks}
    </div>
  );
};

export default ProjectDataView;
