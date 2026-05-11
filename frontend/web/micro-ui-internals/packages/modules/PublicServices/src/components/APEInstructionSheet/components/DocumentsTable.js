import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { LuUpload, LuFileText, LuTrash2, LuDownload, LuEye } from "react-icons/lu";
import { DOCUMENTS_LIST, OBSERVATION_OPTIONS } from "../documentsData";
import { PDFPreview } from "../../ChecklistCards/Common";

// Group docs by category to render the Catégorie column with a rowSpan
const groupByCategory = (docs) => {
  const groups = [];
  let current = null;
  for (const d of docs) {
    if (!current || current.category !== d.category) {
      current = { category: d.category, docs: [] };
      groups.push(current);
    }
    current.docs.push(d);
  }
  return groups;
};

const DocumentsTable = ({
  formData,
  isViewMode,
  isEditMode,
  uploadingFiles,
  handleObservationToggle,
  handleDocumentChange,
  handleFileUpload,
  removeFile,
  downloadFile,
  getColorClass,
  getFileUrl,
}) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState({});
  const groups = useMemo(() => groupByCategory(DOCUMENTS_LIST), []);
  const isDisabled = isViewMode && !isEditMode;

  const handlePreviewFile = async (fileStoreId) => {
    if (!fileStoreId) return;
    setLoadingFiles((prev) => ({ ...prev, [`preview_${fileStoreId}`]: true }));
    try {
      const fileUrl = await getFileUrl(fileStoreId);
      if (fileUrl) {
        setPreviewFile({ fileStoreId, fileUrl, fileName: `Document_${fileStoreId}.pdf` });
      } else if (Digit.Toast) {
        Digit.Toast.error("Impossible de charger le fichier");
      }
    } catch (e) {
      console.error("Error previewing file:", e);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`preview_${fileStoreId}`]: false }));
    }
  };

  const handleFileUploadWithValidation = (docId, files, accept = ".pdf") => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = accept.toLowerCase().split(",").map((s) => s.trim().replace(".", ""));
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowed.includes(ext)) {
      if (Digit.Toast) Digit.Toast.error(`Format ${ext} non accepté. Formats: ${allowed.join(", ")}`);
      return;
    }
    handleFileUpload(docId, files);
  };

  const renderDocRow = (doc, isFirstOfCategory, categoryRowSpan) => {
    const docData = formData.documents.find((d) => String(d.id) === String(doc.id)) || {
      observations: [], comments: "", modifiedFiles: "",
    };
    // For the digital file (DWG / PLN), allow those formats too
    const acceptedFormats = doc.category === "Fichier numérique" ? ".pdf,.dwg,.pln" : ".pdf";
    const acceptLabel = doc.category === "Fichier numérique" ? "Ajouter fichier" : "Ajouter PDF";

    return (
      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
        {isFirstOfCategory && (
          <td
            rowSpan={categoryRowSpan}
            className="border border-gray-200 p-3 text-sm font-semibold text-gray-700 bg-djibouti-primary/5 align-top w-32"
          >
            {doc.category}
          </td>
        )}
        <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600 w-12">{doc.id}</td>
        <td className="border border-gray-200 p-3 text-sm text-gray-800 min-w-[280px]">
          <div className="font-medium">{doc.label}</div>
        </td>
        <td className="border border-gray-200 p-3 text-xs text-gray-600 italic w-40">{doc.statut}</td>
        <td className="border border-gray-200 p-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {OBSERVATION_OPTIONS.map((option) => {
              const isChecked = docData.observations.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-1.5 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name={`obs-${doc.id}`}
                    checked={isChecked}
                    onChange={() => !isDisabled && handleObservationToggle(doc.id, option.value)}
                    disabled={isDisabled}
                    className="w-4 h-4 cursor-pointer accent-djibouti-primary"
                  />
                  <span className={`text-xs font-medium ${getColorClass(option.color)}`}>{option.label}</span>
                </label>
              );
            })}
          </div>
        </td>
        <td className="border border-gray-200 p-3 min-w-[220px]">
          {isDisabled ? (
            <div className="text-sm text-gray-700">{docData.comments || "Aucun commentaire"}</div>
          ) : (
            <textarea
              value={docData.comments}
              onChange={(e) => handleDocumentChange(doc.id, "comments", e.target.value)}
              placeholder={doc.commentHint || "Commentaires…"}
              rows="2"
              className="w-full p-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-djibouti-primary"
            />
          )}
        </td>
        <td className="border border-gray-200 p-3 min-w-[200px]">
          {isDisabled ? (
            docData.modifiedFiles ? (
              <div className="flex items-center gap-2">
                <button onClick={() => handlePreviewFile(docData.modifiedFiles)} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                  <LuEye className="h-3 w-3" /> Aperçu
                </button>
                <button onClick={() => downloadFile(docData.modifiedFiles)} className="inline-flex items-center gap-1 px-2 py-1 bg-djibouti-primary/10 text-djibouti-primary rounded text-xs font-medium hover:bg-djibouti-primary/20">
                  <LuDownload className="h-3 w-3" /> Télécharger
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Aucun fichier</span>
            )
          ) : docData.modifiedFiles ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => handlePreviewFile(docData.modifiedFiles)} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                <LuEye className="h-3 w-3" /> Aperçu
              </button>
              <button onClick={() => downloadFile(docData.modifiedFiles)} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                <LuFileText className="h-3 w-3" /> Fichier
              </button>
              <button onClick={() => removeFile(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Supprimer">
                <LuTrash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200">
              <input
                type="file"
                accept={acceptedFormats}
                className="hidden"
                onChange={(e) => handleFileUploadWithValidation(doc.id, e.target.files, acceptedFormats)}
                disabled={uploadingFiles[doc.id]}
              />
              {uploadingFiles[doc.id] ? "Téléchargement…" : (
                <span className="inline-flex items-center gap-2">
                  <LuUpload className="h-4 w-4" />
                  {acceptLabel}
                </span>
              )}
            </label>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
        <h3 className="text-xl font-bold text-gray-900">II. Documents</h3>
        <p className="text-sm text-gray-500 mt-1">Vérifiez chaque document et indiquez son état (Conforme / Non conforme / Manquant / Non concerné).</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-32">Catégorie</th>
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 w-12">N°</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[280px]">Document à vérifier</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-40">Statut attendu</th>
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">Observations</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Commentaires</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Fichier modificatif</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) =>
              g.docs.map((doc, idx) => renderDocRow(doc, idx === 0, g.docs.length))
            )}
          </tbody>
        </table>
      </div>
      {previewFile && (
        <PDFPreview
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
          onDownload={() => downloadFile(previewFile.fileStoreId)}
        />
      )}
    </div>
  );
};

DocumentsTable.propTypes = {
  formData: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  uploadingFiles: PropTypes.object.isRequired,
  handleObservationToggle: PropTypes.func.isRequired,
  handleDocumentChange: PropTypes.func.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
  getColorClass: PropTypes.func.isRequired,
  getFileUrl: PropTypes.func.isRequired,
};

export default DocumentsTable;
