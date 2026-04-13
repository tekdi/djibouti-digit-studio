import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "@egovernments/digit-ui-components";
import { LuX, LuSave, LuCheck, LuPen, LuUpload, LuEye, LuTrash2, LuFileText } from "react-icons/lu";
import {
  DOSSIER_DOCUMENTS_LIST, TECHNICAL_DOCUMENTS_LIST,
  DOSSIER_OBSERVATION_OPTIONS, TECHNICAL_OBSERVATION_OPTIONS, FINAL_OPINION_OPTIONS,
} from "./documentsData";

var buildEmptyDocs = function (list) {
  return list.map(function (doc) { return { id: doc.id, observations: [], comments: "", modifiedFiles: "" }; });
};

var PSSDECCInstructionSheetModal = function (props) {
  var isOpen = props.isOpen, onClose = props.onClose, applicationNumber = props.applicationNumber;
  var service = props.service, serviceCode = props.serviceCode, state = props.state;
  var onSuccess = props.onSuccess, isViewMode = props.isViewMode || false, existingData = props.existingData;

  var _s = useState({
    dossierDocuments: buildEmptyDocs(DOSSIER_DOCUMENTS_LIST),
    technicalDocuments: buildEmptyDocs(TECHNICAL_DOCUMENTS_LIST),
    finalComments: "", finalOpinion: "",
  }), formData = _s[0], setFormData = _s[1];

  var _e = useState({}), errors = _e[0], setErrors = _e[1];
  var _em = useState(false), isEditMode = _em[0], setIsEditMode = _em[1];
  var _t = useState(null), showToast = _t[0], setShowToast = _t[1];
  var _l = useState(false), isLoading = _l[0], setIsLoading = _l[1];
  var _u = useState({}), uploadingFiles = _u[0], setUploadingFiles = _u[1];

  var tenantId = Digit.ULBService.getCurrentTenantId();

  useEffect(function () {
    if (existingData) {
      setFormData({
        dossierDocuments: existingData.dossierDocuments || buildEmptyDocs(DOSSIER_DOCUMENTS_LIST),
        technicalDocuments: existingData.technicalDocuments || buildEmptyDocs(TECHNICAL_DOCUMENTS_LIST),
        finalComments: existingData.finalComments || "",
        finalOpinion: existingData.finalOpinion || "",
      });
    }
  }, [existingData]);

  var handleObsToggle = function (section, docId, value) {
    setFormData(function (prev) {
      var docs = prev[section].slice();
      var idx = docs.findIndex(function (d) { return d.id === docId; });
      if (idx === -1) return prev;
      var obs = docs[idx].observations.slice();
      var has = obs.indexOf(value);
      if (has >= 0) obs.splice(has, 1); else obs.push(value);
      docs[idx] = Object.assign({}, docs[idx], { observations: obs });
      return Object.assign({}, prev, { [section]: docs });
    });
  };

  var handleDocChange = function (section, docId, field, value) {
    setFormData(function (prev) {
      var docs = prev[section].slice();
      var idx = docs.findIndex(function (d) { return d.id === docId; });
      if (idx === -1) return prev;
      docs[idx] = Object.assign({}, docs[idx], { [field]: value });
      return Object.assign({}, prev, { [section]: docs });
    });
  };

  var handleInputChange = function (field, value) {
    setFormData(function (prev) { return Object.assign({}, prev, { [field]: value }); });
    if (errors[field]) setErrors(function (prev) { return Object.assign({}, prev, { [field]: undefined }); });
  };

  var handleFileUpload = async function (section, docId, files) {
    if (!files || files.length === 0) return;
    var file = files[0];
    var key = section + "_" + docId;
    setUploadingFiles(function (prev) { return Object.assign({}, prev, { [key]: true }); });
    try {
      var resp = await Digit.UploadServices.Filestorage("DIGIT_DJIBOUTI_FILES", file, tenantId);
      if (resp && resp.data && resp.data.files && resp.data.files[0]) {
        handleDocChange(section, docId, "modifiedFiles", resp.data.files[0].fileStoreId);
      }
    } catch (e) { console.error("Upload error:", e); }
    finally { setUploadingFiles(function (prev) { return Object.assign({}, prev, { [key]: false }); }); }
  };

  var onSubmit = async function () {
    var newErrors = {};
    if (!formData.finalOpinion) newErrors.finalOpinion = "L'avis final est obligatoire";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShowToast({ label: "Veuillez remplir les champs obligatoires", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      var currentUser = Digit.UserService.getUser();
      var ts = new Date().toISOString();
      var isEdit = Boolean(existingData);

      var sheetData = Object.assign({}, formData, {
        submittedAt: isEdit ? existingData.submittedAt : ts,
        submittedBy: isEdit ? existingData.submittedBy : currentUser?.info?.uuid,
        submittedByName: isEdit ? existingData.submittedByName : (currentUser?.info?.name || "Utilisateur inconnu"),
        lastEditedAt: ts, lastEditedBy: currentUser?.info?.uuid,
        lastEditedByName: currentUser?.info?.name || "Utilisateur inconnu",
        service: service, state: state, action: "SUBMIT",
        history: (existingData?.history || []).concat([{
          timestamp: ts, editedBy: currentUser?.info?.uuid,
          editedByName: currentUser?.info?.name || "Utilisateur inconnu",
          changes: { finalOpinion: formData.finalOpinion },
        }]),
      });

      var appResp = await Digit.CustomService.getResponse({
        url: "/public-service/v1/application/" + serviceCode, method: "GET",
        headers: { "X-Tenant-Id": tenantId }, params: { applicationNumber: applicationNumber, tenantId: tenantId },
      });
      var app = Array.isArray(appResp?.Application) ? appResp.Application[0] : appResp?.Application;
      if (!app) throw new Error("Application not found");

      await Digit.CustomService.getResponse({
        url: "/public-service/v1/application/" + serviceCode, method: "PUT",
        headers: { "X-Tenant-Id": tenantId },
        body: {
          RequestInfo: { apiId: "Rainmaker", ver: "1.0", ts: Date.now(), action: "UPDATE", did: "1", key: "", msgId: "20170310130900|en_IN", requesterId: "", authToken: Digit.UserService.getUser()?.access_token },
          Application: Object.assign({}, app, {
            workflow: Object.assign({}, app.workflow || {}, { action: "" }),
            additionalDetails: Object.assign({}, app.additionalDetails, { psSDECCInstructionSheet: sheetData }),
          }),
        },
      });

      setShowToast({ label: isEdit ? "Fiche mise à jour avec succès" : "Fiche enregistrée avec succès", isError: false });
      setTimeout(function () { onSuccess(); onClose(); }, 1500);
    } catch (e) {
      console.error("Error:", e);
      if (Digit.Toast) Digit.Toast.error("Erreur lors de l'enregistrement");
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  var isEditable = !isViewMode || isEditMode;
  var getColorClass = function (c) {
    return { emerald: "text-emerald-700", red: "text-red-700", amber: "text-amber-700", gray: "text-gray-700" }[c] || "text-gray-700";
  };

  var renderTable = function (title, section, docList, obsList) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h4>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                <th className="border border-gray-200 p-3 text-center text-xs font-semibold text-gray-600 w-12">#</th>
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 min-w-[250px]">Documents</th>
                <th className="border border-gray-200 p-3 text-center text-xs font-semibold text-gray-600 min-w-[220px]">Observations</th>
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 min-w-[180px]">Commentaires</th>
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 min-w-[180px]">Fichiers modificatifs</th>
              </tr>
            </thead>
            <tbody>
              {docList.map(function (doc) {
                var docData = formData[section].find(function (d) { return d.id === doc.id; }) || { observations: [], comments: "", modifiedFiles: "" };
                var availableOpts = doc.hasNonConcerned ? obsList : obsList.filter(function (o) { return o.value !== "NON_CONCERNE"; });
                var isDisabled = !isEditable;

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600">{doc.id}</td>
                    <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700">{doc.label}</td>
                    <td className="border border-gray-200 p-3">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        {availableOpts.map(function (opt) {
                          var checked = docData.observations.indexOf(opt.value) >= 0;
                          return (
                            <label key={opt.value} className={"flex items-center gap-2 cursor-pointer" + (isDisabled ? " opacity-50 cursor-not-allowed" : "")}>
                              <input type="checkbox" checked={checked} disabled={isDisabled}
                                onChange={function () { if (!isDisabled) handleObsToggle(section, doc.id, opt.value); }}
                                className="w-4 h-4 rounded border-2 cursor-pointer" />
                              <span className={"text-xs font-medium " + getColorClass(opt.color)}>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="border border-gray-200 p-3">
                      {isDisabled ? (
                        <div className="text-sm text-gray-700">{docData.comments || "Aucun"}</div>
                      ) : (
                        <textarea value={docData.comments} rows="2" placeholder="Commentaires..."
                          onChange={function (e) { handleDocChange(section, doc.id, "comments", e.target.value); }}
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-djibouti-primary transition-colors" />
                      )}
                    </td>
                    <td className="border border-gray-200 p-3">
                      {docData.modifiedFiles ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Fichier joint</span>
                          {!isDisabled && (
                            <button onClick={function () { handleDocChange(section, doc.id, "modifiedFiles", ""); }}
                              className="p-1 text-red-400 hover:text-red-600 rounded"><LuTrash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                      ) : !isDisabled ? (
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                          <input type="file" accept=".pdf" className="hidden"
                            onChange={function (e) { handleFileUpload(section, doc.id, e.target.files); }}
                            disabled={uploadingFiles[section + "_" + doc.id]} />
                          {uploadingFiles[section + "_" + doc.id] ? "..." : <span className="inline-flex items-center gap-1"><LuUpload className="h-3.5 w-3.5" />PDF</span>}
                        </label>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      {showToast && <Toast label={showToast.label} isError={showToast.isError} onClose={function () { setShowToast(null); }} />}
      <div className="flex flex-col h-full bg-white" onClick={function (e) { e.stopPropagation(); }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Fiche technique SDECC — Surélévation</h2>
              <p className="text-sm text-white/80">Dossier : {applicationNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              {isViewMode && !isEditMode && existingData && (
                <button onClick={function () { setIsEditMode(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  <LuPen className="h-4 w-4" /> Modifier
                </button>
              )}
              {isEditable && (
                <button onClick={onSubmit} disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {isLoading ? "Enregistrement..." : existingData ? <span className="inline-flex items-center gap-2"><LuCheck className="h-4 w-4" />Mettre à jour</span> : <span className="inline-flex items-center gap-2"><LuSave className="h-4 w-4" />Enregistrer</span>}
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><LuX className="h-5 w-5" /></button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 bg-white overflow-y-auto flex-1">
          {renderTable("Contenu du dossier (Pièces)", "dossierDocuments", DOSSIER_DOCUMENTS_LIST, DOSSIER_OBSERVATION_OPTIONS)}
          {renderTable("Contrôle technique", "technicalDocuments", TECHNICAL_DOCUMENTS_LIST, TECHNICAL_OBSERVATION_OPTIONS)}

          {/* Final opinion */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block mb-3 font-semibold text-base text-gray-800">
                Commentaires <span className="text-gray-500 font-normal">(Optionnel)</span>
              </label>
              {!isEditable ? (
                <div className="w-full min-h-[100px] p-4 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700">{formData.finalComments || "Aucun commentaire."}</div>
              ) : (
                <textarea value={formData.finalComments || ""} onChange={function (e) { handleInputChange("finalComments", e.target.value); }}
                  placeholder="Commentaires..." className="w-full min-h-[100px] p-4 border-2 border-gray-200 rounded-xl text-sm resize-y outline-none focus:border-djibouti-primary" />
              )}
            </div>
            <div>
              <label className="block mb-3 font-semibold text-base text-gray-800">Avis final <span className="text-red-500">*</span></label>
              {!isEditable ? (
                formData.finalOpinion && (
                  <span className={"inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold " + (formData.finalOpinion === "FAVORABLE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {FINAL_OPINION_OPTIONS.find(function (o) { return o.value === formData.finalOpinion; })?.label}
                  </span>
                )
              ) : (
                <div className="flex items-center gap-6">
                  {FINAL_OPINION_OPTIONS.map(function (opt) {
                    var selected = formData.finalOpinion === opt.value;
                    return (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                        <div className={"relative w-14 h-8 rounded-full transition-all duration-300 " + (selected ? (opt.value === "FAVORABLE" ? "bg-emerald-500" : "bg-red-500") : "bg-gray-300")}>
                          <div className={"absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 " + (selected ? "translate-x-6" : "translate-x-0")} />
                        </div>
                        <span className={"text-base font-semibold transition-colors " + (selected ? (opt.value === "FAVORABLE" ? "text-emerald-700" : "text-red-700") : "text-gray-500")}>
                          Avis {opt.label}
                        </span>
                        <input type="radio" name="psSDECCFinalOpinion" value={opt.value} checked={selected}
                          onChange={function (e) { handleInputChange("finalOpinion", e.target.value); }} className="sr-only" />
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.finalOpinion && <p className="text-red-500 text-xs mt-1">{errors.finalOpinion}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PSSDECCInstructionSheetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired, service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired, state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired, isViewMode: PropTypes.bool, existingData: PropTypes.object,
};

export default PSSDECCInstructionSheetModal;
