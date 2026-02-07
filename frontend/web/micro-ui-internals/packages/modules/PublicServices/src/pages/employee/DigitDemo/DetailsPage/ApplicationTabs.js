import React from "react";
import { 
  LuBuilding, 
  LuFolderOpen, 
  LuCreditCard, 
  LuActivity,
  LuSquareCheck,
  LuFileText
} from "react-icons/lu";

// Business services that must NOT show "Retour des Avis" (P1–PR, P2–CCR, P7–PCS, P8–Clôture, P9–Démolir, P10–ATARR, P11–PV, P12–APE, P13–ACE/CCE, P14–CCP, P15–CCG)
const HIDE_OBSERVATIONS_FOR_BUSINESS_SERVICES = [
  "BPA_PR", "BPA_CCR", "BPA_PCS", "BPA_PF", "BPA_PD", "BPA_ATARR",
  "BPA_PV", "BPA_APE", "BPA_CCE", "BPA_CCP", "BPA_CCG"
];

const ApplicationTabs = ({ activeTab, setActiveTab, isCitizen, businessService }) => {

  const userDetails = Digit.UserService.getUser();
  
  // Check if user is a commissioner
  const isCommissioner = userDetails?.info?.roles?.some((role) => 
    role.code === "BPA_SDECC_COMM" || 
    role.code === "BPA_DGDCF_COMM" || 
    role.code === "BPA_ONEAD_COMM" || 
    role.code === "BPA_DNPC_COMM" || 
    role.code === "BPA_EDD_COMM" || 
    role.code === "BPA_INSPD_COMM"
  );

  // Check if user is an architect (should see instruction tab in view-only mode)
  const isArchitect = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT");

  // BPA_ARCHITECT
  const showPaymentsTab = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT" ||   role.code === "BPA_AGENTS" ||  role.code === "BPA_HOD" ||  role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" || role.code === "BPA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "COUNTER_EMPLOYEE");

  // Show instruction tab for architects and other employees (not citizens, not commissioners)
  const showInstructionTab = isArchitect || (!isCitizen && !isCommissioner);

  // Hide "Retour des Avis" / "Observations" for specific permit types
  const hideObservationsTab = HIDE_OBSERVATIONS_FOR_BUSINESS_SERVICES.includes(businessService);

  const tabs = [
    { id: "project", label: "Informations de la demande", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    // Show observations tab for all roles (including agents) except for listed business services
    // Label: "Observations" for commissioners, "Retour des Avis" for others
    ...(!hideObservationsTab ? [{ id: "observations", label: isCommissioner ? "Observations" : "Retour des Avis", icon: LuFileText }] : []),
    // Hide payments and checklist tabs for commissioners only
    ...(isCommissioner 
      ? []
      : [
          ...(showPaymentsTab ? [{ id: "payments", label: "Paiements", icon: LuCreditCard }] : []),
        ]
    ),
    // Show instruction tab for architects (view-only) and other employees
    ...(showInstructionTab ? [{ id: "checklist", label: "Instruction", icon: LuSquareCheck }] : []),
    { id: "activities", label: "Historique", icon: LuActivity },
  ];

  return (
    <div>
      <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-djibouti-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTabs;
