import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuCircleCheck, LuClipboardList, LuClock, LuEye, LuPen, LuX, LuSave, LuCheck,
  LuCamera, LuTrash2, LuUpload,
} from "react-icons/lu";

/**
 * BPA_CCG — Procès-Verbal de Visite (Instruction Certificat de Conformité Générale).
 *
 * Sections (matching the paper PV):
 *   I)  Informations générales (demandeur, contact, localisation, nature du projet)
 *   II) Pièces administratives (PCO, Conformité Électrique, Parasismique, Alignement clôture)
 *   III) Tableau de conformité du projet réalisé (8 lignes × Permis / Travaux / Prescriptions / Observation)
 *   IV) Prises photographiques (upload multi-images)
 *   V)  Signatures (Agent SRA, Chef Service SRA — date + nom)
 *   VI) Observations du Chef SRA
 *   VII) Avis du SDATU
 *   VIII) Avis final (Conforme / Non conforme)
 *
 * Persisted at `application.additionalDetails.ccgVisitChecklist`.
 */

const CONFORMITY_ROWS = [
  { id: "cos", label: "Coefficient d'Occupation du Sol" },
  { id: "ces", label: "Coefficient d'Emprise au Sol" },
  { id: "reculNord", label: "Recul antérieur Nord" },
  { id: "reculSud", label: "Recul antérieur Sud" },
  { id: "reculEst", label: "Recul antérieur Est" },
  { id: "reculOuest", label: "Recul antérieur Ouest" },
  { id: "distancesEntreConstructions", label: "Distances entre les constructions" },
  { id: "hauteur", label: "Hauteur" },
];

const OBSERVATION_OPTIONS = [
  { value: "CONFORME", label: "Conforme" },
  { value: "NON_CONFORME", label: "Non conforme" },
  { value: "REGULARISABLE", label: "Régularisable" },
];

const buildEmptyConformity = () =>
  CONFORMITY_ROWS.reduce((acc, row) => {
    acc[row.id] = { permis: "", realized: "", prescription: "", observation: "" };
    return acc;
  }, {});

const EMPTY_FORM = {
  // I) Informations générales
  applicantName: "",
  applicantContact: "",
  constructionLocation: "",
  projectNature: "",
  // II) Pièces administratives
  pcoNumber: "",
  electricalConformityNumber: "",
  seismicCertificateNumber: "",
  fenceAlignmentCertificateNumber: "",
  // III) Conformité
  conformity: buildEmptyConformity(),
  // IV) Photos
  photos: [],
  // V) Signatures
  agentSraName: "",
  agentSraDate: "",
  chefSraName: "",
  chefSraDate: "",
  // VI) Observations Chef SRA
  chefSraObservations: "",
  // VII) Avis SDATU
  sdatuAvis: "",
  // VIII) Avis final
  finalOpinion: "", // CONFORME | NON_CONFORME
};

// ---------- Data hook ----------

