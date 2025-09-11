import { 
  LuFileText, 
  LuCircleCheck, 
  LuCircleX, 
  LuClock, 
  LuCircleAlert,
  LuCreditCard,
  LuUserCheck,
  LuMapPin,
  LuCircle
} from "react-icons/lu";

// Get service info mapping
export const getServiceInfo = (businessService) => {
  const serviceMap = {
    BPA_PCO: {
      ref: "P1",
      name: "Permis de Construire Ordinaire (PCO) – Constructions Accueillant du Public",
      shortName: "PCO - Constructions Publiques",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits"
    },
    BPA_PCO_SIMPLE: {
      ref: "P2", 
      name: "Permis de Construire Ordinaire (PCO) – Constructions Simples",
      shortName: "PCO - Constructions Simples",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits"
    },
    BPA_PR: {
      ref: "P3",
      name: "Permis de Remblai (PR)",
      shortName: "Permis de Remblai",
      description: "Autorisation pour travaux de remblai",
      category: "permits"
    },
    BPA_PL: {
      ref: "P4",
      name: "Permis de Lotir",
      shortName: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits"
    },
    BPA_PCS: {
      ref: "P5",
      name: "Permis de Construire Simplifié (PCS)",
      shortName: "Permis de Construire Simplifié",
      description: "Pour les constructions de petite taille",
      category: "permits"
    },
    BPA_PD: {
      ref: "P6",
      name: "Permis de Démolir",
      shortName: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits"
    },
    BPA_PF: {
      ref: "P7",
      name: "Permis de Clôture",
      shortName: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits"
    },
    BPA_PS: {
      ref: "P8",
      name: "Permis de Surélévation",
      shortName: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits"
    },
    BPA_ATARR: {
      ref: "P9",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      shortName: "ATARR - Travaux & Aménagement",
      description: "ATARR pour tous types de travaux",
      category: "permits"
    },
    BPA_CCR: {
      ref: "P10",
      name: "Certificat de Conformité de Remblai (CCR)",
      shortName: "Certificat de Conformité Remblai",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates"
    },
    BPA_CCE: {
      ref: "P11",
      name: "Certificat de Conformité Électrique (CCE)",
      shortName: "Certificat de Conformité Électrique",
      description: "Validation de l'installation électrique",
      category: "certificates"
    },
    BPA_CCP: {
      ref: "P12",
      name: "Certificat de Conformité Parasismique (CCP)",
      shortName: "Certificat de Conformité Parasismique",
      description: "Validation des normes parasismiques",
      category: "certificates"
    },
    BPA_CCG: {
      ref: "P13",
      name: "Certificat de Conformité Général (CCG)",
      shortName: "Certificat de Conformité Général",
      description: "Validation générale de conformité",
      category: "certificates"
    },
    BPA_PV: {
      ref: "P14",
      name: "Procès-Verbal d'Implantation",
      shortName: "PV d'Implantation",
      description: "PV d'Implantation pour positionnement",
      category: "validations"
    },
    BPA_APE: {
      ref: "P15",
      name: "Approbation de Plan d'Exécution (APE)",
      shortName: "Approbation de Plan d'Exécution",
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
    "INPROGRESS": "pending",
    "PENDING_ACTION": "pending",
    "AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT": "pending",
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
  // Map actual status values to French translations and styling
  const statusConfig = {
    "INPROGRESS": {
      label: "En cours",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 30
    },
    "PENDING_ACTION": {
      label: "Action requise",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 35
    },
    "AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT": {
      label: "En attente du calcul des frais (Agent SRA)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 45
    },
    // Agent assignment statuses
    "AGENT_NOT_ASSIGNED": {
      label: "Agent non assigné",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleAlert,
      progress: 10
    },
    "AGENT_ASSIGNED": {
      label: "Agent assigné",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuUserCheck,
      progress: 20
    },
    
    // Review statuses
    "PENDING_REVIEW_BY_SRA_AGENT": {
      label: "En attente de révision par Agent SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 25
    },
         "PENDING_REVIEW_BY_SRA_HOD": {
       label: "En attente de révision par Chef de service SRA",
       color: "text-amber-600",
       bgColor: "bg-amber-50",
       icon: LuClock,
       progress: 30
     },
    "PENDING_REVIEW_BY_ARCHITECT": {
      label: "En attente de révision par l'architecte",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 40
    },
    "PENDING_REVIEW_BY_ENGINEER": {
      label: "En attente de révision par l'ingénieur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50
    },
    "PENDING_REVIEW_BY_SUB_DIRECTOR": {
      label: "En attente de révision par le Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55
    },
    
    // Report statuses
    "AGENT_REPORT_READY": {
      label: "Rapport de l'agent prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 60
    },
    "ARCHITECT_REPORT_READY": {
      label: "Rapport de l'architecte prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 70
    },
    "ENGINEER_REPORT_READY": {
      label: "Rapport de l'ingénieur prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 80
    },
    
    // Final statuses
    "PERMIT_GRANTED": {
      label: "Permis accordé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100
    },
    "CERTIFICATE_GRANTED": {
      label: "Certificat accordé",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 100
    },
    "REJECTED": {
      label: "Rejeté",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleX,
      progress: 0
    },
    "CANCELLED": {
      label: "Annulé",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircleX,
      progress: 0
    },
    
    // Payment statuses
    "AWAITING_CITIZEN_PAYMENT": {
      label: "En attente de paiement",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: LuCreditCard,
      progress: 45
    },
    "PAYMENT_PENDING": {
      label: "Paiement en attente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: LuCreditCard,
      progress: 45
    },
    "CITIZEN_PAYMENT_DONE": {
      label: "Paiement effectué",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 50
    },
    
    // Document verification
    "DOCUMENT_VERIFICATION_PENDING": {
      label: "Vérification des documents en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuFileText,
      progress: 25
    },
    "FIELD_VERIFICATION_PENDING": {
      label: "Vérification sur site en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 35
    },
    
    // Commissioner status
    "AWAITING_ON_COMMISSIONER": {
      label: "En attente du Commissaire",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 85
    },
    
    // Default fallback
    "INITIATED": {
      label: "Initié",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircle,
      progress: 5
    },
    "APPLIED": {
      label: "Déposé",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 15
    },
    "APPLICATION_SUBMITTED": {
      label: "Demande soumise",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 20
    }
  };

  return statusConfig[status] || {
    label: status || "Statut inconnu",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: LuCircle,
    progress: 0
  };
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
