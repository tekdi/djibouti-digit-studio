import React from "react";
import ViewCheckListCards from "../../CheckList/viewCheckListCards";

const ChecklistTab = ({ 
  isCitizen, 
  shouldShowChecklist, 
  checkListCodes, 
  data 
}) => {
  // Check if user is an architect - they should see the checklist in view-only mode
  // Note: Architects are citizen-type users but should still see the instruction tab
  const userDetails = Digit.UserService.getUser();
  const isArchitect = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT");

  // Show checklist for architects (view-only) or if shouldShowChecklist is true
  const canViewChecklist = isArchitect || shouldShowChecklist;

  // Block only regular citizens (not architects) who don't have view access
  // Architects are citizen-type but should be allowed to view
  if ((isCitizen && !isArchitect) || !canViewChecklist) {
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
      
      <ViewCheckListCards
        applicationId={data?.Application?.[0]?.id}
        state={data?.Application?.[0]?.processInstance?.[0]?.state?.state}
        checkListCodes={checkListCodes}
      />
    </div>
  );
};

export default ChecklistTab;
