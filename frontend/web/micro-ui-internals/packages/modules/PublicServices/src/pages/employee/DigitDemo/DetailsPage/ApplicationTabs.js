import React from "react";
import {
  LuBuilding,
  LuFolderOpen,
  LuCreditCard,
  LuActivity,
  LuSquareCheck,
  LuFileText,
} from "react-icons/lu";

const HIDE_OBSERVATIONS_FOR_BUSINESS_SERVICES = [
  "BPA_PR", "BPA_CCR", "BPA_PCS", "BPA_PF", "BPA_PD", "BPA_ATARR",
  "BPA_PV", "BPA_APE", "BPA_CCE", "BPA_CCP", "BPA_CCG",
];

const HIDE_INSTRUCTION_TAB_FOR_BUSINESS_SERVICES = ["BPA_CCP"];

const ApplicationTabs = ({ activeTab, setActiveTab, isCitizen, businessService }) => {
  const userDetails = Digit.UserService.getUser();

  const isCommissioner = userDetails?.info?.roles?.some((role) =>
    role.code === "BPA_SDECC_COMM" || role.code === "BPA_DGDCF_COMM" ||
    role.code === "BPA_ONEAD_COMM" || role.code === "BPA_DNPC_COMM" ||
    role.code === "BPA_EDD_COMM" || role.code === "BPA_INSPD_COMM"
  );

  const isArchitect = userDetails?.info?.roles?.some((role) => role.code === "BPA_ARCHITECT");

  const showPaymentsTab = userDetails?.info?.roles?.some((role) =>
    role.code === "BPA_ARCHITECT" || role.code === "BPA_AGENTS" || role.code === "BPA_HOD" ||
    role.code === "BPA_DIRECTOR" || role.code === "BPA_SRA_SUB_DIRECTOR" ||
    role.code === "BPA_SUB_DIRECTOR" || role.code === "CITIZEN" || role.code === "COUNTER_EMPLOYEE"
  );

  const hideInstructionTab = HIDE_INSTRUCTION_TAB_FOR_BUSINESS_SERVICES.includes(businessService);
  const showInstructionTab = !hideInstructionTab && (isArchitect || (!isCitizen && !isCommissioner));
  const hideObservationsTab = HIDE_OBSERVATIONS_FOR_BUSINESS_SERVICES.includes(businessService);

  const tabs = [
    { id: "project", label: "Demande", icon: LuBuilding },
    { id: "documents", label: "Documents", icon: LuFolderOpen },
    ...(!hideObservationsTab
      ? [{ id: "observations", label: isCommissioner ? "Observations" : "Avis", icon: LuFileText }]
      : []),
    ...(isCommissioner
      ? []
      : [...(showPaymentsTab ? [{ id: "payments", label: "Paiements", icon: LuCreditCard }] : [])]),
    ...(showInstructionTab ? [{ id: "checklist", label: "Instruction", icon: LuSquareCheck }] : []),
    { id: "activities", label: "Historique", icon: LuActivity },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ApplicationTabs;
