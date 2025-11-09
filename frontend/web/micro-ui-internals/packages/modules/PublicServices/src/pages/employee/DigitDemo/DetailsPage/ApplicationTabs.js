import React from "react";
import { 
  LuBuilding, 
  LuFolderOpen, 
  LuCreditCard, 
  LuActivity,
  LuSquareCheck
} from "react-icons/lu";

const ApplicationTabs = ({ activeTab, setActiveTab, isCitizen }) => {

  const userDetails = Digit.UserService.getUser();
  // BPA_ARCHITECT
  const showPaymentsTab = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT" ||   role.code === "BPA_AGENTS" ||  role.code === "BPA_HOD" ||  role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" || role.code === "BPA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "COUNTER_EMPLOYEE");

  const tabs = [
    { id: "project", label: "Informations de la demande", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    ...(showPaymentsTab ? [{ id: "payments", label: "Paiements", icon: LuCreditCard }] : []),
    // Only show checklist tab for non-citizens
    ...(isCitizen ? [] : [{ id: "checklist", label: "Instruction", icon: LuSquareCheck }]),
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
