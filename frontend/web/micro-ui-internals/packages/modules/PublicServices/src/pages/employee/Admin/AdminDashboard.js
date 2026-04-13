import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch, Redirect } from "react-router-dom";
import { LuSearch, LuUsers, LuBuilding2, LuSettings, LuUser, LuLogOut } from "react-icons/lu";
import AnimatedLogo from "../../../../../core/src/components/TopBarSideBar/AnimatedLogo";
import SearchTab from "./components/SearchTab";
import EmployeeManagementTab from "./components/EmployeeManagementTab";
import ArchitectListTab from "./components/ArchitectListTab";
import AdminSettings from "./components/AdminSettings";
import LogoutDialog from "../../../../../core/src/components/Dialog/LogoutDialog";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch();
  const userDetails = Digit.UserService.getUser();
  
  // Check if user has STUDIO_ADMIN role
  const hasStudioAdminRole = userDetails?.info?.roles?.some(role => role.code === "STUDIO_ADMIN");
  
  // Redirect if user doesn't have STUDIO_ADMIN role
  if (!hasStudioAdminRole) {
    return <Redirect to={`/${window?.contextPath}/employee/publicservices/dashboard-employee`} />;
  }

  // Get stateInfo from store
  const { data: storeData, isLoading: storeLoading } = Digit.Hooks.useStore.getInitData();
  const stateInfo = storeData?.stateInfo;

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Role translation mapping
  const roleTranslations = {
    "STUDIO_ADMIN": "Administrateur",
    "CITIZEN": "Citoyen (ne)",
    "BPA_ARCHITECT": "Architecte",
    "BPA_DIRECTOR": "Directeur DATUH",
    "BPA_HOD": "Chef SRA",
    "BPA_AGENTS": "Instructeur technique SRA",
    "BPA_SDECC_HOD": "Chef de SCC Privée",
    "BPA_SDECC_AGENTS": "Instructeur technique SDECC",
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
    "COUNTER_EMPLOYEE": "Agent Trésorier",
    "BPA_INSPD_COMM": "Commissaire Santé Publique",
    "BPA_EDD_COMM": "Commissaire Électricité",
    "BPA_DNPC_COMM": "Commissaire Protection Civile",
    "BPA_ONEAD_COMM": "Commissaire Eau et Assainissement",
    "BPA_DGDCF_COMM": "DGDCF - Direction Générale des Domaines et de la Conservation Foncière",
  };

  const userRoles = userDetails?.info?.roles || [];
  const primaryRole = userRoles.find(role => role.code === "STUDIO_ADMIN")?.code || userRoles[0]?.code || "CITIZEN";
  const displayRole = roleTranslations[primaryRole] || primaryRole;
  
  const fullUserName = userDetails?.info?.name || "Utilisateur";
  const userName = fullUserName.length > 15 ? fullUserName.substring(0, 15) + "..." : fullUserName;

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    Digit.UserService.logout();
    setShowLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  // Get current path to determine active menu item
  const currentPath = window.location.pathname;
  const getActiveRoute = () => {
    if (currentPath.includes("/settings")) return "settings";
    if (currentPath.includes("/architects")) return "architects";
    if (currentPath.includes("/employees")) return "employees";
    return "search";
  };

  const [activeRoute, setActiveRoute] = useState(getActiveRoute());

  const menuItems = [
   // { id: "search", label: "Recherche de dossier", icon: LuSearch, path: "/admin-dashboard" },
    { id: "employees", label: "Employés", icon: LuUsers, path: "/admin-dashboard/employees" },
    { id: "architects", label: "Architectes", icon: LuBuilding2, path: "/admin-dashboard/architects" },
    { id: "settings", label: "Paramètres", icon: LuSettings, path: "/admin-dashboard/settings" },
  ];

  const handleNavigation = (item) => {
    // Get base path from match
    const basePath = match.path.split("/admin-dashboard")[0];
    const fullPath = `${basePath}${item.path}`;
    history.push(fullPath);
    setActiveRoute(item.id);
  };

  // Update active route when path changes
  useEffect(() => {
    setActiveRoute(getActiveRoute());
  }, [currentPath]);

  const renderContent = () => {
    switch (activeRoute) {
      case "employees":
        return <EmployeeManagementTab />;
      case "architects":
        return <ArchitectListTab />;
      case "settings":
        return <AdminSettings />;
      default:
        return <SearchTab />;
    }
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-[#22a4d9]/5 via-white to-[#22a4d9]/5 flex">
        {/* Sidebar - Fixed */}
        <div className="fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-lg shadow-xl border-r border-[#22a4d9]/20 flex flex-col z-50">
          {/* Logo Section */}
          <div className="p-6 border-b border-[#22a4d9]/20">
            <div className="flex items-center justify-center">
              <AnimatedLogo withoutContentText={true} />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    isActive
                      ? "text-white shadow-lg transform scale-105"
                      : "text-gray-700 hover:text-[#22a4d9] hover:bg-[#22a4d9]/10"
                  }`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #22a4d9 0%, #1978a0 100%)"
                      : "transparent",
                  }}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info Section at Bottom */}
          <div className="p-4 border-t border-[#22a4d9]/20 bg-gradient-to-br from-[#22a4d9]/5 to-transparent">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-[#22a4d9]/20">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#22a4d9] to-[#1978a0] flex items-center justify-center text-white shadow-lg">
                <LuUser className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-[#22a4d9] font-medium truncate">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <LuLogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main Content - with left margin for fixed sidebar */}
        <div className="flex-1 ml-64 overflow-y-auto">
          <div className="p-6 sm:p-8">
            <div className="animate-fadeIn">
              <div>
                <div>{renderContent()}</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <LogoutDialog
          onSelect={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          onDismiss={handleLogoutCancel}
        />
      )}
    </Fragment>
  );
};

export default AdminDashboard;

