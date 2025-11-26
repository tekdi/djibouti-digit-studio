import React from "react";
import { LuBuilding2, LuClock } from "react-icons/lu";
import ObservationsDisplay from "./ObservationsDisplay";
import FileList from "./FileList";

const ObservationCard = ({
  observationData,
  onPreview,
  onDownload,
  loadingFiles,
}) => {
  const commissionerName = observationData.updatedByOrganization 
    ? observationData.updatedByOrganization.fullName 
    : observationData.updatedByName || "Commissaire inconnu";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5 border-b border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-djibouti-primary/20 rounded-lg">
            <LuBuilding2 className="h-6 w-6 text-djibouti-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              {commissionerName}
            </h2>
            {observationData.updatedByOrganization && (
              <p className="text-xs text-gray-600">
                ({observationData.updatedByOrganization.name})
              </p>
            )}
            {observationData.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <LuClock className="h-3 w-3" />
                <span>
                  {new Date(observationData.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        <ObservationsDisplay observations={observationData.observations} />
        <FileList
          files={observationData.files}
          fileDescriptions={observationData.files?.reduce((acc, file) => {
            if (file.description) {
              acc[file.fileStoreId] = file.description;
            }
            return acc;
          }, {}) || {}}
          onDescriptionChange={() => {}}
          onPreview={onPreview}
          onDownload={onDownload}
          onRemove={() => {}}
          loadingFiles={loadingFiles}
          isEditable={false}
        />
      </div>
    </div>
  );
};

export default ObservationCard;