const useCCGChecklist = (tenantId, serviceCode, applicationNumber) => {
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
      setData(app?.additionalDetails?.ccgVisitChecklist || null);
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
      const existing = app.additionalDetails?.ccgVisitChecklist || null;
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
              ccgVisitChecklist: payload,
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

// ---------- Photo upload helpers ----------

const uploadPhotoToFilestore = async (file) => {
  const tenantId = Digit?.ULBService?.getCurrentTenantId();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("tenantId", tenantId);
  fd.append("module", "DigitStudio");
  const resp = await Digit.CustomService.getResponse({
    url: "/filestore/v1/files",
    method: "POST",
    body: fd,
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!resp?.files?.[0]?.fileStoreId) throw new Error("Upload failed");
  return {
    fileName: file.name,
    fileStoreId: resp.files[0].fileStoreId,
    size: file.size,
    documentType: file.type,
  };
};

const fetchPhotoUrl = async (fileStoreId) => {
  const tenantId = Digit?.ULBService?.getCurrentTenantId();
  const resp = await Digit.CustomService.getResponse({
    url: "/filestore/v1/files/url",
    method: "GET",
    headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
    params: { tenantId, fileStoreIds: fileStoreId },
  });
  if (!resp || !resp[fileStoreId]) return null;
  const raw = resp[fileStoreId];
  return raw.includes(",") ? raw.split(",")[0].trim() : raw;
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

// ---------- Photo gallery sub-component ----------

const PhotoGallery = ({ photos, isEditable, onUpload, onRemove }) => {
  const [urls, setUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = {};
      for (const photo of photos) {
        if (!photo?.fileStoreId) continue;
        try {
          const u = await fetchPhotoUrl(photo.fileStoreId);
          if (u) next[photo.fileStoreId] = u;
        } catch (e) { /* ignore */ }
      }
      if (!cancelled) setUrls(next);
    })();
    return () => { cancelled = true; };
  }, [photos]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        try { uploaded.push(await uploadPhotoToFilestore(f)); }
        catch (err) { console.error(err); }
      }
      if (uploaded.length) onUpload(uploaded);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      {isEditable && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:border-djibouti-primary/50 hover:bg-djibouti-primary/5 transition-all cursor-pointer relative mb-4"
          onClick={() => fileInputRef.current?.click()}
        >
          <LuUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">
            {uploading ? "Téléchargement..." : "Cliquez pour ajouter des photos"}
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG (max 10 MB chacune)</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </div>
      )}

      {photos.length === 0 && !isEditable && (
        <p className="text-sm italic text-gray-500">Aucune photo ajoutée.</p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <div key={p.fileStoreId || i} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
              {urls[p.fileStoreId] ? (
                <img
                  src={urls[p.fileStoreId]}
                  alt={p.fileName}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(urls[p.fileStoreId])}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <LuCamera className="h-8 w-8" />
                </div>
              )}
              {isEditable && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Supprimer"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="Aperçu" className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ---------- Modal ----------

const CCGVisitModal = ({
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
    const ed = existingData || {};
    setForm({
      applicantName: ed.applicantName || "",
      applicantContact: ed.applicantContact || "",
      constructionLocation: ed.constructionLocation || "",
      projectNature: ed.projectNature || "",
      pcoNumber: ed.pcoNumber || "",
      electricalConformityNumber: ed.electricalConformityNumber || "",
      seismicCertificateNumber: ed.seismicCertificateNumber || "",
      fenceAlignmentCertificateNumber: ed.fenceAlignmentCertificateNumber || "",
      conformity: { ...buildEmptyConformity(), ...(ed.conformity || {}) },
      photos: Array.isArray(ed.photos) ? ed.photos.slice() : [],
      agentSraName: ed.agentSraName || "",
      agentSraDate: ed.agentSraDate || "",
      chefSraName: ed.chefSraName || "",
      chefSraDate: ed.chefSraDate || "",
      chefSraObservations: ed.chefSraObservations || "",
      sdatuAvis: ed.sdatuAvis || "",
      finalOpinion: ed.finalOpinion || "",
    });
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const isEditable = !isViewMode || isEditMode;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setConformity = (rowId, col) => (e) =>
    setForm((f) => ({
      ...f,
      conformity: { ...f.conformity, [rowId]: { ...f.conformity[rowId], [col]: e.target.value } },
    }));

  const onUploadPhotos = (uploaded) =>
    setForm((f) => ({ ...f, photos: [...(f.photos || []), ...uploaded] }));
  const onRemovePhoto = (idx) =>
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

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
              <h2 className="text-2xl font-bold mb-1">
                Procès-Verbal de Visite — Certificat de Conformité Générale
              </h2>
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

            {/* I) Informations générales */}
            <section>
              <SectionTitle>I) Informations générales</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nom du demandeur" className="md:col-span-2">
                  <Input value={form.applicantName} onChange={set("applicantName")} disabled={!isEditable}
                    placeholder="ex. Monsieur IBRAHIM ROBLEH GUEDI HARBI" />
                </Field>
                <Field label="Adresse / Numéro de téléphone">
                  <Input value={form.applicantContact} onChange={set("applicantContact")} disabled={!isEditable}
                    placeholder="ex. 77 65 40 80" />
                </Field>
                <Field label="Localisation de la construction">
                  <Input value={form.constructionLocation} onChange={set("constructionLocation")} disabled={!isEditable}
                    placeholder="ex. Lotissement Haramous, lot n°322" />
                </Field>
                <Field label="Nature du projet" className="md:col-span-2">
                  <Input value={form.projectNature} onChange={set("projectNature")} disabled={!isEditable}
                    placeholder="ex. Un Simple rez-de-chaussée" />
                </Field>
              </div>
            </section>

            {/* II) Pièces administratives */}
            <section>
              <SectionTitle>II) Pièces administratives</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Permis de Construire (PCO N°)">
                  <Input value={form.pcoNumber} onChange={set("pcoNumber")} disabled={!isEditable}
                    placeholder="ex. 264/2017" />
                </Field>
                <Field label="Certificat de Conformité Électrique N°">
                  <Input value={form.electricalConformityNumber} onChange={set("electricalConformityNumber")} disabled={!isEditable}
                    placeholder="ex. 159/2018" />
                </Field>
                <Field label="Certificat de Normes Parasismiques N°">
                  <Input value={form.seismicCertificateNumber} onChange={set("seismicCertificateNumber")} disabled={!isEditable}
                    placeholder="ex. 89/2024" />
                </Field>
                <Field label="Certificat d'Alignement de Clôture N°">
                  <Input value={form.fenceAlignmentCertificateNumber} onChange={set("fenceAlignmentCertificateNumber")} disabled={!isEditable}
                    placeholder="ex. 792/2025" />
                </Field>
              </div>
            </section>

            {/* III) Conformité du projet réalisé */}
            <section>
              <SectionTitle>III) Conformité du projet réalisé</SectionTitle>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Élément</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Annexés au PC</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Travaux Réalisés</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Prescriptions réglementaires</th>
                      <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Observations du DATUH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONFORMITY_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{row.label}</td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.conformity[row.id]?.permis || ""}
                            onChange={setConformity(row.id, "permis")} disabled={!isEditable} placeholder="—" />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.conformity[row.id]?.realized || ""}
                            onChange={setConformity(row.id, "realized")} disabled={!isEditable} placeholder="—" />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Input value={form.conformity[row.id]?.prescription || ""}
                            onChange={setConformity(row.id, "prescription")} disabled={!isEditable} placeholder="—" />
                        </td>
                        <td className="border border-gray-200 p-3">
                          <select
                            value={form.conformity[row.id]?.observation || ""}
                            onChange={setConformity(row.id, "observation")}
                            disabled={!isEditable}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 disabled:text-gray-500"
                          >
                            <option value="">—</option>
                            {OBSERVATION_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* IV) Prises photographiques */}
            <section>
              <SectionTitle>IV) Prises photographiques</SectionTitle>
              <PhotoGallery
                photos={form.photos}
                isEditable={isEditable}
                onUpload={onUploadPhotos}
                onRemove={onRemovePhoto}
              />
            </section>

            {/* V) Signatures */}
            <section>
              <SectionTitle>V) Signatures</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-3">Agent du SRA</p>
                  <div className="space-y-3">
                    <Field label="Nom">
                      <Input value={form.agentSraName} onChange={set("agentSraName")} disabled={!isEditable}
                        placeholder="ex. MOUKTAR IDRISS AGANEH" />
                    </Field>
                    <Field label="Date">
                      <Input type="date" value={form.agentSraDate} onChange={set("agentSraDate")} disabled={!isEditable} />
                    </Field>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-3">Chef du Service SRA</p>
                  <div className="space-y-3">
                    <Field label="Nom">
                      <Input value={form.chefSraName} onChange={set("chefSraName")} disabled={!isEditable}
                        placeholder="ex. NAFFISA AIFARAH CHARIF" />
                    </Field>
                    <Field label="Date">
                      <Input type="date" value={form.chefSraDate} onChange={set("chefSraDate")} disabled={!isEditable} />
                    </Field>
                  </div>
                </div>
              </div>
            </section>

            {/* VI) Observations Chef SRA */}
            <section>
              <SectionTitle>VI) Observations du Chef SRA</SectionTitle>
              <Textarea
                rows={5}
                value={form.chefSraObservations}
                onChange={set("chefSraObservations")}
                disabled={!isEditable}
                placeholder="Observations du Chef du Service SRA…"
              />
            </section>

            {/* VII) Avis SDATU */}
            <section>
              <SectionTitle>VII) Avis du SDATU</SectionTitle>
              <Textarea
                rows={4}
                value={form.sdatuAvis}
                onChange={set("sdatuAvis")}
                disabled={!isEditable}
                placeholder="Avis du SDATU…"
              />
            </section>

            {/* VIII) Avis final */}
            <section>
              <SectionTitle>VIII) Avis final</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button" disabled={!isEditable}
                  onClick={() => setForm((f) => ({ ...f, finalOpinion: "CONFORME" }))}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    form.finalOpinion === "CONFORME"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <LuCircleCheck className="h-5 w-5" /> Conforme
                </button>
                <button
                  type="button" disabled={!isEditable}
                  onClick={() => setForm((f) => ({ ...f, finalOpinion: "NON_CONFORME" }))}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    form.finalOpinion === "NON_CONFORME"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <LuX className="h-5 w-5" /> Non conforme
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Card ----------

