import React from "react";
import PropTypes from "prop-types";

/**
 * Bloc d'information du Permis de Remblai — saisi par l'agent (Brigade Topo).
 *
 * Tous les champs sont éditables par l'agent. Persisté dans
 * `additionalDetails.agentChecklist.permitInfo` ; affiché sur la page de
 * détails (ProjectTab) dans le bloc "Détails du Permis de Remblai".
 *
 * IMPORTANT — les sous-composants (Field, RoField) sont définis HORS du
 * composant principal. Si on les définit à l'intérieur, React voit une
 * nouvelle identité de composant à chaque rendu → unmount/remount des inputs
 * → perte du focus pendant la frappe (le user retape sans cesse).
 */

const REGIONS = ["Djibouti-ville", "Arta", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock"];

const INPUT_CLASS =
  "w-full p-3 border border-gray-200 rounded-xl bg-white text-sm outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20";
const RO_CLASS =
  "w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 min-h-[2.75rem]";

const TextField = ({ label, value, onChange, placeholder, hint, required, type, isReadOnly }) => (
  <div>
    <label className="block mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {isReadOnly ? (
      <div className={RO_CLASS}>
        {value ? value : <span className="text-gray-400 italic">—</span>}
      </div>
    ) : (
      <input
        type={type || "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    )}
    {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
  </div>
);

export const PermitInfoSection = ({
  permitInfo,
  isViewMode,
  isEditMode,
  handlePermitInfoChange,
}) => {
  const isReadOnly = isViewMode && !isEditMode;
  const v = (k) => (permitInfo && permitInfo[k]) || "";
  const onChange = (k) => (e) => handlePermitInfoChange(k, e.target.value);

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-djibouti-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Informations du Permis de Remblai</h3>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextField
            label="Numéro du Permis de Remblai"
            value={v("prNumber")}
            onChange={onChange("prNumber")}
            placeholder="Ex : P1-PR-N°20/2026"
            hint="Format attendu : P1-PR-N°XX/AAAA"
            required
            isReadOnly={isReadOnly}
          />
        </div>

        <TextField
          label="Nom du pétitionnaire"
          value={v("applicantName")}
          onChange={onChange("applicantName")}
          placeholder="Ex : DANIA ALI DAOUD"
          required
          isReadOnly={isReadOnly}
        />
        <TextField
          label="Numéro du Titre Foncier"
          value={v("landTitleNumber")}
          onChange={onChange("landTitleNumber")}
          placeholder="Ex : 24726"
          required
          isReadOnly={isReadOnly}
        />
        <TextField
          label="Localisation de la parcelle"
          value={v("terrainLocation")}
          onChange={onChange("terrainLocation")}
          placeholder="Ex : Lotissement Haramous Lot n°24"
          required
          isReadOnly={isReadOnly}
        />

        {/* Région — dropdown */}
        <div>
          <label className="block mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            Région <span className="text-red-500">*</span>
          </label>
          {isReadOnly ? (
            <div className={RO_CLASS}>
              {v("region") ? v("region") : <span className="text-gray-400 italic">—</span>}
            </div>
          ) : (
            <select
              value={v("region")}
              onChange={onChange("region")}
              className={INPUT_CLASS}
            >
              <option value="">Sélectionner une région</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
        </div>

        <TextField
          label="Surface de la parcelle (m²)"
          value={v("terrainSurface")}
          onChange={onChange("terrainSurface")}
          placeholder="Ex : 500"
          type="number"
          required
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
};

PermitInfoSection.propTypes = {
  permitInfo: PropTypes.object,
  isViewMode: PropTypes.bool,
  isEditMode: PropTypes.bool,
  handlePermitInfoChange: PropTypes.func.isRequired,
};
