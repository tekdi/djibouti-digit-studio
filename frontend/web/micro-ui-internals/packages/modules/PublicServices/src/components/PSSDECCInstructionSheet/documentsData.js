/**
 * Section 1: Contenu du dossier (Pièces) — specific to Permis de Surélévation
 */
export const DOSSIER_DOCUMENTS_LIST = [
  { id: 1, label: "Plans du projet existant" },
  { id: 2, label: "Plans du nouveau projet" },
  { id: 3, label: "Plans d'exécution du projet existant approuvée par la SDECC" },
  { id: 4, label: "Plans de renforcement de la structure porteuse" },
  { id: 5, label: "Bons pour coulage du projet existant approuvée par la SDECC" },
  { id: 6, label: "Coordonnées du pétitionnaire" },
];

/**
 * Section 2: Contrôle technique
 */
export const TECHNICAL_DOCUMENTS_LIST = [
  { id: 1, label: "Type de Fondations (Semelle ou Radier)" },
  { id: 2, label: "Hauteur d'ancrage de la fondation" },
  { id: 3, label: "Type de Structures (Béton armé ou Métallique)" },
  { id: 4, label: "Disposition constructive de la structure" },
  { id: 5, label: "Disposition de l'escalier" },
  { id: 6, label: "Continuité de la répartition des charges" },
  { id: 7, label: "Contreventement", hasNonConcerned: true },
  { id: 8, label: "Joints parasismique", hasNonConcerned: true },
  { id: 9, label: "Porte à faux", hasNonConcerned: true },
];

export const DOSSIER_OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non-conforme", color: "red" },
  { value: "MANQUANT", label: "Manquant", color: "amber" },
];

export const TECHNICAL_OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non-conforme", color: "red" },
  { value: "NON_CONCERNE", label: "Non concerné", color: "gray" },
];

export const FINAL_OPINION_OPTIONS = [
  { value: "FAVORABLE", label: "Favorable", color: "emerald" },
  { value: "DEFAVORABLE", label: "Défavorable", color: "red" },
];
