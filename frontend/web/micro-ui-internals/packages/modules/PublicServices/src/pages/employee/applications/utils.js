import { LuFileText, LuCircleCheck, LuCircleX, LuClock, LuCircleAlert, LuCreditCard, LuUserCheck, LuMapPin, LuCircle } from "react-icons/lu";

// Get service info mapping
export const getServiceInfo = (businessService) => {
  const serviceMap = {
    BPA_PR: {
      ref: "P1",
      name: "Permis de Remblai (PR)",
      shortName: "Permis de Remblai",
      description: "Autorisation pour travaux de remblai",
      category: "permits",
    },
    BPA_CCR: {
      ref: "P2",
      name: "Certificat de Conformité de Remblai (CCR)",
      shortName: "Certificat de Conformité Remblai",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates",
    },
    BPA_PCO_SIMPLE: {
      ref: "P3",
      name: "P3 - Permis de Construire Ordinaire (PCO < 200 m²)",
      shortName: "PCO - Constructions Simples",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits",
    },
    BPA_PCO: {
      ref: "P4",
      name: "Permis de Construire Ordinaire par CA/BE (PCO)",
      shortName: "PCO - Constructions Publiques",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits",
    },
    BPA_PL: {
      ref: "P5",
      name: "Permis de Lotir",
      shortName: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits",
    },
    BPA_PS: {
      ref: "P6",
      name: "Permis de Surélévation",
      shortName: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits",
    },
    BPA_PCS: {
      ref: "P7",
      name: "Permis de Construire Simplifié (PCS)",
      shortName: "Permis de Construire Simplifié",
      description: "Pour les constructions de petite taille",
      category: "permits",
    },
    BPA_PF: {
      ref: "P8",
      name: "Permis de Clôture",
      shortName: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits",
    },
    BPA_PD: {
      ref: "P9",
      name: "Permis de Démolir",
      shortName: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits",
    },
    BPA_ATARR: {
      ref: "P10",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      shortName: "ATARR - Travaux & Aménagement",
      description: "ATARR pour tous types de travaux",
      category: "permits",
    },
    BPA_PV: {
      ref: "P11",
      name: "Procès-Verbal d'Implantation",
      shortName: "PV d'Implantation",
      description: "PV d'Implantation pour positionnement",
      category: "validations",
    },
    BPA_APE: {
      ref: "P12",
      name: "Approbation de Plan d'Exécution (APE)",
      shortName: "Approbation de Plan d'Exécution",
      description: "Validation des plans d'exécution",
      category: "validations",
    },
    BPA_CCE: {
      ref: "P13",
      name: "Certificat de Conformité Électrique (CCE)",
      shortName: "Certificat de Conformité Électrique",
      description: "Validation de l'installation électrique",
      category: "certificates",
    },
    BPA_CCP: {
      ref: "P14",
      name: "Certificat de Conformité Parasismique (CCP)",
      shortName: "Certificat de Conformité Parasismique",
      description: "Validation des normes parasismiques",
      category: "certificates",
    },
    BPA_CCG: {
      ref: "P15",
      name: "Certificat de Conformité Général (CCG)",
      shortName: "Certificat de Conformité Général",
      description: "Validation générale de conformité",
      category: "certificates",
    },
  };
  return (
    serviceMap[businessService] || {
      ref: "P?",
      name: businessService,
      description: "Service administratif en ligne",
    }
  );
};

// Statuses considered "Nouveau" (needs immediate attention) on the employee
// dashboard. Think of "Nouveau" as the user's inbox — anything where the
// application is pending THEIR action. Most statuses are role-specific, so we
// build the final list based on the logged-in user's roles.
const BASE_NEW_STATUSES = [
  "AGENT_NOT_ASSIGNED",
  "APPLICATION_SUBMITTED",
  "PENDING_ACTION",
  "PENDING_ACTION_BY_AGENT",
];

