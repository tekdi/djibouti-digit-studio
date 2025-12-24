/**
 * Liste des 8 documents de contrôle pour la Fiche d'instruction SDECC (Structure)
 */
export const DOCUMENTS_LIST = [
  {
    id: 1,
    label: "Type de Fondations (Semelle ou Radier)",
    hasNonConcerned: false,
  },
  {
    id: 2,
    label: "Type de Structures (Béton armé ou Métallique)",
    hasNonConcerned: false,
  },
  {
    id: 3,
    label: "Disposition constructive de la structure",
    hasNonConcerned: false,
  },
  {
    id: 4,
    label: "Disposition de l'escalier",
    hasNonConcerned: false,
  },
  {
    id: 5,
    label: "Continuité de la répartition des charges",
    hasNonConcerned: false,
  },
  {
    id: 6,
    label: "Contreventement",
    hasNonConcerned: true,
  },
  {
    id: 7,
    label: "Joints parasismique",
    hasNonConcerned: true,
  },
  {
    id: 8,
    label: "Porte à faux",
    hasNonConcerned: true,
  },
];

/**
 * Options d'observation
 */
export const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non conforme", color: "red" },
  { value: "NON_CONCERNE", label: "Non concerné", color: "gray" },
];








