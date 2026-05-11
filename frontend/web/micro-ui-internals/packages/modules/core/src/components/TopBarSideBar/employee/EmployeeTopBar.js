import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useHistory, useLocation } from "react-router-dom";
import AnimatedLogo from "../AnimatedLogo";
import LanguageSelector from "../LanguageSelector";
import {
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
  LuShield,
} from "react-icons/lu";

// Role translation mapping
const roleTranslations = {
  CITIZEN: "Citoyen (ne)",
  BPA_ARCHITECT: "Architecte",
  BPA_DIRECTOR: "Directeur DATUH",
  BPA_HOD: "Cheffe SRA",
  BPA_AGENTS: "Instructeur technique SRA",
  BPA_SDECC_HOD: "Chef de SCC Privée",
  BPA_SDECC_AGENT: "Instructeur technique SDECC",
  BPA_SDECC_AGENTS: "Instructeur technique SDECC",
  BPA_SDECC_SUB_DIRECTOR: "Sous-Directeur SDECC par Intérim",
  BPA_SDECC_COMM: "Commissaire SDECC",
  BPA_DGDCF_COMM: "Directeur Général DGDCF",
  BPA_INSPD_COMM: "Commissaire Santé Publique",
  BPA_EDD_COMM: "Commissaire Électricité",
  BPA_DNPC_COMM: "Commissaire Protection Civile",
  BPA_ONEAD_COMM: "Commissaire Eau et Assainissement",
  BPA_PL_COMM: "Commissaire Routes",
  BPA_SRA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_CAD_DGDCF_SUB_DIRECTOR: "Sous-Directeur DGDCF",
  BCIE_HOD: "Chef BCIE",
  BCIE_AGENT: "Instructeur technique BCIE",
  TOPOGRAPHY_HOD: "Chef Topographie",
  TOPOGRAPHY_CHIEF: "Chef Topographie",
  TOPOGRAPHY_AGENT: "Instructeur technique Topographie",
  STUDIO_ADMIN: "Administrateur",
  COUNTER_EMPLOYEE: "Régisseur du trésor",
};

const priorityRoles = [
  "BPA_ARCHITECT", "BPA_DIRECTOR", "BPA_HOD", "BPA_AGENTS",
  "BPA_SDECC_HOD", "BPA_SDECC_SUB_DIRECTOR", "BPA_SDECC_AGENTS", "BPA_SDECC_AGENT",
  "BPA_SDECC_COMM", "BPA_DGDCF_COMM", "BPA_INSPD_COMM", "BPA_EDD_COMM",
  "BPA_DNPC_COMM", "BPA_ONEAD_COMM", "BPA_PL_COMM",
  "BPA_SRA_SUB_DIRECTOR", "BPA_SUB_DIRECTOR", "BPA_CAD_DGDCF_SUB_DIRECTOR",
  "BCIE_HOD", "BCIE_AGENT",
  "TOPOGRAPHY_HOD", "TOPOGRAPHY_CHIEF", "TOPOGRAPHY_AGENT",
  "COUNTER_EMPLOYEE",
];

const EmployeeTopBar = ({ t, userDetails, userOptions, mobileView }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [showDossiersDropdown, setShowDossiersDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const basePath = `/${window?.contextPath}/employee/publicservices`;

  const fullName = userDetails?.info?.name || "Utilisateur";
  const userRoles = userDetails?.info?.roles || [];
  const primaryRole = userRoles.find(r => priorityRoles.includes(r?.code))?.code || userRoles[0]?.code || "CITIZEN";
  const displayRole = roleTranslations[primaryRole] || primaryRole;

  // Commissioner user accounts are typically seeded with a role-derived name
  // (e.g. "Dgdcf Comm" for BPA_DGDCF_COMM) rather than a real person's name.
  // When that's the case, swap so the translated role ("Commissaire DGDCF")
  // becomes the primary header label and the raw name drops to the subtitle.
  const isCommissioner = /_COMM$/.test(primaryRole || "");
  const headerPrimary = isCommissioner ? displayRole : fullName;
  const headerSecondary = isCommissioner ? fullName : displayRole;
  const shortName = headerPrimary.length > 18 ? headerPrimary.substring(0, 18) + "..." : headerPrimary;

  const isStudioAdmin = userRoles.some((r) => r?.code === "STUDIO_ADMIN");

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
    ...(isStudioAdmin
      ? [{ id: "admin", label: "Admin", icon: LuShield, path: `${basePath}/admin-dashboard/employees` }]
      : []),
  ];

  const isActive = (id) => {
    if (id === "dashboard") return pathname.includes("/dashboard-employee");
    if (id === "dossiers") return pathname.includes("/applications-employee") || pathname.includes("/BPA");
    if (id === "search") return pathname.includes("/search");
    if (id === "admin") return pathname.includes("/admin-dashboard");
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

  // Close any open dropdown on route change
  useEffect(() => { setShowUserDropdown(false); setShowDossiersDropdown(false); }, [pathname]);

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
                    <p className="text-[10px] text-gray-400 leading-tight">{headerSecondary}</p>
                  </div>
                  <LuChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                </button>
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{headerPrimary}</p>
                      <p className="text-[11px] text-gray-400">{headerSecondary}</p>
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

            {/* Mobile: User avatar trigger (replaces hamburger — primary nav lives in
                the sticky bottom nav so this only exposes user info + logout) */}
            <div className="md:hidden relative user-dropdown">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LuUser className="w-4.5 h-4.5" />
                </div>
                <LuChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
              </button>
              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 w-60 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{headerPrimary}</p>
                    <p className="text-[11px] text-gray-400 truncate">{headerSecondary}</p>
                  </div>
                  <div className="px-3 py-2 border-b border-gray-50">
                    <LanguageSelector />
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
        </header>
      </div>

      {/* Sticky bottom nav (mobile only) — like Instagram/Twitter */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => history.push(item.path)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all min-w-0 ${
                  active ? "text-primary" : "text-gray-500 active:bg-gray-50"
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-7 rounded-xl mb-0.5 transition-all ${
                  active ? "bg-primary/10" : ""
                }`}>
                  <Icon className={`transition-all ${active ? "w-5 h-5" : "w-5 h-5"}`} />
                </div>
                <span className={`text-[10.5px] leading-tight font-medium truncate w-full text-center ${
                  active ? "text-primary" : "text-gray-500"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer so page content isn't hidden behind the bottom nav on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />
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
