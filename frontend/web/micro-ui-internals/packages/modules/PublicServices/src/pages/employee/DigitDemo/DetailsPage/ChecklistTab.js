import React from "react";
import ViewCheckListCards from "../../CheckList/viewCheckListCards";

const ChecklistTab = ({ 
  isCitizen, 
  shouldShowChecklist, 
  checkListCodes, 
  data 
}) => {
  if (isCitizen || !shouldShowChecklist) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruction</h3>
        <p className="text-gray-500">Aucune liste de vérification disponible pour votre rôle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruction</h3>
      
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ViewCheckListCards
            applicationId={data?.Application?.[0]?.id}
            state={data?.Application?.[0]?.processInstance?.[0]?.state?.state}
            checkListCodes={checkListCodes}
          />
        </div>
      </div>
    </div>
  );
};

export default ChecklistTab;
