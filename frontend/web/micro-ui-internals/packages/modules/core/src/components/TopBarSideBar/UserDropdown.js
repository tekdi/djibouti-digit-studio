import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { LuUser, LuChevronDown, LuSettings } from "react-icons/lu";

const UserDropdown = ({ userDetails, userOptions }) => {
  const history = useHistory();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const fullUserName = userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Utilisateur";
  const userName = fullUserName.length > 10 ? fullUserName.substring(0, 10) + "..." : fullUserName;

  // Role translation mapping
  const roleTranslations = {
    "CITIZEN": "Citoyen (ne)",
    "BPA_ARCHITECT": "Architecte",
    "BPA_DIRECTOR": "Directeur DATUH",
    "BPA_HOD": "Cheffe SRA",
    "BPA_AGENTS": "Instructeur technique SRA",
    "BPA_SDECC_HOD": "Sous-Directeur SDECC par Intérim (SDECC)",
    "BPA_SDECC_AGENTS": "Instructeur technique SCC Privée",
    "BPA_SDEC_AGENT": "Instructeur technique SCC Privée",
    "BPA_SDECC_COMM": "Commissaire SDECC",
    "BPA_SDECC_AGENT": "Instructeur technique SDECC",
    "BPA_SDECC_SUB_DIRECTOR": "Sous-Directeur SDECC",
    "BPA_PL_COMM": "Commissaire Routes",
    "BCIE_AGENT": "Instructeur technique BCIE",
    "BCIE_HOD": "Chef BCIE",
    "TOPOGRAPHY_CHIEF": "Chef Topographie",
    "TOPOGRAPHY_HOD": "Chef Topographie",
    "TOPOGRAPHY_AGENT": "Instructeur technique Topographie",
    "BPA_CAD_DGDCF_SUB_DIRECTOR": "Sous-Directeur DGDCF",
    "BPA_SRA_SUB_DIRECTOR": "Sous-Directeur SDATU",
    "BPA_SUB_DIRECTOR": "Sous-Directeur SDATU",
    "CHAKSHU": "Équipe Interne",
    "COUNTER_EMPLOYEE": "Régisseur du trésor",
    "STUDIO_ADMIN": "Administrateur",
    "BPA_INSPD_COMM": "Commissaire Santé Publique",
    "BPA_EDD_COMM": "Commissaire Électricité",
    "BPA_DNPC_COMM": "Commissaire Protection Civile",
    "BPA_ONEAD_COMM": "Commissaire Eau et Assainissement",
    "BPA_DGDCF_COMM": "Directeur Général DGDCF",
  };

  // Get user roles and find the display role
  const userRoles = userDetails?.info?.roles || [];
  const priorityRoles = [
    "BPA_ARCHITECT", "BPA_DIRECTOR", "BPA_HOD", "BPA_AGENTS", "BPA_SDECC_HOD",
    "BPA_SDECC_SUB_DIRECTOR", "BPA_SDECC_AGENTS", "BPA_SDECC_COMM", "BPA_SDECC_AGENT",
    "BPA_SRA_SUB_DIRECTOR", "BPA_SUB_DIRECTOR", "BPA_CAD_DGDCF_SUB_DIRECTOR",
    "BCIE_AGENT", "BCIE_HOD", "TOPOGRAPHY_HOD", "TOPOGRAPHY_AGENT", "TOPOGRAPHY_CHIEF",
    "COUNTER_EMPLOYEE", "BPA_INSPD_COMM", "BPA_EDD_COMM", "BPA_DNPC_COMM",
    "BPA_ONEAD_COMM", "BPA_DGDCF_COMM", "BPA_PL_COMM"
  ];
  
  // Find the primary role to display
  const primaryRole = userRoles.find(role => priorityRoles.includes(role?.code))?.code || 
                     userRoles[0]?.code || "CITIZEN";
  
  const displayRole = roleTranslations[primaryRole] || primaryRole;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative user-dropdown-container">
      <button
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        className="flex items-center gap-3 p-2 hover:bg-djibouti-primary-light hover:bg-opacity-10 rounded-xl transition-all duration-300 hover:scale-105"
      >
        <div className="w-10 h-10 rounded-xl bg-djibouti-primary-light bg-opacity-30 flex items-center justify-center text-djibouti-primary shadow-lg border border-djibouti-primary border-opacity-20">
          <LuUser className="w-5 h-5" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-gray-900">{userName}</p>
          <p className="text-xs text-djibouti-primary font-medium">{displayRole}</p>
        </div>
        <LuChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* User Dropdown Menu */}
      {showUserDropdown && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white bg-opacity-95 rounded-2xl shadow-xl border border-gray-200 border-opacity-60 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">{userName}</p>
            <p className="text-xs text-djibouti-primary font-medium">{displayRole}</p>
          </div>
          
          {/* Settings Option */}
          <button
            onClick={() => {
              const settingsPath = primaryRole === "CITIZEN" 
                ? `/${window?.contextPath}/citizen/publicservices/settings`
                : `/${window?.contextPath}/employee/publicservices/settings`;
              history.push(settingsPath);
              setShowUserDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary transition-all duration-200 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-gray-100">
              <LuSettings className="w-4 h-4" />
            </div>
            <span className="font-medium">Paramètres</span>
          </button>
          
          {userOptions?.map((option, index) => {
            const isLogout = option.name?.toLowerCase().includes('logout') || option.name?.toLowerCase().includes('déconnexion');
            return (
              <button
                key={index}
                onClick={() => {
                  option.func();
                  setShowUserDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-2 py-3 transition-all duration-200 rounded-xl ${
                  isLogout 
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700" 
                    : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary"
                }`}
              >
                {option.icon && (
                  <div className={`p-2 rounded-lg ${isLogout ? 'bg-red-100' : 'bg-gray-100'}`}>
                    {option.icon}
                  </div>
                )}
                <span className="font-medium">{option.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
