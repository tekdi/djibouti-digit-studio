import React from "react";
import { useTranslation } from "react-i18next";

const ActivitiesTab = ({ timeline, response, isParallelWorkflow, isCitizen }) => {
  const { t } = useTranslation();

  const renderTimeline = (timeline) => {
    console.log(timeline);
    return [...timeline].reverse().map((instance, index) => {
      const isCurrentState = index === timeline.length - 1;
      
      // Special case: if performedAction is "EDIT" and status is "AGENT_NOT_ASSIGNED", display "Demande soumise"
      let displayAction;
      if (instance?.performedAction === "EDIT" && instance?.status === "AGENT_NOT_ASSIGNED") {
        displayAction = "Demande soumise";
      } else {
        displayAction = t(`WF_${response?.module?.toUpperCase()}_${response?.businessService?.toUpperCase()}_${instance?.performedAction}`);
      }
      
      const auditCreated = instance?.auditDetails?.created;

      return (
        <div key={index} className="flex items-start mb-6">
                     <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium mr-4 relative z-10 ${
             isCurrentState 
               ? 'border-djibouti-primary bg-djibouti-primary text-white' 
               : 'border-gray-300 bg-white text-gray-500'
           }`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-medium ${
                isCurrentState ? 'text-djibouti-primary' : 'text-gray-900'
              }`}>
                {displayAction}
              </h4>
              <span className="text-xs text-gray-500">
                {auditCreated}
              </span>
            </div>
            
            {!isCitizen && instance?.assignes?.length > 0 && (
              <p className="text-xs text-gray-500">
                {t("ASSIGNED_TO")}: {instance.assignes[0]?.name}
                {instance.assignes.length > 1 && ` (+${instance.assignes.length - 1} autre${instance.assignes.length > 2 ? 's' : ''})`}
              </p>
            )}

            {instance?.comment && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">{t("COMMENT")}</p>
                <p className="text-xs text-gray-600">"{instance.comment}"</p>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-gray-900 mb-4">Historique des activités</h3>
      
      <div className="relative">
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 z-0"></div>
        
        {Array.isArray(timeline) && renderTimeline(timeline, isParallelWorkflow)}
      </div>
    </div>
  );
};

export default ActivitiesTab;
