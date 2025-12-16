import React from "react";
import PropTypes from "prop-types";

const TopFieldsSection = ({ formData, errors, isViewMode, isEditMode, handleInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Nom et prénom du pétitionnaire <span className="text-red-500">*</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.applicantName || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.applicantName}
            onChange={(e) => handleInputChange("applicantName", e.target.value)}
            placeholder="Entrez le nom complet"
            className={`w-full p-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              errors.applicantName
                ? "border-red-500 focus:border-red-600"
                : "border-gray-200 focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
            }`}
          />
        )}
        {errors.applicantName && (
          <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Type de Projet <span className="text-red-500">*</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.projectType || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.projectType}
            onChange={(e) => handleInputChange("projectType", e.target.value)}
            placeholder="Ex: Construction résidentielle"
            className={`w-full p-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              errors.projectType
                ? "border-red-500 focus:border-red-600"
                : "border-gray-200 focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
            }`}
          />
        )}
        {errors.projectType && (
          <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Localisation de la parcelle <span className="text-red-500">*</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.plotLocation || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.plotLocation}
            onChange={(e) => handleInputChange("plotLocation", e.target.value)}
            placeholder="Ex: Quartier 5, Lot 123"
            className={`w-full p-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              errors.plotLocation
                ? "border-red-500 focus:border-red-600"
                : "border-gray-200 focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
            }`}
          />
        )}
        {errors.plotLocation && (
          <p className="text-red-500 text-xs mt-1">{errors.plotLocation}</p>
        )}
      </div>
    </div>
  );
};

TopFieldsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default TopFieldsSection;







