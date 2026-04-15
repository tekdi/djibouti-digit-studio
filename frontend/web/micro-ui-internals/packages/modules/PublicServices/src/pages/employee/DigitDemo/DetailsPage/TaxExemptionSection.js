import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuShieldCheck, LuUpload, LuFileText, LuCalendar, LuHash, LuTrash2, LuCheck,
  LuCircleAlert, LuDownload, LuEye, LuPen, LuSave, LuX,
} from "react-icons/lu";

// Detect viewer type from file name
const isImageFile = (name = "") => /\.(jpe?g|png|gif|webp|bmp)$/i.test(name);
const isPdfFile = (name = "") => /\.pdf$/i.test(name);

/**
 * BPA_PL specific — Tax Exemption section on the Payments tab.
 *
 * Lets the SRA upload an "Attestation / document d'exonération" together with
 * its reference number and date. Persisted at
 *   `application.additionalDetails.taxExemption = { fileStoreId, fileName, referenceNumber, date, ... }`
 */

const TaxExemptionSection = ({ service, applicationNumber, isViewOnly = false }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  const serviceCode = queryStrings?.serviceCode;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [referenceNumber, setReferenceNumber] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null); // { fileStoreId, fileName, size }
  const fileInputRef = useRef(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationNumber || !serviceCode) return null;
    return await Digit.CustomService.getResponse({
      url: `/public-service/v1/application/${serviceCode}`,
      method: "GET",
      headers: {
        "X-Tenant-Id": tenantId,
        "auth-token": Digit.UserService.getUser()?.access_token,
      },
      params: { applicationNumber, tenantId },
    });
  }, [applicationNumber, serviceCode, tenantId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await fetchApplication();
      const ex = resp?.Application?.[0]?.additionalDetails?.taxExemption || null;
      setData(ex);
      setReferenceNumber(ex?.referenceNumber || "");
      setDate(ex?.date || "");
      setFile(ex?.fileStoreId ? { fileStoreId: ex.fileStoreId, fileName: ex.fileName, size: ex.size } : null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApplication]);

  useEffect(() => { refresh(); }, [refresh]);

  // Resolve the file's download URL whenever the file changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!file?.fileStoreId) { setDownloadUrl(null); return; }
      try {
        const resp = await Digit.CustomService.getResponse({
          url: "/filestore/v1/files/url",
          method: "GET",
          headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
          params: { tenantId, fileStoreIds: file.fileStoreId },
        });
        const raw = resp?.[file.fileStoreId];
        if (!cancelled) setDownloadUrl(raw ? (raw.includes(",") ? raw.split(",")[0].trim() : raw) : null);
      } catch (e) {
        if (!cancelled) setDownloadUrl(null);
      }
    })();
    return () => { cancelled = true; };
  }, [file, tenantId]);

  const handleUpload = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", selected);
      fd.append("tenantId", tenantId);
      fd.append("module", "DigitStudio");
      const resp = await Digit.CustomService.getResponse({
        url: "/filestore/v1/files",
        method: "POST",
        body: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileStoreId = resp?.files?.[0]?.fileStoreId;
      if (!fileStoreId) throw new Error("Échec du téléchargement");
      setFile({ fileStoreId, fileName: selected.name, size: selected.size });
    } catch (err) {
      setError("Échec du téléchargement du fichier");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const resp = await fetchApplication();
      const app = resp?.Application?.[0];
      if (!app) throw new Error("Application introuvable");

      const currentUser = Digit.UserService.getUser();
      const nowISO = new Date().toISOString();
      const previous = app.additionalDetails?.taxExemption || null;

      const payload = {
        ...(previous || {}),
        referenceNumber,
        date,
        fileStoreId: file?.fileStoreId || null,
        fileName: file?.fileName || null,
        size: file?.size || null,
        lastEditedAt: nowISO,
        lastEditedBy: currentUser?.info?.uuid,
        lastEditedByName: currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
        submittedAt: previous?.submittedAt || nowISO,
        submittedBy: previous?.submittedBy || currentUser?.info?.uuid,
        submittedByName: previous?.submittedByName ||
          currentUser?.info?.name || currentUser?.info?.userName || "Utilisateur inconnu",
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
              taxExemption: payload,
            },
          },
        },
      });
      setData(payload);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const isSubmitted = !!data?.submittedAt;
  const isEditable = !isViewOnly && (isEditing || !isSubmitted);
  const formIsValid = file && referenceNumber.trim() && date;

  if (service !== "BPA_PL") return null;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
              <LuShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Document d'exonération</h2>
              <p className="text-xs text-gray-500">
                Référence et date du document d'exonération de taxe
              </p>
            </div>
          </div>
          {isSubmitted && !isEditing && !isViewOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-50"
            >
              <LuPen className="h-3.5 w-3.5" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {showSuccess && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <LuCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Enregistré avec succès</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <LuCircleAlert className="h-4 w-4" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {isLoading && !data ? (
          <div className="text-sm text-gray-500 italic">Chargement…</div>
        ) : (
          <div>
            {/* Read-only display when submitted and not editing */}
            {isSubmitted && !isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <LuHash className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Numéro de référence
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {data.referenceNumber || <span className="italic font-normal text-gray-400">—</span>}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <LuCalendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Date du document
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {data.date
                      ? new Date(data.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                      : <span className="italic font-normal text-gray-400">—</span>}
                  </p>
                </div>

                <div className="md:col-span-2 rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                      <LuFileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{data.fileName || "Document"}</p>
                      {data.size > 0 && (
                        <p className="text-xs text-gray-500">{(data.size / 1024 / 1024).toFixed(2)} MB</p>
                      )}
                    </div>
                  </div>
                  {downloadUrl && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all"
                      >
                        <LuEye className="h-3.5 w-3.5" />
                        Voir
                      </button>
                      <a
                        href={downloadUrl}
                        download={data.fileName}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-600 transition-all"
                      >
                        <LuDownload className="h-3.5 w-3.5" />
                        Télécharger
                      </a>
                    </div>
                  )}
                </div>

                {data.lastEditedByName && (
                  <p className="md:col-span-2 text-xs text-gray-500">
                    Dernière modification par <span className="font-semibold text-gray-700">{data.lastEditedByName}</span>
                    {data.lastEditedAt && (
                      <span> le {new Date(data.lastEditedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </p>
                )}
              </div>
            ) : isViewOnly && !isSubmitted ? (
              <p className="text-sm italic text-gray-500">Aucun document d'exonération soumis.</p>
            ) : (
              /* Edit form */
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <LuHash className="h-3.5 w-3.5" /> Numéro de référence
                    </span>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="ex. EXO-2026-1234"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <LuCalendar className="h-3.5 w-3.5" /> Date du document
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </label>
                </div>

                {/* File upload */}
                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-emerald-50/40 to-white hover:border-emerald-400 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
                  >
                    <LuUpload className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">
                      {isUploading ? "Téléchargement..." : "Cliquez pour télécharger le document"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10 MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </button>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white flex-shrink-0">
                        <LuFileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.fileName}</p>
                        {file.size > 0 && (
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-all"
                      title="Retirer le fichier"
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); refresh(); }}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formIsValid || isSaving || isUploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSaving ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enregistrement...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <LuSave className="h-4 w-4" />
                        {data ? "Mettre à jour" : "Enregistrer"}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && downloadUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 flex flex-col"
          onClick={() => setShowPreview(false)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                <LuFileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{data?.fileName || "Document"}</p>
                <p className="text-xs text-gray-500">Aperçu du document d'exonération</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={downloadUrl}
                download={data?.fileName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-600 transition-all"
              >
                <LuDownload className="h-3.5 w-3.5" />
                Télécharger
              </a>
              <button
                onClick={() => setShowPreview(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
                title="Fermer"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {isImageFile(data?.fileName) ? (
              <img
                src={downloadUrl}
                alt={data?.fileName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
              />
            ) : isPdfFile(data?.fileName) ? (
              <iframe
                src={downloadUrl}
                title={data?.fileName}
                className="w-full h-full bg-white rounded-lg shadow-2xl"
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mx-auto mb-4">
                  <LuFileText className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Aperçu non disponible pour ce type de fichier
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Téléchargez le document pour le consulter dans l'application appropriée.
                </p>
                <a
                  href={downloadUrl}
                  download={data?.fileName}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-all"
                >
                  <LuDownload className="h-4 w-4" />
                  Télécharger {data?.fileName}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default TaxExemptionSection;
