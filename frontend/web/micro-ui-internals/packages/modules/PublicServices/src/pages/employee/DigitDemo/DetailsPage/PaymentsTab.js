import React from "react";
import Calculation from "../../../../../../core/src/pages/citizen/Calculation";
import { checklistByService } from "../../../../utils/templateConfig.js";

const PaymentsTab = ({ 
  costEstimation, 
  checkListCodes, 
  data,
  isCitizen,
  service 
}) => {

  // Services that are free (no payment required) - all others except the ones that require payment
  const paidServices = ['BPA_PCO', 'BPA_PCO_SIMPLE', 'BPA_PL', 'BPA_PCS', 'BPA_PF', 'BPA_PS', 'BPA_ATARR'];
  const isFreeService = !paidServices.includes(service);
  
  // Check if calculationFees checklist should be shown based on service configuration
  const serviceConfig = checklistByService.find(config => config.service === service);
  const hasCalculationFees = serviceConfig && serviceConfig.checklist && serviceConfig.checklist.includes('calculationFees');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements</h3>
      
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
        <div>
          {/* Cost Estimation Section */}
          {costEstimation ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Estimation des coûts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Coût total du bâtiment</p>
                  <p className="text-lg font-bold text-gray-900">
                    {costEstimation.totalBuildingCost?.toLocaleString()} Fdj
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Taxe totale</p>
                  <p className="text-lg font-bold text-gray-900">
                    {costEstimation.totalTax?.toLocaleString()} Fdj
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mb-6">Aucune information de paiement disponible</p>
          )}

          {/* Calculation Fees Checklist Section */}
          {hasCalculationFees && !isCitizen && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Calcul des frais</h4>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <Calculation />
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PaymentsTab;

