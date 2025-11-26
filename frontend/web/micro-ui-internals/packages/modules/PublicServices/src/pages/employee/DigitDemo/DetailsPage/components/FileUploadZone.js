import React from "react";
import { LuUpload } from "react-icons/lu";

const FileUploadZone = ({ onFileUpload, isUploading }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Fichiers à téléverser (facultatif)
        </label>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-djibouti-primary transition-colors">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-djibouti-primary/10 rounded-full">
              <LuUpload className="h-6 w-6 text-djibouti-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Cliquez pour téléverser ou glissez-déposez
            </span>
            <span className="text-xs text-gray-500">
              Formats acceptés : PDF, images, documents (max 10MB par fichier)
            </span>
          </div>
          <input
            type="file"
            multiple
            onChange={onFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
      </div>

      {isUploading && Object.keys(isUploading).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">
              Téléversement en cours...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;

