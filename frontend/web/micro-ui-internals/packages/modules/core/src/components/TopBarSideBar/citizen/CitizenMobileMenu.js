import React, { Fragment, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFileText,
  LuCreditCard,
  LuCircleHelp,
  LuMenu,
  LuChevronDown,
  LuPlus,
  LuClock,
  LuFolderOpen,
} from "react-icons/lu";

const CitizenMobileMenu = ({ mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);

  // Same navigation structure as CitizenNavigation.js
  const navigationTabs = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LuLayoutDashboard,
      path: `/${window?.contextPath}/citizen/publicservices/dashboard`,
    },
    {
      id: "requests",
      label: "Demandes",
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

  // Same logic as CitizenNavigation.js
  const isTabActive = (tabId) => {
    if (tabId === "dashboard") {
      return pathname.includes("/publicservices/dashboard") || pathname.endsWith("/publicservices/modules");
    }
    if (tabId === "requests") {
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

  if (!mobileView) return null;

  return (
    <Fragment>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex-shrink-0 md:hidden p-3 text-gray-600 hover:text-djibouti-primary hover:bg-djibouti-primary-light hover:bg-opacity-10 rounded-xl transition-all duration-300"
        aria-label="Menu"
      >
        <LuMenu className="w-5 h-5" />
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden border-t border-gray-200 border-opacity-60 bg-white bg-opacity-95 z-50">
          <div className="px-4 py-4 space-y-2">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.id);

              if (tab.hasDropdown) {
                return (
                  <div key={tab.id} className="space-y-1">
                    <button
                      onClick={() => setShowRequestsDropdown(!showRequestsDropdown)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                        active
                          ? "text-white bg-djibouti-primary shadow-lg"
                          : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${active ? "bg-white bg-opacity-20" : "bg-gray-100"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span>{tab.label}</span>
                      </div>
                      <LuChevronDown className={`w-4 h-4 transition-transform ${showRequestsDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showRequestsDropdown && (
                      <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-gray-200 ml-4">
                        {tab.dropdownItems?.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              history.push(item.path);
                              setShowRequestsDropdown(false);
                              setIsMobileMenuOpen(false);
                              setActiveTab(tab.id);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary transition-all text-sm text-left"
                          >
                            <div className="p-1.5 rounded-lg bg-gray-100">
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
                  onClick={() => {
                    handleTabClick(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                    active
                      ? "text-white bg-djibouti-primary shadow-lg"
                      : "text-gray-700 hover:bg-djibouti-primary-light hover:bg-opacity-10 hover:text-djibouti-primary"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? "bg-white bg-opacity-20" : "bg-gray-100"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default CitizenMobileMenu;
