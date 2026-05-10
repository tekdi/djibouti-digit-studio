import React, { useCallback, useEffect, useState } from "react";
import {
  LuHouse, LuCircleCheck, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

/**
 * BPA_CCE — Attestation de Conformité Électrique — Habitation.
 *
 * Paper-form variant for residential installations. Captures the installer
 * info, applicant details, document type selection, domestique installation
 * (circuits + prises per pièce), climatisation installation (circuits +
 * climatiseurs per pièce), and free-form notes. Signature / visa blocks are
 * intentionally omitted (matches the Locaux-accueillant-du-public variant).
 *
 * Persisted at `application.additionalDetails.aceHabitation`.
 */

// ---------- Schema ----------

const DOMESTIQUE_PRISES_ROOMS = [
  { id: "sejourSalon", label: "Séjour-Salon" },
  { id: "chambre1", label: "Chambre 1" },
  { id: "chambre2", label: "Chambre 2" },
  { id: "chambre3", label: "Chambre 3" },
  { id: "autresChambres", label: "Autres chambres" },
  { id: "cuisine", label: "Cuisine" },
  { id: "salleEau", label: "Salle d'eau" },
  { id: "entreeDegagements", label: "Entrée-Dégagements" },
  { id: "autresPieces", label: "Autres pièces" },
];

const CLIMATISATION_ROOMS = [
  { id: "sejourSalon", label: "Séjour-Salon" },
  { id: "chambre1", label: "Chambre 1" },
  { id: "chambre2", label: "Chambre 2" },
  { id: "chambre3", label: "Chambre 3" },
  { id: "chambre4", label: "Chambre 4" },
  { id: "autresPieces", label: "Autres pièces" },
];

const DOMESTIQUE_SECTIONS = ["2.5", "1.5", "4", "6"]; // mm²
const CLIMATISATION_SECTIONS = ["4", "6", "10", "16"]; // mm²
const PRISE_TYPES = [
  { id: "a10_16", label: "10/16A" },
  { id: "a20", label: "20A" },
  { id: "a32", label: "32A" },
  { id: "triphases", label: "Triphasés" },
];

const emptyCircuits = (sections) => {
  const row = () => sections.reduce((a, s) => { a[s] = ""; return a; }, {});
  return { monophases: row(), triphases: row() };
};

const emptyPrises = (rooms) => rooms.reduce((a, r) => {
  a[r.id] = PRISE_TYPES.reduce((b, p) => { b[p.id] = ""; return b; }, {});
  return a;
}, {});

const emptyClimatiseurs = (rooms) => rooms.reduce((a, r) => {
  a[r.id] = { nombre: "", puissance: "" };
  return a;
}, {});

const buildEmptyForm = () => ({
  referenceNumber: "",
  installerInfo: "",
  installationType: { domestique: false, climatisation: false },
  applicantName: "",
  address: "",
  documentTypes: { constructionPermit: "", titreOccupation: "" },
  domestique: {
    multipleLogements: { nombre: "", typeF: "" },
    circuits: emptyCircuits(DOMESTIQUE_SECTIONS),
    prises: emptyPrises(DOMESTIQUE_PRISES_ROOMS),
  },
  climatisation: {
    mode: { basePlusAppoint: false, direct: false },
    circuits: emptyCircuits(CLIMATISATION_SECTIONS),
    climatiseurs: emptyClimatiseurs(CLIMATISATION_ROOMS),
  },
  notes: "",
});

// ---------- Data hook ----------

const useACEHabitation = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.aceHabitation || null);
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
      const existing = app.additionalDetails?.aceHabitation || null;
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
              aceHabitation: payload,
            },
          },
        },
      });
      // Trust the server-echoed Application if present; otherwise re-fetch.
      // Without this, closing+reopening the modal showed stale data because
      // setData(payload) is local-only and a remount replaced it with the
      // last GET (which was pre-save).
      const echoed = Array.isArray(putResp?.Application)
        ? putResp?.Application?.[0]?.additionalDetails?.aceHabitation
        : putResp?.Application?.additionalDetails?.aceHabitation;
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
const SubTitle = ({ children }) => (
  <h4 className="text-sm font-bold text-gray-700 mb-2 mt-4">{children}</h4>
);
const Check = ({ checked, onChange, disabled, label }) => (
  <label className={`inline-flex items-center gap-2 text-sm ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => !disabled && onChange(e.target.checked)}
      disabled={disabled}
      className="h-4 w-4 rounded border-gray-300 text-djibouti-primary focus:ring-djibouti-primary"
    />
    <span>{label}</span>
  </label>
);

// Small numeric cell for table-based inputs.
const NumCell = ({ value, onChange, disabled }) => (
  <input
    type="number"
    min="0"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none transition focus:border-djibouti-primary disabled:bg-gray-50 disabled:text-gray-500"
  />
);

// ---------- Modal ----------

const ACEHabitationModal = ({
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
    // Deep-merge: keep base structure even if existingData is missing inner keys.
    const merge = (a, b) => {
      if (!b || typeof b !== "object" || Array.isArray(b)) return b !== undefined ? b : a;
      const out = { ...a };
      Object.keys(b).forEach((k) => {
        out[k] = a && typeof a[k] === "object" && !Array.isArray(a[k])
          ? merge(a[k], b[k])
          : b[k];
      });
      return out;
    };
    const merged = { ...base };
    Object.keys(ed).forEach((k) => {
      if (["history", "submittedAt", "submittedBy", "submittedByName",
           "lastEditedAt", "lastEditedBy", "lastEditedByName"].includes(k)) return;
      merged[k] = merge(base[k], ed[k]);
    });
    setForm(merged);
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const isEditable = !isViewMode || isEditMode;
  const set = (path) => (value) =>
    setForm((f) => {
      // path is dot-separated, e.g. "installationType.domestique"
      const keys = path.split(".");
      const out = { ...f };
      let cur = out;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return out;
    });
  const setEvt = (path) => (e) => set(path)(e.target.value);

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
              <h2 className="text-2xl font-bold mb-1">Attestation de Conformité Électrique — Habitation</h2>
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
          {/* Installer info */}
          <section>
            <SectionTitle>Informations de l'installateur</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="N° de référence" className="md:col-span-2">
                <Input type="text" value={form.referenceNumber} onChange={setEvt("referenceNumber")} disabled={!isEditable} placeholder="N°…… / 2026" />
              </Field>
              <Field label="Nom, adresse, signature et cachet de l'installateur" className="md:col-span-2">
                <Textarea rows={3} value={form.installerInfo} onChange={setEvt("installerInfo")} disabled={!isEditable} />
              </Field>
            </div>
            <p className="text-sm text-gray-600 mt-4 mb-2">
              L'installateur soussigné atteste que l'installation électrique est conforme aux règles de sécurité.
              Cochez la case correspondante :
            </p>
            <div className="flex flex-wrap gap-6">
              <Check
                checked={form.installationType.domestique}
                onChange={(v) => set("installationType.domestique")(v)}
                disabled={!isEditable}
                label="Domestique"
              />
              <Check
                checked={form.installationType.climatisation}
                onChange={(v) => set("installationType.climatisation")(v)}
                disabled={!isEditable}
                label="Climatisation"
              />
            </div>
          </section>

          {/* Requester info */}
          <section>
            <SectionTitle>Demandeur</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom du demandeur (en lettres capitales)" className="md:col-span-2">
                <Input type="text" value={form.applicantName} onChange={setEvt("applicantName")} disabled={!isEditable} />
              </Field>
              <Field label="Adresse et numéro de téléphone" className="md:col-span-2">
                <Textarea rows={2} value={form.address} onChange={setEvt("address")} disabled={!isEditable} />
              </Field>
            </div>
            <SubTitle>Document d'identification de la propriété</SubTitle>
            <div className="space-y-4">
              <Field label="Numéro et date de délivrance du permis de Construire (construction en dur dans les lotissements — pièce à présenter)">
                <Textarea
                  rows={2}
                  value={form.documentTypes.constructionPermit}
                  onChange={setEvt("documentTypes.constructionPermit")}
                  disabled={!isEditable}
                  placeholder="Saisir le numéro et la date du permis de Construire…"
                />
              </Field>
              <Field label="Pour les constructions légères dans les Quartiers 1 à 7, Djebel/Ambouli, Balbala et PK12 : Titre d'Occupation Provisoire ou attestation du Fonds de l'Habitat (Barwaquo, Cité-Gargaar, Cité Concorde, Cité Shebelley, Cité GR/GN)">
                <Textarea
                  rows={2}
                  value={form.documentTypes.titreOccupation}
                  onChange={setEvt("documentTypes.titreOccupation")}
                  disabled={!isEditable}
                  placeholder="Saisir la référence du Titre d'Occupation Provisoire ou de l'attestation…"
                />
              </Field>
            </div>
          </section>

          {/* Descriptif sommaire — two columns */}
          <section>
            <SectionTitle>Descriptif sommaire</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DOMESTIQUE */}
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50">
                <h4 className="text-base font-bold text-gray-800 mb-4">Installation domestique</h4>
                <SubTitle>Cas de plusieurs logements</SubTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre">
                    <Input type="number" min="0" value={form.domestique.multipleLogements.nombre}
                      onChange={setEvt("domestique.multipleLogements.nombre")} disabled={!isEditable} />
                  </Field>
                  <Field label="Type F">
                    <Input type="text" value={form.domestique.multipleLogements.typeF}
                      onChange={setEvt("domestique.multipleLogements.typeF")} disabled={!isEditable} />
                  </Field>
                </div>

                <SubTitle>Nombre de circuits — Section mm²</SubTitle>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-djibouti-primary/10">
                        <th className="border border-gray-200 p-2 text-left text-xs font-semibold text-gray-600"></th>
                        {DOMESTIQUE_SECTIONS.map((s) => (
                          <th key={s} className="border border-gray-200 p-2 text-center text-xs font-semibold text-gray-600">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "monophases", label: "Monophasés" },
                        { id: "triphases", label: "Triphasés" },
                      ].map((row) => (
                        <tr key={row.id}>
                          <td className="border border-gray-200 p-2 text-xs font-medium text-gray-700">{row.label}</td>
                          {DOMESTIQUE_SECTIONS.map((s) => (
                            <td key={s} className="border border-gray-200 p-1">
                              <NumCell
                                value={form.domestique.circuits[row.id][s]}
                                onChange={set(`domestique.circuits.${row.id}.${s}`)}
                                disabled={!isEditable}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SubTitle>Nombre de prises de courant par pièce</SubTitle>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-djibouti-primary/10">
                        <th className="border border-gray-200 p-2 text-left text-xs font-semibold text-gray-600">Pièce</th>
                        {PRISE_TYPES.map((p) => (
                          <th key={p.id} className="border border-gray-200 p-2 text-center text-xs font-semibold text-gray-600">{p.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DOMESTIQUE_PRISES_ROOMS.map((room) => (
                        <tr key={room.id}>
                          <td className="border border-gray-200 p-2 text-xs font-medium text-gray-700">{room.label}</td>
                          {PRISE_TYPES.map((p) => (
                            <td key={p.id} className="border border-gray-200 p-1">
                              <NumCell
                                value={form.domestique.prises[room.id][p.id]}
                                onChange={set(`domestique.prises.${room.id}.${p.id}`)}
                                disabled={!isEditable}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CLIMATISATION */}
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50">
                <h4 className="text-base font-bold text-gray-800 mb-4">Installation climatisation</h4>
                <SubTitle>Mode</SubTitle>
                <div className="flex flex-wrap gap-6">
                  <Check
                    checked={form.climatisation.mode.basePlusAppoint}
                    onChange={(v) => set("climatisation.mode.basePlusAppoint")(v)}
                    disabled={!isEditable}
                    label="Base + Appoint"
                  />
                  <Check
                    checked={form.climatisation.mode.direct}
                    onChange={(v) => set("climatisation.mode.direct")(v)}
                    disabled={!isEditable}
                    label="Direct"
                  />
                </div>

                <SubTitle>Nombre de circuits — Section mm²</SubTitle>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-djibouti-primary/10">
                        <th className="border border-gray-200 p-2 text-left text-xs font-semibold text-gray-600"></th>
                        {CLIMATISATION_SECTIONS.map((s) => (
                          <th key={s} className="border border-gray-200 p-2 text-center text-xs font-semibold text-gray-600">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "monophases", label: "Monophasés" },
                        { id: "triphases", label: "Triphasés" },
                      ].map((row) => (
                        <tr key={row.id}>
                          <td className="border border-gray-200 p-2 text-xs font-medium text-gray-700">{row.label}</td>
                          {CLIMATISATION_SECTIONS.map((s) => (
                            <td key={s} className="border border-gray-200 p-1">
                              <NumCell
                                value={form.climatisation.circuits[row.id][s]}
                                onChange={set(`climatisation.circuits.${row.id}.${s}`)}
                                disabled={!isEditable}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SubTitle>Nombre de climatiseurs par pièce</SubTitle>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-djibouti-primary/10">
                        <th className="border border-gray-200 p-2 text-left text-xs font-semibold text-gray-600">Pièce</th>
                        <th className="border border-gray-200 p-2 text-center text-xs font-semibold text-gray-600">Nombre</th>
                        <th className="border border-gray-200 p-2 text-center text-xs font-semibold text-gray-600">Puissance (W ou CV)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLIMATISATION_ROOMS.map((room) => (
                        <tr key={room.id}>
                          <td className="border border-gray-200 p-2 text-xs font-medium text-gray-700">{room.label}</td>
                          <td className="border border-gray-200 p-1">
                            <NumCell
                              value={form.climatisation.climatiseurs[room.id].nombre}
                              onChange={set(`climatisation.climatiseurs.${room.id}.nombre`)}
                              disabled={!isEditable}
                            />
                          </td>
                          <td className="border border-gray-200 p-1">
                            <Input
                              type="text"
                              value={form.climatisation.climatiseurs[room.id].puissance}
                              onChange={setEvt(`climatisation.climatiseurs.${room.id}.puissance`)}
                              disabled={!isEditable}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic mt-4">
              (1) Par nombre de circuits, il faut entendre les nombres de départs issus du tableau de réparation,
              protégés individuellement à leur origine.
            </p>
          </section>

          {/* Notes */}
          <section>
            <SectionTitle>Remarques</SectionTitle>
            <Textarea
              rows={5}
              value={form.notes}
              onChange={setEvt("notes")}
              disabled={!isEditable}
              placeholder="Ajouter des précisions sur l'installation..."
            />
          </section>
        </div>
      </div>
    </div>
  );
};

// ---------- Card ----------

const ACEHabitationChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useACEHabitation(tenantId, serviceCode, applicationNumber);
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
              <LuHouse className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Attestation de Conformité Électrique — Habitation</h3>
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
                Rédigez l'attestation pour une habitation : informations de l'installateur, coordonnées du demandeur,
                type de document d'identification, descriptif sommaire (domestique + climatisation — circuits, prises,
                climatiseurs par pièce).
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
                {isSubmitted ? <LuPen className="h-4 w-4" /> : <LuHouse className="h-4 w-4" />}
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

      <ACEHabitationModal
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

export default ACEHabitationChecklistCard;
