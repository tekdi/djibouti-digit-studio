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
  tenantId,
  applicationDocuments = [],
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
      } else {
        if (Digit.Toast) {
          Digit.Toast.error("Impossible de charger le fichier");
        }
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

  const handleDownloadFile = async (fileStoreId) => {
    if (!fileStoreId) return;
    
    setLoadingFiles((prev) => ({ ...prev, [`download_${fileStoreId}`]: true }));
    
    try {
      await downloadFile(fileStoreId);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors du téléchargement du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`download_${fileStoreId}`]: false }));
    }
  };

  const handleFileUploadWithValidation = (docId, files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      if (Digit.Toast) {
        Digit.Toast.error("Seuls les fichiers PDF sont acceptés");
      }
      return;
    }

    handleFileUpload(docId, files);
  };

  // Find application document by index (for first 19 documents only)
  const getApplicationDocument = (docId) => {
    // Only show application documents for first 19 documents (not the 20th - AutoCAD file)
    if (docId > 19) return null;
    
    // Map document index to application document index (assuming they are in the same order)
    // We'll use the document index (docId - 1) to find the corresponding application document
    const appDocIndex = docId - 1;
    if (applicationDocuments && applicationDocuments[appDocIndex]) {
      return applicationDocuments[appDocIndex];
    }
    return null;
  };

  // Check if file is PDF
  const isPdfFile = (fileStoreId) => {
    // We'll assume all files can be previewed, but we'll check the file extension if available
    // For now, we'll try to preview all files and handle errors gracefully
    return true;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Contenu du dossier</h3>
        <p className="text-sm text-gray-500">
          Vérifiez chaque document et indiquez son état
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-12">
                #
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[300px]">
                Documents
              </th>
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 min-w-[250px]">
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
            {DOCUMENTS_LIST.map((doc) => {
              const docData = formData.documents.find((d) => d.id === doc.id) || {
                observations: [],
                comments: "",
                modifiedFiles: "",
              };

              // Get application document for first 19 documents only
              const appDoc = doc.id <= 19 ? getApplicationDocument(doc.id) : null;
              const hasAppFile = appDoc && appDoc.fileStoreId;

              return (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600">
                    {doc.id}
                  </td>
                  <td className="border border-gray-200 p-3 text-sm text-gray-700">
                    {doc.label}
                  </td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex items-center justify-center gap-4">
                      {OBSERVATION_OPTIONS.map((option) => {
                        const isChecked = docData.observations.includes(option.value);
                        const isDisabled = isViewMode && !isEditMode;

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
                  <td className="border border-gray-200 p-3">
                    {isViewMode && !isEditMode ? (
                      <div className="text-sm text-gray-700">
                        {docData.comments || "Aucun commentaire"}
                      </div>
                    ) : (
                      <textarea
                        value={docData.comments}
                        onChange={(e) =>
                          handleDocumentChange(doc.id, "comments", e.target.value)
                        }
                        placeholder="Commentaires..."
                        rows="2"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-djibouti-primary transition-colors"
                      />
                    )}
                  </td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex flex-col gap-3">
                      {/* Application uploaded files (for first 19 documents only) */}
                      {hasAppFile && (
                        <div className="flex flex-col gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-xs font-semibold text-blue-700 mb-1">
                            Fichier du dossier
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {isPdfFile(appDoc.fileStoreId) && (
                              <button
                                onClick={() => handlePreviewFile(appDoc.fileStoreId)}
                                disabled={loadingFiles[`preview_${appDoc.fileStoreId}`]}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingFiles[`preview_${appDoc.fileStoreId}`] ? (
                                  <span className="inline-flex items-center gap-1">
                                    <div className="h-3 w-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                    Chargement...
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <LuEye className="h-3 w-3" />
                                    Prévisualiser
                                  </span>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadFile(appDoc.fileStoreId)}
                              disabled={loadingFiles[`download_${appDoc.fileStoreId}`]}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingFiles[`download_${appDoc.fileStoreId}`] ? (
                                <span className="inline-flex items-center gap-1">
                                  <div className="h-3 w-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                                  Téléchargement...
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <LuDownload className="h-3 w-3" />
                                  Télécharger
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Modified files section */}
                      {isViewMode && !isEditMode ? (
                        docData.modifiedFiles ? (
                          <div className="flex flex-col gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-xs font-semibold text-amber-700 mb-1">
                              Fichiers modificatifs
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePreviewFile(docData.modifiedFiles)}
                                disabled={loadingFiles[`preview_${docData.modifiedFiles}`]}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingFiles[`preview_${docData.modifiedFiles}`] ? (
                                  <span className="inline-flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                    Chargement...
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <LuEye className="h-4 w-4" />
                                    Prévisualiser
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => handleDownloadFile(docData.modifiedFiles)}
                                disabled={loadingFiles[`download_${docData.modifiedFiles}`]}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-djibouti-primary/10 text-djibouti-primary rounded-lg text-sm font-medium hover:bg-djibouti-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingFiles[`download_${docData.modifiedFiles}`] ? (
                                  <span className="inline-flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-djibouti-primary border-t-transparent rounded-full animate-spin"></div>
                                    Téléchargement...
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <LuDownload className="h-4 w-4" />
                                    Télécharger
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : null
                      ) : (
                        <div className="flex flex-col gap-2">
                          {docData.modifiedFiles ? (
                            <div className="flex flex-col gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                              <span className="text-xs font-semibold text-amber-700 mb-1">
                                Fichiers modificatifs
                              </span>
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
                                  Ajouter PDF modificatif
                                </span>
                              )}
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PDF Preview Modal */}
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
  tenantId: PropTypes.string.isRequired,
  applicationDocuments: PropTypes.array,
};

export default DocumentsTable;