// Role code → statuses that are awaiting action from that role.
// When any of the user's roles match, those statuses get added to "Nouveau".
const ROLE_INBOX_STATUSES = {
  BPA_DIRECTOR: [
    "AWAITING_ON_DIRECTOR_REVIEW",
    "UNDER_REVIEW_BY_DIRECTOR",
    "PENDING_REVIEW_BY_DIRECTOR",
    "DIRECTOR_APPROVAL_PENDING",
    "PENDING_DIRECTOR_APPROVAL",
  ],
  BPA_HOD: [
    "REVIEW_IN_PROGRESS_BY_SRA_HOD",
    "PENDING_REVIEW_BY_SRA_HOD",
    "AWAITING_ON_SRA_HOD_REVIEW",
  ],
  BPA_AGENTS: [
    "PENDING_REVIEW_BY_SRA_AGENT",
    "AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT",
  ],
  BPA_SRA_SUB_DIRECTOR: [
    "BPA_SRA_SUB_DIRECTOR_REVIEW",
    "BPA_SRA_SUB_DIRECTOR_APPROVAL",
    "AWAITING_ON_SUB_DIRECTOR_REVIEW",
    "UNDER_REVIEW_BY_SUB_DIRECTOR",
    "PENDING_REVIEW_BY_SUB_DIRECTOR",
    "PENDING_SUB_DIRECTOR_ACTION",
    "PENDING_SUB_DIRECTOR_APPROVAL",
    "SUB_DIRECTOR_APPROVAL_PENDING",
  ],
  BPA_SUB_DIRECTOR: [
    "BPA_SRA_SUB_DIRECTOR_REVIEW",
    "BPA_SRA_SUB_DIRECTOR_APPROVAL",
    "AWAITING_ON_SUB_DIRECTOR_REVIEW",
    "UNDER_REVIEW_BY_SUB_DIRECTOR",
    "PENDING_REVIEW_BY_SUB_DIRECTOR",
    "PENDING_SUB_DIRECTOR_ACTION",
    "PENDING_SUB_DIRECTOR_APPROVAL",
    "SUB_DIRECTOR_APPROVAL_PENDING",
  ],
  BPA_SDECC_SUB_DIRECTOR: [
    "BPA_SDECC_SUB_DIRECTOR_REVIEW",
  ],
  BPA_SDECC_HOD: [
    "SDECC_HOD_REVIEW",
    "SUBMITTED_TO_SDECC_HOD",
    "SUBMITTED_TO_SDECC",
    "TECHNICAL_REVIEW",
    "PENDING_HOD_VALIDATION",
    "HOD_APPROVAL_PENDING",
  ],
  BPA_SDECC_AGENT: [
    "SDECC_AGENT_NOT_ASSSIGNED",
    "PENDING_ACTION_BY_SDECC_AGENT",
    "AGENT_VERIFICATION_PENDING",
  ],
  BPA_SDECC_AGENTS: [
    "SDECC_AGENT_NOT_ASSSIGNED",
    "PENDING_ACTION_BY_SDECC_AGENT",
    "AGENT_VERIFICATION_PENDING",
  ],
  BCIE_HOD: [
    "BCIE_HOD_REVIEW",
  ],
  BCIE_AGENT: [
    "AGENT_INSPECTION_PENDING",
    "AGENT_NOT_ASSIGNED",
    "AGENT_ASSIGNED",
    "PENDING_ACTION_BY_AGENT",
  ],
  BCIE_AGENTS: [
    "AGENT_INSPECTION_PENDING",
    "AGENT_NOT_ASSIGNED",
    "AGENT_ASSIGNED",
    "PENDING_ACTION_BY_AGENT",
  ],
  TOPOGRAPHY_HOD: [
    "TOPOGRAPHY_HOD_REVIEW",
    "SUBMITTED_TO_TOPOGRAPHY_HOD",
  ],
  TOPOGRAPHY_CHIEF: [
    "TOPOGRAPHY_HOD_REVIEW",
    "SUBMITTED_TO_TOPOGRAPHY_HOD",
  ],
  TOPOGRAPHY_AGENT: [
    "SENT_TO_TOPOGRAPHY",
  ],
  BPA_DGDCF_COMM: [
    "PENDING_REVIEW_BY_DGDCF",
    "AWAITING_ON_COMMISSIONER",
  ],
  BPA_SDECC_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_INSPD_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_EDD_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_DNPC_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_ONEAD_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_PL_COMM: ["AWAITING_ON_COMMISSIONER"],
  BPA_DJITELECOM_COMM: ["AWAITING_ON_COMMISSIONER"],
};

