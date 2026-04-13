import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LuX, LuSave, LuCheck, LuPen, LuPlus, LuTrash2 } from "react-icons/lu";

const DEFAULT_FORM = {
  beneficiaryName: "",
  location: "",
  lotNumbers: "",
  landTitleNumber: "",
  siteVisitDate: "",
  labTests: [
    { couche: "Première couche", surface: "", date: "" },
  ],
  cotesTravaux: {
    angleNordEst: "",
    angleNordOuest: "",
    angleSudEst: "",
    angleSudOuest: "",
  },
  coteVoieExistante: "",
};

const CCRChecklistModal = ({
  isOpen,
  onClose,
  applicationNumber,
  service,
  serviceCode,
  state,
  onSuccess,
  isViewMode = false,
  isViewOnly = false,
  existingData = null,
}) => {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tenantId = Digit.ULBService.getCurrentTenantId();

  useEffect(() => {
    if (existingData) {
      setFormData({
        beneficiaryName: existingData.beneficiaryName || "",
        location: existingData.location || "",
        lotNumbers: existingData.lotNumbers || "",
        landTitleNumber: existingData.landTitleNumber || "",
        siteVisitDate: existingData.siteVisitDate || "",
        labTests: existingData.labTests || [{ couche: "Première couche", surface: "", date: "" }],
        cotesTravaux: existingData.cotesTravaux || { angleNordEst: "", angleNordOuest: "", angleSudEst: "", angleSudOuest: "" },
        coteVoieExistante: existingData.coteVoieExistante || "",
      });
    }
  }, [existingData]);

  var handleChange = function (field, value) {
    setFormData(function (prev) { return Object.assign({}, prev, { [field]: value }); });
  };

  var handleCoteChange = function (field, value) {
    setFormData(function (prev) {
      return Object.assign({}, prev, { cotesTravaux: Object.assign({}, prev.cotesTravaux, { [field]: value }) });
    });
  };

  var handleLabTestChange = function (index, field, value) {
    setFormData(function (prev) {
      var tests = prev.labTests.slice();
      tests[index] = Object.assign({}, tests[index], { [field]: value });
      return Object.assign({}, prev, { labTests: tests });
    });
  };

  var addLabTest = function () {
    setFormData(function (prev) {
      var num = prev.labTests.length + 1;
      var label = num === 1 ? "Première couche" : num === 2 ? "Deuxième couche" : num + "ème couche";
      return Object.assign({}, prev, { labTests: prev.labTests.concat([{ couche: label, surface: "", date: "" }]) });
    });
  };

  var removeLabTest = function (index) {
    setFormData(function (prev) {
      return Object.assign({}, prev, { labTests: prev.labTests.filter(function (_, i) { return i !== index; }) });
    });
  };

  var handleSave = async function () {
    setIsSaving(true);
    try {
      var currentUser = Digit.UserService.getUser();
      var currentTimestamp = new Date().toISOString();
      var isEdit = Boolean(existingData);

      var checklistData = Object.assign({}, formData, {
        submittedAt: isEdit ? existingData.submittedAt : currentTimestamp,
        submittedBy: isEdit ? existingData.submittedBy : currentUser?.info?.uuid,
        submittedByName: isEdit ? existingData.submittedByName : (currentUser?.info?.name || "Utilisateur inconnu"),
        lastEditedAt: currentTimestamp,
        lastEditedBy: currentUser?.info?.uuid,
        lastEditedByName: currentUser?.info?.name || "Utilisateur inconnu",
        service: service,
        state: state,
      });

      // GET current application
      var getReq = {
        url: "/public-service/v1/application/" + serviceCode,
        method: "GET",
        headers: { "X-Tenant-Id": tenantId },
        params: { applicationNumber: applicationNumber, tenantId: tenantId },
      };
      var appResp = await Digit.CustomService.getResponse(getReq);
      var currentApp = Array.isArray(appResp?.Application) ? appResp.Application[0] : appResp?.Application;

      if (!currentApp) throw new Error("Application not found");

      // PUT with updated additionalDetails
      var putReq = {
        url: "/public-service/v1/application/" + serviceCode,
        method: "PUT",
        headers: { "X-Tenant-Id": tenantId },
        body: {
          RequestInfo: {
            apiId: "Rainmaker", ver: "1.0", ts: Date.now(), action: "UPDATE",
            did: "1", key: "", msgId: "20170310130900|en_IN", requesterId: "",
            authToken: Digit.UserService.getUser()?.access_token,
          },
          Application: Object.assign({}, currentApp, {
            workflow: Object.assign({}, currentApp.workflow || {}, { action: "" }),
            additionalDetails: Object.assign({}, currentApp.additionalDetails, {
              ccrChecklist: checklistData,
            }),
          }),
        },
      };

      await Digit.CustomService.getResponse(putReq);
      setShowSuccess(true);
      setTimeout(function () {
        setShowSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error saving CCR checklist:", error);
      if (Digit.Toast) Digit.Toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  var isEditable = !isViewMode || isEditMode;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex flex-col" onClick={onClose}>
      <div className="bg-white w-full h-full overflow-hidden flex flex-col" onClick={function (e) { e.stopPropagation(); }}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Fiche de contrôle — Certificat de Conformité de Remblai</h2>
              <p className="text-sm text-white/80">Dossier : {applicationNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              {isViewMode && !isEditMode && existingData && !isViewOnly && (
                <button onClick={function () { setIsEditMode(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  <LuPen className="h-4 w-4" /> Modifier
                </button>
              )}
              {isEditable && (
                <button onClick={handleSave} disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-djibouti-primary hover:bg-white/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {isSaving ? "Enregistrement..." : existingData ? <span className="inline-flex items-center gap-2"><LuCheck className="h-4 w-4" /> Mettre à jour</span> : <span className="inline-flex items-center gap-2"><LuSave className="h-4 w-4" /> Enregistrer</span>}
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><LuX className="h-5 w-5" /></button>
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

          {/* Beneficiary Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informations du bénéficiaire</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "beneficiaryName", label: "Nom du bénéficiaire", placeholder: "Mr/Mme..." },
                { key: "location", label: "Localisation (Sise)", placeholder: "Ex: HERON EXTENSION" },
                { key: "lotNumbers", label: "Numéro(s) de lot", placeholder: "Ex: lot n°116, 117, et 118" },
                { key: "landTitleNumber", label: "Numéro du Titre Foncier", placeholder: "Ex: n°24295" },
                { key: "siteVisitDate", label: "Date de visite de terrain", placeholder: "", type: "date" },
              ].map(function (f) {
                return (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                    {isEditable ? (
                      <input type={f.type || "text"} value={formData[f.key]} onChange={function (e) { handleChange(f.key, e.target.value); }}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 transition-all" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 py-2.5">{formData[f.key] || "-"}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lab Tests Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Tests du laboratoire</h4>
              </div>
              {isEditable && (
                <button onClick={addLabTest}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-djibouti-primary border border-djibouti-primary/30 bg-djibouti-primary/5 hover:bg-djibouti-primary/10 transition-all">
                  <LuPlus className="h-3.5 w-3.5" /> Ajouter une couche
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase w-12">#</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase">Couche</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase">Surface (m²)</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase">Date du test</th>
                    {isEditable && <th className="border border-gray-200 p-3 w-16"></th>}
                  </tr>
                </thead>
                <tbody>
                  {formData.labTests.map(function (test, i) {
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-gray-200 p-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="border border-gray-200 p-3">
                          {isEditable ? (
                            <input type="text" value={test.couche} onChange={function (e) { handleLabTestChange(i, "couche", e.target.value); }}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all" />
                          ) : <span className="text-sm">{test.couche}</span>}
                        </td>
                        <td className="border border-gray-200 p-3">
                          {isEditable ? (
                            <input type="text" value={test.surface} onChange={function (e) { handleLabTestChange(i, "surface", e.target.value); }}
                              placeholder="m²" className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all" />
                          ) : <span className="text-sm">{test.surface || "-"}</span>}
                        </td>
                        <td className="border border-gray-200 p-3">
                          {isEditable ? (
                            <input type="date" value={test.date} onChange={function (e) { handleLabTestChange(i, "date", e.target.value); }}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all" />
                          ) : <span className="text-sm">{test.date || "-"}</span>}
                        </td>
                        {isEditable && (
                          <td className="border border-gray-200 p-3">
                            {formData.labTests.length > 1 && (
                              <button onClick={function () { removeLabTest(i); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <LuTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Côtes Table */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Situation du terrain — Mesures relevées</h4>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase w-12">N°</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase">Situation du terrain</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase">Point</th>
                    <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase w-40">Mesure relevée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "angleNordEst", label: "Angle Nord-est" },
                    { key: "angleNordOuest", label: "Angle Nord-Ouest" },
                    { key: "angleSudEst", label: "Angle Sud-est" },
                    { key: "angleSudOuest", label: "Angle Sud-ouest" },
                  ].map(function (item, i) {
                    return (
                      <tr key={item.key} className="hover:bg-gray-50 transition-colors">
                        {i === 0 && <td className="border border-gray-200 p-3 text-sm font-medium text-gray-600 text-center" rowSpan={4}>1</td>}
                        {i === 0 && <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700" rowSpan={4}>Côte de travaux finis</td>}
                        <td className="border border-gray-200 p-3 text-sm text-gray-700">{item.label}</td>
                        <td className="border border-gray-200 p-3">
                          {isEditable ? (
                            <div className="flex items-center gap-1">
                              <input type="text" value={formData.cotesTravaux[item.key]}
                                onChange={function (e) { handleCoteChange(item.key, e.target.value); }}
                                placeholder="0.00" className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all" />
                              <span className="text-xs text-gray-400">m</span>
                            </div>
                          ) : <span className="text-sm font-semibold">{formData.cotesTravaux[item.key] ? formData.cotesTravaux[item.key] + " m" : "-"}</span>}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-sm font-medium text-gray-600 text-center">2</td>
                    <td className="border border-gray-200 p-3 text-sm font-medium text-gray-700" colSpan={2}>Côtes de la Voie Existante</td>
                    <td className="border border-gray-200 p-3">
                      {isEditable ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={formData.coteVoieExistante}
                            onChange={function (e) { handleChange("coteVoieExistante", e.target.value); }}
                            placeholder="0.00" className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all" />
                          <span className="text-xs text-gray-400">m</span>
                        </div>
                      ) : <span className="text-sm font-semibold">{formData.coteVoieExistante ? formData.coteVoieExistante + " m" : "-"}</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CCRChecklistModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicationNumber: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  serviceCode: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool,
  existingData: PropTypes.object,
};

export default CCRChecklistModal;
