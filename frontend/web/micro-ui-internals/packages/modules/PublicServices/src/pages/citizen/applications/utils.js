import { LuBuilding, LuFileText, LuClock, LuCircleCheck, LuMapPin, LuShield, LuAward, LuCreditCard } from "react-icons/lu";

// Get service info mapping
export const getServiceInfo = (businessService) => {
  const serviceMap = {
    BPA_PR: {
      ref: "P1",
      name: "Permis de Remblai (PR)",
      grantedLabel: "Permis de Remblai",
      description: "Autorisation pour travaux de remblai",
      category: "permits",
    },
    BPA_CCR: {
      ref: "P2",
      name: "Certificat de Conformité de Remblai (CCR)",
      grantedLabel: "CCR",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates",
    },
    BPA_PCO_SIMPLE: {
      ref: "P3",
      name: "P3 - Permis de Construire Ordinaire (PCO < 200 m²)",
      grantedLabel: "PCO",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits",
    },
    BPA_PCO: {
      ref: "P4",
      name: "Permis de Construire Ordinaire par CA/BE (PCO)",
      grantedLabel: "PCO",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits",
    },
    BPA_PL: {
      ref: "P5",
      name: "Permis de Lotir",
      grantedLabel: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits",
    },
    BPA_PS: {
      ref: "P6",
      name: "Permis de Surélévation",
      grantedLabel: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits",
    },
    BPA_PCS: {
      ref: "P7",
      name: "Permis de Construire Simplifié (PCS)",
      grantedLabel: "PCS",
      description: "Pour les constructions de petite taille",
      category: "permits",
    },
    BPA_PF: {
      ref: "P8",
      name: "Permis de Clôture",
      grantedLabel: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits",
    },
    BPA_PD: {
      ref: "P9",
      name: "Permis de Démolir",
      grantedLabel: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits",
    },
    BPA_ATARR: {
      ref: "P10",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      grantedLabel: "ATARR",
      description: "ATARR pour tous types de travaux",
      category: "permits",
    },
    BPA_PV: {
      ref: "P11",
      name: "Procès-Verbal d'Implantation",
      grantedLabel: "PV",
      description: "PV d'Implantation pour positionnement",
      category: "validations",
    },
    BPA_APE: {
      ref: "P12",
      name: "Approbation de Plan d'Exécution (APE)",
      grantedLabel: "APE",
      description: "Validation des plans d'exécution",
      category: "validations",
    },
    BPA_CCE: {
      ref: "P13",
      name: "Certificat de Conformité Électrique (CCE)",
      grantedLabel: "Certificat",
      description: "Validation de l'installation électrique",
      category: "certificates",
    },
    BPA_CCP: {
      ref: "P14",
      name: "Certificat de Conformité Parasismique (CCP)",
      grantedLabel: "Certificat",
      description: "Validation des normes parasismiques",
      category: "certificates",
    },
    BPA_CCG: {
      ref: "P15",
      name: "Certificat de Conformité Général (CCG)",
      grantedLabel: "Certificat",
      description: "Validation générale de conformité",
      category: "certificates",
    },
  };
  return (
    serviceMap[businessService] || {
      ref: "P?",
      name: businessService,
      grantedLabel: "Demande",
      description: "Service administratif en ligne",
    }
  );
};

// Get service icon based on service type
export const getServiceIcon = (businessService) => {
  const iconMap = {
    BPA_PCO: LuBuilding,
    BPA_PCO_SIMPLE: LuBuilding,
    BPA_PR: LuMapPin,
    BPA_PL: LuMapPin,
    BPA_PCS: LuBuilding,
    BPA_PD: LuFileText,
    BPA_PF: LuShield,
    BPA_PS: LuBuilding,
    BPA_ATARR: LuFileText,
    BPA_CCR: LuAward,
    BPA_CCE: LuAward,
    BPA_CCP: LuAward,
    BPA_CCG: LuAward,
    BPA_PV: LuFileText,
    BPA_APE: LuFileText,
  };
  return iconMap[businessService] || LuFileText;
};

// Simplified status mapping based on workflow
const GRANTED_STATUSES = new Set([
  "PERMIT_GRANTED",
  "CERTIFICATE_GRANTED",
  "CERTIFICATE_ISSUED",
  "APPROVED",
  "PV_APPROVED",
  "APE_APPROVED",
]);

const REJECTED_STATUSES = new Set([
  "REJECTED",
  "PERMIT_REJECTED",
  "CERTIFICATE_REJECTED",
  "INSPECTION_REJECTED",
  "PV_REJECTED",
  "APE_REJECTED",
  "APPLICATION_REJECTED",
  "FINAL_REJECTED",
]);

export const getSimplifiedStatus = (status) => {
  if (!status) return "in_progress";
  if (status === "INITIATED") return "draft";
  if (GRANTED_STATUSES.has(status)) return "granted";
  if (REJECTED_STATUSES.has(status)) return "rejected";
  // Any status that ends with _REJECTED is treated as rejected (covers service-specific
  // rejection states we may not have enumerated above).
  if (status.endsWith("_REJECTED")) return "rejected";
  if (status === "AWAITING_CITIZEN_PAYMENT") return "payment_pending";
  return "in_progress";
};

// Get status info for display (optionally pass businessService for granted/rejected labels)
export const getStatusInfo = (status, businessService) => {
  const simplifiedStatus = getSimplifiedStatus(status);
  const serviceInfo = businessService ? getServiceInfo(businessService) : null;
  const grantedLabel = serviceInfo?.grantedLabel || "Demande";

  switch (simplifiedStatus) {
    case "draft":
      return {
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        icon: LuFileText,
        label: "Brouillon",
        progress: 10,
        stepSubtext: "Saisie des informations",
      };
    case "in_progress":
      return {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: LuClock,
        label: "En cours d'examen",
        progress: 60,
        stepSubtext: "Vérification des documents",
      };
    case "payment_pending":
      return {
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: LuCreditCard,
        label: "En attente de paiement",
        progress: 50,
        stepSubtext: "En attente de paiement",
      };
    case "granted":
      return {
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: LuCircleCheck,
        label: `${grantedLabel} délivré`,
        progress: 100,
        stepSubtext: `${grantedLabel} délivré`,
      };
    case "rejected":
      return {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: LuFileText,
        label: `${grantedLabel} rejeté`,
        progress: 0,
        stepSubtext: "Demande rejetée",
      };
    default:
      return {
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        icon: LuFileText,
        label: "En cours",
        progress: 30,
        stepSubtext: "Traitement en cours",
      };
  }
};

// Format date
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Primary display identifier: PCO number from the SRA Fiche d'instruction
// (`additionalDetails.instructionSheet.pcoNumber`) when filled, otherwise
// the raw application number. Used on list cards and the detail header.
export const getDisplayApplicationId = (app) => {
  if (!app) return "";
  const pcoNumber = app && app.additionalDetails && app.additionalDetails.instructionSheet && app.additionalDetails.instructionSheet.pcoNumber;
  if (pcoNumber && String(pcoNumber).trim()) return String(pcoNumber).trim();
  return app.applicationNumber || "";
};

// Status options for filter
export const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "in_progress", label: "En cours d'examen" },
  { value: "granted", label: "Permis Accordé" },
  { value: "rejected", label: "Permis Rejeté" },
];
