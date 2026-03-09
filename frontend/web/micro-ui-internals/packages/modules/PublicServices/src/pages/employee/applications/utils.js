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
    BPA_PR: {
      ref: "P1",
      name: "Permis de Remblai (PR)",
      shortName: "Permis de Remblai",
      description: "Autorisation pour travaux de remblai",
      category: "permits"
    },
    BPA_CCR: {
      ref: "P2",
      name: "Certificat de Conformité de Remblai (CCR)",
      shortName: "Certificat de Conformité Remblai",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates"
    },
    BPA_PCO_SIMPLE: {
      ref: "P3", 
      name: "Permis de Construire Ordinaire (PCO) – Constructions Simples",
      shortName: "PCO - Constructions Simples",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits"
    },
    BPA_PCO: {
      ref: "P4",
      name: "Permis de Construire Ordinaire (PCO) – Constructions Accueillant du Public",
      shortName: "PCO - Constructions Publiques",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits"
    },
    BPA_PL: {
      ref: "P5",
      name: "Permis de Lotir",
      shortName: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits"
    },
    BPA_PS: {
      ref: "P6",
      name: "Permis de Surélévation",
      shortName: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits"
    },
    BPA_PCS: {
      ref: "P7",
      name: "Permis de Construire Simplifié (PCS)",
      shortName: "Permis de Construire Simplifié",
      description: "Pour les constructions de petite taille",
      category: "permits"
    },
    BPA_PF: {
      ref: "P8",
      name: "Permis de Clôture",
      shortName: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits"
    },
    BPA_PD: {
      ref: "P9",
      name: "Permis de Démolir",
      shortName: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits"
    },
    BPA_ATARR: {
      ref: "P10",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      shortName: "ATARR - Travaux & Aménagement",
      description: "ATARR pour tous types de travaux",
      category: "permits"
    },
    BPA_PV: {
      ref: "P11",
      name: "Procès-Verbal d'Implantation",
      shortName: "PV d'Implantation",
      description: "PV d'Implantation pour positionnement",
      category: "validations"
    },
    BPA_APE: {
      ref: "P12",
      name: "Approbation de Plan d'Exécution (APE)",
      shortName: "Approbation de Plan d'Exécution",
      description: "Validation des plans d'exécution",
      category: "validations"
    },
    BPA_CCE: {
      ref: "P13",
      name: "Certificat de Conformité Électrique (CCE)",
      shortName: "Certificat de Conformité Électrique",
      description: "Validation de l'installation électrique",
      category: "certificates"
    },
    BPA_CCP: {
      ref: "P14",
      name: "Certificat de Conformité Parasismique (CCP)",
      shortName: "Certificat de Conformité Parasismique",
      description: "Validation des normes parasismiques",
      category: "certificates"
    },
    BPA_CCG: {
      ref: "P15",
      name: "Certificat de Conformité Général (CCG)",
      shortName: "Certificat de Conformité Général",
      description: "Validation générale de conformité",
      category: "certificates"
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
    "PENDING_ACTION_BY_AGENT": "pending",
    "PENDING_ACTION_BY_ARCHITECT": "pending",
    "PENDING_SUB_DIRECTOR_ACTION": "pending",
    "PENDING_SUB_DIRECTOR_APPROVAL": "pending",
    "PENDING_DIRECTOR_APPROVAL": "pending",
    "PENDING_VERIFICATION": "pending",
    "BPA_SRA_SUB_DIRECTOR_REVIEW": "pending",
    "BCIE_HOD_REVIEW": "pending",
    "AGENT_INSPECTION_PENDING": "pending",
    "BPA_SRA_SUB_DIRECTOR_APPROVAL": "pending",
    "SUB_DIRECTOR_APPROVAL_PENDING": "pending",
    "DIRECTOR_APPROVAL_PENDING": "pending",
    "APPLICATION_CANCEL": "cancelled",
    "AGENT_REPORT_READY": "pending",
    "SDECC_AGENT_NOT_ASSSIGNED": "pending",
    "PENDING_ACTION_BY_SDECC_AGENT": "pending",
    "SDECC_AGENT_REPORT_READY": "pending",
    "REVIEW_IN_PROGRESS_BY_SRA_HOD": "pending",
    "UNDER_REVIEW_BY_DIRECTOR": "pending",
    "UNDER_REVIEW_BY_SUB_DIRECTOR": "pending",
    "PENDING_REVIEW_BY_SRA_HOD": "pending",
    "PENDING_REVIEW_BY_SRA_AGENT": "pending",
    "PENDING_REVIEW_BY_SUB_DIRECTOR": "pending",
    "PENDING_REVIEW_BY_DIRECTOR": "pending",
    "AWAITING_ON_COMMISSIONER": "pending",
    "AWAITING_ON_SUB_DIRECTOR_REVIEW": "pending",
    "AWAITING_ON_SRA_HOD_REVIEW": "pending",
    "AWAITING_ON_DIRECTOR_REVIEW": "pending",
    "AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT": "pending",
    "PAYMENT_PENDING": "payment_pending",
    "AWAITING_CITIZEN_PAYMENT": "payment_pending",
    "DOCUMENT_VERIFICATION_PENDING": "pending",
    "FIELD_VERIFICATION_PENDING": "pending",
    "APPROVED": "approved",
    "REJECTED": "rejected",
    "PERMIT_REJECTED": "rejected",
    "PERMIT_GRANTED": "completed",
    "CERTIFICATE_GRANTED": "completed",
    "CERTIFICATE_ISSUED": "completed",
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
    "PENDING_ACTION_BY_AGENT": {
      label: "En attente d'action de l'agent",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 40
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
    "TECHNICAL_REVIEW": {
      label: "En attente de révision technique",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50
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
    "PENDING_ACTION_BY_ARCHITECT": {
      label: "Action requise par l'architecte",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 20
    },
    "APPLICATION_CANCEL": {
      label: "Demande annulée",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: LuCircleX,
      progress: 0
    },
    "SDECC_AGENT_NOT_ASSSIGNED": {
      label: "Agent SDECC non assigné",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: LuCircleAlert,
      progress: 10
    },
    "PENDING_ACTION_BY_SDECC_AGENT": {
      label: "Action requise par l'agent SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 45
    },
    "SDECC_AGENT_REPORT_READY": {
      label: "Rapport de l'agent SDECC prêt",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: LuCircleCheck,
      progress: 60
    },
    "REVIEW_IN_PROGRESS_BY_SRA_HOD": {
      label: "Révision en cours par Chef SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65
    },
    "UNDER_REVIEW_BY_DIRECTOR": {
      label: "Révision par le Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70
    },
    "UNDER_REVIEW_BY_SUB_DIRECTOR": {
      label: "Révision par le Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60
    },
    "PENDING_REVIEW_BY_SRA_HOD": {
      label: "En attente de révision par Chef SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55
    },
    "PENDING_REVIEW_BY_SRA_AGENT": {
      label: "En attente de révision par Agent SRA",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 50
    },
    "PENDING_REVIEW_BY_SUB_DIRECTOR": {
      label: "En attente de révision par Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65
    },
    "PENDING_SUB_DIRECTOR_ACTION": {
      label: "En attente d'action du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55
    },
    "PENDING_SUB_DIRECTOR_APPROVAL": {
      label: "En attente d'approbation du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70
    },
    "PENDING_DIRECTOR_APPROVAL": {
      label: "En attente d'approbation du Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 80
    },
    "PENDING_VERIFICATION": {
      label: "En attente de vérification",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 50
    },
    "BPA_SRA_SUB_DIRECTOR_REVIEW": {
      label: "Révision par le Sous-directeur SDATU",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65
    },
    "BPA_SDECC_SUB_DIRECTOR_REVIEW": {
      label: "Révision par le Sous-directeur SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 65
    },
    "SUBMITTED_TO_SDECC": {
      label: "Soumis au SDECC",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 40
    },
    "SUBMITTED_TO_SDECC_HOD": {
      label: "Soumis au Chef de Département SDECC",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 50
    },
    "UNDER_REVIEW": {
      label: "En cours de révision",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60
    },
    "SDECC_HOD_REVIEW": {
      label: "Révision par le Chef de Département SDECC",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70
    },
    "SUBMITTED_TO_TOPOGRAPHY_HOD": {
      label: "Soumis au Chef de Département Topographie",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuClock,
      progress: 45
    },
    "TOPOGRAPHY_HOD_REVIEW": {
      label: "Révision par le Chef de Département Topographie",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 55
    },
    "UNDER_APPROVAL": {
      label: "En cours d'approbation",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 80
    },
    "BCIE_HOD_REVIEW": {
      label: "Révision par le Chef de service BCIE",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60
    },
    "AGENT_INSPECTION_PENDING": {
      label: "Inspection de l'agent en attente",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: LuMapPin,
      progress: 45
    },
    "BPA_SRA_SUB_DIRECTOR_APPROVAL": {
      label: "En attente d'approbation du Sous-directeur SDATU",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75
    },
    "SUB_DIRECTOR_APPROVAL_PENDING": {
      label: "En attente d'approbation du Sous-directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 70
    },
    "DIRECTOR_APPROVAL_PENDING": {
      label: "En attente d'approbation du Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75
    },
    "PENDING_REVIEW_BY_DIRECTOR": {
      label: "En attente de révision par Directeur",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 75
    },
    "CONFORMED": {
      label: "En attente des avis",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: LuClock,
      progress: 60
    },
    "AWAITING_ON_SUB_DIRECTOR_REVIEW": {
      label: "En attente de révision du Sous-directeur",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 80
    },
    "AWAITING_ON_SRA_HOD_REVIEW": {
      label: "En attente de révision du Chef SRA",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 75
    },
    "AWAITING_ON_DIRECTOR_REVIEW": {
      label: "En attente de révision du Directeur",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: LuClock,
      progress: 85
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
    "CERTIFICATE_ISSUED": {
      label: "Certificat délivré",
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
      label: "En cours d’instruction",
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
