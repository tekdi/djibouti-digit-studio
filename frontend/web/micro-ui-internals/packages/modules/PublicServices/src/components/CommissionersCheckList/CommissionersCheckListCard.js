import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LuUsers, LuCircleCheck , LuClock, LuPen, LuEye, LuBuilding2, LuDroplets, LuShield, LuZap, LuHeart, LuRoute, LuClipboardCheck, LuPhone } from "react-icons/lu";
import CommissionersCheckListModal from "./CommissionersCheckListModal";
import { useCommissionersData } from "./hooks/useCommissionersData";

const CommissionersCheckListCard = ({ service, state, t, isViewOnly = false, applicationId: propApplicationId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const {
    serviceCode,
    applicationNumber: queryApplicationNumber,
  } = Digit.Hooks.useQueryParams();
  
  // Always prefer queryApplicationNumber (real app number like PL-000020/2026).
  // propApplicationId is the record UUID which the backend rejects.
  const applicationNumber = queryApplicationNumber || propApplicationId;

  const {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist
  } = useCommissionersData(applicationNumber, serviceCode);

  // Commissioner data
  const commissioners = [
    {
      id: "SDECC",
      name: "SDECC",
      fullName: "Sous-Direction Expertise et Contrôle des Constructions",
      description: "Expertise technique et contrôle des constructions",
      icon: LuClipboardCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
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
      id: "INSPD",
      name: "INSPD",
      fullName: "Institut National de la Santé Publique de Djibouti",
      description: "Évaluation et approbation des critères sanitaires du projet",
      icon: LuHeart,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
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
      fullName: "Direction Générale de l'Électricité de Djibouti",
      description: "Contrôle et validation des installations électriques",
      icon: LuZap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      id: "ONEAD",
      name: "ONEAD", 
      fullName: "Office National des Eaux et de l'Assainissement de Djibouti",
      description: "Vérification des aspects liés à l'eau potable et à l'assainissement",
      icon: LuDroplets,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "DT",
      name: "Djibouti Télécom",
      fullName: "Direction Générale de Djibouti Télécom",
      description: "Validation des aspects télécommunications",
      icon: LuPhone,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: "ADR",
      name: "ADR",
      fullName: "Direction Générale de l'Agence Djiboutienne des Routes",
      description: "Validation des aspects routiers et de circulation",
      icon: LuRoute,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  // Some services only allow specific commissioners
  const COMMISSIONERS_BY_SERVICE = {
    BPA_PS: ["SDECC"],
    BPA_PF: ["DGDCF"],
  };
  const allowedIds = COMMISSIONERS_BY_SERVICE[service];
  const filteredCommissioners = allowedIds ? commissioners.filter(c => allowedIds.includes(c.id)) : commissioners;

  // Get selected commissioners from checklist data
  const selectedCommissioners = checklistData?.selectedCommissioners || [];

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

  if (isSubmitted && checklistData) {
    return (
      <React.Fragment>
        <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark" />

          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-djibouti-primary/10">
                <LuUsers className="h-6 w-6 text-djibouti-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                  Sélection des services concernés
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <LuCircleCheck className="h-4 w-4" />
                    Terminé
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Soumis le
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {new Date(checklistData.submittedAt || Date.now()).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Commissaires sélectionnés
                </span>
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  {selectedCommissioners.length} sur {filteredCommissioners.length}
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

            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">
                Commissaires sélectionnés
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedCommissioners.map((commissionerId) => {
                  const commissioner = filteredCommissioners.find((c) => c.id === commissionerId);
                  if (!commissioner) return null;
                  const IconComponent = commissioner.icon;

                  return (
                    <div
                      key={commissionerId}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-djibouti-primary/40"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${commissioner.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${commissioner.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {commissioner.name}
                        </p>
                        <p className="truncate text-xs text-gray-600">
                          {commissioner.fullName}
                        </p>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                        <LuCircleCheck className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
              {!isViewOnly && (
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-djibouti-primary/40 hover:text-djibouti-primary"
                >
                  <LuPen className="h-4 w-4" />
                  Modifier la sélection
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
          commissioners={filteredCommissioners}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary/70 to-djibouti-primary" />

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70">
                <LuUsers className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                  Sélection des services concernés
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <LuClock className="h-4 w-4" />
                    En attente
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Statut
              </span>
              <p className="mt-2 text-sm font-semibold text-amber-800">
                En attente de sélection
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Instructions
              </span>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                Sélectionnez selon les exigences du projet
              </p>
            </div>
          </div>

          <div className="pt-4">
            {!isViewOnly ? (
              <button
                onClick={handleOpenModal}
                disabled={isLoading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-djibouti-primary px-4 py-3 text-base font-semibold transition-all duration-200 ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-djibouti-primary/10 text-djibouti-primary hover:bg-djibouti-primary hover:text-white"
                }`}
              >
                <LuUsers className="h-5 w-5" />
                {isLoading ? "Chargement..." : "Sélectionner"}
              </button>
            ) : (
              <span className="text-sm text-gray-500 italic block text-center py-2">
                Sélection non encore effectuée
              </span>
            )}
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
        commissioners={filteredCommissioners}
      />
    </React.Fragment>
  );
};

CommissionersCheckListCard.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  applicationId: PropTypes.string
};

export default CommissionersCheckListCard;
