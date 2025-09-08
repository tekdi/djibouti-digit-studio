import React from "react";
import { useTranslation } from "react-i18next";

const PersonTypeSelector = ({
  value,
  onChange,
  required,
  options = [],
  // FieldV1 props
  setValue,
  config,
  formData,
  props: fieldProps = {},
  // Additional props that might be passed
  onSelect,
  data,
}) => {
  const { t } = useTranslation();

  // Get the field name from config
  const fieldName = config?.populators?.name || config?.name;

  // Get current value from formData if not provided directly
  // Handle nested field names like "applicantDetails.0.personType"
  let currentValue = value || "";
  if (!currentValue && fieldName && formData) {
    if (fieldName.includes(".")) {
      // Handle nested field names like "applicantDetails.0.personType"
      const parts = fieldName.split(".");
      let current = formData;
      for (const part of parts) {
        if (current && typeof current === "object") {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }
      currentValue = current || "";
    } else {
      currentValue = formData[fieldName] || "";
    }
  }

  // Get options from config if not provided directly
  const fieldOptions = options.length > 0 ? options : config?.options || [];

  const handleSelection = (selectedValue) => {
    // Try multiple ways to update the value
    if (onChange) {
      onChange(selectedValue);
    } else if (setValue && fieldName) {
      setValue(fieldName, selectedValue);
    } else if (onSelect && fieldName) {
      onSelect(fieldName, selectedValue);
    } else if (fieldProps.onChange) {
      fieldProps.onChange(selectedValue);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personne physique button */}
        <button
          type="button"
          onClick={() => handleSelection("INDIVIDUAL")}
          className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
            currentValue === "INDIVIDUAL" || (typeof currentValue === "object" && currentValue?.code === "INDIVIDUAL")
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                currentValue === "INDIVIDUAL" || (typeof currentValue === "object" && currentValue?.code === "INDIVIDUAL")
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Personne physique</div>
              <div className="text-sm text-gray-500">Particulier</div>
            </div>
          </div>
        </button>

        {/* Personne morale button */}
        <button
          type="button"
          onClick={() => handleSelection("LEGAL_ENTITY")}
          className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
            currentValue === "LEGAL_ENTITY" || (typeof currentValue === "object" && currentValue?.code === "LEGAL_ENTITY")
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                currentValue === "LEGAL_ENTITY" || (typeof currentValue === "object" && currentValue?.code === "LEGAL_ENTITY")
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Personne morale</div>
              <div className="text-sm text-gray-500">Entreprise, association</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PersonTypeSelector;
