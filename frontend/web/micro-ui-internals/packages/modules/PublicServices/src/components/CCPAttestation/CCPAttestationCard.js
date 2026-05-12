import React, { useCallback, useEffect, useState } from "react";
import {
  LuCircleCheck, LuFileText, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
} from "react-icons/lu";

// BPA_CCP — Attestation de conformité aux normes parasismiques.
// Fields drive the final attestation PDF (P14).
// Persisted at `application.additionalDetails.ccpAttestation`.

const EMPTY_FORM = {
  documentNumber: "",
  buyerName: "",
  location: "",
  titleDeedNumber: "",
  constructionType: "",
  pcoNumber: "",
};

const useCCPAttestation = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.ccpAttestation || null);
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
      const existing = app.additionalDetails?.ccpAttestation || null;
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
              ccpAttestation: payload,
            },
          },
        },
      });
      const echoed = Array.isArray(putResp?.Application)
        ? putResp?.Application?.[0]?.additionalDetails?.ccpAttestation
        : putResp?.Application?.additionalDetails?.ccpAttestation;
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

const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
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

const CCPAttestationModal = ({
  isOpen, onClose, applicationNumber, existingData, onSubmit,
  isViewMode, isEditMode, setIsEditMode, isLoading,
}) => {
  const [form, setForm] = useState(existingData || EMPTY_FORM);
  const isDisabled = isViewMode && !isEditMode;

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...(existingData || {}) });
  }, [existingData]);

  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      <div className="flex flex-col h-full bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Attestation de conformité aux normes parasismiques</h2>
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
                  onClick={() => onSubmit(form)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading
                    ? "Enregistrement…"
                    : existingData
                      ? <React.Fragment><LuCheck className="h-4 w-4" /> Mettre à jour</React.Fragment>
                      : <React.Fragment><LuSave className="h-4 w-4" /> Enregistrer</React.Fragment>}
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg" title="Fermer">
                <LuX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          <div className="mb-6 pb-2 border-b-2 border-djibouti-primary/20">
            <h3 className="text-xl font-bold text-gray-900">Données de l'attestation</h3>
            <p className="text-sm text-gray-500 mt-1">Ces informations seront reportées sur le document signé.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="N° de l'attestation" hint="Format : P14-CCP-002/YYYY">
              <Input type="text" value={form.documentNumber} onChange={setField("documentNumber")} disabled={isDisabled} placeholder="P14-CCP-002/YYYY" />
            </Field>

            <Field label="N° de PCO" hint="Permis de Construire d'Origine">
              <Input type="text" value={form.pcoNumber} onChange={setField("pcoNumber")} disabled={isDisabled} placeholder="264/2017" />
            </Field>

            <Field label="Parcelle achetée par" hint="Acheteur de la parcelle (si distinct du propriétaire)" className="md:col-span-2">
              <Input type="text" value={form.buyerName} onChange={setField("buyerName")} disabled={isDisabled} placeholder="ex. Madame AMINA ABDI SOULEIMAN" />
            </Field>

            <Field label="Localisation" className="md:col-span-2">
              <Input type="text" value={form.location} onChange={setField("location")} disabled={isDisabled} placeholder="ex. Sise Haramous lot N°322 A bis" />
            </Field>

            <Field label="Objet du Titre Foncier (TF N°)">
              <Input type="text" value={form.titleDeedNumber} onChange={setField("titleDeedNumber")} disabled={isDisabled} placeholder="10 339" />
            </Field>

            <Field label="Type de construction">
              <Input type="text" value={form.constructionType} onChange={setField("constructionType")} disabled={isDisabled} placeholder="Simple Rez-de-chaussée de type F4…" />
            </Field>

            <Field label="Description détaillée (optionnel)" className="md:col-span-2">
              <Textarea
                rows={3}
                value={form.constructionDescription || ""}
                onChange={setField("constructionDescription")}
                disabled={isDisabled}
                placeholder="ex. Simple Rez-de-chaussée de type F4 sur une parcelle de 500 m²"
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

const CCPAttestationCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useCCPAttestation(tenantId, serviceCode, applicationNumber);
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
          isSubmitted
            ? "bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark"
            : "bg-gradient-to-r from-amber-400 to-amber-500"}`} />
        <div className="flex flex-col gap-6 p-6 min-h-full">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSubmitted ? "bg-djibouti-primary/10" : "bg-amber-100/70"}`}>
              <LuFileText className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Attestation parasismique — données</h3>
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
                <p className="text-xs text-gray-500">
                  Soumis par <span className="font-medium text-gray-700">{data.submittedByName}</span>
                </p>
              )}
            </div>
          </div>

          {!isSubmitted && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Saisir les informations qui figureront sur l'attestation signée : numéro de document, acheteur de la parcelle, localisation, titre foncier, type de construction et numéro de PCO.
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
                {isSubmitted ? <LuPen className="h-4 w-4" /> : <LuFileText className="h-4 w-4" />}
                {isSubmitted ? "Modifier" : "Remplir l'attestation"}
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
          </div>
        </div>
      </div>

      <CCPAttestationModal
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

export default CCPAttestationCard;
