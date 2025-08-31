import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFileText,
  LuChevronDown,
  LuPlus,
  LuClock,
  LuFolderOpen,
  LuSearch,
} from "react-icons/lu";

const EmployeeNavigation = ({ mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDossiersDropdown, setShowDossiersDropdown] = useState(false);

  // Employee navigation tabs
  const navigationTabs = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LuLayoutDashboard,
      path: `/${window?.contextPath}/employee/publicservices/dashboard-employee`,
    },
    {
      id: "dossiers",
      label: "Dossiers",
      icon: LuFileText,
      path: `/${window?.contextPath}/employee/publicservices/applications-employee/all`,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "new-dossiers",
          label: "Nouveaux dossiers",
          path: `/${window?.contextPath}/employee/publicservices/applications-employee/new`,
          icon: LuPlus,
        },
        {
          id: "in-progress",
          label: "En cours",
          path: `/${window?.contextPath}/employee/publicservices/applications-employee/in-progress`,
          icon: LuClock,
        },
        {
          id: "all-dossiers",
          label: "Tous les dossiers",
          path: `/${window?.contextPath}/employee/publicservices/applications-employee/all`,
          icon: LuFolderOpen,
        },
      ],
    },
    {
      id: "search",
      label: "Recherche",
      icon: LuSearch,
      path: `/${window?.contextPath}/employee/publicservices/search`,
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
    if (tabId === "dossiers" && pathname.includes("/BPA")) {
      return true;
    }
    if (tabId === "search" && pathname.includes("/employee/search")) {
      return true;
    }
    return activeTab === tabId;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDossiersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (mobileView) return null;

  return (
    <nav className="hidden md:flex items-center space-x-2">
      {navigationTabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.id);
        
        if (tab.hasDropdown) {
          return (
            <div key={tab.id} className="relative dropdown-container">
              <button
                onClick={() => setShowDossiersDropdown(!showDossiersDropdown)}
                className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-300 font-medium ${
                  active
                    ? "text-white bg-djibouti-primary shadow-lg scale-105"
                    : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary hover:scale-105"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <LuChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDossiersDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showDossiersDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white bg-opacity-95 rounded-2xl shadow-xl border border-gray-200 border-opacity-60 py-2 z-50">
                  {tab.dropdownItems?.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        history.push(item.path);
                        setShowDossiersDropdown(false);
                        setActiveTab(tab.id);
                      }}
                      className="w-full flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary transition-all duration-200 rounded-xl text-left"
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
              active
                ? "text-white bg-djibouti-primary shadow-lg scale-105"
                : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary hover:scale-105"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default EmployeeNavigation;