// Primary display identifier for an application:
//   - once the SRA has filled the Fiche d'instruction with a
//     `Numéro du Permis de Construire` (additionalDetails.instructionSheet.pcoNumber),
//     use that number everywhere (cards, detail header, etc.)
//   - otherwise fall back to the raw application number (e.g. "PCO-000041/2026")
// Keeps applicationNumber accessible for traceability if the caller needs it.
export const getDisplayApplicationId = (app) => {
  if (!app) return "";
  const pcoNumber = app?.additionalDetails?.instructionSheet?.pcoNumber;
  if (pcoNumber && String(pcoNumber).trim()) return String(pcoNumber).trim();
  return app.applicationNumber || "";
};

export const getNewStatusesForUser = (roles = []) => {
  const codes = (roles || []).map((r) => r?.code).filter(Boolean);
  const extra = new Set();
  for (const code of codes) {
    const statuses = ROLE_INBOX_STATUSES[code];
    if (statuses) statuses.forEach((s) => extra.add(s));
  }
  return [...BASE_NEW_STATUSES, ...extra];
};

export const getSimplifiedStatus = (status) => {
  const statusMap = {
    INITIATED: "pending",
    APPLIED: "pending",
    INPROGRESS: "pending",
    PENDING_ACTION: "pending",
    PENDING_ACTION_BY_AGENT: "pending",
    PENDING_ACTION_BY_ARCHITECT: "pending",
    PENDING_SUB_DIRECTOR_ACTION: "pending",
    PENDING_SUB_DIRECTOR_APPROVAL: "pending",
    PENDING_DIRECTOR_APPROVAL: "pending",
    PENDING_VERIFICATION: "pending",
    BPA_SRA_SUB_DIRECTOR_REVIEW: "pending",
    BCIE_HOD_REVIEW: "pending",
    AGENT_INSPECTION_PENDING: "pending",
    AGENT_VERIFICATION_PENDING: "pending",
    BPA_SRA_SUB_DIRECTOR_APPROVAL: "pending",
    SUB_DIRECTOR_APPROVAL_PENDING: "pending",
    DIRECTOR_APPROVAL_PENDING: "pending",
    APPLICATION_CANCEL: "cancelled",
    AGENT_REPORT_READY: "pending",
    SDECC_AGENT_NOT_ASSSIGNED: "pending",
    PENDING_ACTION_BY_SDECC_AGENT: "pending",
    SDECC_AGENT_REPORT_READY: "pending",
    REVIEW_IN_PROGRESS_BY_SRA_HOD: "pending",
    UNDER_REVIEW_BY_DIRECTOR: "pending",
    UNDER_REVIEW_BY_SUB_DIRECTOR: "pending",
    PENDING_REVIEW_BY_SRA_HOD: "pending",
    PENDING_REVIEW_BY_SRA_AGENT: "pending",
    PENDING_REVIEW_BY_SUB_DIRECTOR: "pending",
    PENDING_REVIEW_BY_DIRECTOR: "pending",
    PENDING_REVIEW_BY_DGDCF: "pending",
    SENT_TO_TOPOGRAPHY: "pending",
    AWAITING_ON_COMMISSIONER: "pending",
    AWAITING_ON_SUB_DIRECTOR_REVIEW: "pending",
    AWAITING_ON_SRA_HOD_REVIEW: "pending",
    AWAITING_ON_DIRECTOR_REVIEW: "pending",
    AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT: "pending",
    // BPA_APE workflow states
    BPA_SDECC_SUB_DIRECTOR_REVIEW: "pending",
    SUBMITTED_TO_SDECC: "pending",
    TECHNICAL_REVIEW: "pending",
    PENDING_HOD_VALIDATION: "pending",
    HOD_APPROVAL_PENDING: "pending",
    PENDING_SUB_DIRECTOR_SIGNATURE: "pending",
    PAYMENT_PENDING: "payment_pending",
    AWAITING_CITIZEN_PAYMENT: "payment_pending",
    DOCUMENT_VERIFICATION_PENDING: "pending",
    FIELD_VERIFICATION_PENDING: "pending",
    VERIFICATION_COMPLETED: "completed",
    APPROVED: "approved",
    REJECTED: "rejected",
    PERMIT_REJECTED: "rejected",
    INSPECTION_REJECTED: "rejected",
    VERIFICATION_REJECTED: "rejected",
    PERMIT_GRANTED: "completed",
    CERTIFICATE_GRANTED: "completed",
    CERTIFICATE_ISSUED: "completed",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
  };
  return statusMap[status] || "pending";
};

