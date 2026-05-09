import React, { useCallback, useEffect, useState } from "react";
import {
  LuBuilding2, LuCircleCheck, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

/**
 * BPA_CCE — Attestation de Conformité Électrique — Locaux accueillant du public.
 *
 * Paper-form variant of the ACE used specifically for "locaux accueillant du
 * public" (public venues). Captures the installer info, client/établissement
 * details, building destination checkboxes, per-level surface, and a textual
 * descriptif. Signature / visa blocks from the paper form are intentionally
 * omitted per requirement.
 *
 * Persisted at `application.additionalDetails.aceLocauxPublic`.
 */

const DESTINATIONS = [
  { id: "industriel", label: "Industriel" },
  { id: "commercial", label: "Commercial" },
  { id: "agricole", label: "Agricole" },
  { id: "banque", label: "Banque" },
  { id: "hotel", label: "Hôtel" },
  { id: "restaurant", label: "Restaurant" },
  { id: "magasin", label: "Magasin" },
  { id: "enseignement", label: "Enseignement" },
  { id: "etablissementSanitaire", label: "Établissement sanitaire" },
];

const LEVELS = [
  { id: "sousSol", label: "Sous-Sol" },
  { id: "rdc", label: "Rez-de-Chaussée" },
  { id: "etage1", label: "1er étage" },
  { id: "etage2", label: "2ème étage" },
  { id: "etage3", label: "3ème étage" },
  { id: "etage4", label: "4ème étage" },
];

const buildEmptyForm = () => ({
  referenceNumber: "",
  installerInfo: "",
  clientName: "",
  establishmentName: "",
  address: "",
  phoneNumber: "",
  constructionPermitNumber: "",
  publicMarketNumber: "",
  destinations: DESTINATIONS.reduce((a, d) => { a[d.id] = false; return a; }, {}),
  autresDestination: "",
  surfaces: LEVELS.reduce((a, l) => { a[l.id] = ""; return a; }, {}),
  attestationDate: "",
  descriptifInstallation: "",
  dateMiseSousTension: "",
  effectifMaximum: "",
});

const useACEChecklist = (tenantId, serviceCode, applicationNumber) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApplication = useCallback(async () => {
    if (!applicationNumber || !serviceCode) return null;
    const resp = await Digit.CustomService.getResponse({
      url: `/public-service/v1/application/${serviceCode}`,
      method: "GET",
      headers: {
        "X-Tenant-Id": tenantId,
        "auth-token": Digit.UserService.getUser()?.access_token,
      },
      params: { applicationNumber, tenantId },
    });
    return resp?.Application?.[0] || null;
  }, [applicationNumber, serviceCode, tenantId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const app = await fetchApplication();
      setData(app?.additionalDetails?.aceLocauxPublic || null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApplication]);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = useCallback(async (form) => {
    setIsLoading(true);
    try {
      const app = await fetchApplication();
      if (!app) throw new Error("Application not found");
      const currentUser = Digit.UserService.getUser();
      const nowISO = new Date().toISOString();
      const existing = app.additionalDetails?.aceLocauxPublic || null;
      const history = Array.isArray(existing?.history) ? existing.history.slice() : [];
      if (existing) {
        history.push({
          timestamp: nowISO,
          editedBy: currentUser?.info?.uuid,
          editedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
        });
      }
      const payload = {
        ...(existing || {}),
        ...form,
        lastEditedAt: nowISO,
        lastEditedBy: currentUser?.info?.uuid,
        lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
        submittedAt: existing?.submittedAt || nowISO,
        submittedBy: existing?.submittedBy || currentUser?.info?.uuid,
        submittedByName: existing?.submittedByName ||
          currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
        history,
      };
      const putResp = await Digit.CustomService.getResponse({
        url: `/public-service/v1/application/${serviceCode}`,
        method: "PUT",
        headers: { "X-Tenant-Id": tenantId },
        body: {
          RequestInfo: {
            apiId: "Rainmaker",
            authToken: Digit.UserService.getUser()?.access_token,
            msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
          },
          Application: {
            ...app,
            workflow: { ...(app.workflow || {}), action: "" },
            additionalDetails: {
              ...app.additionalDetails,
              aceLocauxPublic: payload,
            },
          },
        },
      });
      // Use the echoed payload to keep local state in sync with what the
      // server actually persisted; otherwise re-fetch.
      const echoed = Array.isArray(putResp?.Application)
        ? putResp?.Application?.[0]?.additionalDetails?.aceLocauxPublic
        : putResp?.Application?.additionalDetails?.aceLocauxPublic;
      if (echoed) {
        setData(echoed);
      } else {
        setData(payload);
        await refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchApplication, refresh, serviceCode, tenantId]);

  return { data, isLoading, submit };
};

// ---------- UI primitives ----------

const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
    {children}
  </label>
);
const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:text-gray-500"
  />
);
const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 resize-y disabled:bg-gray-50 disabled:text-gray-500"
  />
);
const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    <span className="inline-block w-1 h-5 bg-djibouti-primary rounded-full" />
    {children}
  </h3>
);

