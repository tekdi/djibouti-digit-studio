/**
 * Liste des documents à contrôler pour la fiche d'instruction APE
 * (Approbation de Plan d'Exécution - P12)
 *
 * Item 5 (Plans des détails structuraux) has 5 sub-items (a..e).
 * Sub-items are stored as separate documents with `parentId` so the table
 * can render them indented under their parent.
 */
export const DOCUMENTS_LIST = [
  { id: 1, label: "Permis de Construire", isSubItem: false },
  { id: 2, label: "PV d'implantation", isSubItem: false },
  { id: 3, label: "Plan de coffrage de la fondation", isSubItem: false },
  { id: 4, label: "Plans de coffrages de tous les planchers", isSubItem: false },
  { id: 5, label: "Plans des détails structuraux", isSubItem: false, isSection: true },
  { id: "5a", label: "Détails des armatures des fondations", isSubItem: true, parentId: 5, subLabel: "a" },
  { id: "5b", label: "Détails des poteaux", isSubItem: true, parentId: 5, subLabel: "b" },
  { id: "5c", label: "Détails des poutres", isSubItem: true, parentId: 5, subLabel: "c" },
  { id: "5d", label: "Détails des planchers", isSubItem: true, parentId: 5, subLabel: "d" },
  { id: "5e", label: "Détails des escaliers", isSubItem: true, parentId: 5, subLabel: "e" },
  { id: 6, label: "Autres plans nécessaires", isSubItem: false },
  { id: 7, label: "Fichier numérique du projet en AutoCAD (*.DWG)", isSubItem: false },
];

/**
 * Options d'observation pour chaque document
 */
export const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non-conforme", color: "red" },
  { value: "MANQUANT", label: "Manquant", color: "amber" },
];

/**
 * Options pour l'avis final (Approbation) — rendered as a switch like the SRA/SDECC sheets
 */
export const FINAL_OPINION_OPTIONS = [
  { value: "APPROVED", label: "Plans d'exécution approuvés", color: "emerald" },
  { value: "NOT_APPROVED", label: "Plans d'exécution non approuvés", color: "red" },
];
