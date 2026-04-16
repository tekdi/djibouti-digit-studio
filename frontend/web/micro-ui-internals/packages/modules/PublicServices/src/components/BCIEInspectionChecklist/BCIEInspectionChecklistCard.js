import React, { useCallback, useEffect, useState } from "react";
import {
  LuCircleCheck, LuCircleX, LuClipboardList, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

/**
 * BPA_CCE — Fiche d'inspection BCIE (Certificat de Conformité Électrique).
 *
 * Sections (matching the paper form):
 *   ⓪ En-tête : propriétaire / téléphone / type d'autorisation / date inspection / localisation
 *   1) Nature de construction — 5 rows (Type / Nb unités / Type habitation / Constructions illégales / Porte-à-faux)
 *      + Avis du Sous-Directeur ATU (Favorable / Défavorable)
 *   2) Inspection technique — sub-blocks:
 *      • Mise à la terre (Fond de fouille, Piquet de terre)
 *      • Tableau divisionnaire (DPN 10A/16A/32A/DDR + Calibre/Sensibilité/Nbre de départs)
 *      • Étanchéité locaux humides (WC, Cuisine)
 *      • Section de câbles (1.5 / 2.5 / 6 mm² each with DPN installé + Calibre DPN)
 *   3) Test de mise à la Terre (Résistance / Continuité)
 *   4) Qualité des matériels électriques — 4 rows (Câbles / Gaines / DPN / DDR)
 *   ⑤ Visas : Nom de l'agent, Visa Chef BCIE, Visa SDATU
 *
 * Persisted at `application.additionalDetails.bcieInspectionChecklist`.
 */

// ---------- Schema ----------

const CONFORM_OPTIONS = [
  { value: "CONFORME", label: "Conforme" },
  { value: "NON_CONFORME", label: "Non conforme" },
  { value: "REGULARISABLE", label: "Régularisable" },
];

const OBS_OPTIONS = [
  { value: "OUI", label: "Oui" },
  { value: "MANQUANT", label: "Manquant" },
  { value: "NON_CONFORME", label: "Non conforme" },
];

const OBS2_OPTIONS = [
  { value: "OUI", label: "Oui" },
  { value: "NON_CONFORME", label: "Non conforme" },
];

// Section 1 — conformity rows (with dropdown)
const NATURE_CONFORM_ROWS = [
  { id: "typeConstruction", label: "Type de construction" },
  { id: "nbUnitesHabitation", label: "Nombre d'Unité habitation" },
  { id: "typeHabitation", label: "Type d'habitation (Commerciale ou résidentielle)" },
];

// Section 1 — observation-only rows
const NATURE_OBS_ROWS = [
  { id: "constructionsIllegales", label: "Constructions ou extensions illégales sur la voie publique" },
  { id: "porteAFaux", label: "Existence de Porte-à-faux" },
];

// Section 2 — inspection technique
const MISE_TERRE_ROWS = [
  { id: "fondFouille", label: "Fond de fouille" },
  { id: "piquetTerre", label: "Piquet de terre" },
];
const TABLEAU_DIV_ROWS = [
  { id: "dpn10", label: "DPN 10A" },
  { id: "dpn16", label: "DPN 16A" },
  { id: "dpn32", label: "DPN 32A" },
  { id: "ddr", label: "DDR" },
];
const ETANCHEITE_ROWS = [
  { id: "wc", label: "WC" },
  { id: "cuisine", label: "Cuisine" },
];
const SECTION_CABLES_ROWS = [
  { id: "section_1_5", label: "1.5 mm²" },
  { id: "section_2_5", label: "2.5 mm²" },
  { id: "section_6", label: "6 mm²" },
];

// Section 4 — qualité matériels
const QUALITY_ROWS = [
  { id: "cables", label: "Câbles électriques" },
  { id: "gaines", label: "Gaines" },
  { id: "dpn", label: "Disjoncteurs magnétothermiques (DPN)" },
  { id: "ddr", label: "Disjoncteur Différence Résiduel (DDR)" },
];

const buildEmptyForm = () => ({
  // en-tête
  ownerInfo: "", phoneNumber: "",
  authorizationType: "", inspectionDate: "", projectLocation: "",

  // 1) Nature de construction
  natureConformity: NATURE_CONFORM_ROWS.reduce((a, r) => {
    a[r.id] = { authorized: "", realized: "", decision: "" };
    return a;
  }, {}),
  natureObservations: NATURE_OBS_ROWS.reduce((a, r) => { a[r.id] = ""; return a; }, {}),
  subDirectorAtuDecision: "", // FAVORABLE | DEFAVORABLE

  // 2) Inspection technique
  miseTerre: MISE_TERRE_ROWS.reduce((a, r) => { a[r.id] = { nb: "", obs: "" }; return a; }, {}),
  tableauDiv: TABLEAU_DIV_ROWS.reduce((a, r) => { a[r.id] = { nb: "", obs: "" }; return a; }, {}),
  tableauDivSpec: { calibre: "", sensibilite: "", nbDeparts: "" },
  etancheite: ETANCHEITE_ROWS.reduce((a, r) => { a[r.id] = { nb: "", obs: "" }; return a; }, {}),
  sectionCables: SECTION_CABLES_ROWS.reduce((a, r) => {
    a[r.id] = { dpnInstalle: "", calibreDpn: "", obs: "" };
    return a;
  }, {}),

  // 3) Test de mise à la terre
  resistanceValue: "",
  continuityTest: "",

  // 4) Qualité matériels
  quality: QUALITY_ROWS.reduce((a, r) => { a[r.id] = ""; return a; }, {}),

  // ⑤ Visas
  agentName: "",
  chefBcieVisa: "",
  sdatuVisa: "",

  // Avis final (card badge)
  finalOpinion: "",
});

// ---------- Data hook ----------

const useBCIEChecklist = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.bcieInspectionChecklist || null);
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
      const existing = app.additionalDetails?.bcieInspectionChecklist || null;
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
      await Digit.CustomService.getResponse({
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
              bcieInspectionChecklist: payload,
            },
          },
        },
      });
      setData(payload);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApplication, serviceCode, tenantId]);

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
const Select = ({ value, onChange, disabled, options }) => (
  <select
    value={value || ""}
    onChange={onChange}
    disabled={disabled}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:text-gray-500"
  >
    <option value="">—</option>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
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

// ---------- Modal ----------

const BCIEInspectionModal = ({
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
      if (k === "history" || k === "submittedAt" || k === "submittedBy" || k === "submittedByName" ||
          k === "lastEditedAt" || k === "lastEditedBy" || k === "lastEditedByName") return;
      // Merge nested objects so schema additions are preserved
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && ed[k] && typeof ed[k] === "object") {
        merged[k] = { ...base[k], ...ed[k] };
        Object.keys(base[k]).forEach((sk) => {
          if (base[k][sk] && typeof base[k][sk] === "object" && ed[k][sk] && typeof ed[k][sk] === "object") {
            merged[k][sk] = { ...base[k][sk], ...ed[k][sk] };
          }
        });
      } else {
        merged[k] = ed[k];
      }
    });
    setForm(merged);
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const isEditable = !isViewMode || isEditMode;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNested = (section, rowId, col) => (e) =>
    setForm((f) => ({
      ...f,
      [section]: { ...f[section], [rowId]: { ...f[section][rowId], [col]: e.target.value } },
    }));
  const setNestedSimple = (section, rowId) => (e) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [rowId]: e.target.value } }));

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
              <h2 className="text-2xl font-bold mb-1">Fiche d'inspection BCIE — Certificat de Conformité Électrique</h2>
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
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          {showSuccess && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <LuCheck className="h-5 w-5" /><span className="text-sm font-semibold">Enregistré avec succès</span>
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-10">

            {/* En-tête */}
            <section>
              <SectionTitle>Informations générales</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Information sur le propriétaire">
                  <Input value={form.ownerInfo} onChange={set("ownerInfo")} disabled={!isEditable} placeholder="Nom du propriétaire" />
                </Field>
                <Field label="Numéro de téléphone">
                  <Input value={form.phoneNumber} onChange={set("phoneNumber")} disabled={!isEditable} placeholder="ex. 77 XX XX XX" />
                </Field>
                <Field label="Type d'autorisation de mise en valeur">
                  <Input value={form.authorizationType} onChange={set("authorizationType")} disabled={!isEditable} />
                </Field>
                <Field label="Date de l'inspection">
                  <Input type="date" value={form.inspectionDate} onChange={set("inspectionDate")} disabled={!isEditable} />
                </Field>
                <Field label="Localisation du projet" className="md:col-span-2">
                  <Input value={form.projectLocation} onChange={set("projectLocation")} disabled={!isEditable} />
                </Field>
              </div>
            </section>

            {/* 1) Nature de construction */}
            <section>
              <SectionTitle>1) Nature de construction</SectionTitle>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Informations</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Autorisés dans l'autorisation</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Travaux réalisés</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Cadre réservé au chef du BCIE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NATURE_CONFORM_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.natureConformity[row.id]?.authorized || ""} onChange={setNested("natureConformity", row.id, "authorized")} disabled={!isEditable} />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.natureConformity[row.id]?.realized || ""} onChange={setNested("natureConformity", row.id, "realized")} disabled={!isEditable} />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Select value={form.natureConformity[row.id]?.decision} onChange={setNested("natureConformity", row.id, "decision")} disabled={!isEditable} options={CONFORM_OPTIONS} />
                        </td>
                      </tr>
                    ))}
                    {NATURE_OBS_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
                        <td colSpan={3} className="border border-gray-200 p-3">
                          <Textarea rows={2} placeholder="Observations…" value={form.natureObservations[row.id] || ""} onChange={setNestedSimple("natureObservations", row.id)} disabled={!isEditable} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-3">
                  Cadre réservé exclusivement au Sous-Directeur ATU
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" disabled={!isEditable}
                    onClick={() => setForm((f) => ({ ...f, subDirectorAtuDecision: "FAVORABLE" }))}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      form.subDirectorAtuDecision === "FAVORABLE"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <LuCircleCheck className="h-5 w-5" /> Favorable
                  </button>
                  <button type="button" disabled={!isEditable}
                    onClick={() => setForm((f) => ({ ...f, subDirectorAtuDecision: "DEFAVORABLE" }))}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      form.subDirectorAtuDecision === "DEFAVORABLE"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <LuCircleX className="h-5 w-5" /> Défavorable
                  </button>
                </div>
              </div>
            </section>

            {/* 2) Inspection technique */}
            <section>
              <SectionTitle>2) Inspection technique</SectionTitle>

              <SubTitle>Mise à la terre</SubTitle>
              <TableNbObs rows={MISE_TERRE_ROWS} data={form.miseTerre} setNested={setNested} section="miseTerre" isEditable={isEditable} obsOptions={OBS_OPTIONS} />

              <SubTitle>Tableau divisionnaire</SubTitle>
              <TableNbObs rows={TABLEAU_DIV_ROWS} data={form.tableauDiv} setNested={setNested} section="tableauDiv" isEditable={isEditable} obsOptions={OBS_OPTIONS} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Field label="Calibre">
                  <Input value={form.tableauDivSpec?.calibre || ""} onChange={(e) => setForm((f) => ({ ...f, tableauDivSpec: { ...f.tableauDivSpec, calibre: e.target.value } }))} disabled={!isEditable} />
                </Field>
                <Field label="Sensibilité">
                  <Input value={form.tableauDivSpec?.sensibilite || ""} onChange={(e) => setForm((f) => ({ ...f, tableauDivSpec: { ...f.tableauDivSpec, sensibilite: e.target.value } }))} disabled={!isEditable} />
                </Field>
                <Field label="Nombre de départs">
                  <Input value={form.tableauDivSpec?.nbDeparts || ""} onChange={(e) => setForm((f) => ({ ...f, tableauDivSpec: { ...f.tableauDivSpec, nbDeparts: e.target.value } }))} disabled={!isEditable} />
                </Field>
              </div>

              <SubTitle>Étanchéité des prises de courant dans les locaux humides</SubTitle>
              <TableNbObs rows={ETANCHEITE_ROWS} data={form.etancheite} setNested={setNested} section="etancheite" isEditable={isEditable} obsOptions={OBS_OPTIONS} />

              <SubTitle>Section de câbles</SubTitle>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Section</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">DPN installé</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Calibre du DPN</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SECTION_CABLES_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.sectionCables[row.id]?.dpnInstalle || ""} onChange={setNested("sectionCables", row.id, "dpnInstalle")} disabled={!isEditable} />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.sectionCables[row.id]?.calibreDpn || ""} onChange={setNested("sectionCables", row.id, "calibreDpn")} disabled={!isEditable} />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Select value={form.sectionCables[row.id]?.obs} onChange={setNested("sectionCables", row.id, "obs")} disabled={!isEditable} options={OBS_OPTIONS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3) Test de mise à la terre */}
            <section>
              <SectionTitle>3) Test de mise à la Terre</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Valeur de la Résistance de terre (appareil de contrôle de terre)">
                  <Input value={form.resistanceValue} onChange={set("resistanceValue")} disabled={!isEditable} placeholder="ex. 5 Ω" />
                </Field>
                <Field label="Test de continuité de prise de terre (multimètre)">
                  <Input value={form.continuityTest} onChange={set("continuityTest")} disabled={!isEditable} />
                </Field>
              </div>
            </section>

            {/* 4) Qualité des matériels électriques */}
            <section>
              <SectionTitle>4) Qualité des matériels électriques</SectionTitle>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Désignation</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUALITY_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
                        <td className="border border-gray-200 p-3">
                          <Select value={form.quality[row.id]} onChange={setNestedSimple("quality", row.id)} disabled={!isEditable} options={OBS2_OPTIONS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Visas */}
            <section>
              <SectionTitle>Visas</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Nom de l'agent">
                  <Input value={form.agentName} onChange={set("agentName")} disabled={!isEditable} />
                </Field>
                <Field label="Visa du Chef BCIE">
                  <Input value={form.chefBcieVisa} onChange={set("chefBcieVisa")} disabled={!isEditable} placeholder="Nom + date" />
                </Field>
                <Field label="Visa du SDATU">
                  <Input value={form.sdatuVisa} onChange={set("sdatuVisa")} disabled={!isEditable} placeholder="Nom + date" />
                </Field>
              </div>
            </section>

            {/* Avis final */}
            <section>
              <SectionTitle>Avis final</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" disabled={!isEditable}
                  onClick={() => setForm((f) => ({ ...f, finalOpinion: "CONFORME" }))}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    form.finalOpinion === "CONFORME"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <LuCircleCheck className="h-5 w-5" /> Conforme
                </button>
                <button type="button" disabled={!isEditable}
                  onClick={() => setForm((f) => ({ ...f, finalOpinion: "NON_CONFORME" }))}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    form.finalOpinion === "NON_CONFORME"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <LuCircleX className="h-5 w-5" /> Non conforme
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper table (Nb + Observations) used by Mise à la terre / Tableau divisionnaire / Étanchéité
const TableNbObs = ({ rows, data, setNested, section, isEditable, obsOptions }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
          <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Désignation</th>
          <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-40">Nombre d'unités</th>
          <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-56">Observations</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
            <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
            <td className="border border-gray-200 p-3">
              <Input type="number" min="0" value={data[row.id]?.nb || ""} onChange={setNested(section, row.id, "nb")} disabled={!isEditable} />
            </td>
            <td className="border border-gray-200 p-3">
              <Select value={data[row.id]?.obs} onChange={setNested(section, row.id, "obs")} disabled={!isEditable} options={obsOptions} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ---------- Card ----------

const BCIEInspectionChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useBCIEChecklist(tenantId, serviceCode, applicationNumber);
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
              <LuClipboardList className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Fiche d'inspection BCIE</h3>
                {isSubmitted ? (
                  data.finalOpinion === "CONFORME" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <LuCircleCheck className="h-4 w-4" /> Conforme
                    </span>
                  ) : data.finalOpinion === "NON_CONFORME" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <LuCircleX className="h-4 w-4" /> Non conforme
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <LuCircleCheck className="h-4 w-4" /> Soumis
                    </span>
                  )
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
                Rédigez la fiche d'inspection BCIE : nature de construction, inspection technique (mise à la terre,
                tableau divisionnaire, étanchéité, section des câbles), test de mise à la terre, qualité des matériels
                et visas.
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
                {isSubmitted ? <LuPen className="h-4 w-4" /> : <LuClipboardList className="h-4 w-4" />}
                {isSubmitted ? "Modifier" : "Rédiger la fiche d'inspection"}
              </button>
            )}
            {isSubmitted && (
              <button
                onClick={openView}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark"
              >
                <LuEye className="h-4 w-4" /> Voir la fiche
              </button>
            )}
            {isViewOnly && !isSubmitted && (
              <span className="text-sm italic text-gray-500">Fiche non encore rédigée</span>
            )}
          </div>
        </div>
      </div>

      <BCIEInspectionModal
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

export default BCIEInspectionChecklistCard;
