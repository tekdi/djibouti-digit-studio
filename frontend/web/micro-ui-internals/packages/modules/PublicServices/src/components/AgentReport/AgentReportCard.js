import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AgentReportModal from "./AgentReportModal";
import { useAgentReportData } from "./hooks/useAgentReportData";

const AgentReportCard = ({ service, state, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Check if checklist is already submitted
  useEffect(() => {
    if (applicationNumber && serviceCode) {
      checkExistingChecklist();
    }
  }, [applicationNumber, serviceCode, checkExistingChecklist]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    checkExistingChecklist(); // Refresh data
  };

  const handleViewReport = () => {
    setIsModalOpen(true);
  };

  // Don't render if required props are missing
  if (!applicationNumber || !service) {
    return null;
  }

  if (isSubmitted && checklistData) {
    return (
      <React.Fragment>
        <div className="p-0 mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
          {/* Report Header */}
          <div className="bg-gradient-to-br from-[#0f6769] to-[#73836a] p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Rapport d'inspection sur site
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/20 px-2 py-1 rounded-md flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                      TERMINÉ
                    </span>
                    <span className="text-xs opacity-80">
                      ID Rapport: {applicationNumber}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleViewReport}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-white/30"
              >
                Voir le rapport complet
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              {/* Submission Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  SOUMIS LE
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {new Date(checklistData.submittedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Created By */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  CRÉÉ PAR
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {checklistData.submittedByName || "Utilisateur inconnu"}
                </div>
              </div>

              {/* Files Count */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  FICHIERS JOINTS
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {((checklistData.report && checklistData.report.length) || 0) + 
                   ((checklistData.photos && checklistData.photos.length) || 0)} fichiers
                </div>
              </div>

              {/* Last Edited */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  DERNIÈRE MODIFICATION
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {checklistData.lastEditedByName || "Utilisateur inconnu"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {checklistData.lastEditedAt && new Date(checklistData.lastEditedAt).toLocaleDateString('fr-FR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Notes Section - Full Width */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-5">
              <div className="text-xs font-semibold text-slate-500 mb-2">
                NOTES D'INSPECTION
              </div>
              <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {checklistData.notes ? checklistData.notes : "— Aucune note fournie"}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleViewReport}
                className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-200"
              >
                Télécharger le rapport
              </button>
              <button
                onClick={handleViewReport}
                className="bg-[#0f6769] text-white border-none rounded-md px-4 py-2 text-sm font-medium cursor-pointer hover:bg-[#0a4f51]"
              >
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
          isViewMode={isSubmitted}
          existingChecklistData={checklistData}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="p-0 mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
        {/* Report Header */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Rapport d'inspection sur site
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300 bg-amber-300/20 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="currentColor"/>
                    </svg>
                    EN ATTENTE
                  </span>
                  <span className="text-xs opacity-80">
                    ID Rapport: {applicationNumber}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenModal}
              disabled={isLoading}
              className={`bg-white/20 text-white border border-white/30 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white/30'
              }`}
            >
              {isLoading ? "Chargement..." : "Créer le rapport"}
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            {/* Status */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-500">
              <div className="text-xs font-semibold text-amber-800 mb-1">
                STATUT
              </div>
              <div className="text-sm font-medium text-amber-800">
                ⏳ En attente de soumission
              </div>
            </div>

            {/* Required Fields */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                CHAMPS REQUIS
              </div>
              <div className="text-sm font-medium text-gray-800">
                • Fichiers de rapport sur site<br/>
                • Notes d'inspection<br/>
                • Photos sur site (Optionnel)
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                INSTRUCTIONS
              </div>
              <div className="text-sm font-medium text-gray-800">
                Téléchargez vos documents d'inspection sur site et fournissez des notes détaillées sur vos constatations
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleOpenModal}
              className="bg-amber-500 text-white border-none rounded-md px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-amber-600"
            >
              Commencer le rapport
            </button>
            <button
              onClick={handleOpenModal}
              className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-200"
            >
              Voir les exigences
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
        isViewMode={isSubmitted}
        existingChecklistData={checklistData}
      />
    </React.Fragment>
  );
};

AgentReportCard.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default AgentReportCard; 