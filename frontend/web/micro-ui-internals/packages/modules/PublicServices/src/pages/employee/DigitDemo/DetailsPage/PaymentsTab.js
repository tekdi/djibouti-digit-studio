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
  // Check if calculationFees checklist should be shown based on service configuration
  const serviceConfig = checklistByService.find(config => config.service === service);
  const hasCalculationFees = serviceConfig && serviceConfig.checklist && serviceConfig.checklist.includes('calculationFees');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements</h3>
      
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
  );
};

export default PaymentsTab;