export const getStatusInfo = (status) => {
  // Map actual status values to French translations and styling
  const statusConfig = {
    INPROGRESS: {
      label: "En cours",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 30,
    },
    PENDING_ACTION: {
      label: "Action requise",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 35,
    },
    AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT: {
      label: "En attente du calcul des frais (Agent SRA)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 45,
    },
    PENDING_ACTION_BY_AGENT: {
      label: "En attente d'action de l'agent",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 40,
    },
    // Agent assignment statuses
    AGENT_NOT_ASSIGNED: {
      label: "Agent non assigné",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleAlert,
      progress: 10,
    },
    AGENT_ASSIGNED: {
      label: "Agent assigné",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuUserCheck,
      progress: 20,
    },

    // Review statuses
    PENDING_REVIEW_BY_SRA_AGENT: {
      label: "En attente de révision par Agent SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 25,
    },
    PENDING_REVIEW_BY_SRA_HOD: {
      label: "En attente de révision par Chef de service SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 30,
    },
    PENDING_REVIEW_BY_ARCHITECT: {
      label: "En attente de révision par l'architecte",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 40,
    },
    PENDING_REVIEW_BY_ENGINEER: {
      label: "En attente de révision par l'ingénieur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50,
    },
    PENDING_REVIEW_BY_SUB_DIRECTOR: {
      label: "En attente de révision par le Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55,
    },
    TECHNICAL_REVIEW: {
      label: "En attente de révision technique",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50,
    },

    // Report statuses
    AGENT_REPORT_READY: {
      label: "Rapport de l'agent prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 60,
    },
    ARCHITECT_REPORT_READY: {
      label: "Rapport de l'architecte prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 70,
    },
    ENGINEER_REPORT_READY: {
      label: "Rapport de l'ingénieur prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 80,
    },
    PENDING_ACTION_BY_ARCHITECT: {
      label: "Action requise par l'architecte",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 20,
    },
    APPLICATION_CANCEL: {
      label: "Demande annulée",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircleX,
      progress: 0,
    },
    SDECC_AGENT_NOT_ASSSIGNED: {
      label: "Agent SDECC non assigné",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleAlert,
      progress: 10,
    },
    PENDING_ACTION_BY_SDECC_AGENT: {
      label: "Action requise par l'agent SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 45,
    },
    SDECC_AGENT_REPORT_READY: {
      label: "Rapport de l'agent SDECC prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 60,
    },
    REVIEW_IN_PROGRESS_BY_SRA_HOD: {
      label: "Révision en cours par Chef SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65,
    },
    UNDER_REVIEW_BY_DIRECTOR: {
      label: "Révision par le Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70,
    },
    UNDER_REVIEW_BY_SUB_DIRECTOR: {
      label: "Révision par le Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60,
    },
    PENDING_REVIEW_BY_SRA_HOD: {
      label: "En attente de révision par Chef SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55,
    },
    PENDING_REVIEW_BY_SRA_AGENT: {
      label: "En attente de révision par Agent SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50,
    },
    PENDING_REVIEW_BY_SUB_DIRECTOR: {
      label: "En attente de révision par Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65,
    },
    PENDING_SUB_DIRECTOR_ACTION: {
      label: "En attente d'action du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55,
    },
    PENDING_SUB_DIRECTOR_APPROVAL: {
      label: "En attente d'approbation du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70,
    },
    PENDING_DIRECTOR_APPROVAL: {
      label: "En attente d'approbation du Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 80,
    },
    PENDING_VERIFICATION: {
      label: "En attente de vérification",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 50,
    },
    BPA_SRA_SUB_DIRECTOR_REVIEW: {
      label: "Révision par le Sous-directeur SDATU",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65,
    },
    BPA_SDECC_SUB_DIRECTOR_REVIEW: {
      label: "Révision par le Sous-directeur SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65,
    },
    SUBMITTED_TO_SDECC: {
      label: "Transmis au Chef de Service de Contrôle",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 50,
    },
    TECHNICAL_REVIEW: {
      label: "Examen technique en cours",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65,
    },
    PENDING_HOD_VALIDATION: {
      label: "En attente de validation du Chef de Service",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 80,
    },
    HOD_APPROVAL_PENDING: {
      label: "En attente d'approbation du Chef de Service",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75,
    },
    PENDING_SUB_DIRECTOR_SIGNATURE: {
      label: "En attente de signature du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 90,
    },
    SUBMITTED_TO_SDECC_HOD: {
      label: "Soumis au Chef de Département SDECC",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 50,
    },
    UNDER_REVIEW: {
      label: "En cours de révision",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60,
    },
    SDECC_HOD_REVIEW: {
      label: "Révision par le Chef de Département SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70,
    },
    SUBMITTED_TO_TOPOGRAPHY_HOD: {
      label: "Soumis au Chef de Département Topographie",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 45,
    },
    TOPOGRAPHY_HOD_REVIEW: {
      label: "Révision par le Chef de Département Topographie",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55,
    },
    UNDER_APPROVAL: {
      label: "En cours d'approbation",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 80,
    },
    BCIE_HOD_REVIEW: {
      label: "Révision par le Chef de service BCIE",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60,
    },
    AGENT_INSPECTION_PENDING: {
      label: "Inspection de l'agent en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 45,
    },
    AGENT_VERIFICATION_PENDING: {
      label: "Vérification de l'agent en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 40,
    },
    BPA_SRA_SUB_DIRECTOR_APPROVAL: {
      label: "En attente d'approbation du Sous-directeur SDATU",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75,
    },
    SUB_DIRECTOR_APPROVAL_PENDING: {
      label: "En attente d'approbation du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70,
    },
    PENDING_REVIEW_BY_DGDCF: {
      label: "En attente de révision par DGDCF",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60,
    },
    SENT_TO_TOPOGRAPHY: {
      label: "Transmis au service Topographie",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 55,
    },
    DIRECTOR_APPROVAL_PENDING: {
      label: "En attente d'approbation du Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75,
    },
    PENDING_REVIEW_BY_DIRECTOR: {
      label: "En attente de révision par Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75,
    },
    CONFORMED: {
      label: "En attente des avis",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60,
    },
    AWAITING_ON_SUB_DIRECTOR_REVIEW: {
      label: "En attente de révision du Sous-directeur",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 80,
    },
    AWAITING_ON_SRA_HOD_REVIEW: {
      label: "En attente de révision du Chef SRA",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 75,
    },
    AWAITING_ON_DIRECTOR_REVIEW: {
      label: "En attente de révision du Directeur",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 85,
    },

    // Final statuses
    PERMIT_GRANTED: {
      label: "Permis accordé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100,
    },
    CERTIFICATE_GRANTED: {
      label: "Certificat accordé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100,
    },
    CERTIFICATE_ISSUED: {
      label: "Certificat délivré",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100,
    },
    APPROVED: {
      label: "Approuvé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100,
    },
    REJECTED: {
      label: "Rejeté",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0,
    },
    PERMIT_REJECTED: {
      label: "Permis rejeté",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0,
    },
    CERTIFICATE_REJECTED: {
      label: "Certificat rejeté",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0,
    },
    INSPECTION_REJECTED: {
      label: "Inspection rejetée",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0,
    },
    VERIFICATION_REJECTED: {
      label: "Vérification rejetée",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0,
    },
    CANCELLED: {
      label: "Annulé",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircleX,
      progress: 0,
    },

    // Payment statuses
    AWAITING_CITIZEN_PAYMENT: {
      label: "En attente de paiement",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: LuCreditCard,
      progress: 45,
    },
    PAYMENT_PENDING: {
      label: "Paiement en attente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: LuCreditCard,
      progress: 45,
    },
    CITIZEN_PAYMENT_DONE: {
      label: "Paiement effectué",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 50,
    },

    // Document verification
    DOCUMENT_VERIFICATION_PENDING: {
      label: "Vérification des documents en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuFileText,
      progress: 25,
    },
    FIELD_VERIFICATION_PENDING: {
      label: "Vérification sur site en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 35,
    },
    VERIFICATION_COMPLETED: {
      label: "Vérification terminée",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 90,
    },

    // Commissioner status
    AWAITING_ON_COMMISSIONER: {
      label: "En cours d’instruction",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 85,
    },

    // Default fallback
    INITIATED: {
      label: "Initié",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircle,
      progress: 5,
    },
    APPLIED: {
      label: "Déposé",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 15,
    },
    APPLICATION_SUBMITTED: {
      label: "Demande soumise",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 20,
    },
  };

  return (
    statusConfig[status] || {
      label: status || "Statut inconnu",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircle,
      progress: 0,
    }
  );
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
};

