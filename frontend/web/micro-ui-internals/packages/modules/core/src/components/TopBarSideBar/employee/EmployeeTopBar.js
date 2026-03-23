import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useHistory, useLocation } from "react-router-dom";
import AnimatedLogo from "../AnimatedLogo";
import LanguageSelector from "../LanguageSelector";
import {
  LuMenu,
  LuX,
  LuLayoutDashboard,
  LuFileText,
  LuClipboardList,
  LuClock,
  LuCircleCheck,
  LuFolderOpen,
  LuSearch,
  LuUser,
  LuChevronDown,
  LuLogOut,
  LuSettings,
} from "react-icons/lu";

// Role translation mapping
const roleTranslations = {
  CITIZEN: "Citoyen (ne)",
  BPA_ARCHITECT: "Architecte",
  BPA_DIRECTOR: "Directeur DATUH",
  BPA_HOD: "Chef SRA",
  BPA_AGENTS: "Instructeur technique SRA",
  BPA_SDECC_HOD: "Chef SDECC",
  BPA_SDECC_AGENTS: "Instructeur technique SDECC",
  BPA_SDECC_COMM: "Commissaire SDECC",
  BPA_SRA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_CAD_DGDCF_SUB_DIRECTOR: "Sous-Directeur DGDCF",
  TOPOGRAPHY_HOD: "Chef Topographie",
  TOPOGRAPHY_AGENT: "Instructeur technique Topographie",
  STUDIO_ADMIN: "Administrateur",
  COUNTER_EMPLOYEE: "Agent Trésorier",
};

const priorityRoles = [
  "BPA_ARCHITECT", "BPA_DIRECTOR", "BPA_HOD", "BPA_AGENTS",
  "BPA_SDECC_HOD", "BPA_SDECC_AGENTS", "BPA_SDECC_COMM",
  "BPA_SRA_SUB_DIRECTOR", "BPA_SUB_DIRECTOR",
  "TOPOGRAPHY_HOD", "TOPOGRAPHY_AGENT",
];

const EmployeeTopBar = ({ t, userDetails, userOptions, mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDossiersDropdown, setShowDossiersDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const basePath = `/${window?.contextPath}/employee/publicservices`;

  const fullName = userDetails?.info?.name || "Utilisateur";
  const shortName = fullName.length > 12 ? fullName.substring(0, 12) + "..." : fullName;
  const userRoles = userDetails?.info?.roles || [];
  const primaryRole = userRoles.find(r => priorityRoles.includes(r?.code))?.code || userRoles[0]?.code || "CITIZEN";
  const displayRole = roleTranslations[primaryRole] || primaryRole;

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LuLayoutDashboard, path: `${basePath}/dashboard-employee` },
    {
      id: "dossiers", label: "Dossiers", icon: LuFileText, path: `${basePath}/applications-employee/all`,
      children: [
        { id: "new", label: "Nouveaux", icon: LuClipboardList, path: `${basePath}/applications-employee/new` },
        { id: "in-progress", label: "En cours", icon: LuClock, path: `${basePath}/applications-employee/in-progress` },
        { id: "completed", label: "Terminés", icon: LuCircleCheck, path: `${basePath}/applications-employee/completed` },
        { id: "all", label: "Tous les dossiers", icon: LuFolderOpen, path: `${basePath}/applications-employee/all` },
      ],
    },
    { id: "search", label: "Recherche", icon: LuSearch, path: `${basePath}/search` },
  ];

  const isActive = (id) => {
    if (id === "dashboard") return pathname.includes("/dashboard-employee");
    if (id === "dossiers") return pathname.includes("/applications-employee") || pathname.includes("/BPA");
    if (id === "search") return pathname.includes("/search");
    return false;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".dossiers-dropdown")) setShowDossiersDropdown(false);
      if (!e.target.closest(".user-dropdown")) setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <Fragment>
      {/* Desktop + Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-3 pt-2 pb-2 sm:px-5 sm:pt-3 sm:pb-3">
        <header className="max-w-7xl mx-auto rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
            {/* Logo */}
            <AnimatedLogo />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);

                if (item.children) {
                  return (
                    <div key={item.id} className="relative dossiers-dropdown">
                      <button
                        onClick={() => setShowDossiersDropdown(!showDossiersDropdown)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "text-white bg-primary shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        <LuChevronDown className={`w-3.5 h-3.5 transition-transform ${showDossiersDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showDossiersDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => { history.push(child.path); setShowDossiersDropdown(false); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                              <child.icon className="w-4 h-4 text-gray-400" />
                              <span>{child.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => history.push(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "text-white bg-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelector />
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <LuUser className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{shortName}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{displayRole}</p>
                  </div>
                  <LuChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                </button>
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                      <p className="text-[11px] text-gray-400">{displayRole}</p>
                    </div>
                    {userOptions?.map((option, i) => {
                      const isLogout = option.name?.toLowerCase().includes("logout") || option.name?.toLowerCase().includes("déconnexion");
                      return (
                        <button
                          key={i}
                          onClick={() => { option.func(); setShowUserDropdown(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                            isLogout ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {isLogout ? <LuLogOut className="w-4 h-4" /> : <LuSettings className="w-4 h-4 text-gray-400" />}
                          <span>{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Logo + Hamburger only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-colors"
            >
              {mobileMenuOpen ? <LuX className="w-5 h-5" /> : <LuMenu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          {/* Panel */}
          <div
            className="absolute top-[60px] left-3 right-3 rounded-2xl border border-white/60 bg-white/95 backdrop-blur-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <LuUser className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-400">{displayRole}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);

                if (item.children) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setShowDossiersDropdown(!showDossiersDropdown)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          active ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4.5 h-4.5" />
                          <span>{item.label}</span>
                        </div>
                        <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDossiersDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showDossiersDropdown && (
                        <div className="ml-4 pl-3 mt-1 mb-1 space-y-0.5 border-l-2 border-gray-100">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => { history.push(child.path); setMobileMenuOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                              <child.icon className="w-4 h-4 text-gray-400" />
                              <span>{child.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => { history.push(item.path); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom: Language + Logout */}
            <div className="px-3 pb-3 pt-1 border-t border-gray-100 mt-1 space-y-1">
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              {userOptions?.map((option, i) => {
                const isLogout = option.name?.toLowerCase().includes("logout") || option.name?.toLowerCase().includes("déconnexion");
                return (
                  <button
                    key={i}
                    onClick={() => { option.func(); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isLogout ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isLogout ? <LuLogOut className="w-4.5 h-4.5" /> : <LuSettings className="w-4.5 h-4.5 text-gray-400" />}
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

EmployeeTopBar.propTypes = {
  t: PropTypes.func.isRequired,
  userDetails: PropTypes.shape({
    info: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      userInfo: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
  userOptions: PropTypes.array,
  handleUserDropdownSelection: PropTypes.func,
  mobileView: PropTypes.bool,
};

export default EmployeeTopBar;