// ---------- Modal ----------

const ACELocauxPublicModal = ({
  isOpen, onClose, applicationNumber, existingData, isViewMode = false, isViewOnly = false, onSubmit,
}) => {
  const [form, setForm] = useState(buildEmptyForm());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsEditMode(false);
    setShowSuccess(false);
    const base = buildEmptyForm();
    const ed = existingData || {};
    const merged = { ...base };
    Object.keys(ed).forEach((k) => {
      if (["history", "submittedAt", "submittedBy", "submittedByName",
           "lastEditedAt", "lastEditedBy", "lastEditedByName"].includes(k)) return;
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && ed[k] && typeof ed[k] === "object") {
        merged[k] = { ...base[k], ...ed[k] };
      } else {
        merged[k] = ed[k];
      }
    });
    setForm(merged);
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const isEditable = !isViewMode || isEditMode;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleDest = (id) =>
    setForm((f) => ({ ...f, destinations: { ...f.destinations, [id]: !f.destinations?.[id] } }));
  const setSurface = (id) => (e) =>
    setForm((f) => ({ ...f, surfaces: { ...f.surfaces, [id]: e.target.value } }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSubmit(form);
      setShowSuccess(true);
      setIsEditMode(false);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      <div className="bg-white w-full h-full overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Attestation de Conformité Électrique — Locaux accueillant du public</h2>
              <p className="text-sm text-white/80">Dossier : {applicationNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              {isViewMode && !isEditMode && existingData && !isViewOnly && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <LuPen className="h-4 w-4" /> Modifier
                </button>
              )}
              {isEditable && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Enregistrement..." : existingData ? (
                    <span className="inline-flex items-center gap-2"><LuCheck className="h-4 w-4" /> Mettre à jour</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><LuSave className="h-4 w-4" /> Enregistrer</span>
                  )}
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <LuX className="h-5 w-5" />
              </button>
            </div>
          </div>
          {showSuccess && (
            <div className="mt-4 bg-emerald-500/20 border border-emerald-300/40 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
              <LuCheck className="h-4 w-4" /> Enregistré avec succès
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          {/* Top — installer & reference */}
          <section>
            <SectionTitle>Informations de l'installateur</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="N° de référence" className="md:col-span-2">
                <Input type="text" value={form.referenceNumber || ""} onChange={set("referenceNumber")} disabled={!isEditable} placeholder="N°……… / ……" />
              </Field>
              <Field label="Nom, adresse, signature et cachet de l'installateur" className="md:col-span-2">
                <Textarea rows={4} value={form.installerInfo || ""} onChange={set("installerInfo")} disabled={!isEditable} />
              </Field>
            </div>
          </section>

          {/* Client / établissement */}
          <section>
            <SectionTitle>Informations du client / établissement</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom du client">
                <Input type="text" value={form.clientName || ""} onChange={set("clientName")} disabled={!isEditable} />
              </Field>
              <Field label="Nom de l'établissement">
                <Input type="text" value={form.establishmentName || ""} onChange={set("establishmentName")} disabled={!isEditable} />
              </Field>
              <Field label="Adresse" className="md:col-span-2">
                <Textarea rows={2} value={form.address || ""} onChange={set("address")} disabled={!isEditable} />
              </Field>
              <Field label="Numéro de téléphone">
                <Input type="tel" value={form.phoneNumber || ""} onChange={set("phoneNumber")} disabled={!isEditable} placeholder="77 XX XX XX" />
              </Field>
              <Field label="Date de l'attestation">
                <Input type="date" value={form.attestationDate || ""} onChange={set("attestationDate")} disabled={!isEditable} />
              </Field>
              <Field label="N° du Permis de Construire (bâtiment privé)">
                <Input type="text" value={form.constructionPermitNumber || ""} onChange={set("constructionPermitNumber")} disabled={!isEditable} />
              </Field>
              <Field label="N° du marché Public (bâtiment public)">
                <Input type="text" value={form.publicMarketNumber || ""} onChange={set("publicMarketNumber")} disabled={!isEditable} />
              </Field>
            </div>
          </section>

          {/* Destinations */}
          <section>
            <SectionTitle>Destination du bâtiment</SectionTitle>
            <p className="text-sm text-gray-600 mb-3">Cocher la case correspondante :</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DESTINATIONS.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition ${
                    form.destinations?.[d.id]
                      ? "border-djibouti-primary bg-djibouti-primary/5 text-djibouti-primary"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  } ${!isEditable ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={!!form.destinations?.[d.id]}
                    onChange={() => isEditable && toggleDest(d.id)}
                    disabled={!isEditable}
                    className="h-4 w-4 rounded border-gray-300 text-djibouti-primary focus:ring-djibouti-primary"
                  />
                  <span className="font-medium">{d.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <Field label="Autres (préciser)">
                <Input type="text" value={form.autresDestination || ""} onChange={set("autresDestination")} disabled={!isEditable} />
              </Field>
            </div>
          </section>

          {/* Surfaces */}
          <section>
            <SectionTitle>Surface en m² par niveau</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LEVELS.map((lvl) => (
                <Field key={lvl.id} label={lvl.label}>
                  <Input type="number" min="0" step="0.01" value={form.surfaces?.[lvl.id] || ""} onChange={setSurface(lvl.id)} disabled={!isEditable} placeholder="m²" />
                </Field>
              ))}
            </div>
          </section>

          {/* Descriptif */}
          <section>
            <SectionTitle>Descriptif sommaire de l'installation électrique</SectionTitle>
            <p className="text-sm text-gray-600 mb-3">
              Accompagnant le schéma unifilaire détaillé ci-joint.
            </p>
            <Textarea
              rows={8}
              value={form.descriptifInstallation || ""}
              onChange={set("descriptifInstallation")}
              disabled={!isEditable}
              placeholder="Détaillez l'installation électrique..."
            />
          </section>

          {/* Mise sous tension & effectif */}
          <section>
            <SectionTitle>Mise sous tension et effectif</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Date probable de mise sous tension définitive">
                <Input type="date" value={form.dateMiseSousTension || ""} onChange={set("dateMiseSousTension")} disabled={!isEditable} />
              </Field>
              <Field label="Effectif maximum admissible (établissement recevant du public)">
                <Input type="number" min="0" value={form.effectifMaximum || ""} onChange={set("effectifMaximum")} disabled={!isEditable} placeholder="Nombre de personnes" />
              </Field>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ---------- Card ----------

const ACELocauxPublicChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useACEChecklist(tenantId, serviceCode, applicationNumber);
  const isSubmitted = !!data?.submittedAt;

  if (!applicationNumber || !service) return null;
  const openEdit = () => { setIsViewMode(false); setIsOpen(true); };
  const openView = () => { setIsViewMode(true); setIsOpen(true); };

  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className={`absolute inset-x-0 top-0 h-1 ${
          isSubmitted ? "bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"}`} />
        <div className="flex flex-col gap-6 p-6 min-h-full">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSubmitted ? "bg-djibouti-primary/10" : "bg-amber-100/70"}`}>
              <LuBuilding2 className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Attestation de Conformité Électrique — Locaux accueillant du public</h3>
                {isSubmitted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <LuCircleCheck className="h-4 w-4" /> Soumis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <LuClock className="h-4 w-4" /> En attente
                  </span>
                )}
              </div>
              {isSubmitted && data.submittedByName && (
                <p className="text-xs text-gray-500">
                  Soumis par <span className="font-medium text-gray-700">{data.submittedByName}</span>
                </p>
              )}
            </div>
          </div>

          {!isSubmitted && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Rédigez l'attestation pour un établissement recevant du public : informations de l'installateur,
                coordonnées de l'établissement, destination du bâtiment, surfaces par niveau, descriptif de
                l'installation électrique, date de mise sous tension et effectif maximum admissible.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-auto border-t border-gray-100 pt-6">
            {!isViewOnly && (
              <button
                onClick={openEdit}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isSubmitted
                    ? "border border-gray-200 bg-white text-gray-700 hover:border-djibouti-primary/40 hover:text-djibouti-primary"
                    : "border border-djibouti-primary bg-djibouti-primary text-white hover:bg-djibouti-primary-dark"
                }`}
              >
                {isSubmitted ? <LuPen className="h-4 w-4" /> : <LuBuilding2 className="h-4 w-4" />}
                {isSubmitted ? "Modifier" : "Rédiger l'attestation"}
              </button>
            )}
            {isSubmitted && (
              <button
                onClick={openView}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark"
              >
                <LuEye className="h-4 w-4" /> Voir l'attestation
              </button>
            )}
            {isViewOnly && !isSubmitted && (
              <span className="text-sm italic text-gray-500">Attestation non encore rédigée</span>
            )}
          </div>
        </div>
      </div>

      <ACELocauxPublicModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationNumber={applicationNumber}
        existingData={data}
        isViewMode={isViewMode}
        isViewOnly={isViewOnly}
        onSubmit={submit}
      />
    </div>
  );
};

export default ACELocauxPublicChecklistCard;
