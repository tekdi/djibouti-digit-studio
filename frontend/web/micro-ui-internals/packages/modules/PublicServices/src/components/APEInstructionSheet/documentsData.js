/**
 * Liste des documents à contrôler pour la fiche d'instruction APE
 * (P12 — Approbation des plans d'exécution).
 *
 * Each document carries its category (used for grouped rendering) and
 * `statutAttendu` (the expected status: Obligatoire / Conditionnel /
 * Optionnel / Obligatoire si <condition>).
 */
export const CATEGORIES = {
  ADMIN: "Documents administratifs",
  FONDATION: "Fondation",
  STRUCTURE: "Structure des niveaux",
  CONDITIONNELS: "Documents conditionnels",
  COMPLEMENTAIRES: "Documents complémentaires",
  NUMERIQUE: "Fichier numérique",
};

export const DOCUMENTS_LIST = [
  // Documents administratifs
  { id: 1, category: CATEGORIES.ADMIN, label: "Permis de construire délivré", statut: "Obligatoire", commentHint: "Champ obligatoire si non conforme/manquant" },
  { id: 2, category: CATEGORIES.ADMIN, label: "Procès-verbal d'implantation", statut: "Non obligatoire", commentHint: "Préciser la raison si non concerné" },

  // Fondation
  { id: 3, category: CATEGORIES.FONDATION, label: "Plans d'implantation des semelles, longrines, radiers général et radier inversé", statut: "Obligatoire", commentHint: "Vérifier cohérence avec type de fondation" },
  { id: 4, category: CATEGORIES.FONDATION, label: "Plans des détails des dimensions (coffrages) et ferraillages des semelles, radier général ou radier inversé", statut: "Obligatoire", commentHint: "Dimensions, aciers, espacements, nomenclature" },
  { id: 5, category: CATEGORIES.FONDATION, label: "Plans des détails des dimensions (coffrage) et ferraillages des longrines", statut: "Obligatoire", commentHint: "À justifier si non concerné" },
  { id: 6, category: CATEGORIES.FONDATION, label: "Plans des détails des dimensions (coffrage) et ferraillages de la chape armée ou du dallage", statut: "Obligatoire", commentHint: "Préciser chape, dallage ou radier" },
  { id: 7, category: CATEGORIES.FONDATION, label: "Renseignements techniques des fondations : enrobage, dosage béton, nuance d'acier, prescriptions particulières", statut: "Obligatoire", commentHint: "Vérifier lisibilité et cohérence des prescriptions" },

  // Structure des niveaux
  { id: 8, category: CATEGORIES.STRUCTURE, label: "Plans d'implantation des axes des poteaux", statut: "Obligatoire", commentHint: "Vérifier axes, trames, repères" },
  { id: 9, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions et ferraillages des poteaux", statut: "Obligatoire", commentHint: "Sections, armatures, cadres, niveaux" },
  { id: 10, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions (coffrage) et ferraillages des chaînages", statut: "Obligatoire", commentHint: "À justifier si absent" },
  { id: 11, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions et ferraillages des poutres", statut: "Obligatoire", commentHint: "Vérifier continuité, appuis, ferraillage" },
  { id: 12, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions et ferraillages des raidisseurs", statut: "Obligatoire", commentHint: "À justifier si non concerné" },
  { id: 13, category: CATEGORIES.STRUCTURE, label: "Plans de coffrage des dalles et planchers, y compris paliers et volées d'escaliers", statut: "Obligatoire", commentHint: "Remplace l'ancien libellé « coffrages de tous les planchers »" },
  { id: 14, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions et ferraillages des dalles et planchers", statut: "Obligatoire", commentHint: "Vérifier épaisseur, sens porteur, aciers" },
  { id: 15, category: CATEGORIES.STRUCTURE, label: "Plans des détails des dimensions et ferraillages des escaliers", statut: "Obligatoire", commentHint: "À justifier si bâtiment sans escalier" },
  { id: 16, category: CATEGORIES.STRUCTURE, label: "Coupes relatives aux différences de niveau", statut: "Obligatoire", commentHint: "Vérifier altimétries et cohérence avec plans" },
  { id: 17, category: CATEGORIES.STRUCTURE, label: "Renseignements techniques des niveaux : enrobage, dosage béton, nuance d'acier, prescriptions particulières", statut: "Obligatoire", commentHint: "Peut être sur plans ou note technique" },

  // Documents conditionnels
  { id: 18, category: CATEGORIES.CONDITIONNELS, label: "Plans des détails des dimensions et ferraillages des voiles périphériques", statut: "Non obligatoire", commentHint: "Obligatoire si voiles prévus" },
  { id: 19, category: CATEGORIES.CONDITIONNELS, label: "Plans des détails des dimensions et ferraillages des porte-à-faux", statut: "Non obligatoire", commentHint: "Obligatoire si balcons/auvents/console" },
  { id: 20, category: CATEGORIES.CONDITIONNELS, label: "Plans des détails des dimensions et ferraillages des acrotères en béton armé", statut: "Non obligatoire", commentHint: "Obligatoire si acrotères prévus" },
  { id: 21, category: CATEGORIES.CONDITIONNELS, label: "Étude géotechnique du sol", statut: "Non obligatoire", commentHint: "Règle automatique selon nombre de niveaux" },
  { id: 22, category: CATEGORIES.CONDITIONNELS, label: "Note de calcul de la structure", statut: "Non obligatoire", commentHint: "Règle automatique selon nombre de niveaux" },
  { id: 23, category: CATEGORIES.CONDITIONNELS, label: "Plans et détails d'exécution de la structure métallique", statut: "Non obligatoire", commentHint: "Assemblages, profils, platines, boulons, soudures" },

  // Documents complémentaires
  { id: 24, category: CATEGORIES.COMPLEMENTAIRES, label: "Autres plans ou documents techniques nécessaires à l'instruction", statut: "Non obligatoire", commentHint: "À motiver par l'agent instructeur" },

  // Fichier numérique
  { id: 25, category: CATEGORIES.NUMERIQUE, label: "Fichier numérique source du projet au format DWG / PLN", statut: "Obligatoire", commentHint: "Vérifier ouverture, lisibilité, cohérence avec PDF" },
];

export const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non conforme", color: "red" },
  { value: "MANQUANT", label: "Manquant", color: "amber" },
  { value: "NON_CONCERNE", label: "Non concerné", color: "gray" },
];

export const FINAL_OPINION_OPTIONS = [
  { value: "APPROVED", label: "Plans d'exécution approuvés", color: "emerald" },
  { value: "NOT_APPROVED", label: "Plans d'exécution non approuvés", color: "red" },
];
