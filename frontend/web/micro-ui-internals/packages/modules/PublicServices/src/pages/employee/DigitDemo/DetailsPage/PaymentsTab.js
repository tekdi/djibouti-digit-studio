import React from "react";
import { useTranslation } from "react-i18next";
import Calculation from "../../../../../../core/src/pages/citizen/Calculation";
import { checklistByService } from "../../../../utils/templateConfig.js";
import { LuReceipt, LuCreditCard } from "react-icons/lu";
import TaxExemptionSection from "./TaxExemptionSection";

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
  const isSRA = userDetails?.info?.roles?.some((role) => role.code === "BPA_AGENTS" || role.code === "BPA_HOD");
  const isPaymentViewOnly = !isSRA;

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

          {/* Détails du paiement — résultat des calculs (visible à tous) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-djibouti-primary/10 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-djibouti-primary p-2 rounded-lg">
                  <LuReceipt className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Détails du paiement</h2>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {hasCalculationResults ? (
                <React.Fragment>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Valeur de projet estimée</span>
                    <span className="font-semibold text-gray-900">{totalProjectValue.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">
                      Redevance de {royaltyPer != null ? royaltyPer : 1.5}% sur le Permis de Construire
                    </span>
                    <span className="font-semibold text-gray-900">{royaltyFee.toLocaleString()} FDj</span>
                  </div>

                  {seismicFee > 0 && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">
                        Redevance de {seismicPer != null ? seismicPer : 1}% pour le Contrôle Parasismique
                      </span>
                      <span className="font-semibold text-gray-900">{seismicFee.toLocaleString()} FDj</span>
                    </div>
                  )}

                  {registryServiceFee > 0 && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Frais de service d'enregistrement</span>
                      <span className="font-semibold text-gray-900">{registryServiceFee.toLocaleString()} FDj</span>
                    </div>
                  )}

                  <div className="bg-djibouti-primary rounded-xl p-5 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-lg">Montant de la taxe à payer</span>
                      <span className="text-white font-bold text-2xl">
                        {totalTaxWithService.toLocaleString()} FDj
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

          {/* BPA_PL only — tax exemption document section, just after the
              "Détails du paiement" card. Internally the component returns null
              for any other service. */}
          <TaxExemptionSection
            service={service}
            applicationNumber={applicationNumber}
            isViewOnly={isPaymentViewOnly}
          />

          {/* Calculation Fees Section */}
          {hasCalculationFees && (
            <Calculation isCitizen={isCitizen} isViewOnly={isPaymentViewOnly} />
          )}
        </div>
      )}

    </div>
  );
};

export default PaymentsTab;

