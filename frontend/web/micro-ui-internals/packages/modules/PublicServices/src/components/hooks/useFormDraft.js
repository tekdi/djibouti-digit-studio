import { useEffect, useRef } from "react";

/**
 * Sauvegarde automatique des fiches/checklists dans localStorage pour
 * protéger le travail de l'agent contre :
 *   - le déchargement d'onglet par Chrome (Tab Discarding) après ~5-10 min idle
 *   - une expiration de session (token expiré → redirect login)
 *   - un F5 accidentel ou fermeture de l'onglet
 *   - un crash navigateur ou coupure réseau
 *
 * Utilisation type dans un Modal :
 *
 *   const [formData, setFormData] = useState(DEFAULT);
 *   const { restoreDraft, clearDraft, hasDraft } = useFormDraft({
 *     key: `pcs-fiche-draft:${applicationNumber}`,
 *     formData,
 *     setFormData,
 *     enabled: isOpen && !isViewMode,
 *   });
 *   // après submit OK : clearDraft();
 *
 * Le draft est restauré automatiquement au montage si présent et qu'aucune
 * donnée serveur n'a été chargée.
 */
export const useFormDraft = ({ key, formData, setFormData, enabled = true, serverData = null }) => {
  const isFirstRun = useRef(true);
  const restoredRef = useRef(false);

  // Restore au montage : seulement si on n'a PAS encore de données serveur
  // chargées dans le formulaire (sinon on écraserait des données réelles).
  useEffect(() => {
    if (!enabled || !key || restoredRef.current) return;
    if (serverData) {
      // Données serveur prennent priorité — on ignore le draft local.
      restoredRef.current = true;
      return;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && typeof draft === "object") {
          setFormData((prev) => ({ ...prev, ...draft }));
        }
      }
    } catch (e) {
      console.warn("[useFormDraft] restore failed:", e);
    }
    restoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, serverData]);

  // Auto-save à chaque changement de formData. Skip le tout premier render
  // (sinon on écraserait une éventuelle restauration avec un état vide).
  useEffect(() => {
    if (!enabled || !key) return;
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    try {
      window.localStorage.setItem(key, JSON.stringify(formData));
    } catch (e) {
      /* localStorage plein ou désactivé — ignoré */
    }
  }, [key, formData, enabled]);

  const clearDraft = () => {
    if (!key) return;
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  };

  const hasDraft = () => {
    if (!key) return false;
    try { return Boolean(window.localStorage.getItem(key)); } catch (e) { return false; }
  };

  return { clearDraft, hasDraft };
};
