import React from "react";
import PropTypes from "prop-types";

const FIELDS = [
  { key: "voieReference", label: "Voie de référence" },
  { key: "coteVoieNiveauMer", label: "Côte de la voie / niveau mer" },
  { key: "volumeRemblai", label: "Volume de remblai nécessaire (m³)" },
  { key: "hauteurMaximale", label: "Hauteur maximale" },
  { key: "nombreCouches", label: "Nombre de couches" },
];

export const TechnicalInfoSection = ({
  technicalInfo,
  isViewMode,
  isEditMode,
  handleTechnicalInfoChange,
}) => {
  const isEditable = !isViewMode || isEditMode;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-djibouti-primary rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">Informations techniques complémentaires</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 p-6 rounded-xl border border-gray-200 bg-white">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {field.label}
            </label>
            {isEditable ? (
              <input
                type="text"
                value={technicalInfo[field.key] || ""}
                onChange={(e) => handleTechnicalInfoChange(field.key, e.target.value)}
                placeholder="-"
                className="w-full px-3 py-2.5 text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 focus:border-djibouti-primary transition-all"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900 py-2.5">
                {technicalInfo[field.key] || "-"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

TechnicalInfoSection.propTypes = {
  technicalInfo: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleTechnicalInfoChange: PropTypes.func.isRequired,
};
