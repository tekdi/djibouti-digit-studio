import { LuFileText, LuBuilding, LuMapPin, LuShield, LuAward } from "react-icons/lu";

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

// Get service description and ref based on service type
export const getServiceInfo = (businessService) => {
  const serviceMap = {
    BPA_PR: {
      ref: "P1",
      name: "Permis de Remblai (PR)",
      description: "Autorisation pour travaux de remblai",
      category: "permits",
    },
    BPA_CCR: {
      ref: "P2",
      name: "Certificat de Conformité de Remblai (CCR)",
      description: "Validation de conformité des travaux de remblai",
      category: "certificates",
    },
    BPA_PCO_SIMPLE: {
      ref: "P3",
      name: "P3 - Permis de Construire Ordinaire (PCO < 200 m²)",
      description: "Pour les constructions résidentielles et commerciales simples",
      category: "permits",
    },
    BPA_PCO: {
      ref: "P4",
      name: "Permis de Construire Ordinaire par CA/BE (PCO)",
      description: "Hôtel, Hôpital, École, etc.",
      category: "permits",
    },
    BPA_PL: {
      ref: "P5",
      name: "Permis de Lotir",
      description: "Division d'un terrain en plusieurs lots",
      category: "permits",
    },
    BPA_PS: {
      ref: "P6",
      name: "Permis de Surélévation",
      description: "Ajout d'un ou plusieurs étages",
      category: "permits",
    },
    BPA_PCS: {
      ref: "P7",
      name: "Permis de Construire Simplifié (PCS)",
      description: "Pour les constructions de petite taille",
      category: "permits",
    },
    BPA_PF: {
      ref: "P8",
      name: "Permis de Clôture",
      description: "Autorisation pour construire une clôture",
      category: "permits",
    },
    BPA_PD: {
      ref: "P9",
      name: "Permis de Démolir",
      description: "Autorisation de démolition d'une construction",
      category: "permits",
    },
    BPA_ATARR: {
      ref: "P10",
      name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
      description: "ATARR pour tous types de travaux",
      category: "permits",
    },
    BPA_PV: {
      ref: "P11",
      name: "Procès-Verbal d'Implantation",
      description: "PV d'Implantation pour positionnement",
      category: "validations",
    },
    BPA_APE: {
      ref: "P12",
      name: "Approbation de Plan d'Exécution (APE)",
      description: "Validation des plans d'exécution",
      category: "validations",
    },
    BPA_CCE: {
      ref: "P13",
      name: "Certificat de Conformité Électrique (CCE)",
      description: "Validation de l'installation électrique",
      category: "certificates",
    },
    BPA_CCP: {
      ref: "P14",
      name: "Certificat de Conformité Parasismique (CCP)",
      description: "Validation des normes parasismiques",
      category: "certificates",
    },
    BPA_CCG: {
      ref: "P15",
      name: "Certificat de Conformité Général (CCG)",
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
