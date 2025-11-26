import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuSearch, LuUsers, LuBuilding2 } from "react-icons/lu";
import SearchTab from "./components/SearchTab";
import EmployeeManagementTab from "./components/EmployeeManagementTab";
import ArchitectListTab from "./components/ArchitectListTab";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("search");

  const tabs = [
    { id: "search", label: "Recherche", icon: LuSearch },
    { id: "employees", label: "Gestion des Employés", icon: LuUsers },
    { id: "architects", label: "Liste des Architectes", icon: LuBuilding2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600">Gérez les applications, employés et architectes</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 border border-gray-200 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-djibouti-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === "search" && <SearchTab />}
          {activeTab === "employees" && <EmployeeManagementTab />}
          {activeTab === "architects" && <ArchitectListTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

