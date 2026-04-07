import React, { useState } from "react";
import PropTypes from "prop-types";
import { LuUpload, LuFileText, LuTrash2, LuDownload, LuEye } from "react-icons/lu";
import { DOCUMENTS_LIST, OBSERVATION_OPTIONS } from "../documentsData";
import { PDFPreview } from "../../ChecklistCards/Common";

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

  const handlePreviewFile = async (fileStoreId) => {
    if (!fileStoreId) return;
    setLoadingFiles((prev) => ({ ...prev, [`preview_${fileStoreId}`]: true }));
    try {
      const fileUrl = await getFileUrl(fileStoreId);
      if (fileUrl) {
        setPreviewFile({
          fileStoreId,
          fileUrl,
          fileName: `Document_${fileStoreId}.pdf`,
        });
      } else if (Digit.Toast) {
        Digit.Toast.error("Impossible de charger le fichier");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors de la prévisualisation du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`preview_${fileStoreId}`]: false }));
    }
  };

  const handleFileUploadWithValidation = (docId, files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      if (Digit.Toast) Digit.Toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }
    handleFileUpload(docId, files);
  };

  const renderRow = (doc) => {
    const docData = formData.documents.find((d) => String(d.id) === String(doc.id)) || {
      observations: [],
      comments: "",
      modifiedFiles: "",
    };

    const isDisabled = isViewMode && !isEditMode;
    const indexCell = doc.isSubItem ? doc.subLabel : doc.id;
    const labelCell = (
      <span className={doc.isSubItem ? "pl-6 text-gray-600 italic" : "font-medium text-gray-800"}>
        {doc.label}
      </span>
    );

    // For section parent rows (item 5) we still allow observations on the parent row,
    // matching the spec.
    return (
      <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${doc.isSubItem ? "bg-gray-50/40" : ""}`}>
        <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600 w-12">
          {indexCell}
        </td>
        <td className="border border-gray-200 p-3 text-sm text-gray-700">
          {labelCell}
        </td>
        <td className="border border-gray-200 p-3">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {OBSERVATION_OPTIONS.map((option) => {
              const isChecked = docData.observations.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 cursor-pointer ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      !isDisabled && handleObservationToggle(doc.id, option.value)
                    }
                    disabled={isDisabled}
                    className="w-4 h-4 rounded border-2 cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${getColorClass(option.color)}`}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </td>
        <td className="border border-gray-200 p-3 min-w-[200px]">
          {isDisabled ? (
            <div className="text-sm text-gray-700">
              {docData.comments || "Aucun commentaire"}
            </div>
          ) : (
            <textarea
              value={docData.comments}
              onChange={(e) => handleDocumentChange(doc.id, "comments", e.target.value)}
              placeholder="Commentaires..."
              rows="2"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-djibouti-primary transition-colors"
            />
          )}
        </td>
        <td className="border border-gray-200 p-3 min-w-[220px]">
          {isDisabled ? (
            docData.modifiedFiles ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreviewFile(docData.modifiedFiles)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  <LuEye className="h-3 w-3" />
                  Prévisualiser
                </button>
                <button
                  onClick={() => downloadFile(docData.modifiedFiles)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-djibouti-primary/10 text-djibouti-primary rounded text-xs font-medium hover:bg-djibouti-primary/20 transition-colors"
                >
                  <LuDownload className="h-3 w-3" />
                  Télécharger
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Aucun fichier</span>
            )
          ) : docData.modifiedFiles ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePreviewFile(docData.modifiedFiles)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                <LuEye className="h-3 w-3" />
                Prévisualiser
              </button>
              <button
                onClick={() => downloadFile(docData.modifiedFiles)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
              >
                <LuFileText className="h-3 w-3" />
                Fichier
              </button>
              <button
                onClick={() => removeFile(doc.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <LuTrash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileUploadWithValidation(doc.id, e.target.files)}
                disabled={uploadingFiles[doc.id]}
              />
              {uploadingFiles[doc.id] ? (
                "Téléchargement..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LuUpload className="h-4 w-4" />
                  Ajouter PDF
                </span>
              )}
            </label>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Contrôle des documents — Plans d'Exécution
        </h3>
        <p className="text-sm text-gray-500">
          Vérifiez chaque document et indiquez son état (Conforme / Non-conforme / Manquant)
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 w-12">
                #
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[300px]">
                Documents
              </th>
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 min-w-[280px]">
                Observations
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                Commentaires
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                Fichiers modificatifs
              </th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS_LIST.map(renderRow)}
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
