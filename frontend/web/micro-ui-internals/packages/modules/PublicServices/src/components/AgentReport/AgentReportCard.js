import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LuFileText, LuCircleCheck, LuClock, LuPen, LuEye, LuChevronDown, LuChevronUp, LuDownload, LuCamera, LuClipboardList } from "react-icons/lu";
import AgentReportModal from "./AgentReportModal";
import { useAgentReportData } from "./hooks/useAgentReportData";

const AgentReportCard = ({ service, state, t, isViewOnly = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    serviceCode,
    applicationNumber,
  } = Digit.Hooks.useQueryParams();

  const {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist
  } = useAgentReportData(applicationNumber, serviceCode);

  useEffect(() => {
    if (applicationNumber && serviceCode) {
      checkExistingChecklist();
    }
  }, [applicationNumber, serviceCode, checkExistingChecklist]);

  const handleOpenModal = () => {
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    checkExistingChecklist();
  };

  const handleViewReport = () => {
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Don't render if required props are missing
  if (!applicationNumber || !service) {
    return null;
  }

  // Calculate files count
  const filesCount = checklistData 
    ? ((checklistData.report && checklistData.report.length) || 0) + 
      ((checklistData.photos && checklistData.photos.length) || 0)
    : 0;

  if (isSubmitted && checklistData) {
    return (
      <div>
        <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark" />

          <div className="flex flex-col gap-6 p-6 min-h-full">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-djibouti-primary/10">
                <LuClipboardList className="h-6 w-6 text-djibouti-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Rapport d'inspection sur site
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <LuCircleCheck className="h-4 w-4" />
                    Terminé
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  ID Rapport : <span className="font-medium text-gray-900">{applicationNumber}</span>
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Soumis le
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {new Date(checklistData.submittedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Créé par
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {checklistData.submittedByName || "Utilisateur inconnu"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Fichiers joints
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {filesCount} fichier{filesCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Dernière modification
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {checklistData.lastEditedByName || "Utilisateur inconnu"}
                </p>
                {checklistData.lastEditedAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(checklistData.lastEditedAt).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Notes Section */}
            {checklistData.notes && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Notes d'inspection
                </span>
                <p className="mt-2 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                  {checklistData.notes}
                </p>
              </div>
            )}

            {/* History */}
            {checklistData.history && checklistData.history.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="flex items-center justify-between w-full text-left mb-4 group"
                >
                  <h4 className="text-sm font-semibold text-gray-700 group-hover:text-djibouti-primary transition-colors">
                    Historique des modifications
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      ({checklistData.history.length} {checklistData.history.length === 1 ? "modification" : "modifications"})
                    </span>
                    {isHistoryOpen ? (
                      <LuChevronUp className="h-4 w-4 text-gray-500 group-hover:text-djibouti-primary transition-colors" />
                    ) : (
                      <LuChevronDown className="h-4 w-4 text-gray-500 group-hover:text-djibouti-primary transition-colors" />
                    )}
                  </div>
                </button>
                {isHistoryOpen && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {checklistData.history
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-900">
                                {entry.editedByName || "Utilisateur inconnu"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6 mt-auto">
              {!isViewOnly && (
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-djibouti-primary/40 hover:text-djibouti-primary"
                >
                  <LuPen className="h-4 w-4" />
                  Modifier le rapport
                </button>
              )}
              <button
                onClick={handleViewReport}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-djibouti-primary-dark"
              >
                <LuEye className="h-4 w-4" />
                Voir les détails
              </button>
            </div>
          </div>
        </div>

        <AgentReportModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          applicationNumber={applicationNumber}
          service={service}
          serviceCode={serviceCode}
          state={state}
          onSuccess={handleSuccess}
          isViewMode={isViewMode}
          isViewOnly={isViewOnly}
          existingChecklistData={checklistData}
        />
      </div>
    );
  }

  // Pending state - not yet submitted
  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />

        <div className="flex flex-col gap-6 p-6 min-h-full">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70">
              <LuClipboardList className="h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Rapport d'inspection sur site
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <LuClock className="h-4 w-4" />
                  En attente
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Statut
              </span>
              <p className="mt-2 text-sm font-semibold text-amber-800">
                En attente de remplissage
              </p>
            </div>

            <div className="rounded-xl border border-djibouti-primary/10 bg-djibouti-primary/5 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-djibouti-primary/70">
                Éléments requis
              </span>
              <p className="mt-2 text-sm font-semibold text-djibouti-primary">
                Fiche de terrain, Photos du site
              </p>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Instructions
            </span>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Téléchargez vos documents d'inspection sur site et fournissez des notes détaillées sur vos constatations.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                <LuFileText className="h-3.5 w-3.5" />
                Fiche de terrain
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                <LuCamera className="h-3.5 w-3.5" />
                Photos du site
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-auto">
            {!isViewOnly ? (
              <button
                onClick={handleOpenModal}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isLoading
                    ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                    : "border border-djibouti-primary bg-djibouti-primary text-white hover:bg-djibouti-primary-dark"
                }`}
              >
                <LuFileText className="h-4 w-4" />
                {isLoading ? "Chargement..." : "Créer le rapport"}
              </button>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Rapport non encore soumis
              </span>
            )}
          </div>
        </div>
      </div>

      <AgentReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationNumber={applicationNumber}
        service={service}
        serviceCode={serviceCode}
        state={state}
        onSuccess={handleSuccess}
        isViewMode={isSubmitted}
        existingChecklistData={checklistData}
      />
    </div>
  );
};

AgentReportCard.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default AgentReportCard;
