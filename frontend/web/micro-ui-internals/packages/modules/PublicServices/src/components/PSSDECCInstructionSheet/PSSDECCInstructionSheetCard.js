import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { LuFileText, LuCircleCheck, LuClock, LuPen, LuEye } from "react-icons/lu";
import PSSDECCInstructionSheetModal from "./PSSDECCInstructionSheetModal";

var PSSDECCInstructionSheetCard = function (props) {
  var service = props.service, state = props.state, t = props.t, isViewOnly = props.isViewOnly || false;
  var _m = useState(false), isModalOpen = _m[0], setIsModalOpen = _m[1];
  var _v = useState(false), isViewMode = _v[0], setIsViewMode = _v[1];
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _s = useState(false), isSubmitted = _s[0], setIsSubmitted = _s[1];
  var _l = useState(false), isLoading = _l[0], setIsLoading = _l[1];

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
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <LuCircleCheck className="h-4 w-4" /> Terminé
                  </span>
                </div>
                <p className="text-sm text-gray-500">ID dossier : <span className="font-medium text-gray-900">{applicationNumber}</span></p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              {!isViewOnly && (
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
