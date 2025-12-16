import React from "react";
import { LuFileText, LuEye, LuDownload, LuTrash2 } from "react-icons/lu";

const FileItem = ({
  file,
  description,
  onDescriptionChange,
  onPreview,
  onDownload,
  onRemove,
  isLoading,
  isEditable = false,
}) => {
  const isPdfFile = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-djibouti-primary/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-djibouti-primary/10 rounded-lg">
          <LuFileText className="h-5 w-5 text-djibouti-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {file.fileName}
              </p>
              {file.fileSize && (
                <p className="text-xs text-gray-500 mt-1">
                  {(file.fileSize / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isPdfFile(file.fileName) && (
                <button
                  onClick={() => onPreview(file)}
                  disabled={isLoading[`preview_${file.fileStoreId}`]}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Prévisualiser"
                >
                  {isLoading[`preview_${file.fileStoreId}`] ? (
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LuEye className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => onDownload(file)}
                disabled={isLoading[`download_${file.fileStoreId}`]}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Télécharger"
              >
                {isLoading[`download_${file.fileStoreId}`] ? (
                  <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LuDownload className="h-4 w-4" />
                )}
              </button>
              {isEditable && (
                <button
                  onClick={() => onRemove(file.fileStoreId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <LuTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description du fichier :
            </label>
            {isEditable ? (
              <textarea
                value={description || ""}
                onChange={(e) => onDescriptionChange(file.fileStoreId, e.target.value)}
                placeholder="Ajoutez une description pour ce fichier..."
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary transition-all"
              />
            ) : (
              <div className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[60px]">
                {description || (
                  <span className="text-gray-400 italic">Aucune description</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileItem;







