import React, { useCallback, useEffect, useState } from "react";
import {
  LuCircleCheck, LuClipboardList, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

/**
 * BPA_PV — Procès-Verbal d'Implantation custom checklist.
 *
 * Agent-fillable fields:
 *   - Date d'implantation
 *   - N° du Permis de Construire (référence)
 *   - Bénéficiaire / Propriétaire
 *   - Description du projet
 *   - Superficie du terrain (m²)
 *   - Tableau Recul du PCO vs Recul constaté (Nord / Est / Sud / Ouest)
 *   - Conclusion / Conformité (texte)
 *   - Avis final : CONFORME / NON_CONFORME
 *
 * Persisted at `application.additionalDetails.pvImplantationChecklist`.
 */

const RECUL_SIDES = [
  { key: "nord", label: "Recul au Nord" },
  { key: "est", label: "Recul à l'Est" },
  { key: "sud", label: "Recul au Sud" },
  { key: "ouest", label: "Recul à l'Ouest" },
];

const EMPTY_FORM = {
  implantationDate: "",
  pcoNumber: "",
  beneficiaryName: "",
  projectDescription: "",
  landArea: "",
  reculs: {
    nord: { pco: "", constate: "" },
    est: { pco: "", constate: "" },
    sud: { pco: "", constate: "" },
    ouest: { pco: "", constate: "" },
  },
  conclusion: "",
  finalOpinion: "", // CONFORME | NON_CONFORME
};

// ---------- Data hook ----------

const usePVChecklist = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.pvImplantationChecklist || null);
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
      const existing = app.additionalDetails?.pvImplantationChecklist || null;
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
              pvImplantationChecklist: payload,
            },
          },
        },
      });
      setData(payload);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApplication, serviceCode, tenantId]);

  return { data, isLoading, submit, refresh };
};

// ---------- Modal (full-screen) ----------

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

