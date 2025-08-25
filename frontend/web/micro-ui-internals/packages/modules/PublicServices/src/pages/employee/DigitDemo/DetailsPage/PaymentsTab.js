import React from "react";

const PaymentsTab = ({ costEstimation }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements</h3>
      
      {costEstimation ? (
        <div className="bg-gray-50 rounded-xl p-4">
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
        <p className="text-gray-500">Aucune information de paiement disponible</p>
      )}
    </div>
  );
};

export default PaymentsTab;
