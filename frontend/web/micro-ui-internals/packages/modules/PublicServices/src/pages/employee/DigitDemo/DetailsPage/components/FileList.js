import React from "react";
import { LuFileText } from "react-icons/lu";
import FileItem from "./FileItem";

const FileList = ({
  files,
  fileDescriptions,
  onDescriptionChange,
  onPreview,
  onDownload,
  onRemove,
  loadingFiles,
  isEditable = false,
}) => {
  if (!files || files.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <LuFileText className="h-4 w-4 text-djibouti-primary" />
        Fichiers partagés ({files.length})
      </h3>
      <div className="space-y-3">
        {files.map((file) => (
          <FileItem
            key={file.fileStoreId}
            file={file}
            description={fileDescriptions[file.fileStoreId]}
            onDescriptionChange={onDescriptionChange}
            onPreview={onPreview}
            onDownload={onDownload}
            onRemove={onRemove}
            isLoading={loadingFiles}
            isEditable={isEditable}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;








