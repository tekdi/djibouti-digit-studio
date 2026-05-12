import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Calculation from "../../../../../../core/src/pages/citizen/Calculation";
import { checklistByService } from "../../../../utils/templateConfig.js";
import { LuReceipt, LuCreditCard, LuBanknote, LuFileText, LuDownload, LuCalendar } from "react-icons/lu";
import TaxExemptionSection from "./TaxExemptionSection";

const BILLING_BUSINESS_SERVICE = "PCO";

// Fetches the most recent payment for this application from collection-services
// so the Détails tab can show the receipt/quittance info captured at payment time.
const usePaymentRecord = (tenantId, applicationNumber, isPaid) => {
  const [payment, setPayment] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayment = useCallback(async () => {
    if (!isPaid || !applicationNumber || !tenantId) return;
    setIsLoading(true);
    const consumer = encodeURIComponent(applicationNumber);
    const candidates = [
      `/collection-services/payments/${BILLING_BUSINESS_SERVICE}/_search?tenantId=${tenantId}&consumerCodes=${consumer}`,
      `/collection-services/payments/_search?tenantId=${tenantId}&consumerCodes=${consumer}&businessServices=${BILLING_BUSINESS_SERVICE}`,
      `/collection-services/payments/_search?tenantId=${tenantId}&consumerCodes=${consumer}`,
    ];
    let payments = [];
    let lastError = null;
    for (const url of candidates) {
      try {
        const resp = await Digit.CustomService.getResponse({
          url,
          method: "POST",
          headers: { "X-Tenant-Id": tenantId },
          body: {
            RequestInfo: {
              apiId: "Rainmaker",
              authToken: Digit.UserService.getUser()?.access_token,
              userInfo: Digit.UserService.getUser()?.info,
              msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
            },
          },
        });
        payments = resp?.Payments || [];
        if (payments.length > 0) break;
      } catch (e) {
        lastError = e;
        console.warn("[PaymentsTab] payment search failed for", url, e?.message);
      }
    }
    if (lastError && payments.length === 0) {
      console.error("[PaymentsTab] all payment search endpoints failed", lastError);
    }

    const sorted = payments.slice().sort(
      (a, b) => (b?.auditDetails?.createdTime || 0) - (a?.auditDetails?.createdTime || 0),
    );
    const latest = sorted[0] || null;
    setPayment(latest);

    const detail = (latest?.paymentDetails || [])[0] || {};
    const fileStoreId = latest?.fileStoreId
      || detail?.fileStoreId
      || latest?.additionalDetails?.fileStoreId
      || detail?.additionalDetails?.fileStoreId
      || "";
    if (latest && fileStoreId) {
      latest.fileStoreId = fileStoreId; // normalize for the card
    }
    if (fileStoreId) {
      try {
        const urlResp = await Digit.CustomService.getResponse({
          url: `/filestore/v1/files/url?tenantId=${tenantId}&fileStoreIds=${encodeURIComponent(fileStoreId)}`,
          method: "GET",
          headers: { "X-Tenant-Id": tenantId },
        });
        const raw = urlResp?.fileStoreIds?.[0]?.url || "";
        setFileUrl(raw.split(",")[0] || "");
      } catch (e) {
        setFileUrl("");
      }
    } else {
      setFileUrl("");
    }
    setIsLoading(false);
  }, [tenantId, applicationNumber, isPaid]);

  useEffect(() => { fetchPayment(); }, [fetchPayment]);

  return { payment, fileUrl, isLoading };
};

