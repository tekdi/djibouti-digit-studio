import React, { useCallback, useEffect, useState } from "react";
import {
  LuCircleCheck, LuClipboardList, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

/**
 * BPA_CCP — Procès-verbal de visite — Certificat de conformité parasismique.
 *
 * Sections:
 *   I)   Informations générales (10 fields)
 *   II)  Pièces administratives (5 docs × Conforme / Non conforme / Manquant + observations)
 *   III) Signatures (3 signataires)
 *   IV)  Observations de l'ingénieur SDECC
 *   V)   Observations du chef de service SCC Privée
 *   + Avis final (Conforme / Non conforme)
 *
 * Persisted at `application.additionalDetails.ccpVisitChecklist`.
 */

const ADMIN_DOCS = [
  { id: "permitDelivered", label: "Permis de Construire délivré" },
  { id: "executionPlans", label: "Plans d'exécution approuvés" },
  { id: "concretePourSlips", label: "Bons pour coulage de chaque ouvrage contrôlé" },
  { id: "lcbeTests", label: "Résultats des tests Laboratoire Central du Bâtiment et de l'Équipement (LCBE) de chaque ouvrage contrôlé" },
  { id: "otherDocs", label: "Autres documents nécessaires à l'instruction" },
];

const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme", color: "emerald" },
  { value: "NON_CONFORME", label: "Non conforme", color: "red" },
  { value: "MANQUANT", label: "Manquant", color: "amber" },
];

const buildEmptyAdminDocs = () =>
  ADMIN_DOCS.reduce((acc, d) => {
    acc[d.id] = { observation: "", comment: "" };
    return acc;
  }, {});

const EMPTY_FORM = {
  // I — Informations générales
  ownerName: "",
  certificateNumber: "",
  contactInfo: "",
  constructionLocation: "",
  authorizedProjectType: "",
  permitNumber: "",
  permitIssueDate: "",
  firstReinforcementReceptionDate: "",
  lastUpperFloorReceptionDate: "",
  architectFirm: "",
  // II — Pièces administratives
  adminDocs: buildEmptyAdminDocs(),
  // III — Signatures
  signatures: {
    engineer: { name: "", date: "" },
    chef: { name: "", date: "" },
    subDirector: { name: "", date: "" },
  },
  // IV — Observations ingénieur SDECC
  engineerObservations: "",
  // V — Observations chef de service SCC Privée
  chefObservations: "",
  // Avis final
  finalOpinion: "",
};

// ---------- Data hook ----------

