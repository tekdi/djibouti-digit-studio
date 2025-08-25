import React from "react";
import { 
  LuBuilding, 
  LuFolderOpen, 
  LuCreditCard, 
  LuActivity,
  LuSquareCheck
} from "react-icons/lu";

const ApplicationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "project", label: "Détails du projet", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    { id: "payments", label: "Paiements", icon: LuCreditCard },
    { id: "activities", label: "Activités", icon: LuActivity },
    { id: "checklist", label: "Liste de vérification", icon: LuSquareCheck }
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
