import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LuUsers, LuCircleCheck , LuClock, LuPen, LuEye, LuBuilding2, LuDroplets, LuShield, LuZap, LuHeart, LuRoute } from "react-icons/lu";
import CommissionersCheckListModal from "./CommissionersCheckListModal";
import { useCommissionersData } from "./hooks/useCommissionersData";

const CommissionersCheckListCard = ({ service, state, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const {
    serviceCode,
    applicationNumber,
  } = Digit.Hooks.useQueryParams();

  const {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist
  } = useCommissionersData(applicationNumber, serviceCode);

  // Commissioner data
  const commissioners = [
    {
      id: "DGDCF",
      name: "DGDCF",
      fullName: "Direction Générale des Domaines et de la Conservation Foncière",
      description: "Validation des documents fonciers et cadastraux",
      icon: LuBuilding2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      id: "ONEAD",
      name: "ONEAD", 
      fullName: "Office National de l'Eau et de l'Assainissement",
      description: "Vérification des aspects liés à l'eau potable et à l'assainissement",
      icon: LuDroplets,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "DNPC",
      name: "DNPC",
      fullName: "Direction Nationale de la Protection Civile", 
      description: "Vérification des normes de sécurité incendie et de protection civile",
      icon: LuShield,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: "EDD",
      name: "EDD",
      fullName: "Électricité de Djibouti",
      description: "Contrôle et validation des installations électriques",
      icon: LuZap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      id: "INSPD",
      name: "INSPD",
      fullName: "Institut National de Santé Publique de Djibouti",
      description: "Évaluation et approbation des critères sanitaires du projet",
      icon: LuHeart,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      id: "ADR",
      name: "ADR",
      fullName: "AGENCE DJIBOUTIENNE DES ROUTES",
      description: "Validation des aspects routiers et de circulation",
      icon: LuRoute,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  // Get selected commissioners from checklist data
  const selectedCommissioners = checklistData?.selectedCommissioners || [];

  const handleOpenModal = () => {
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleSuccess = () => {
    checkExistingChecklist(); // Refresh data
  };

  const handleViewReport = () => {
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Don't render if required props are missing
  if (!applicationNumber || !service) {
    return null;
  }

  if (isSubmitted && checklistData) {
    return (
      <React.Fragment>
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <LuUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Sélection des Commissaires
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-100 text-xs font-medium rounded-full">
                      <LuCircleCheck className="w-3 h-3" />
                      Terminé
                    </span>
                    <span className="text-white/70 text-sm">
                      ID: {applicationNumber}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                <LuEye className="w-4 h-4" />
                Voir la sélection
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Submission Info */}
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Soumis le
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {new Date(checklistData.submittedAt || Date.now()).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Selected Count */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="text-xs font-medium text-primary/70 mb-2 uppercase tracking-wide">
                  Commissaires sélectionnés
                </div>
                <div className="text-sm font-semibold text-primary">
                  {selectedCommissioners.length} sur {commissioners.length}
                </div>
              </div>

              {/* Created By */}
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Créé par
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {checklistData.submittedByName || "Utilisateur inconnu"}
                </div>
              </div>

              {/* Last Edited */}
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Dernière modification
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {checklistData.lastEditedByName || "Utilisateur inconnu"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {checklistData.lastEditedAt && new Date(checklistData.lastEditedAt).toLocaleDateString('fr-FR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Selected Commissioners */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Commissaires sélectionnés
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCommissioners.map((commissionerId) => {
                  const commissioner = commissioners.find(c => c.id === commissionerId);
                  if (!commissioner) return null;
                  
                  const IconComponent = commissioner.icon;
                  
                  return (
                    <div key={commissionerId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className={`w-12 h-12 rounded-xl ${commissioner.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${commissioner.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {commissioner.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {commissioner.fullName}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <LuCircleCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <LuPen className="w-4 h-4" />
                Modifier la sélection
              </button>
              <button
                onClick={handleViewReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <LuEye className="w-4 h-4" />
                Voir les détails
              </button>
            </div>
          </div>
        </div>

        <CommissionersCheckListModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          applicationNumber={applicationNumber}
          service={service}
          serviceCode={serviceCode}
          state={state}
          onSuccess={handleSuccess}
          isViewMode={isViewMode}
          existingData={checklistData}
          commissioners={commissioners}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Sélection des Commissaires
                </h3>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    <LuClock className="w-3 h-3" />
                    En attente
                  </span>
                  <span className="text-gray-500 text-sm">
                    ID: {applicationNumber}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenModal}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              <LuUsers className="w-4 h-4" />
              {isLoading ? "Chargement..." : "Sélectionner"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Status */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-xs font-medium text-amber-700 mb-2 uppercase tracking-wide">
                Statut
              </div>
              <div className="text-sm font-semibold text-amber-800">
                En attente de sélection
              </div>
            </div>

            {/* Available Commissioners */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="text-xs font-medium text-primary/70 mb-2 uppercase tracking-wide">
                Commissaires disponibles
              </div>
              <div className="text-sm font-semibold text-primary">
                {commissioners.length} commissaires
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Instructions
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Sélectionnez selon les exigences du projet
              </div>
            </div>
          </div>

          {/* Commissioners Preview */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Commissaires disponibles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commissioners.slice(0, 4).map((commissioner) => {
                const IconComponent = commissioner.icon;
                return (
                  <div key={commissioner.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className={`w-10 h-10 rounded-lg ${commissioner.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${commissioner.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {commissioner.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {commissioner.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {commissioners.length > 4 && (
              <div className="text-xs text-gray-500 mt-3 text-center">
                +{commissioners.length - 4} autres commissaires disponibles
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <LuUsers className="w-4 h-4" />
              Commencer la sélection
            </button>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <LuEye className="w-4 h-4" />
              Voir tous les commissaires
            </button>
          </div>
        </div>
      </div>

      <CommissionersCheckListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationNumber={applicationNumber}
        service={service}
        serviceCode={serviceCode}
        state={state}
        onSuccess={handleSuccess}
        isViewMode={isSubmitted}
        existingData={checklistData}
        commissioners={commissioners}
      />
    </React.Fragment>
  );
};

CommissionersCheckListCard.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default CommissionersCheckListCard;
