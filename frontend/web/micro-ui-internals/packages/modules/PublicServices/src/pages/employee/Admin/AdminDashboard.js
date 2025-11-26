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
    { id: "search", label: "Recherche de dossier", icon: LuSearch },
    { id: "employees", label: "Gestion des Employés", icon: LuUsers },
    { id: "architects", label: "Gestion des Architectes", icon: LuBuilding2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22a4d9]/5 via-white to-[#22a4d9]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className="mb-8 animate-fadeInDown">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#22a4d9] to-[#22a4d9]/50 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#22a4d9]/20 shadow-xl">
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#22a4d9] to-[#1978a0] bg-clip-text text-transparent mb-3">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-gray-600 text-lg">Gérez les applications, employés et architectes en toute simplicité</p>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8 animate-fadeInUp">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#22a4d9]/20 p-2">
            <div className="flex space-x-2">
              {tabs.map((tab, index) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex-1 justify-center group ${
                      isActive
                        ? 'text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-[#22a4d9] hover:bg-[#22a4d9]/5'
                    }`}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, #22a4d9 0%, #1978a0 100%)' 
                        : 'transparent'
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-[#22a4d9] rounded-xl opacity-20 animate-pulse"></div>
                    )}
                    <TabIcon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10">{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content with smooth transition */}
        <div className="animate-fadeIn">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#22a4d9]/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              {activeTab === "search" && <SearchTab />}
              {activeTab === "employees" && <EmployeeManagementTab />}
              {activeTab === "architects" && <ArchitectListTab />}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out 0.1s both;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

