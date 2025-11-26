/**
 * Liste des 20 documents de la Fiche d'instruction (SRA)
 */
export const DOCUMENTS_LIST = [
  {
    id: 1,
    label: "Document de propriété (Titre Foncier, Certificat d'inscription, Attestation…)",
  },
  {
    id: 2,
    label: "Plan de situation",
  },
  {
    id: 3,
    label: "Plan de masse cadastral",
  },
  {
    id: 4,
    label: "Permis de Remblai",
  },
  {
    id: 5,
    label: "Quittance de la taxe d'extraction des matériaux",
  },
  {
    id: 6,
    label: "Certificat de Conformité de Remblai",
  },
  {
    id: 7,
    label: "Plan de masse de projet",
  },
  {
    id: 8,
    label: "Vues en plans architecturaux",
  },
  {
    id: 9,
    label: "Plans d'électricité",
  },
  {
    id: 10,
    label: "Plans d'assainissement",
  },
  {
    id: 11,
    label: "Plans des façades",
  },
  {
    id: 12,
    label: "Plans des coupes",
  },
  {
    id: 13,
    label: "Plan de descente des eaux pluviales",
  },
  {
    id: 14,
    label: "Notice descriptive des travaux",
  },
  {
    id: 15,
    label: "Devis estimatif de la construction",
  },
  {
    id: 16,
    label: "Agrément d'exercice de l'activité concernée",
  },
  {
    id: 17,
    label: "Acte de la promesse de vente",
  },
  {
    id: 18,
    label: "Protocole d'accord",
  },
  {
    id: 19,
    label: "Autres documents ou photos nécessaires",
  },
  {
    id: 20,
    label: "Fichier unique du projet en format AutoCAD ou ArchiCAD (*.DWG ; *.PLN)",
  },
];

/**
 * Options d'observation
 */
export const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non-conforme", color: "red" },
  { value: "MANQUANT", label: "Manquant", color: "amber" },
];

/**
 * Liste des 18 prescriptions de conformité du projet
 */
export const CONFORMITY_LIST = [
  {
    id: 1,
    label: "Coefficient d'Emprise au Sol (CES) projeté*",
    hasTextInput: false,
  },
  {
    id: 2,
    label: "Coefficient d'Occupation du Sol (COS) projeté*",
    hasTextInput: false,
  },
  {
    id: 3,
    label: "Conformité au plan de masse cadastral",
    hasTextInput: false,
  },
  {
    id: 4,
    label: "Échelle des plans",
    hasTextInput: false,
  },
  {
    id: 5,
    label: "Réalisation de porte-à-faux",
    hasTextInput: true,
    textInputLabel: "Si oui, précisez :",
  },
  {
    id: 6,
    label: "Marches d'escalier sur le domaine public",
    hasTextInput: false,
  },
  {
    id: 7,
    label: "Côte seuil de la construction",
    hasTextInput: false,
  },
  {
    id: 8,
    label: "Recul par rapport à la limite Nord",
    hasTextInput: false,
  },
  {
    id: 9,
    label: "Recul par rapport à la limite Sud",
    hasTextInput: false,
  },
  {
    id: 10,
    label: "Recul par rapport à la limite Est",
    hasTextInput: false,
  },
  {
    id: 11,
    label: "Recul par rapport à la limite Ouest",
    hasTextInput: false,
  },
  {
    id: 12,
    label: "Distance entre les constructions",
    hasTextInput: false,
  },
  {
    id: 13,
    label: "Ouvertures sur limite mitoyenne",
    hasTextInput: false,
  },
  {
    id: 14,
    label: "Hauteur de la construction mesurée à l'acrotère",
    hasTextInput: false,
  },
  {
    id: 15,
    label: "Destination du projet",
    hasTextInput: false,
  },
  {
    id: 16,
    label: "Type d'architecture",
    hasTextInput: false,
  },
  {
    id: 17,
    label: "Auteur du projet",
    hasTextInput: false,
  },
  {
    id: 18,
    label: "Cabinet d'Architecture / Bureau d'Étude",
    hasTextInput: false,
  },
];

/**
 * Options d'observation pour la conformité
 */
export const CONFORMITY_OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non-conforme", color: "red" },
  { value: "NON", label: "Non", color: "gray" },
  { value: "OUI", label: "Oui", color: "blue" },
];

/**
 * Options pour l'avis final
 */
export const FINAL_OPINION_OPTIONS = [
  { value: "FAVORABLE", label: "Favorable", color: "emerald" },
  { value: "DEFAVORABLE", label: "Défavorable", color: "red" },
];