const CCGVisitChecklistCard = ({ service, t, isViewOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const { serviceCode, applicationNumber } = Digit.Hooks.useQueryParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data, isLoading, submit } = useCCGChecklist(tenantId, serviceCode, applicationNumber);
  const isSubmitted = !!data?.submittedAt;

  if (!applicationNumber || !service) return null;

  const openEdit = () => { setIsViewMode(false); setIsOpen(true); };
  const openView = () => { setIsViewMode(true); setIsOpen(true); };

  const photoCount = Array.isArray(data?.photos) ? data.photos.length : 0;

  return (
    <div>
      <div className="group relative mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className={`absolute inset-x-0 top-0 h-1 ${
          isSubmitted ? "bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"}`} />

        <div className="flex flex-col gap-6 p-6 min-h-full">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isSubmitted ? "bg-djibouti-primary/10" : "bg-amber-100/70"}`}>
              <LuClipboardList className={`h-6 w-6 ${isSubmitted ? "text-djibouti-primary" : "text-amber-600"}`} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Procès-Verbal de Visite — Certificat de Conformité Générale
                </h3>
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
                  {photoCount > 0 && <> · {photoCount} photo{photoCount > 1 ? "s" : ""}</>}
                </p>
              )}
            </div>
          </div>

          {!isSubmitted && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Rédigez le procès-verbal de visite : informations générales, pièces administratives,
                tableau de conformité, photos, signatures et avis du SDATU.
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

      <CCGVisitModal
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

export default CCGVisitChecklistCard;
