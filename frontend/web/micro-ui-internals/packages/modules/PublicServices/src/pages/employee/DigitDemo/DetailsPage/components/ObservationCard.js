import React from "react";
import { LuBuilding2, LuClock, LuCircleCheck, LuCircleX, LuClock3 } from "react-icons/lu";
import ObservationsDisplay from "./ObservationsDisplay";
import FileList from "./FileList";

const VERDICT_STYLES = {
  CONFORME: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: LuCircleCheck,
  },
  NON_CONFORME: {
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: LuCircleX,
  },
};

// Badge shown when the commissioner hasn't acted yet.
const PENDING_BADGE = {
  badge: "bg-amber-100 text-amber-700 border-amber-200",
  icon: LuClock3,
  label: "En attente",
};

const ObservationCard = ({
  observationData,
  verdict,
  onPreview,
  onDownload,
  loadingFiles,
}) => {
  const commissionerName = observationData.updatedByOrganization
    ? observationData.updatedByOrganization.fullName
    : observationData.updatedByName || "Commissaire inconnu";

  const verdictStyle = verdict ? VERDICT_STYLES[verdict.verdict] : null;
  const VerdictIcon = verdictStyle?.icon;
  const PendingIcon = PENDING_BADGE.icon;

  const hasObservationsText = !!(observationData.observations && String(observationData.observations).trim());
  const hasFiles = Array.isArray(observationData.files) && observationData.files.length > 0;
  const hasAnyContent = hasObservationsText || hasFiles;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5 border-b border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-djibouti-primary/20 rounded-lg">
            <LuBuilding2 className="h-6 w-6 text-djibouti-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {commissionerName}
              </h2>
              {verdict && verdictStyle ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${verdictStyle.badge}`}
                >
                  {VerdictIcon && <VerdictIcon className="h-3.5 w-3.5" />}
                  {verdict.label}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${PENDING_BADGE.badge}`}
                >
                  <PendingIcon className="h-3.5 w-3.5" />
                  {PENDING_BADGE.label}
                </span>
              )}
            </div>
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
        {/* Commentaire du commissaire — captured from the workflow action
            (e.g. "Sans objection", "OK"). Shown whenever the avis was given,
            even if no observation text or files were attached. */}
        {verdict?.comment && String(verdict.comment).trim() && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Commentaire
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {verdict.comment}
            </p>
            {verdict.timestamp ? (
              <p className="mt-2 text-xs text-gray-500">
                {new Date(verdict.timestamp).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : null}
          </div>
        )}
        {hasAnyContent ? (
          <React.Fragment>
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
          </React.Fragment>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {verdict
              ? "Aucune observation ni document ajoutés."
              : "Ce commissaire n'a pas encore soumis d'avis."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ObservationCard;
