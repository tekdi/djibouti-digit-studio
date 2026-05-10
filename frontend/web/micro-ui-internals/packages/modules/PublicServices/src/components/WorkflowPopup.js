import React, { useState, useEffect, useMemo, useRef } from "react";
import { Loader, UploadFile } from "@egovernments/digit-ui-components";
import { LuX, LuChevronDown, LuPaperclip } from "react-icons/lu";

const formatAssigneeUser = (user) => ({
  uuid: user?.uuid || null,
  userName: user?.userName || null,
  name: user?.name || null,
  mobileNumber: user?.mobileNumber || null,
  emailId: user?.emailId || null,
  type: user?.type || null,
  roles: user?.roles || null,
  tenantId: user?.tenantId || null,
  active: user?.active || null,
  permanentCity: user?.permanentCity || null,
  locale: user?.locale || null,
});

// Display name fallback — HRMS users sometimes only have userName/mobile.
const displayName = (emp) =>
  emp?.nameOfEmp ||
  emp?.user?.name ||
  emp?.user?.userName ||
  emp?.user?.mobileNumber ||
  emp?.code ||
  emp?.commissionerCode ||
  "—";

// Apply the approver filtering rules that used to live in modalConfig.js:
//   1. drop STUDIO_ADMIN users
//   2. drop users whose only role is in the ADD_QUERY action (those folks
//      shouldn't be assigned the file going forward, only commented at)
const applyApproverFilter = (approvers, action) => {
  if (!Array.isArray(approvers)) return [];
  const assignableRoles =
    action?.actions?.filter((a) => a.action !== "ADD_QUERY")?.flatMap((a) => a.roles || []) || [];
  const addQueryRoles = action?.actions?.find((a) => a.action === "ADD_QUERY")?.roles || [];

  return approvers.filter((approver) => {
    const userRoles = approver?.user?.roles?.map((r) => r.code) || [];
    if (userRoles.includes("STUDIO_ADMIN")) return false;
    const hasAssignableRole = userRoles.some((r) => assignableRoles.includes(r));
    const onlyHasAddQueryRoles = userRoles.length > 0 && userRoles.every((r) => addQueryRoles.includes(r));
    return hasAssignableRole || !onlyHasAddQueryRoles;
  });
};

// Lookup docConfig for the current businessService + action.
const resolveDocConfig = (documentConfig, moduleCode, businessService, actionString) => {
  const currentModule = `${moduleCode?.toLowerCase()}.${businessService.toLowerCase()}`;
  const actions = documentConfig?.find((ob) => ob?.module?.toLowerCase() === currentModule)?.actions;
  return actions?.find((item) => item?.action === actionString) || actions?.find((item) => item?.action === "DEFAULT") || {};
};

const fieldFromConfig = (docConfig, field, defaults = []) => {
  if (!docConfig || Object.keys(docConfig).length === 0) return defaults.includes(field);
  return !!docConfig?.[field]?.show;
};
const fieldIsMandatory = (docConfig, field) => !!docConfig?.[field]?.isMandatory;

