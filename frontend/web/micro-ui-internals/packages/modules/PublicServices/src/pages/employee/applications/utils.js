import { 
  LuFileText, 
  LuCircleCheck, 
  LuCircleX, 
  LuClock, 
  LuCircleAlert,
  LuCreditCard,
  LuUserCheck,
  LuSend,
  LuBuilding,
  LuMapPin,
  LuShield,
  LuAward
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

export const getSimplifiedStatus = (status) => {
  const statusMap = {
    "INITIATED": "pending",
    "APPLIED": "pending",
    "PAYMENT_PENDING": "payment_pending",
    "AWAITING_CITIZEN_PAYMENT": "payment_pending",
    "DOCUMENT_VERIFICATION_PENDING": "pending",
    "FIELD_VERIFICATION_PENDING": "pending",
    "APPROVED": "approved",
    "REJECTED": "rejected",
    "PERMIT_GRANTED": "completed",
    "CERTIFICATE_GRANTED": "completed",
    "CANCELLED": "cancelled",
    "EXPIRED": "expired"
  };
  return statusMap[status] || "pending";
};

export const getStatusInfo = (status) => {
  const simplifiedStatus = getSimplifiedStatus(status);
  
  const statusConfig = {
    pending: {
      label: "En cours d'examen",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 25
    },
    payment_pending: {
      label: "En attente de paiement",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: LuCreditCard,
      progress: 50
    },
    approved: {
      label: "Approuvé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuUserCheck,
      progress: 75
    },
    completed: {
      label: "Complété",
      color: "text-green-600",
      bgColor: "bg-green-50",
        icon: LuCircleCheck,
      progress: 100
    },
    rejected: {
      label: "Rejeté",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0
    },
    cancelled: {
      label: "Annulé",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircleX,
      progress: 0
    },
    expired: {
      label: "Expiré",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleAlert,
      progress: 0
    }
  };

  return statusConfig[simplifiedStatus] || statusConfig.pending;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "N/A";
  }
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
    BPA_APE: "Approbation Plan d'Exécution"
  };
  return shortNameMap[businessService] || businessService;
};
