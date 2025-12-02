import React from "react";
import { LuBuilding2, LuClock } from "react-icons/lu";

const CommissionerInfoCard = ({ observationData, isCurrentUser = false }) => {
  const commissionerName = observationData.updatedByOrganization 
    ? observationData.updatedByOrganization.fullName 
    : observationData.updatedByName || "Commissaire inconnu";

  return (
    <div className={`bg-gradient-to-r ${isCurrentUser ? 'from-djibouti-primary/10 to-djibouti-primary/5' : 'from-djibouti-primary/10 to-djibouti-primary/5'} rounded-xl p-6 border ${isCurrentUser ? 'border-djibouti-primary/20' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-djibouti-primary/20 rounded-lg">
          <LuBuilding2 className="h-6 w-6 text-djibouti-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 mb-1 ${isCurrentUser ? '' : 'text-xl font-bold mb-2'}`}>
              {isCurrentUser ? "Votre observation" : commissionerName}
            </h3>
            {observationData.updatedByOrganization ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {observationData.updatedByOrganization.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  ({observationData.updatedByOrganization.name})
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {observationData.updatedByName || "Commissaire inconnu"}
              </p>
            )}
          </div>
          {observationData.updatedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LuClock className="h-4 w-4" />
              <span>
                {isCurrentUser ? "Dernière modification : " : ""}
                {new Date(observationData.updatedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionerInfoCard;


