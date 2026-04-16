import React from "react";
import PropTypes from "prop-types";

// PCO-Number format hint shown next to the "Numéro du Permis de Construire"
// label. Each service has its own P-ref (P1..P15) and permit suffix, e.g.
//   BPA_PCO_SIMPLE → "P3-PCO-N°184/2026"
//   BPA_PCO        → "P4-PCO-N°184/2026"
const SERVICE_PCO_FORMAT = {
  BPA_PR: "P1-PR-N°184/2026",
  BPA_CCR: "P2-CCR-N°184/2026",
  BPA_PCO_SIMPLE: "P3-PCO-N°184/2026",
  BPA_PCO: "P4-PCO-N°184/2026",
  BPA_PL: "P5-PL-N°184/2026",
  BPA_PS: "P6-PS-N°184/2026",
  BPA_PCS: "P7-PCS-N°184/2026",
  BPA_PF: "P8-PF-N°184/2026",
  BPA_PD: "P9-PD-N°184/2026",
  BPA_ATARR: "P10-ATARR-N°184/2026",
  BPA_PV: "P11-PV-N°184/2026",
  BPA_APE: "P12-APE-N°184/2026",
  BPA_CCE: "P13-CCE-N°184/2026",
  BPA_CCP: "P14-CCP-N°184/2026",
  BPA_CCG: "P15-CCG-N°184/2026",
};

const TopFieldsSection = ({ formData, errors, isViewMode, isEditMode, handleInputChange, service }) => {
  const pcoFormat = SERVICE_PCO_FORMAT[service] || "P?-PCO-N°184/2026";
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="md:col-span-2">
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Numéro du Permis de Construire <span className="font-normal text-xs text-gray-500">(format : {pcoFormat})</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.pcoNumber || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.pcoNumber || ""}
            onChange={(e) => handleInputChange("pcoNumber", e.target.value)}
            placeholder="Ex: P3-PCO-N°184/2026"
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
        )}
      </div>

      <div className="md:col-span-2" />

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

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Numéro de Titre Foncier
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.landTitleNumber || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.landTitleNumber || ""}
            onChange={(e) => handleInputChange("landTitleNumber", e.target.value)}
            placeholder="Ex: TF 12345"
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">Région</label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.region || "Non renseigné"}
          </div>
        ) : (
          <select
            value={formData.region || ""}
            onChange={(e) => handleInputChange("region", e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)] bg-white"
          >
            <option value="">Sélectionner une région</option>
            {["Djibouti-ville", "Arta", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">Coefficient d'Emprise au Sol (C.E.S)</label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.ces || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.ces || ""}
            onChange={(e) => handleInputChange("ces", e.target.value)}
            placeholder="Ex: 35%"
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">Coefficient d'Occupation du Sol (C.O.S)</label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.cos || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.cos || ""}
            onChange={(e) => handleInputChange("cos", e.target.value)}
            placeholder="Ex: 100%"
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">Destination du projet</label>
        {isViewMode && !isEditMode ? (
          <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
            {formData.destination || "Non renseigné"}
          </div>
        ) : (
          <input
            type="text"
            value={formData.destination || ""}
            onChange={(e) => handleInputChange("destination", e.target.value)}
            placeholder="Ex: Habitation"
            className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
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
  service: PropTypes.string,
};

export default TopFieldsSection;