// Commissioner role → parallel branch mapping.
// All permit types that have a commissioner step share the SAME BPA_PCO_* branch names.
// Only _COMM roles reroute; HOD/Agent/Sub-Director stay on the main workflow.
const COMMISSIONER_BRANCHES = {
  BPA_SDECC_COMM: "BPA_PCO_SDECC",
  BPA_DGDCF_COMM: "BPA_PCO_DGDCF",
  BPA_DNPC_COMM: "BPA_PCO_DNPC",
  BPA_EDD_COMM: "BPA_PCO_EDD",
  BPA_INSPD_COMM: "BPA_PCO_INSPD",
  BPA_ONEAD_COMM: "BPA_PCO_ONEAD",
};

// Base services that spawn parallel commissioner workflows.
// Services NOT in this set (BPA_CCP, BPA_CCE, BPA_CCR, BPA_CCG, BPA_PV, BPA_APE, BPA_ATARR)
// are standalone — commissioners should NOT be rerouted on those.
const SERVICES_WITH_COMMISSIONER_BRANCHES = new Set([
  "BPA_PCO_SIMPLE",
  "BPA_PCO",
  "BPA_PS",
  "BPA_PF",
  "BPA_PL",
  "BPA_PD",
  "BPA_PCS",
]);

/**
 * Resolve which business service branch a user should land on when opening an application.
 *
 * Logic:
 *   1. Look up the application's base businessService in PARALLEL_BRANCHES_BY_BASE.
 *      - If the base service doesn't have any parallel branches (e.g. BPA_CCP, BPA_PCS),
 *        return the base unchanged. This is critical: rerouting an SDECC user looking at
 *        a BPA_CCP application to "BPA_PCO_SDECC" would point at a workflow that has
 *        nothing to do with that application.
 *   2. If the base does have parallel branches, check if any of the user's roles maps
 *      to one of them — if so, return that branch. Otherwise return the base.
 *
 * The old behavior of using `ProcessInstance.businessService` is intentionally NOT used,
 * because that returns whichever branch was most recently touched — wrong for everyone
 * except the user who triggered that branch.
 *
 * @param {string} baseBusinessService - The application's primary businessService (e.g. "BPA_PCO_SIMPLE", "BPA_CCP").
 * @returns {string} The businessService to put in the ViewScreen URL.
 */
