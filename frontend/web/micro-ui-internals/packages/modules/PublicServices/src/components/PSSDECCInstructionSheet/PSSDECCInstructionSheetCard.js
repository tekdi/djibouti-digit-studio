import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { LuFileText, LuCircleCheck, LuCircleX, LuClock, LuPen, LuEye, LuChevronDown, LuChevronUp } from "react-icons/lu";
import PSSDECCInstructionSheetModal from "./PSSDECCInstructionSheetModal";

var COMMISSIONER_ROLES_PSSDECC = new Set([
  "BPA_SDECC_COMM", "BPA_DGDCF_COMM", "BPA_ONEAD_COMM",
  "BPA_DNPC_COMM", "BPA_EDD_COMM", "BPA_INSPD_COMM",
  "BPA_DCT_COMM", "BPA_PL_COMM", "BPA_DJITELECOM_COMM",
]);

var PSSDECCInstructionSheetCard = function (props) {
  var service = props.service, state = props.state, t = props.t, isViewOnly = props.isViewOnly || false;
  var userRoles = (Digit.UserService.getUser() || {}).info?.roles || [];
  var isCommissioner = userRoles.some(function (r) { return COMMISSIONER_ROLES_PSSDECC.has(r && r.code); });
  var _m = useState(false), isModalOpen = _m[0], setIsModalOpen = _m[1];
  var _v = useState(false), isViewMode = _v[0], setIsViewMode = _v[1];
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _s = useState(false), isSubmitted = _s[0], setIsSubmitted = _s[1];
  var _l = useState(false), isLoading = _l[0], setIsLoading = _l[1];
  var _h = useState(false), isHistoryOpen = _h[0], setIsHistoryOpen = _h[1];
  var _a = useState(""), applicantName = _a[0], setApplicantName = _a[1];

  var qs = Digit.Hooks.useQueryParams();
  var serviceCode = qs.serviceCode;
  var applicationNumber = qs.applicationNumber;
  var tenantId = Digit.ULBService.getCurrentTenantId();

  var loadData = useCallback(async function () {
    if (!applicationNumber || !serviceCode) return;
    setIsLoading(true);
    try {
      var resp = await Digit.CustomService.getResponse({
        url: "/public-service/v1/application/" + serviceCode, method: "GET",
        headers: { "X-Tenant-Id": tenantId }, params: { applicationNumber: applicationNumber, tenantId: tenantId },
      });
      var app = Array.isArray(resp?.Application) ? resp.Application[0] : resp?.Application;
      if (app?.additionalDetails?.psSDECCInstructionSheet) {
        setData(app.additionalDetails.psSDECCInstructionSheet);
        setIsSubmitted(!!app.additionalDetails.psSDECCInstructionSheet.submittedAt);
      }
      // Applicant name for the Pétitionnaire tile — pull from the application's
      // applicants array (fallback to responseData.applicants for apps without
      // a cleaned top-level array).
      var firstApplicant = (app?.applicants || []).find(function (a) { return a && (a.name || a.mobileNumber); });
      var rd = app?.serviceDetails?.responseData?.Application?.applicants?.[0];
      var name = firstApplicant?.name || rd?.name || "";
      if (name) setApplicantName(name);
    } catch (e) { console.error("Error:", e); }
    finally { setIsLoading(false); }
  }, [applicationNumber, serviceCode, tenantId]);

  useEffect(function () { loadData(); }, [loadData]);

  if (!applicationNumber || !service) return null;

  if (isSubmitted && data) {
    return (
      <div>
        <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark" />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-djibouti-primary/10">
                <LuFileText className="h-6 w-6 text-djibouti-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">Fiche technique SDECC — Surélévation</h3>
                  {data.finalOpinion === "FAVORABLE" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <LuCircleCheck className="h-4 w-4" /> Avis Favorable
                    </span>
                  ) : data.finalOpinion === "DEFAVORABLE" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <LuCircleX className="h-4 w-4" /> Avis Défavorable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <LuCircleCheck className="h-4 w-4" /> Terminé
                    </span>
                  )}
                </div>
                {!isCommissioner && (
                  <p className="text-sm text-gray-500">ID dossier : <span className="font-medium text-gray-900">{applicationNumber}</span></p>
                )}
              </div>
            </div>

            {/* Metadata grid — mirrors the Fiche d'instruction (par le SRA) card.
                Hidden for commissioners (they only need the verdict + button). */}
            {!isCommissioner && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Soumis le</span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {new Date(data.submittedAt || Date.now()).toLocaleDateString("fr-FR", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Créé par</span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{data.submittedByName || "Utilisateur inconnu"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Dernière modification</span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{data.lastEditedByName || "Utilisateur inconnu"}</p>
                  {data.lastEditedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(data.lastEditedAt).toLocaleDateString("fr-FR", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">Pétitionnaire</span>
                  <p className="mt-2 text-sm font-semibold text-emerald-800">{applicantName || "Non renseigné"}</p>
                </div>
              </div>
            )}

            {/* History — collapsible block, hidden for commissioners */}
            {!isCommissioner && Array.isArray(data.history) && data.history.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={function () { setIsHistoryOpen(!isHistoryOpen); }}
                  className="flex items-center justify-between w-full text-left mb-4 group"
                >
                  <h4 className="text-sm font-semibold text-gray-700 group-hover:text-djibouti-primary transition-colors">
                    Historique des modifications
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      ({data.history.length} {data.history.length === 1 ? "modification" : "modifications"})
                    </span>
                    {isHistoryOpen
                      ? <LuChevronUp className="h-4 w-4 text-gray-500 group-hover:text-djibouti-primary transition-colors" />
                      : <LuChevronDown className="h-4 w-4 text-gray-500 group-hover:text-djibouti-primary transition-colors" />}
                  </div>
                </button>
                {isHistoryOpen && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {data.history.slice().reverse().map(function (entry, index) {
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-900">
                                {entry.editedByName || "Utilisateur inconnu"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {entry.timestamp
                                  ? new Date(entry.timestamp).toLocaleDateString("fr-FR", {
                                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            {entry.changes && entry.changes.finalOpinion && (
                              <div className="text-xs text-gray-600">
                                Avis :{" "}
                                <span className={"font-semibold " + (entry.changes.finalOpinion === "FAVORABLE" ? "text-emerald-700" : "text-red-700")}>
                                  {entry.changes.finalOpinion === "FAVORABLE" ? "Favorable" : "Défavorable"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              {!isViewOnly && !isCommissioner && (
                <button onClick={function () { setIsViewMode(false); setIsModalOpen(true); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-djibouti-primary/40 hover:text-djibouti-primary transition-all">
                  <LuPen className="h-4 w-4" /> Modifier
                </button>
              )}
              <button onClick={function () { setIsViewMode(true); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark transition-all">
                <LuEye className="h-4 w-4" /> Voir les détails
              </button>
            </div>
          </div>
        </div>
        <PSSDECCInstructionSheetModal isOpen={isModalOpen} onClose={function () { setIsModalOpen(false); }}
          applicationNumber={applicationNumber} service={service} serviceCode={serviceCode} state={state}
          onSuccess={function () { loadData(); window.location.reload(); }} isViewMode={isViewMode} isViewOnly={isViewOnly} existingData={data} />
      </div>
    );
  }

  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary/70 to-djibouti-primary" />
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70">
              <LuFileText className="h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Fiche technique SDECC — Surélévation</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <LuClock className="h-4 w-4" /> En attente
                </span>
              </div>
              <p className="text-sm text-gray-500">ID dossier : <span className="font-medium text-gray-900">{applicationNumber}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isViewOnly ? (
              <button onClick={function () { setIsViewMode(false); setIsModalOpen(true); }} disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-djibouti-primary bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark transition-all disabled:opacity-50">
                <LuFileText className="h-4 w-4" /> {isLoading ? "Chargement..." : "Remplir la fiche"}
              </button>
            ) : <span className="text-sm text-gray-500 italic">Fiche non encore soumise</span>}
          </div>
        </div>
      </div>
      <PSSDECCInstructionSheetModal isOpen={isModalOpen} onClose={function () { setIsModalOpen(false); }}
        applicationNumber={applicationNumber} service={service} serviceCode={serviceCode} state={state}
        onSuccess={function () { loadData(); window.location.reload(); }} isViewMode={false} existingData={data} />
    </div>
  );
};

PSSDECCInstructionSheetCard.propTypes = {
  service: PropTypes.string.isRequired, state: PropTypes.string.isRequired, t: PropTypes.func.isRequired,
};

export default PSSDECCInstructionSheetCard;