const PVChecklistModal = ({
  isOpen, onClose, applicationNumber, existingData, isViewMode = false, isViewOnly = false, onSubmit,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsEditMode(false);
    setShowSuccess(false);
    setForm({
      implantationDate: existingData?.implantationDate || "",
      pcoNumber: existingData?.pcoNumber || "",
      beneficiaryName: existingData?.beneficiaryName || "",
      projectDescription: existingData?.projectDescription || "",
      landArea: existingData?.landArea || "",
      reculs: {
        nord: {
          pco: existingData?.reculs?.nord?.pco || "",
          constate: existingData?.reculs?.nord?.constate || "",
        },
        est: {
          pco: existingData?.reculs?.est?.pco || "",
          constate: existingData?.reculs?.est?.constate || "",
        },
        sud: {
          pco: existingData?.reculs?.sud?.pco || "",
          constate: existingData?.reculs?.sud?.constate || "",
        },
        ouest: {
          pco: existingData?.reculs?.ouest?.pco || "",
          constate: existingData?.reculs?.ouest?.constate || "",
        },
      },
      conclusion: existingData?.conclusion || "",
      finalOpinion: existingData?.finalOpinion || "",
    });
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const isEditable = !isViewMode || isEditMode;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setRecul = (side, col) => (e) =>
    setForm((f) => ({
      ...f,
      reculs: { ...f.reculs, [side]: { ...f.reculs[side], [col]: e.target.value } },
    }));

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
              <h2 className="text-2xl font-bold mb-1">Procès-Verbal d'Implantation</h2>
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

          <div className="max-w-5xl mx-auto space-y-8">

            {/* Informations générales */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Date d'implantation">
                  <Input type="date" value={form.implantationDate} onChange={set("implantationDate")} disabled={!isEditable} />
                </Field>
                <Field label="N° Permis de Construire">
                  <Input
                    type="text" placeholder="ex. 398/2025"
                    value={form.pcoNumber} onChange={set("pcoNumber")} disabled={!isEditable}
                  />
                </Field>
                <Field label="Bénéficiaire / Propriétaire" className="md:col-span-2">
                  <Input
                    type="text" placeholder="Nom complet du bénéficiaire"
                    value={form.beneficiaryName} onChange={set("beneficiaryName")} disabled={!isEditable}
                  />
                </Field>
                <Field label="Description du projet" className="md:col-span-2">
                  <Textarea
                    rows={3}
                    placeholder="ex. construction d'une villa duplex de type F4 avec terrasse accessible"
                    value={form.projectDescription} onChange={set("projectDescription")} disabled={!isEditable}
                  />
                </Field>
                <Field label="Superficie du terrain (m²)">
                  <Input
                    type="number" min="0" step="0.01"
                    value={form.landArea} onChange={set("landArea")} disabled={!isEditable}
                  />
                </Field>
              </div>
            </section>

            {/* Reculs Table */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tableau des reculs</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-1/3">
                        Côté
                      </th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Recul du PCO (m)
                      </th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Recul constaté (m)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECUL_SIDES.map((side) => (
                      <tr key={side.key} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">
                          {side.label}
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input
                            type="number" min="0" step="0.01"
                            value={form.reculs[side.key].pco}
                            onChange={setRecul(side.key, "pco")}
                            disabled={!isEditable}
                          />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input
                            type="number" min="0" step="0.01"
                            value={form.reculs[side.key].constate}
                            onChange={setRecul(side.key, "constate")}
                            disabled={!isEditable}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Conclusion + Avis */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Conclusion</h3>
              <div className="space-y-4">
                <Field label="Observations">
                  <Textarea
                    rows={4}
                    placeholder="ex. L'implantation est conforme au permis de construire, sans observations particulières."
                    value={form.conclusion} onChange={set("conclusion")} disabled={!isEditable}
                  />
                </Field>

                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Avis final
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!isEditable}
                      onClick={() => setForm((f) => ({ ...f, finalOpinion: "CONFORME" }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        form.finalOpinion === "CONFORME"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <LuCircleCheck className="h-5 w-5" />
                      Conforme
                    </button>
                    <button
                      type="button"
                      disabled={!isEditable}
                      onClick={() => setForm((f) => ({ ...f, finalOpinion: "NON_CONFORME" }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        form.finalOpinion === "NON_CONFORME"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <LuX className="h-5 w-5" />
                      Non conforme
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Card ----------

const PVImplantationChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { data, isLoading, submit } = usePVChecklist(tenantId, serviceCode, applicationNumber);
  const isSubmitted = !!data?.submittedAt;

  if (!applicationNumber || !service) return null;

  const openEdit = () => { setIsViewMode(false); setIsOpen(true); };
  const openView = () => { setIsViewMode(true); setIsOpen(true); };

  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            isSubmitted
              ? "bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark"
              : "bg-gradient-to-r from-amber-400 to-amber-500"
          }`}
        />

        <div className="flex flex-col gap-6 p-6 min-h-full">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSubmitted ? "bg-djibouti-primary/10" : "bg-amber-100/70"}`}>
              <LuClipboardList className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Procès-Verbal d'Implantation</h3>
                {isSubmitted ? (
                  data.finalOpinion === "CONFORME" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <LuCircleCheck className="h-4 w-4" /> Conforme
                    </span>
                  ) : data.finalOpinion === "NON_CONFORME" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <LuX className="h-4 w-4" /> Non conforme
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
                Rédigez le procès-verbal d'implantation : informations générales, tableau des reculs (PCO vs constaté)
                et conclusion de conformité.
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
                {isSubmitted ? "Modifier" : "Rédiger le procès-verbal"}
              </button>
            )}
            {isSubmitted && (
              <button
                onClick={openView}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-djibouti-primary-dark"
              >
                <LuEye className="h-4 w-4" /> Voir le procès-verbal
              </button>
            )}
            {isViewOnly && !isSubmitted && (
              <span className="text-sm italic text-gray-500">Procès-verbal non encore rédigé</span>
            )}
          </div>
        </div>
      </div>

      <PVChecklistModal
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

export default PVImplantationChecklistCard;
