import { 
  LuBuilding, 
  LuFileText, 
  LuClock, 
  LuCircleCheck, 
  LuMapPin,
  LuShield,
  LuAward,
  LuCreditCard
} from "react-icons/lu";

// Get service info mapping
export const getServiceInfo = (businessService) => {
  const serviceMap = {
    BPA_PCO: {
      ref: "P1",
      name: "Permis de Construire Ordinaire (PCO) – Constructions Accueillant du Public",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits"
    },
    BPA_PCO_SIMPLE: {
      ref: "P2", 
      name: "Permis de Construire Ordinaire (PCO) – Constructions Simples",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits"
    },
    BPA_PR: {
      ref: "P3",
      name: "Permis de Remblai (PR)",
      description: "Autorisation pour travaux de remblai",
      category: "permits"
    },
    BPA_PL: {
      ref: "P4",
      name: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits"
    },
    BPA_PCS: {
      ref: "P5",
      name: "Permis de Construire Simplifié (PCS)",
      description: "Pour les constructions de petite taille",
      category: "permits"
    },
    BPA_PD: {
      ref: "P6",
      name: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits"
    },
    BPA_PF: {
      ref: "P7",
      name: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits"
    },
    BPA_PS: {
      ref: "P8",
      name: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits"
    },
    BPA_ATARR: {
      ref: "P9",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      description: "ATARR pour tous types de travaux",
      category: "permits"
    },
    BPA_CCR: {
      ref: "P10",
      name: "Certificat de Conformité de Remblai (CCR)",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates"
    },
    BPA_CCE: {
      ref: "P11",
      name: "Certificat de Conformité Électrique (CCE)",
      description: "Validation de l'installation électrique",
      category: "certificates"
    },
    BPA_CCP: {
      ref: "P12",
      name: "Certificat de Conformité Parasismique (CCP)",
      description: "Validation des normes parasismiques",
      category: "certificates"
    },
    BPA_CCG: {
      ref: "P13",
      name: "Certificat de Conformité Général (CCG)",
      description: "Validation générale de conformité",
      category: "certificates"
    },
    BPA_PV: {
      ref: "P14",
      name: "Procès-Verbal d'Implantation",
      description: "PV d'Implantation pour positionnement",
      category: "validations"
    },
    BPA_APE: {
      ref: "P15",
      name: "Approbation de Plan d'Exécution (APE)",
      description: "Validation des plans d'exécution",
      category: "validations"
    }
  };
  return serviceMap[businessService] || {
    ref: "P?",
    name: businessService,
    description: "Service administratif en ligne"
  };
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
export const getSimplifiedStatus = (status) => {
  if (status === "INITIATED") return "draft";
  if (status === "PERMIT_GRANTED" || status === "CERTIFICATE_ISSUED") return "granted";
  if (status === "PERMIT_REJECTED" || status === "CERTIFICATE_REJECTED") return "rejected";
  if (status === "AWAITING_CITIZEN_PAYMENT") return "payment_pending";
  if (status === "INITIATED" || 
      (status !== "PERMIT_GRANTED" && status !== "PERMIT_REJECTED" && 
       status !== "CERTIFICATE_ISSUED" && status !== "CERTIFICATE_REJECTED" &&
       status !== "AWAITING_CITIZEN_PAYMENT")) {
    return "in_progress";
  }
  return "in_progress";
};

// Get status info for display
export const getStatusInfo = (status) => {
  const simplifiedStatus = getSimplifiedStatus(status);
  
  switch (simplifiedStatus) {
    case "draft":
      return { 
        color: "text-gray-600", 
        bgColor: "bg-gray-50", 
        icon: LuFileText, 
        label: "Brouillon",
        progress: 10
      };
    case "in_progress":
      return { 
        color: "text-blue-600", 
        bgColor: "bg-blue-50", 
        icon: LuClock, 
        label: "En cours d'examen",
        progress: 60
      };
    case "payment_pending":
      return { 
        color: "text-orange-600", 
        bgColor: "bg-orange-50", 
        icon: LuCreditCard, 
        label: "En attente de paiement",
        progress: 50
      };
    case "granted":
      return { 
        color: "text-green-600", 
        bgColor: "bg-green-50", 
        icon: LuCircleCheck, 
        label: "Permis Accordé",
        progress: 100
      };
    case "rejected":
      return { 
        color: "text-red-600", 
        bgColor: "bg-red-50", 
        icon: LuFileText, 
        label: "Permis Rejeté",
        progress: 0
      };
    default:
      return { 
        color: "text-gray-600", 
        bgColor: "bg-gray-50", 
        icon: LuFileText, 
        label: "En cours",
        progress: 30
      };
  }
};

// Format date
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Status options for filter
export const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "in_progress", label: "En cours d'examen" },
  { value: "granted", label: "Permis Accordé" },
  { value: "rejected", label: "Permis Rejeté" }
];
