import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { LuFileText, LuCircleCheck, LuClock, LuPen, LuEye } from "react-icons/lu";
import PCSInstructionSheetModal from "./PCSInstructionSheetModal";
import { usePCSInstructionSheetAPI } from "./hooks/usePCSInstructionSheetAPI";

const COMMISSIONER_ROLES = new Set([
  "BPA_SDECC_COMM", "BPA_DGDCF_COMM", "BPA_ONEAD_COMM",
  "BPA_DNPC_COMM", "BPA_EDD_COMM", "BPA_INSPD_COMM",
  "BPA_DCT_COMM", "BPA_PL_COMM", "BPA_DJITELECOM_COMM",
]);

const PCSInstructionSheetCard = ({ service, state, t, isViewOnly = false }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const { getFiche } = usePCSInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [data, setData] = useState(null);

  const userRoles = Digit.UserService.getUser()?.info?.roles || [];
  const isCommissioner = userRoles.some((r) => COMMISSIONER_ROLES.has(r?.code));

  const reload = useCallback(async () => {
    const d = await getFiche();
    setData(d);
  }, [getFiche]);

  const handleSaved = useCallback(() => {
    // Full reload so the status badge + "Détails du projet simplifié" block
    // on the Demande tab pick up the newly-saved values. Triggered by an
    // explicit user save (not background polling).
    window.location.reload();
  }, []);

  useEffect(() => {
    if (applicationNumber && serviceCode) reload();
  }, [applicationNumber, serviceCode, reload]);

  if (!applicationNumber || !service) return null;

  const openFill = () => {
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  const openView = () => {
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const isSubmitted = Boolean(data);

  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
            isSubmitted ? "from-djibouti-primary to-djibouti-primary-dark" : "from-djibouti-primary/70 to-djibouti-primary"
          }`}
        />

        <div className="flex flex-col gap-6 p-6 min-h-full">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isSubmitted ? "bg-djibouti-primary/10" : "bg-amber-100/70"
              }`}
            >
              <LuFileText className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Fiche d'instruction — Détails du projet simplifié
                </h3>
                {isSubmitted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <LuCircleCheck className="h-4 w-4" />
                    Terminé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <LuClock className="h-4 w-4" />
                    En attente
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSubmitted && !isCommissioner && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Soumis le</span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {new Date(data.submittedAt || Date.now()).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Créé par</span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {data.submittedByName || "Utilisateur inconnu"}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">Pétitionnaire</span>
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  {data.applicantName || "Non renseigné"}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6 mt-auto">
            {isSubmitted ? (
              <React.Fragment>
                {!isViewOnly && !isCommissioner && (
                  <button
                    onClick={openFill}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-djibouti-primary/40 hover:text-djibouti-primary"
                  >
                    <LuPen className="h-4 w-4" />
                    Modifier la fiche
                  </button>
                )}
                <button
                  onClick={openView}
                  className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark"
                >
                  <LuEye className="h-4 w-4" />
                  Voir les détails
                </button>
              </React.Fragment>
            ) : !isViewOnly && !isCommissioner ? (
              <button
                onClick={openFill}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark"
              >
                <LuFileText className="h-4 w-4" />
                Remplir la fiche
              </button>
            ) : (
              <span className="text-sm text-gray-500 italic">Fiche non encore soumise</span>
            )}
          </div>
        </div>
      </div>

      <PCSInstructionSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicationNumber={applicationNumber}
        service={service}
        serviceCode={serviceCode}
        state={state}
        onSuccess={handleSaved}
        isViewMode={isViewMode}
        isViewOnly={isViewOnly}
        existingData={data}
      />
    </div>
  );
};

PCSInstructionSheetCard.propTypes = {
  service: PropTypes.string.isRequired,
  state: PropTypes.string,
  t: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

export default PCSInstructionSheetCard;
