import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { LuSave, LuCamera, LuTrash2, LuDownload, LuEye, LuFileText, LuX, LuFile, LuUpload, LuCheck } from "react-icons/lu";
import { useAgentReportForm } from "./hooks/useAgentReportForm";
import { useAgentReportAPI } from "./hooks/useAgentReportAPI";

const AgentReportInline = ({ service, state, t, isViewOnly = false }) => {
  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [existingData, setExistingData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState({});

  const {
    formData, uploadingFiles,
    handleInputChange, handleFileUpload, removeFile, setFormData,
  } = useAgentReportForm();

  const { submitChecklist, downloadFile, getFileUrl } = useAgentReportAPI(tenantId, serviceCode, applicationNumber);

  const loadData = useCallback(async () => {
    if (!applicationNumber || !serviceCode) return;
    try {
      var request = {
        url: "/public-service/v1/application/" + serviceCode,
        method: "GET",
        params: { applicationNumber: applicationNumber, tenantId: tenantId },
      };
      var response = await Digit.CustomService.getResponse(request);
      var app = response && response.Application && response.Application[0];
      if (app && app.additionalDetails && app.additionalDetails.agentChecklist) {
        setExistingData(app.additionalDetails.agentChecklist);
        setFormData(app.additionalDetails.agentChecklist);
      }
    } catch (e) {
      console.error("Error loading agent checklist:", e);
    }
  }, [applicationNumber, serviceCode, tenantId, setFormData]);

  useEffect(function () { loadData(); }, [loadData]);

  var handleSave = async function () {
    setIsSaving(true);
    try {
      var isEdit = Boolean(existingData);
      await submitChecklist(formData, service, state, isEdit, existingData);
      setShowSuccess(true);
      setTimeout(function () { setShowSuccess(false); }, 3000);
      loadData();
    } catch (e) {
      console.error("Error saving:", e);
      if (Digit.Toast) Digit.Toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  var handlePreview = async function (file) {
    setLoadingPreview(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n[file.fileStoreId] = true; return n; });
    try {
      var url = await getFileUrl(file);
      if (url) {
        var isImage = (file.documentType && file.documentType.indexOf("image/") === 0) ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || "");
        setPreviewType(isImage ? "image" : "pdf");
        setPreviewUrl(url);
      }
    } catch (e) {
      console.error("Error previewing:", e);
    } finally {
      setLoadingPreview(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n[file.fileStoreId] = false; return n; });
    }
  };

  if (!applicationNumber || !service) return null;

  var photos = formData.photos || [];

  return (
    <div className="w-full">
      {/* Success banner */}
      {showSuccess && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-[fadeIn_0.2s_ease-out]">
          <LuCheck className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Enregistré avec succès</span>
        </div>
      )}

      {/* Notes section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Commentaires / Observations</h4>
        </div>
        {isViewOnly ? (
          <div className="w-full min-h-[120px] p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed">
            {formData.notes || "Aucun commentaire."}
          </div>
        ) : (
          <textarea
            value={formData.notes || ""}
            onChange={function (e) { handleInputChange("notes", e.target.value); }}
            placeholder="Entrez vos commentaires ou observations..."
            rows="6"
            className="w-full p-5 border border-gray-200 rounded-xl text-sm resize-y outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 transition-all"
          />
        )}
      </div>

      {/* Files section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Photos & Documents</h4>
            {photos.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">({photos.length} fichier{photos.length > 1 ? "s" : ""})</span>
            )}
          </div>
          {!isViewOnly && (
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-djibouti-primary border border-djibouti-primary/30 bg-djibouti-primary/5 hover:bg-djibouti-primary/10 cursor-pointer transition-all">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={function (e) { handleFileUpload(e, "photos"); }}
                disabled={uploadingFiles}
              />
              {uploadingFiles ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-djibouti-primary border-t-transparent rounded-full animate-spin" />
                  Téléchargement...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LuUpload className="h-4 w-4" />
                  Ajouter des fichiers
                </span>
              )}
            </label>
          )}
        </div>

        {photos.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {photos.map(function (photo, index) {
              var isImage = (photo.documentType && photo.documentType.indexOf("image/") === 0) ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(photo.fileName || "");
              var isPdf = photo.documentType === "application/pdf" ||
                /\.pdf$/i.test(photo.fileName || "");
              var FileIcon = isImage ? LuCamera : isPdf ? LuFileText : LuFile;

              return (
                <div
                  key={index}
                  className={"flex items-center gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors" + (index > 0 ? " border-t border-gray-100" : "")}
                >
                  <div className={"flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center " + (isImage ? "bg-blue-50" : isPdf ? "bg-red-50" : "bg-gray-100")}>
                    <FileIcon className={"h-5 w-5 " + (isImage ? "text-blue-500" : isPdf ? "text-red-500" : "text-gray-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{photo.fileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isImage ? "Image" : isPdf ? "PDF" : "Document"}
                      {photo.size ? " · " + (photo.size / 1024).toFixed(0) + " KB" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={function () { handlePreview(photo); }}
                      disabled={loadingPreview[photo.fileStoreId]}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Prévisualiser"
                    >
                      {loadingPreview[photo.fileStoreId] ? (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LuEye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={function () { downloadFile(photo); }}
                      className="p-2 text-gray-500 hover:text-djibouti-primary hover:bg-djibouti-primary/10 rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <LuDownload className="h-4 w-4" />
                    </button>
                    {!isViewOnly && (
                      <button
                        onClick={function () { removeFile("photos", index); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Save */}
      {!isViewOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-djibouti-primary text-white rounded-xl font-semibold hover:bg-djibouti-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LuSave className="h-4 w-4" />
                Enregistrer
              </span>
            )}
          </button>
        </div>
      )}

      {/* Preview overlay */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-6" onClick={function () { setPreviewUrl(null); }}>
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-bold text-gray-700">Prévisualisation</span>
              <button onClick={function () { setPreviewUrl(null); }} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                <LuX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-6">
              {previewType === "image" ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[75vh] rounded-lg border border-gray-200 bg-white" title="PDF Preview" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AgentReportInline.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

export default AgentReportInline;