export const resolveBusinessServiceForUser = (baseBusinessService) => {
  if (!SERVICES_WITH_COMMISSIONER_BRANCHES.has(baseBusinessService)) {
    // Standalone workflow (BPA_CCP, BPA_CCE, BPA_CCR, etc.). Never reroute.
    return baseBusinessService;
  }
  try {
    const userRoles = Digit?.UserService?.getUser?.()?.info?.roles || [];
    for (const role of userRoles) {
      const branch = COMMISSIONER_BRANCHES[role?.code];
      if (branch) return branch;
    }
  } catch (e) {
    // fall through to base
  }
  return baseBusinessService;
};

// Get short service name for filter dropdown
export const getServiceShortName = (businessService) => {
  const shortNameMap = {
    BPA_PCO: "PCO - Constructions Publiques",
    BPA_PCO_SIMPLE: "PCO - Constructions Simples",
    BPA_PR: "Permis de Remblai",
    BPA_PL: "Permis de Lotir",
    BPA_PCS: "Permis de Construire Simplifié",
    BPA_PD: "Permis de Démolir",
    BPA_PF: "Permis de Clôture",
    BPA_PS: "Permis de Surélévation",
    BPA_ATARR: "ATARR - Travaux & Aménagement",
    BPA_CCR: "Certificat Conformité Remblai",
    BPA_CCE: "Certificat Conformité Électrique",
    BPA_CCP: "Certificat Conformité Parasismique",
    BPA_CCG: "Certificat Conformité Général",
    BPA_PV: "Procès-Verbal d'Implantation",
    BPA_APE: "Approbation Plan d'Exécution",
  };
  return shortNameMap[businessService] || businessService;
};
