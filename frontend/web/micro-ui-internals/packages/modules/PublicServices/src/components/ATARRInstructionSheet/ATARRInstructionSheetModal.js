import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "@egovernments/digit-ui-components";
import {
  LuX, LuSave, LuCamera, LuDownload, LuEye, LuTrash2, LuUpload, LuFileText, LuFile,
} from "react-icons/lu";
import { useATARRInstructionSheetAPI } from "./hooks/useATARRInstructionSheetAPI";

const DEFAULT_FORM = {
  pcoNumber: "",
  applicantName: "",
  projectType: "",
  plotLocation: "",
  plotArea: "",
  region: "",
  landTitleNumber: "",
  builtArea: "",
  notes: "",
  photos: [],
};

const REGIONS = ["Djibouti-ville", "Arta", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock"];

const ATARRInstructionSheetModal = ({
  isOpen,
  onClose,
  applicationNumber,
  service,
  serviceCode,
  state,
  onSuccess,
  isViewMode = false,
  isViewOnly = false,
  existingData = null,
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, submitFiche, uploadFile, getFileUrl, downloadFile } =
    useATARRInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const readOnly = isViewMode && !isEditMode;

  useEffect(() => {
    if (existingData) {
      setFormData({
        ...DEFAULT_FORM,
        ...existingData,
        photos: Array.isArray(existingData.photos) ? existingData.photos : [],
      });
    }
  }, [existingData]);

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) uploaded.push(await uploadFile(f));
      setFormData((p) => ({ ...p, photos: [...(p.photos || []), ...uploaded] }));
      setToast({ label: "Fichier(s) ajouté(s)", isError: false });
    } catch (err) {
      setToast({ label: "Erreur lors du téléchargement", isError: true });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (i) =>
    setFormData((p) => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }));

  const handlePreview = async (file) => {
    const url = await getFileUrl(file);
    if (!url) return;
    const isImg =
      (file.documentType && file.documentType.indexOf("image/") === 0) ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || "");
    setPreviewType(isImg ? "image" : "pdf");
    setPreviewUrl(url);
  };

  const validate = () => {
    const e = {};
    if (!formData.applicantName?.trim()) e.applicantName = "Champ requis";
    if (!formData.projectType?.trim()) e.projectType = "Champ requis";
    if (!formData.plotLocation?.trim()) e.plotLocation = "Champ requis";
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
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
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
      {toast && (
        <Toast label={toast.label} error={toast.isError} isDleteBtn={true} onClose={() => setToast(null)} />
      )}
      <div className="bg-white w-full h-full overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fiche d'instruction — Détails du projet d'extension</h2>
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

        {/* Body */}
        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              {field("pcoNumber", "Numéro du Permis de Construire", {
                placeholder: "Ex: P10-ATARR-N°184/2026",
                hint: "P10-ATARR-N°184/2026",
              })}
            </div>
            {field("applicantName", "Nom et Prénoms du Pétitionnaire", {
              required: true,
              placeholder: "Entrez le nom complet",
            })}
            {field("projectType", "Type de Projet", {
              required: true,
              placeholder: "Ex: Extension résidentielle",
            })}
            {field("plotLocation", "Localisation de la Parcelle", {
              required: true,
              placeholder: "Ex: Quartier 5, Lot 123",
            })}
            {field("plotArea", "Surface de la parcelle (m²)", {
              placeholder: "Ex: 400",
            })}
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
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}
            </div>
            {field("landTitleNumber", "Numéro du Titre Foncier", { placeholder: "Ex: TF 12345" })}
            {field("builtArea", "Surface bâtie (m²)", { placeholder: "Ex: 250" })}
          </div>

          {/* Notes */}
          <div className="mb-8">
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

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Photos & Documents</h4>
                {formData.photos?.length > 0 && (
                  <span className="text-xs text-gray-400 font-medium">
                    ({formData.photos.length} fichier{formData.photos.length > 1 ? "s" : ""})
                  </span>
                )}
              </div>
              {!readOnly && (
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-djibouti-primary border border-djibouti-primary/30 bg-djibouti-primary/5 hover:bg-djibouti-primary/10 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <React.Fragment>
                      <div className="h-4 w-4 border-2 border-djibouti-primary border-t-transparent rounded-full animate-spin" />
                      Téléchargement...
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <LuUpload className="h-4 w-4" />
                      Ajouter des fichiers
                    </React.Fragment>
                  )}
                </label>
              )}
            </div>
            {formData.photos?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {formData.photos.map((photo, index) => {
                  const isImg =
                    (photo.documentType && photo.documentType.indexOf("image/") === 0) ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(photo.fileName || "");
                  const isPdf =
                    photo.documentType === "application/pdf" || /\.pdf$/i.test(photo.fileName || "");
                  const Icon = isImg ? LuCamera : isPdf ? LuFileText : LuFile;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 px-5 py-4 bg-white hover:bg-gray-50 ${
                        index > 0 ? "border-t border-gray-100" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                          isImg ? "bg-blue-50" : isPdf ? "bg-red-50" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isImg ? "text-blue-500" : isPdf ? "text-red-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{photo.fileName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isImg ? "Image" : isPdf ? "PDF" : "Document"}
                          {photo.size ? ` · ${(photo.size / 1024).toFixed(0)} KB` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePreview(photo)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Prévisualiser"
                        >
                          <LuEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(photo)}
                          className="p-2 text-gray-500 hover:text-djibouti-primary hover:bg-djibouti-primary/10 rounded-lg"
                          title="Télécharger"
                        >
                          <LuDownload className="h-4 w-4" />
                        </button>
                        {!readOnly && (
                          <button
                            onClick={() => removePhoto(index)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Supprimer"
                          >
                            <LuTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-center">
                <LuCamera className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Aucun fichier ajouté</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1200] flex items-center justify-center p-6"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-bold text-gray-700">Prévisualisation</span>
              <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-gray-200 rounded-xl">
                <LuX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-6">
              {previewType === "image" ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[75vh] rounded-lg border border-gray-200 bg-white" title="Preview" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ATARRInstructionSheetModal.propTypes = {
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

export default ATARRInstructionSheetModal;
