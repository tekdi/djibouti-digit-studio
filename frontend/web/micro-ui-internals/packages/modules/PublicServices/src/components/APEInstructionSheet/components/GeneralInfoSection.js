import React from "react";
import PropTypes from "prop-types";

const FIELDS = [
  { key: "ownerName", label: "Nom du propriétaire / pétitionnaire", placeholder: "À reprendre depuis la demande", required: true },
  { key: "registrationNumber", label: "N° d'enregistrement SDECC / APE", placeholder: "ex. P12-APE-N°000…/2026", required: true },
  { key: "projectTitle", label: "Intitulé du projet", placeholder: "Ex. Construction d'un immeuble R+4", required: true },
  { key: "projectLocation", label: "Localisation du projet / de la parcelle", placeholder: "À reprendre depuis le permis de construire", required: true },
  { key: "projectDestination", label: "Destination du projet", placeholder: "Habitation, commerce, équipement…", required: true, type: "select", options: ["Habitation", "Commerce", "Équipement", "Bureaux", "Mixte", "Autre"] },
  { key: "permitNumber", label: "Numéro du permis de construire délivré", placeholder: "ex. 398/2025", required: true },
  { key: "permitIssueDate", label: "Date de délivrance du permis de construire", required: true, type: "date" },
  { key: "foundationType", label: "Type de fondation prévu", required: true, type: "select", options: ["Semelles", "Radier", "Radier inversé", "Autre"] },
  { key: "constructiveSystem", label: "Système constructif", required: true, type: "select", options: ["Béton armé", "Structure métallique", "Mixte", "Bois", "Autre"] },
  { key: "totalLevels", label: "Nombre total de niveaux", placeholder: "ex. 4", required: true, type: "number" },
  { key: "approvedBuiltArea", label: "Surface totale bâtie approuvée (m²)", placeholder: "ex. 320", required: true, type: "number" },
];

const GeneralInfoSection = ({ values, onChange, isDisabled }) => {
  const handle = (key) => (e) => onChange(key, e.target.value);
  return (
    <div className="mb-8">
      <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
        <h3 className="text-xl font-bold text-gray-900">I. Informations générales</h3>
        <p className="text-sm text-gray-500 mt-1">À reprendre depuis la demande et le permis de construire délivré.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            {f.type === "select" ? (
              <select
                value={values[f.key] || ""}
                onChange={handle(f.key)}
                disabled={isDisabled}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:border-djibouti-primary focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">— Sélectionner —</option>
                {f.options.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            ) : (
              <input
                type={f.type || "text"}
                value={values[f.key] || ""}
                onChange={handle(f.key)}
                placeholder={f.placeholder}
                disabled={isDisabled}
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:border-djibouti-primary focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

GeneralInfoSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

export default GeneralInfoSection;
