import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFileText,
  LuMenu,
} from "react-icons/lu";

const EmployeeMobileMenu = ({ mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Employee navigation tabs for mobile
  const navigationTabs = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LuLayoutDashboard,
      path: `/${window?.contextPath}/employee/dashboard`,
    },
    {
      id: "dossiers",
      label: "Tous les dossiers",
      icon: LuFileText,
      path: `/${window?.contextPath}/employee/applications/all`,
    },
    {
      id: "new-dossiers",
      label: "Nouveaux dossiers",
      icon: LuFileText,
      path: `/${window?.contextPath}/employee/applications/new`,
    },
    {
      id: "in-progress",
      label: "Dossiers en cours",
      icon: LuFileText,
      path: `/${window?.contextPath}/employee/applications/in-progress`,
    },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    history.push(tab.path);
  };

  const isTabActive = (tabId) => {
    if (tabId === "dashboard" && (pathname.includes("/employee") && !pathname.includes("/BPA"))) {
      return true;
    }
    if (pathname.includes("/BPA")) {
      if (tabId === "new-dossiers" && pathname.includes("/inbox")) return true;
      if (tabId === "in-progress" && pathname.includes("status=")) return true;
      if (tabId === "dossiers" && pathname.includes("/application-search") && !pathname.includes("status=")) return true;
    }
    return activeTab === tabId;
  };

  if (!mobileView) return null;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-3 text-gray-600 hover:text-djibouti-primary hover:bg-djibouti-primary-light hover:bg-opacity-10 rounded-xl transition-all duration-300"
      >
        <LuMenu className="w-5 h-5" />
      </button>

      {/* Mobile Navigation Menu - positioned absolutely */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden border-t border-gray-200 border-opacity-60 bg-white bg-opacity-95 z-50">
          <div className="px-4 py-4 space-y-2">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    active
                      ? "text-white bg-djibouti-primary shadow-lg"
                      : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-white bg-opacity-20' : 'bg-gray-100'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeMobileMenu;