const useCCPChecklist = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.ccpVisitChecklist || null);
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
      const existing = app.additionalDetails?.ccpVisitChecklist || null;
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
              ccpVisitChecklist: payload,
            },
          },
        },
      });
      const echoed = Array.isArray(putResp?.Application)
        ? putResp?.Application?.[0]?.additionalDetails?.ccpVisitChecklist
        : putResp?.Application?.additionalDetails?.ccpVisitChecklist;
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
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:text-gray-500 resize-y"
  />
);
const SectionHeader = ({ children, subtitle }) => (
  <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
    <h3 className="text-xl font-bold text-gray-900">{children}</h3>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// ---------- Modal (full-screen editor) ----------

const CCPVisitChecklistModal = ({ isOpen, onClose, applicationNumber, existingData, onSubmit, isViewMode, isEditMode, setIsEditMode, isLoading }) => {
  const [form, setForm] = useState(existingData || EMPTY_FORM);
  const isDisabled = isViewMode && !isEditMode;

  useEffect(() => {
    setForm({
      ...EMPTY_FORM,
      ...(existingData || {}),
      adminDocs: { ...buildEmptyAdminDocs(), ...(existingData?.adminDocs || {}) },
      signatures: {
        engineer: { name: "", date: "", ...(existingData?.signatures?.engineer || {}) },
        chef: { name: "", date: "", ...(existingData?.signatures?.chef || {}) },
        subDirector: { name: "", date: "", ...(existingData?.signatures?.subDirector || {}) },
      },
    });
  }, [existingData]);

  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setDocField = (docId, field) => (val) =>
    setForm((p) => ({
      ...p,
      adminDocs: { ...p.adminDocs, [docId]: { ...(p.adminDocs[docId] || {}), [field]: val } },
    }));
  const setSigField = (sigKey, field) => (e) =>
    setForm((p) => ({
      ...p,
      signatures: { ...p.signatures, [sigKey]: { ...(p.signatures[sigKey] || {}), [field]: e.target.value } },
    }));

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      <div className="flex flex-col h-full bg-white" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Procès-verbal de visite — Certificat de conformité parasismique</h2>
              <p className="text-sm text-white/90 font-medium">P14 — Certificat de conformité parasismique (CCP)</p>
              <p className="text-xs text-white/70 mt-1">Dossier : {applicationNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              {isViewMode && !isEditMode && existingData ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
                >
                  <LuPen className="h-4 w-4" /> Modifier
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? "Enregistrement…" : existingData ? <><LuCheck className="h-4 w-4" /> Mettre à jour</> : <><LuSave className="h-4 w-4" /> Enregistrer</>}
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg" title="Fermer">
                <LuX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">

          {/* Section I */}
          <section className="mb-8">
            <SectionHeader subtitle="À reprendre depuis la demande et le permis original.">I. Informations générales</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom du propriétaire / pétitionnaire">
                <Input type="text" value={form.ownerName} onChange={setField("ownerName")} disabled={isDisabled} />
              </Field>
              <Field label="Numéro du certificat de conformité parasismique">
                <Input type="text" value={form.certificateNumber} onChange={setField("certificateNumber")} disabled={isDisabled} placeholder="ex. CCP-000.../2026" />
              </Field>
              <Field label="Adresse / numéro de téléphone" className="md:col-span-2">
                <Textarea rows={2} value={form.contactInfo} onChange={setField("contactInfo")} disabled={isDisabled} />
              </Field>
              <Field label="Localisation de la construction">
                <Input type="text" value={form.constructionLocation} onChange={setField("constructionLocation")} disabled={isDisabled} />
              </Field>
              <Field label="Type de projet autorisé">
                <Input type="text" value={form.authorizedProjectType} onChange={setField("authorizedProjectType")} disabled={isDisabled} placeholder="Habitation, immeuble, commerce…" />
              </Field>
              <Field label="Numéro du Permis de Construire délivré">
                <Input type="text" value={form.permitNumber} onChange={setField("permitNumber")} disabled={isDisabled} />
              </Field>
              <Field label="Date de délivrance du Permis de construire">
                <Input type="date" value={form.permitIssueDate} onChange={setField("permitIssueDate")} disabled={isDisabled} />
              </Field>
              <Field label="Date de la 1re réception du ferraillage">
                <Input type="date" value={form.firstReinforcementReceptionDate} onChange={setField("firstReinforcementReceptionDate")} disabled={isDisabled} />
              </Field>
              <Field label="Date de la dernière réception du dernier plancher haut">
                <Input type="date" value={form.lastUpperFloorReceptionDate} onChange={setField("lastUpperFloorReceptionDate")} disabled={isDisabled} />
              </Field>
              <Field label="Architecte / cabinet / bureau d'études" className="md:col-span-2">
                <Input type="text" value={form.architectFirm} onChange={setField("architectFirm")} disabled={isDisabled} />
              </Field>
            </div>
          </section>

          {/* Section II */}
          <section className="mb-8">
            <SectionHeader subtitle="Vérifiez chaque document et indiquez son état.">II. Pièces administratives</SectionHeader>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                    <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 w-12">N°</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[280px]">Pièce administrative</th>
                    <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">Observation</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Commentaires</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_DOCS.map((doc, idx) => {
                    const docData = form.adminDocs[doc.id] || { observation: "", comment: "" };
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600">{idx + 1}</td>
                        <td className="border border-gray-200 p-3 text-sm text-gray-800 font-medium">{doc.label}</td>
                        <td className="border border-gray-200 p-3">
                          <div className="flex items-center justify-center gap-3 flex-wrap">
                            {OBSERVATION_OPTIONS.map((opt) => (
                              <label key={opt.value} className={`flex items-center gap-1.5 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                                <input
                                  type="radio"
                                  name={`obs-${doc.id}`}
                                  checked={docData.observation === opt.value}
                                  onChange={() => !isDisabled && setDocField(doc.id, "observation")(opt.value)}
                                  disabled={isDisabled}
                                  className="w-4 h-4"
                                />
                                <span className={`text-xs font-medium text-${opt.color}-700`}>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="border border-gray-200 p-3">
                          {isDisabled ? (
                            <div className="text-sm text-gray-700">{docData.comment || "Aucun commentaire"}</div>
                          ) : (
                            <textarea
                              value={docData.comment}
                              onChange={(e) => setDocField(doc.id, "comment")(e.target.value)}
                              rows={2}
                              placeholder="Observations…"
                              className="w-full p-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-djibouti-primary"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section III */}
          <section className="mb-8">
            <SectionHeader>III. Signatures</SectionHeader>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Signataire</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Fonction</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "engineer", role: "Agent / ingénieur SCC Privée", title: "Ingénieur chargé du contrôle" },
                    { key: "chef", role: "Chef de service SCC Privée", title: "Validation technique" },
                    { key: "subDirector", role: "Sous-Directeur de la SDECC", title: "Validation finale / certificat" },
                  ].map((s) => {
                    const v = form.signatures[s.key] || { name: "", date: "" };
                    return (
                      <tr key={s.key}>
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-800">{s.role}</td>
                        <td className="border border-gray-200 p-2">
                          <input
                            type="text"
                            value={v.name}
                            onChange={setSigField(s.key, "name")}
                            disabled={isDisabled}
                            placeholder="Nom complet"
                            className="w-full px-2 py-1.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded text-sm focus:border-djibouti-primary focus:outline-none disabled:bg-gray-50"
                          />
                        </td>
                        <td className="border border-gray-200 p-2 text-sm text-gray-600 italic">{s.title}</td>
                        <td className="border border-gray-200 p-2">
                          <input
                            type="date"
                            value={v.date}
                            onChange={setSigField(s.key, "date")}
                            disabled={isDisabled}
                            className="w-full px-2 py-1.5 bg-white text-gray-900 border border-gray-200 rounded text-sm focus:border-djibouti-primary focus:outline-none disabled:bg-gray-50"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section IV */}
          <section className="mb-8">
            <SectionHeader subtitle="À renseigner obligatoirement en cas de non-conformité, de pièce manquante ou de demande de complément.">IV. Observations de l'ingénieur SDECC</SectionHeader>
            <Textarea
              rows={5}
              value={form.engineerObservations}
              onChange={setField("engineerObservations")}
              disabled={isDisabled}
              placeholder="Saisir les observations techniques relatives aux documents, aux ouvrages contrôlés ou aux essais de laboratoire…"
            />
          </section>

          {/* Section V */}
          <section className="mb-8">
            <SectionHeader subtitle="Validation, réserve, demande de complément ou orientation du dossier.">V. Observations du chef de service SCC Privée</SectionHeader>
            <Textarea
              rows={5}
              value={form.chefObservations}
              onChange={setField("chefObservations")}
              disabled={isDisabled}
              placeholder="Saisir les observations du chef de service SCC Privée…"
            />
          </section>

          {/* Avis final */}
          <section className="mb-8">
            <SectionHeader>Avis final</SectionHeader>
            <div className="flex gap-3">
              {[
                { value: "CONFORME", label: "Conforme", color: "emerald" },
                { value: "NON_CONFORME", label: "Non conforme", color: "red" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setForm((p) => ({ ...p, finalOpinion: opt.value }))}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border ${
                    form.finalOpinion === opt.value
                      ? `bg-${opt.color}-100 border-${opt.color}-300 text-${opt.color}-800`
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ---------- Card ----------

const CCPVisitChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useCCPChecklist(tenantId, serviceCode, applicationNumber);
  const isSubmitted = !!data?.submittedAt;

  if (!applicationNumber || !service) return null;

  const openEdit = () => { setIsViewMode(false); setIsEditMode(false); setIsOpen(true); };
  const openView = () => { setIsViewMode(true); setIsEditMode(false); setIsOpen(true); };

  const handleSubmit = async (form) => {
    await submit(form);
    setIsOpen(false);
  };

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
                <h3 className="text-xl font-semibold text-gray-900">Fiche d'instruction CCP</h3>
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
              <p className="text-sm text-gray-500">
                ID dossier : <span className="font-medium text-gray-900">{applicationNumber}</span>
              </p>
              {isSubmitted && data.submittedByName && (
                <p className="text-xs text-gray-500">Soumis par <span className="font-medium text-gray-700">{data.submittedByName}</span></p>
              )}
            </div>
          </div>

          {!isSubmitted && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Procès-verbal de visite — vérification des pièces administratives, signatures et observations pour le contrôle de conformité parasismique.
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
                {isSubmitted ? "Modifier" : "Remplir la fiche"}
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
          </div>
        </div>
      </div>

      <CCPVisitChecklistModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationNumber={applicationNumber}
        existingData={data}
        onSubmit={handleSubmit}
        isViewMode={isViewMode}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CCPVisitChecklistCard;
