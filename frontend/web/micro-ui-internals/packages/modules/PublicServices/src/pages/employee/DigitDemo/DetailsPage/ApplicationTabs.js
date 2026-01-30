import React from "react";
import { 
  LuBuilding, 
  LuFolderOpen, 
  LuCreditCard, 
  LuActivity,
  LuSquareCheck,
  LuFileText
} from "react-icons/lu";

const ApplicationTabs = ({ activeTab, setActiveTab, isCitizen }) => {

  const userDetails = Digit.UserService.getUser();
  
  // Check if user is a commissioner
  const isCommissioner = userDetails?.info?.roles?.some((role) => 
    role.code === "BPA_SDECC_COMM" || 
    role.code === "BPA_DGDCF_COMM" || 
    role.code === "BPA_ONEAD_COMM" || 
    role.code === "BPA_DNPC_COMM" || 
    role.code === "BPA_EDD_COMM" || 
    role.code === "BPA_INSPD_COMM"
  );

  // Check if user is an agent (should not see observations tab)
  const isAgent = userDetails?.info?.roles?.some((role) => role.code === "BPA_AGENTS");

  // Check if user is an architect (should see instruction tab in view-only mode)
  const isArchitect = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT");

  // BPA_ARCHITECT
  const showPaymentsTab = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT" ||   role.code === "BPA_AGENTS" ||  role.code === "BPA_HOD" ||  role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" || role.code === "BPA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "COUNTER_EMPLOYEE");

  // Show instruction tab for architects and other employees (not citizens, not commissioners)
  const showInstructionTab = isArchitect || (!isCitizen && !isCommissioner);

  const tabs = [
    { id: "project", label: "Informations de la demande", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    // Show observations tab for everyone except agents
    // Label changes based on user role: "Observations" for commissioners, "Retour des Avis" for others
    ...(!isAgent ? [{ id: "observations", label: isCommissioner ? "Observations" : "Retour des Avis", icon: LuFileText }] : []),
    // Hide payments and checklist tabs for commissioners only
    ...(isCommissioner 
      ? []
      : [
          ...(showPaymentsTab ? [{ id: "payments", label: "Paiements", icon: LuCreditCard }] : []),
        ]
    ),
    // Show instruction tab for architects (view-only) and other employees
    ...(showInstructionTab ? [{ id: "checklist", label: "Instruction", icon: LuSquareCheck }] : []),
    { id: "activities", label: "Historique", icon: LuActivity },
  ];

  return (
    <div>
      <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-djibouti-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTabs;