// Payload builder — same logic as before, just expecting the same `data` shape.
const updatePayload = async (applicationDetails, data, action, businessService, tenantId, employees) => {
  const assigneeUsers = [];
  if (action?.action != "SEND_TO_CITIZEN_PAYMENT") {
    assigneeUsers.push(formatAssigneeUser(data?.assignee?.user));
  }

  const roleCodes = Digit.UserService.getUser()?.info?.roles?.map((role) => role.code);
  if (employees) {
    const filterEmployees = employees?.filter((emp) =>
      emp?.user?.roles?.some((role) => roleCodes.includes(role.code))
    );
    const users = filterEmployees?.map((emp) => formatAssigneeUser(emp?.user));
    assigneeUsers.push(...users);
  }

  const workflow = {
    comment: data.comments,
    documents: data?.document
      ? Object.values(data.document)
          .flat()
          .filter(Boolean)
          .map((d) => ({
            documentType: action?.action + " DOC",
            fileName: d?.fileName,
            fileStoreId: d?.fileStoreId,
            documentUid: d?.fileStoreId,
            tenantId: d?.tenantId,
          }))
      : [],
    action: action.action,
    businessService: businessService,
  };

  if (action?.action === "SEND_TO_CITIZEN_PAYMENT") {
    if (employees) {
      const filterEmployees = employees?.filter((emp) =>
        emp?.user?.roles?.some((role) => role.code === "COUNTER_EMPLOYEE")
      );
      const users = filterEmployees?.map((emp) => formatAssigneeUser(emp?.user));
      assigneeUsers.push(...users);
    }
  }

  if (action.action === "SEND_TO_COMMISSIONER") {
    const selectedCommissioners =
      data.commissioner?.map((c) => c.commissionerCode || c.code)?.join(",") || "";
    try {
      const commissionerCodes = data.commissioner?.map((c) => c.commissionerCode || c.code) || [];
      const businessServicesParam = commissionerCodes.join(",");
      const url = `/egov-workflow-v2/egov-wf/businessservice/_search?tenantId=${tenantId}&businessServices=${businessServicesParam}`;
      const businessServiceResponse = await Digit.CustomService.getResponse({ url });

      const businessServiceRoles = [];
      businessServiceResponse?.BusinessServices?.forEach((bs) => {
        bs.states?.forEach((state) => {
          if ((state.state === "" || state.state == null || state.state == "INITIATED") && state.actions) {
            state.actions.forEach((act) => {
              act.roles?.forEach((role) => {
                if (!businessServiceRoles.includes(role)) businessServiceRoles.push(role);
              });
            });
          }
        });
      });

      if (businessServiceRoles.length > 0) {
        const rolesParam = businessServiceRoles.join(",");
        const hrmsUrl = `/egov-hrms/employees/_search?tenantId=${tenantId}&roles=${rolesParam}&isActive=true`;
        const hrmsResponse = await Digit.CustomService.getResponse({ url: hrmsUrl });
        workflow.assignees = hrmsResponse?.Employees?.map((employee) => formatAssigneeUser(employee?.user));
      } else {
        workflow.assignees = [formatAssigneeUser(null)];
      }
    } catch (error) {
      console.error("Error fetching workflow or HRMS data:", error);
    }
    workflow.triggerSelectiveParallelWorkflows = selectedCommissioners;
  } else if (action.action == "ADD_QUERY") {
    workflow.assignees = applicationDetails?.workflow?.assignees;
  } else if (
    action.action != "ADD_QUERY" &&
    !action.isTerminateState &&
    action.action != "SEND_BACK_TO_ARCHITECT" &&
    action.action != "SEND_TO_COMMISSIONER" &&
    action.action != "SEND_BACK_TO_SOURCE"
  ) {
    workflow.assignees = assigneeUsers ? assigneeUsers : [];
  }

  Object.keys(workflow).forEach((key) => {
    if (!workflow[key] || workflow[key]?.length === 0) delete workflow[key];
  });

  applicationDetails = { ...applicationDetails, workflow };
  return { Application: applicationDetails };
};

