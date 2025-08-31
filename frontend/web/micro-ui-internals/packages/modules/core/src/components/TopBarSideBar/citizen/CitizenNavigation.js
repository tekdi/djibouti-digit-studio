import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFileText,
  LuCreditCard,
  LuCircleHelp,
  LuChevronDown,
  LuPlus,
  LuClock,
  LuFolderOpen,
} from "react-icons/lu";

const CitizenNavigation = ({ mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);

  // Navigation tabs
  const navigationTabs = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LuLayoutDashboard,
      path: `/${window?.contextPath}/citizen/publicservices/dashboard`,
    },
    {
      id: "requests",
      label: "Mes Demandes",
      icon: LuFileText,
      path: `/${window?.contextPath}/citizen/publicservices/applications`,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "new-request",
          label: "Nouvelle demande",
          path: `/${window?.contextPath}/citizen/publicservices/apply`,
          icon: LuPlus,
        },
        {
          id: "pending-requests",
          label: "Demandes en cours",
          path: `/${window?.contextPath}/citizen/publicservices/applications/pending`,
          icon: LuClock,
        },
        {
          id: "completed-requests",
          label: "Demandes complétées",
          path: `/${window?.contextPath}/citizen/publicservices/applications/completed`,
          icon: LuFolderOpen,
        },
      ],
    },
    {
      id: "payments",
      label: "Paiements",
      icon: LuCreditCard,
      path: `/${window?.contextPath}/citizen/publicservices/applications/pending-payment`,
    },
    {
      id: "help",
      label: "Aide",
      icon: LuCircleHelp,
      path: `/${window?.contextPath}/citizen/publicservices/help`,
    },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    history.push(tab.path);
  };

  const isTabActive = (tabId) => {
    if (tabId === "dashboard") {
      // Only activate dashboard for exact dashboard path or modules path
      return pathname.includes("/publicservices/dashboard") || pathname.endsWith("/publicservices/modules");
    }
    if (tabId === "requests") {
      // Activate requests tab for applications-related paths, but exclude pending-payment
      return (pathname.includes("/publicservices/applications") || pathname.includes("/publicservices/apply")) && 
             !pathname.includes("/pending-payment");
    }
    if (tabId === "payments") {
      return pathname.includes("/publicservices/applications/pending-payment");
    }
    if (tabId === "help") {
      return pathname.includes("/publicservices/help");
    }
    return activeTab === tabId;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowRequestsDropdown(false);
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
                onClick={() => setShowRequestsDropdown(!showRequestsDropdown)}
                className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                  active
                    ? "text-white bg-djibouti-primary shadow-lg scale-105"
                    : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary hover:scale-105"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <LuChevronDown className={`w-4 h-4 transition-transform duration-300 ${showRequestsDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showRequestsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white bg-opacity-95 rounded-2xl shadow-xl border border-gray-200 border-opacity-60 py-2 z-50">
                  {tab.dropdownItems?.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        history.push(item.path);
                        setShowRequestsDropdown(false);
                        setActiveTab(tab.id);
                      }}
                      className="w-full flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary transition-all duration-200 rounded-xl text-left text-sm"
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

export default CitizenNavigation;
