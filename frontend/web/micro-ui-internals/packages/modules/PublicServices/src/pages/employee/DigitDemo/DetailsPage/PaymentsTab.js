import React from "react";
import { useTranslation } from "react-i18next";
import Calculation from "../../../../../../core/src/pages/citizen/Calculation";
import { checklistByService } from "../../../../utils/templateConfig.js";
import { LuReceipt, LuUser, LuPhone, LuMapPin, LuCreditCard } from "react-icons/lu";

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

  // Fetch bill data for displaying payment details
  // Billing service rejects state-level tenantId (e.g. "dj"), needs city-level (e.g. "dj.city")
  const rawTenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = rawTenantId && !rawTenantId.includes(".") ? rawTenantId + ".city" : rawTenantId;
  const requestCriteria = {
    url: "/billing-service/bill/v2/_fetchbill",
    params: {
      consumerCode: applicationNumber,
      tenantId: tenantId,
      businessService: service
    },
    body: {},
    options: {
      userService: true,
      auth: true,
    },
    config: {
      enabled: !!applicationNumber && !!tenantId && !!service && !isFreeService,
      select: (data) => {
        return data?.Bill?.[0];
      },
    },
  };
  const { isLoading: isBillLoading, data: bill } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const arrears =
    bill?.billDetails
      ?.sort((a, b) => b.fromPeriod - a.fromPeriod)
      ?.reduce((total, current, index) => (index === 0 ? total : total + current.amount), 0) || 0;

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
          
          {/* Payment Details Table - For Citizens and Architects (View Only) */}
          {isPaymentViewOnly && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-djibouti-primary/10 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-djibouti-primary p-2 rounded-lg">
                    <LuReceipt className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Détails du paiement</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {isBillLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-djibouti-primary"></div>
                    <span className="ml-3 text-gray-600">Chargement des détails...</span>
                  </div>
                ) : bill ? (
                  <>
                    {/* Consumer Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-djibouti-primary/10 p-2 rounded-lg">
                          <LuUser className="w-5 h-5 text-djibouti-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Nom du demandeur</p>
                          <p className="font-semibold text-gray-900 truncate">{bill?.payerName || "-"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-djibouti-primary/10 p-2 rounded-lg">
                          <LuPhone className="w-5 h-5 text-djibouti-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Numéro de téléphone</p>
                          <p className="font-semibold text-gray-900">{bill?.mobileNumber || "-"}</p>
                        </div>
                      </div>
                      
                      {bill?.payerAddress && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <div className="bg-djibouti-primary/10 p-2 rounded-lg">
                            <LuMapPin className="w-5 h-5 text-djibouti-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Adresse</p>
                            <p className="font-semibold text-gray-900 truncate">{bill?.payerAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fee Breakdown */}
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">Détails des taxes</span>
                        <span className="font-semibold text-gray-700">Montant</span>
                      </div>
                      
                      <div className="space-y-3">
                        {bill?.billDetails?.[0]?.billAccountDetails
                          ?.sort((a, b) => a.order - b.order)
                          .map((amountDetails, index) => (
                            <div key={index + "taxheads"} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">{t(amountDetails.taxHeadCode)}</span>
                              <span className="font-semibold text-gray-900">FDj {amountDetails.amount?.toFixed(0)}</span>
                            </div>
                          ))}
                        
                        {arrears > 0 && (
                          <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-200">
                            <span className="text-orange-700">Arriérés</span>
                            <span className="font-semibold text-orange-700">FDj {arrears?.toFixed?.(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="bg-djibouti-primary rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-lg">Montant total à payer</span>
                        <span className="text-white font-bold text-2xl">FDj {Number(bill?.totalAmount).toFixed(0)}</span>
                      </div>
                    </div>
                  </>
                ) : costEstimation?.totalTaxWithServiceCharge || costEstimation?.totalTax ? (
                  /* No bill yet, but SRA has already calculated the fees — show a preview
                     from costEstimation so citizens/architects can see the expected
                     amount before the director sends the app to payment. */
                  <React.Fragment>
                    <div className="space-y-3">
                      {costEstimation?.royaltyFee != null && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Redevance Permis de Construire</span>
                          <span className="font-semibold text-gray-900">FDj {Number(costEstimation.royaltyFee).toLocaleString()}</span>
                        </div>
                      )}
                      {costEstimation?.eqResistanceCost != null && costEstimation.eqResistanceCost > 0 && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Redevance Contrôle Parasismique</span>
                          <span className="font-semibold text-gray-900">FDj {Number(costEstimation.eqResistanceCost).toLocaleString()}</span>
                        </div>
                      )}
                      {costEstimation?.registryServiceFee != null && costEstimation.registryServiceFee > 0 && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Frais de service d'enregistrement</span>
                          <span className="font-semibold text-gray-900">FDj {Number(costEstimation.registryServiceFee).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-djibouti-primary rounded-xl p-5 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-lg">Montant total à payer</span>
                        <span className="text-white font-bold text-2xl">
                          FDj {Number(costEstimation.totalTaxWithServiceCharge || costEstimation.totalTax).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        Aperçu — la facture officielle sera générée lorsque le dossier sera transmis au paiement.
                      </p>
                    </div>
                  </React.Fragment>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <LuCreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Aucune facture générée pour cette demande</p>
                    <p className="text-gray-400 text-sm mt-1">La facture sera disponible après validation du dossier</p>
                  </div>
                )}
              </div>
            </div>
          )}

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