// Single-select dropdown — no field label. Shows employee names.
const AssigneeDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value ? displayName(value) : ""}</span>
        <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {(!options || options.length === 0) ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucune option disponible</div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={opt?.user?.uuid || opt?.uuid || opt?.code || idx}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-primary/5 hover:text-primary border-b last:border-b-0 border-gray-100"
              >
                {displayName(opt)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Multi-select with chips — for SEND_TO_COMMISSIONER.
const MultiSelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isSelected = (opt) =>
    value?.some((v) => (v.commissionerCode || v.code) === (opt.commissionerCode || opt.code));
  const toggle = (opt) => {
    if (isSelected(opt)) {
      onChange(value.filter((v) => (v.commissionerCode || v.code) !== (opt.commissionerCode || opt.code)));
    } else {
      onChange([...(value || []), opt]);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className={value?.length ? "text-gray-900" : "text-gray-400"}>
          {value?.length ? `${value.length} sélectionné${value.length > 1 ? "s" : ""}` : placeholder || ""}
        </span>
        <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {value?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((v) => (
            <span key={v.commissionerCode || v.code} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {v.commissionerCode || v.code}
              <button type="button" onClick={() => toggle(v)} className="hover:text-red-600">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {(!options || options.length === 0) ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucune option disponible</div>
          ) : (
            options.map((opt, idx) => {
              const sel = isSelected(opt);
              return (
                <button
                  key={opt.commissionerCode || opt.code || idx}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b last:border-b-0 border-gray-100 flex items-center gap-2 ${sel ? "bg-primary/10 text-primary" : "hover:bg-gray-50"}`}
                >
                  <input type="checkbox" readOnly checked={sel} className="accent-primary" />
                  <span>{opt.commissionerCode || opt.code}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const WorkflowPopup = ({ applicationDetails, ...props }) => {
  const { action, tenantId, t, closeModal, submitAction, businessService, moduleCode } = props;

  const [assignee, setAssignee] = useState(null);
  const [commissioners, setCommissioners] = useState([]);
  const [comments, setComments] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [docFiles, setDocFiles] = useState({}); // { docName: [{fileStoreId, fileName, tenantId}] }
  const [submitting, setSubmitting] = useState(false);

  const assigneeRoles = action?.assigneeRoles?.toString();

  const { isLoading: isLoadingHrmsSearch, data: hrmsData } = Digit.Hooks.hrms.useHRMSSearch(
    { roles: assigneeRoles, isActive: true },
    tenantId,
    null,
    null,
    { enabled: action?.assigneeRoles?.length > 0 }
  );

  // MDMS document config
  const requestCriteria = {
    url: "/egov-mdms-service/v1/_search",
    body: {
      MdmsCriteria: {
        tenantId: Digit.ULBService.getCurrentTenantId(),
        moduleDetails: [{ moduleName: "DigitStudio", masterDetails: [{ name: "DocumentConfig" }] }],
      },
    },
    changeQueryName: "documentConfig",
  };
  const { isLoading: isLoadingDoc, data: docData } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const documentConfig = docData?.MdmsRes?.DigitStudio?.DocumentConfig;
  const docConfig = useMemo(
    () => resolveDocConfig(documentConfig, moduleCode, businessService, action?.action),
    [documentConfig, moduleCode, businessService, action?.action]
  );

  // Approvers — apply STUDIO_ADMIN/ADD_QUERY-only filter, mark a display name.
  const assigneeOptions = useMemo(() => {
    if (action?.action === "SEND_TO_COMMISSIONER" || action?.action === "SEND_TO_COMMISSION") {
      return action.triggerParallelWorkflows?.map((tg) => ({ commissionerCode: tg, code: tg })) || [];
    }
    const employees = hrmsData?.Employees || [];
    const roleCodes = Digit.UserService.getUser()?.info?.roles?.map((r) => r.code) || [];
    // Drop the current user themselves and anyone sharing only the user's roles —
    // matches the legacy filter behavior in modalConfig.js.
    const others = employees.filter((emp) => emp?.user?.roles?.some((role) => !roleCodes.includes(role.code)));
    const filtered = applyApproverFilter(others, action);
    filtered.forEach((emp) => (emp.nameOfEmp = emp?.user?.name || emp?.user?.userName || t("ES_COMMON_NA")));
    return filtered;
  }, [action, hrmsData?.Employees, t]);

  const isCommissionerAction = action?.action === "SEND_TO_COMMISSIONER" || action?.action === "SEND_TO_COMMISSION";
  const showAssignee =
    !isCommissionerAction &&
    fieldFromConfig(docConfig, "assignee", ["assignee", "comments"]) &&
    action?.action !== "ADD_QUERY" &&
    !action?.isTerminateState &&
    action?.action !== "SEND_BACK_TO_ARCHITECT" &&
    action?.action !== "SEND_TO_CITIZEN_PAYMENT" &&
    action?.action !== "SEND_BACK_TO_SOURCE" &&
    assigneeRoles?.length > 0;

  const showComments = fieldFromConfig(docConfig, "comments", ["assignee", "comments"]);
  const commentsMandatory = fieldIsMandatory(docConfig, "comments");
  const showAcceptTerms = fieldFromConfig(docConfig, "acceptTerms");

  const documents = docConfig?.documents || [];

  const headerKey = Digit.Utils.locale.getTransformedLocale(`WF_MODAL_HEADER_${businessService}_${action?.action}`);
  // Submit button text — hardcoded per action verb to avoid pushing
  // WF_MODAL_SUBMIT_<svc>_<action> for every (service × action) combo. The
  // title (header) carries the meaning; the button just executes.
  const submitLabel = (() => {
    const a = action?.action;
    if (a === "REJECT" || a === "REJECT_INSPECTION" || a === "REJECT_VERIFICATION" || a === "REJECT_CERTIFICATE" || a === "REJECT_INSPECTION_HOD") return "Rejeter";
    if (a === "APPROVE" || a === "APPROVE_INSPECTION") return "Approuver";
    if (a === "CANCEL") return "Annuler";
    if (a === "SEND_TO_CITIZEN_PAYMENT") return "Envoyer";
    if (a === "SEND_BACK_TO_ARCHITECT" || a === "SEND_BACK_TO_SOURCE") return "Renvoyer";
    if (a === "SEND_BACK_TO_SUB_DIRECTOR") return "Retourner";
    if (a === "SUBMIT_FOR_HOD_APPROVAL") return "Soumettre";
    if (a === "ADD_QUERY") return "Soumettre";
    if (a === "SIGN_ELECTRONICALLY") return "Signer";
    if (a === "MAKE_PAYMENT") return "Procéder au paiement";
    // For PF, SEND_TO_COMMISSIONER goes only to the DGDCF — wording is
    // "Envoyer" rather than the generic "Transmettre".
    if (businessService === "BPA_PF" && (a === "SEND_TO_COMMISSIONER" || a === "SEND_TO_COMMISSION")) return "Envoyer";
    return "Transmettre";
  })();

  const canSubmit = (() => {
    if (submitting) return false;
    if (showAcceptTerms && !acceptTerms) return false;
    if (commentsMandatory && !comments?.trim()) return false;
    if (isCommissionerAction) return commissioners.length > 0;
    if (showAssignee) return !!assignee;
    return true;
  })();

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = {
        assignee: assignee,
        commissioner: commissioners,
        comments: comments,
        document: docFiles,
      };
      const customPayload = await updatePayload(applicationDetails, formData, action, businessService, tenantId, hrmsData?.Employees);
      submitAction(customPayload, action);
    } catch (error) {
      console.error("Error submitting workflow action:", error);
      setSubmitting(false);
    }
  };

  if (isLoadingHrmsSearch || isLoadingDoc) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal?.(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t(headerKey)}</h2>
          <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {showAcceptTerms && (
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span>{t("MUSTOR_APPROVAL_CHECKBOX")}</span>
            </label>
          )}

          {showAssignee && (
            <AssigneeDropdown options={assigneeOptions} value={assignee} onChange={setAssignee} />
          )}

          {isCommissionerAction && (
            <MultiSelectDropdown
              options={assigneeOptions}
              value={commissioners}
              onChange={setCommissioners}
              placeholder={
                // Per-service override for the commissioner field placeholder.
                // PS sends to a single internal service, PF sends only to the
                // DGDCF (one recipient), so the wording differs from the
                // generic multi-service "Sélectionner les services concernés".
                businessService === "BPA_PS" ? "Sélectionner le service" :
                businessService === "BPA_PF" ? "Sélectionner le destinataire" :
                t("WF_MODAL_COMMISSIONER")
              }
            />
          )}

          {showComments && (
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                {t("WF_MODAL_COMMENTS")} {commentsMandatory && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                maxLength={1024}
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          )}

          {documents.map((doc, idx) => (
            <div key={doc.name || idx}>
              <label className="block text-sm text-gray-600 mb-1.5">
                {t(doc.code)} {doc.isMandatory && <span className="text-red-500">*</span>}
              </label>
              <UploadFile
                onUpload={async (file) => {
                  if (!file) return;
                  const res = await Digit.UploadServices.Filestorage("BPA", file, tenantId);
                  const fileStoreId = res?.data?.files?.[0]?.fileStoreId;
                  if (fileStoreId) {
                    setDocFiles((prev) => ({
                      ...prev,
                      [doc.name]: [{ fileStoreId, fileName: file.name, tenantId }],
                    }));
                  }
                }}
                onDelete={() => setDocFiles((prev) => { const c = { ...prev }; delete c[doc.name]; return c; })}
                message={docFiles[doc.name]?.[0]?.fileName || ""}
                accept={doc.allowedFileTypes?.join(",")}
                hintText={t(doc.hintText || "COMMON_DOC_UPLOAD_HINT")}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t("WF_MODAL_CANCEL")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPopup;
