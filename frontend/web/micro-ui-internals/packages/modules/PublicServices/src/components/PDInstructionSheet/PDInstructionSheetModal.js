import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "@egovernments/digit-ui-components";
import { LuX, LuSave } from "react-icons/lu";
import { usePDInstructionSheetAPI } from "./hooks/usePDInstructionSheetAPI";

const DEFAULT_FORM = {
  pcoNumber: "",
  applicantName: "",
  demolitionType: "",
  plotLocation: "",
  landTitleNumber: "",
  plotArea: "",
  region: "",
  notes: "",
};

const REGIONS = ["Djibouti-ville", "Arta", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock"];

const PDInstructionSheetModal = ({
  isOpen, onClose, applicationNumber, service, serviceCode, state,
  onSuccess, isViewMode = false, isViewOnly = false, existingData = null,
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, submitFiche } = usePDInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState(null);

  const readOnly = isViewMode && !isEditMode;

  useEffect(() => {
    if (existingData) setFormData({ ...DEFAULT_FORM, ...existingData });
  }, [existingData]);

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.applicantName || !String(formData.applicantName).trim()) e.applicantName = "Champ requis";
    if (!formData.demolitionType || !String(formData.demolitionType).trim()) e.demolitionType = "Champ requis";
    if (!formData.plotLocation || !String(formData.plotLocation).trim()) e.plotLocation = "Champ requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setToast({ label: "Veuillez remplir les champs obligatoires", isError: true });
      return;
    }
    try {
      await submitFiche(formData, service, state, Boolean(existingData), existingData);
      if (Digit.Toast) Digit.Toast.success("Fiche enregistrée");
      setTimeout(() => { onSuccess && onSuccess(); onClose(); }, 800);
    } catch (err) {
      if (Digit.Toast) Digit.Toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (!isOpen) return null;

  const field = (name, label, { required, placeholder, hint, type = "text" } = {}) => (
    <div>
      <label className="block mb-2 font-semibold text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="font-normal text-xs text-gray-500"> (format : {hint})</span>}
      </label>
      {readOnly ? (
        <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
          {formData[name] || "Non renseigné"}
        </div>
      ) : (
        <input
          type={type}
          value={formData[name] || ""}
          onChange={(e) => handleChange(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 border-2 rounded-xl outline-none transition ${
            errors[name]
              ? "border-red-500 focus:border-red-600"
              : "border-gray-200 focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          }`}
        />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      {toast && <Toast label={toast.label} error={toast.isError} isDleteBtn={true} onClose={() => setToast(null)} />}
      <div className="bg-white w-full h-full overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fiche d'instruction — Détails du Permis de Démolition</h2>
            <p className="text-xs text-gray-500 mt-0.5">Demande {applicationNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            {!isViewOnly && isViewMode && !isEditMode && existingData && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-djibouti-primary text-djibouti-primary hover:bg-djibouti-primary/5"
              >
                Modifier
              </button>
            )}
            {!isViewOnly && (!isViewMode || isEditMode) && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-djibouti-primary text-white hover:bg-djibouti-primary-dark disabled:opacity-50"
              >
                <LuSave className="h-4 w-4" />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
              <LuX className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              {field("pcoNumber", "Numéro du Permis de Construire", {
                placeholder: "Ex: P9-PDEM-N°184/2026",
                hint: "P9-PDEM-N°184/2026",
              })}
            </div>
            {field("applicantName", "Nom et Prénoms du Pétitionnaire", { required: true, placeholder: "Nom complet" })}
            {field("demolitionType", "Type de démolition", { required: true, placeholder: "Ex: Totale, partielle…" })}
            {field("plotLocation", "Localisation de la Parcelle", { required: true, placeholder: "Ex: Quartier 5, Lot 123" })}
            {field("landTitleNumber", "Numéro du Titre Foncier", { placeholder: "Ex: TF 12345" })}
            {field("plotArea", "Surface de la parcelle (m²)", { placeholder: "Ex: 400" })}
            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-700">Région</label>
              {readOnly ? (
                <div className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                  {formData.region || "Non renseigné"}
                </div>
              ) : (
                <select
                  value={formData.region || ""}
                  onChange={(e) => handleChange("region", e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
                >
                  <option value="">Sélectionner une région</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Commentaires / Observations</h4>
            </div>
            {readOnly ? (
              <div className="w-full min-h-[120px] p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                {formData.notes || "Aucun commentaire."}
              </div>
            ) : (
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={6}
                placeholder="Entrez vos commentaires ou observations..."
                className="w-full p-5 border border-gray-200 rounded-xl text-sm resize-y outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PDInstructionSheetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string,
  onSuccess: PropTypes.func,
  isViewMode: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  existingData: PropTypes.object,
};

export default PDInstructionSheetModal;