const formatDate = (epoch) => {
  if (!epoch) return "—";
  const d = new Date(Number(epoch));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const PaymentReceiptCard = ({ payment, fileUrl }) => {
  if (!payment) return null;
  const detail = (payment.paymentDetails || [])[0] || {};
  const isCheque = payment.paymentMode === "CHEQUE";
  return (
    <div className="rounded-2xl shadow-sm border border-green-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500">
            <LuReceipt className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Reçu de paiement</h2>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            {isCheque ? "Chèque" : "Espèces"}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Numéro de reçu</p>
          <p className="text-base font-semibold text-gray-900">{detail.manualReceiptNumber || "—"}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-2">
            <LuCalendar className="w-3.5 h-3.5" /> Date de la quittance
          </p>
          <p className="text-base font-semibold text-gray-900">{formatDate(detail.manualReceiptDate)}</p>
        </div>

        {isCheque && (
          <React.Fragment>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Numéro de chèque</p>
              <p className="text-base font-semibold text-gray-900">{payment.instrumentNumber || payment.transactionNumber || "—"}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1 flex items-center gap-2">
                <LuCalendar className="w-3.5 h-3.5" /> Date du chèque
              </p>
              <p className="text-base font-semibold text-gray-900">{formatDate(payment.instrumentDate)}</p>
            </div>
          </React.Fragment>
        )}

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Montant payé</p>
          <p className="text-2xl font-bold text-green-700">
            {Number(payment.totalAmountPaid || 0).toLocaleString()} FDj
          </p>
          <p className="text-xs text-gray-500 mt-1">Payé par {payment.payerName || "—"}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-2">
            <LuFileText className="w-3.5 h-3.5" /> Quittance téléversée
          </p>
          {payment.fileStoreId ? (
            fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-djibouti-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-djibouti-primary hover:bg-djibouti-primary hover:text-white transition-all"
              >
                <LuDownload className="w-4 h-4" /> Télécharger la quittance
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic">Lien en cours de chargement…</p>
            )
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun fichier joint</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentsTab = ({
  costEstimation,
  checkListCodes,
  data,
  isCitizen,
  service,
  applicationNumber
}) => {
  const { t } = useTranslation();

  // HOD and Agents can edit/calculate, but only HOD can save (backend rejects BPA_AGENTS for costEstimation writes)
  const userDetails = Digit.UserService.getUser();
  const userRoles = userDetails?.info?.roles || [];
  const isSRA = userRoles.some((role) => role.code === "BPA_AGENTS" || role.code === "BPA_HOD");
  const isPaymentViewOnly = !isSRA;

  // Citizens and architects only see the "Détails du paiement" summary card.
  // The detailed Calculation component (fee rates, floor table, breakdown) is
  // an SRA-side working tool and is hidden from applicants.
  const isArchitect = userRoles.some((role) => role.code === "BPA_ARCHITECT");
  const hideCalculationForUser = isCitizen || isArchitect;

  // Services that are free (no payment required) - all others except the ones that require payment
  const paidServices = ['BPA_PCO', 'BPA_PCO_SIMPLE', 'BPA_PL', 'BPA_PCS', 'BPA_PF', 'BPA_PS', 'BPA_ATARR'];
  const isFreeService = !paidServices.includes(service);

  // Check if calculationFees checklist should be shown based on service configuration
  const serviceConfig = checklistByService.find(config => config.service === service);
  const hasCalculationFees = serviceConfig && serviceConfig.checklist && serviceConfig.checklist.includes('calculationFees');

  // Pull computed amounts from costEstimation (populated once SRA calculates fees)
  const totalProjectValue = Number(costEstimation?.totalBuildingCost || 0);
  const royaltyFee = Number(costEstimation?.royaltyFee || 0);
  const royaltyPer = costEstimation?.royaltyPer;
  const seismicFee = Number(costEstimation?.eqResistanceCost || 0);
  const seismicPer = costEstimation?.eqResistancePer;
  const registryServiceFee = Number(costEstimation?.registryServiceFee || 0);
  const totalTax = Number(costEstimation?.totalTax || 0);
  const totalTaxWithService = Number(costEstimation?.totalTaxWithServiceCharge || totalTax || 0);
  const hasCalculationResults = totalProjectValue > 0 || totalTax > 0 || royaltyFee > 0;

  // Map businessService → human permit name shown next to the royalty fee.
  // Default rates: PCS is 2.5%, every other paid service is 1.5%.
  const PERMIT_NAME_BY_SERVICE = {
    BPA_PCO: "Permis de Construire",
    BPA_PCO_SIMPLE: "Permis de Construire",
    BPA_PL: "Permis de Lotir",
    BPA_PCS: "Permis de Construire Simplifié",
    BPA_PF: "Permis de Clôture",
    BPA_PS: "Permis de Surélévation",
    BPA_PD: "Permis de Démolir",
    BPA_PR: "Permis de Remblai",
    BPA_ATARR: "Autorisation de Travaux",
  };
  const permitName = PERMIT_NAME_BY_SERVICE[service] || "Permis de Construire";
  const defaultRoyaltyPer = service === "BPA_PCS" ? 2.5 : 1.5;
  // If the saved costEstimation has a 0/null royaltyPer (legacy buggy data), fall
  // back to the per-service default rather than displaying "0%".
  const displayRoyaltyPer = royaltyPer && Number(royaltyPer) > 0 ? royaltyPer : defaultRoyaltyPer;

  // Services with a simplified fee structure — no seismic fee, no registry service fee.
  // Even when an application was calculated *before* the simplified rates were applied
  // (so the saved costEstimation still has non-zero values), we force-hide those lines.
  const FEE_SIMPLIFIED_SERVICES = new Set(["BPA_PF", "BPA_PCS", "BPA_ATARR"]);
  const hideSeismicAndRegistry = FEE_SIMPLIFIED_SERVICES.has(service);

  // Paid check: application has moved past the payment step.
  // Covers the explicit "payment done" state as well as any downstream granted/approved states.
  const appStatus =
    data?.Application?.[0]?.processInstance?.[0]?.state?.applicationStatus ||
    data?.Application?.[0]?.processInstance?.[0]?.state?.state ||
    data?.Application?.[0]?.workflowStatus;
  const PAID_STATUSES = new Set([
    "CITIZEN_PAYMENT_DONE",
    "PAYMENT_DONE",
    "PAID",
    "PERMIT_GRANTED",
    "CERTIFICATE_GRANTED",
    "CERTIFICATE_ISSUED",
    "APPROVED",
  ]);
  const isPaid = appStatus ? PAID_STATUSES.has(appStatus) : false;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { payment, fileUrl } = usePaymentRecord(tenantId, applicationNumber, isPaid);

  return (
    <div className="space-y-6">
      {/* Free Service Message */}
      {isFreeService ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-bold text-green-800 mb-3">Service Gratuit</h4>
            <p className="text-green-700 text-lg mb-4">
              Ce service ne nécessite aucun paiement
            </p>
            <p className="text-green-600 text-sm">
              Vous pouvez procéder sans frais supplémentaires
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Détails du paiement — résultat des calculs (visible à tous).
              When the application is paid, the entire card switches to a light-green theme. */}
          <div className={`rounded-2xl shadow-lg overflow-hidden border ${isPaid ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}>
            <div className={`px-6 py-4 border-b ${isPaid ? "bg-green-100 border-green-200" : "bg-djibouti-primary/10 border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPaid ? "bg-green-500" : "bg-djibouti-primary"}`}>
                  <LuReceipt className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${isPaid ? "text-green-900" : "text-gray-900"}`}>
                  Détails du paiement
                </h2>
                {isPaid && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                    Payé
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-3">
              {hasCalculationResults ? (
                <React.Fragment>
                  <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isPaid ? "bg-green-100/60" : "bg-gray-50"}`}>
                    <span className={isPaid ? "text-green-900" : "text-gray-600"}>Valeur de projet estimée</span>
                    <span className={`font-semibold ${isPaid ? "text-green-900" : "text-gray-900"}`}>{totalProjectValue.toLocaleString()}</span>
                  </div>

                  <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isPaid ? "bg-green-100/60" : "bg-gray-50"}`}>
                    <span className={isPaid ? "text-green-900" : "text-gray-600"}>
                      Redevance de {displayRoyaltyPer}% sur le {permitName}
                    </span>
                    <span className={`font-semibold ${isPaid ? "text-green-900" : "text-gray-900"}`}>{royaltyFee.toLocaleString()} FDj</span>
                  </div>

                  {!hideSeismicAndRegistry && seismicFee > 0 && (
                    <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isPaid ? "bg-green-100/60" : "bg-gray-50"}`}>
                      <span className={isPaid ? "text-green-900" : "text-gray-600"}>
                        Redevance de {seismicPer != null ? seismicPer : 1}% pour le Contrôle Parasismique
                      </span>
                      <span className={`font-semibold ${isPaid ? "text-green-900" : "text-gray-900"}`}>{seismicFee.toLocaleString()} FDj</span>
                    </div>
                  )}

                  {!hideSeismicAndRegistry && registryServiceFee > 0 && (
                    <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isPaid ? "bg-green-100/60" : "bg-gray-50"}`}>
                      <span className={isPaid ? "text-green-900" : "text-gray-600"}>Frais de service d'enregistrement</span>
                      <span className={`font-semibold ${isPaid ? "text-green-900" : "text-gray-900"}`}>{registryServiceFee.toLocaleString()} FDj</span>
                    </div>
                  )}

                  <div className={`rounded-xl p-5 mt-4 ${isPaid ? "bg-green-500" : "bg-djibouti-primary"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-lg">
                        {isPaid ? "Montant payé" : "Montant de la taxe à payer"}
                      </span>
                      <span className="text-white font-bold text-2xl">
                        {(hideSeismicAndRegistry ? royaltyFee : totalTaxWithService).toLocaleString()} FDj
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <LuCreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Les calculs n'ont pas encore été effectués</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {isSRA
                      ? "Saisissez les informations ci-dessous et cliquez sur « Calculer »"
                      : "Le service SRA doit d'abord calculer les redevances"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reçu de paiement — receipt info captured at payment time
              (manualReceiptNumber, date, cheque info, uploaded file).
              Hidden when fetch fails (ACL issue) — pending backend fix. */}
          {isPaid && payment && (
            <PaymentReceiptCard payment={payment} fileUrl={fileUrl} />
          )}

          {/* BPA_PL only — tax exemption document section, just after the
              "Détails du paiement" card. Internally the component returns null
              for any other service. */}
          <TaxExemptionSection
            service={service}
            applicationNumber={applicationNumber}
            isViewOnly={isPaymentViewOnly}
          />

          {/* Calculation Fees Section.
              Citizens and architects now see this too (view-only) so they
              can understand how the redevance was computed, BUT with the
              "Désignation des travaux" cost-breakdown table hidden (internal
              SRA working data they don't need to see). */}
          {hasCalculationFees && (
            <Calculation
              isCitizen={isCitizen}
              isViewOnly={isPaymentViewOnly}
              hideCostBreakdown={hideCalculationForUser}
            />
          )}
        </div>
      )}

    </div>
  );
};

export default PaymentsTab;

