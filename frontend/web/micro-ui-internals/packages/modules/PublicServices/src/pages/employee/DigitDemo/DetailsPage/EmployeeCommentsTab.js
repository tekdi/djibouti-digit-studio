import React, { Fragment, useState, useEffect, useMemo } from "react";
import { LuMessageSquare, LuSend, LuTrash2, LuUser, LuPencil } from "react-icons/lu";
import { PDFPreview } from "../../../../components/ChecklistCards/Common";
import { useFileOperations } from "./hooks/useFileOperations";
import { useSaveEmployeeComments } from "./hooks/useSaveEmployeeComments";
import FileList from "./components/FileList";
import FileUploadZone from "./components/FileUploadZone";
import EmptyState from "./components/EmptyState";
import ToastNotification from "./components/ToastNotification";

// Roles that can author comments
const EMPLOYEE_COMMENT_ROLES = {
  BPA_DIRECTOR: "Directeur DATUH",
  BPA_HOD: "Chef SRA",
  BPA_AGENTS: "Instructeur technique SRA",
  BPA_SDECC_HOD: "Chef SDECC",
  BPA_SDECC_AGENT: "Instructeur technique SDECC",
  BPA_SDECC_AGENTS: "Instructeur technique SDECC",
  BPA_SDECC_SUB_DIRECTOR: "Sous-Directeur SDECC",
  BPA_SRA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_SUB_DIRECTOR: "Sous-Directeur SDATU",
  BPA_CAD_DGDCF_SUB_DIRECTOR: "Sous-Directeur DGDCF",
  BCIE_HOD: "Chef BCIE",
  BCIE_AGENT: "Instructeur technique BCIE",
  TOPOGRAPHY_HOD: "Chef Topographie",
  TOPOGRAPHY_CHIEF: "Chef Topographie",
  TOPOGRAPHY_AGENT: "Instructeur technique Topographie",
  STUDIO_ADMIN: "Administrateur",
};

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const getPrimaryEmployeeRole = (userDetails) => {
  const roles = userDetails?.info?.roles || [];
  for (const r of roles) {
    if (EMPLOYEE_COMMENT_ROLES[r?.code]) {
      return { code: r.code, label: EMPLOYEE_COMMENT_ROLES[r.code] };
    }
  }
  return null;
};

const EmployeeCommentsTab = ({ response, queryStrings }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const serviceCode = queryStrings?.serviceCode;
  const applicationNumber = queryStrings?.applicationNumber;

  const userDetails = Digit.UserService.getUser();
  const userUuid = userDetails?.info?.uuid;
  const primaryRole = getPrimaryEmployeeRole(userDetails);
  const canComment = Boolean(primaryRole);

  // Existing comments array (may be undefined, single object, or array)
  const rawComments = response?.additionalDetails?.employeeComments;
  const comments = useMemo(() => {
    if (!rawComments) return [];
    return Array.isArray(rawComments) ? rawComments : [rawComments];
  }, [rawComments]);

  const myComment = comments.find((c) => c.updatedBy === userUuid);
  const otherComments = comments.filter((c) => c.updatedBy !== userUuid);

  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [fileDescriptions, setFileDescriptions] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Prefill from existing comment
  useEffect(() => {
    if (myComment) {
      setComment(myComment.comment || "");
      if (Array.isArray(myComment.files)) {
        setFiles(myComment.files);
        const descs = {};
        myComment.files.forEach((f) => {
          if (f.description) descs[f.fileStoreId] = f.description;
        });
        setFileDescriptions(descs);
      }
    }
  }, [myComment]);

  const {
    previewFile, setPreviewFile, loadingFiles,
    handlePreviewFile, handleDownloadFile, handleFileUpload: handleFileUploadOperation,
  } = useFileOperations(tenantId);

  const {
    isSaving, showToast, setShowToast, saveComment, deleteComment,
  } = useSaveEmployeeComments(serviceCode, applicationNumber, tenantId);

  const handleFileUpload = async (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;
    const { errors } = await handleFileUploadOperation(selected, setFiles, setUploadingFiles);
    if (errors.length > 0) setShowToast({ label: errors.join(", "), isError: true });
    e.target.value = "";
  };

  const handleRemoveFile = (fileStoreId) => {
    setFiles((prev) => prev.filter((f) => f.fileStoreId !== fileStoreId));
    setFileDescriptions((prev) => {
      const u = { ...prev };
      delete u[fileStoreId];
      return u;
    });
  };

  const handleDescriptionChange = (fileStoreId, description) => {
    setFileDescriptions((prev) => ({ ...prev, [fileStoreId]: description }));
  };

  const handleSave = async () => {
    await saveComment(comment, files, fileDescriptions, primaryRole?.code, primaryRole?.label);
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    await deleteComment(userUuid);
  };

  const CommentCard = ({ c, isMine }) => (
    <div className={`rounded-2xl border p-5 ${isMine ? "border-djibouti-primary/30 bg-djibouti-primary/5" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-djibouti-primary/10 text-djibouti-primary">
            <LuUser className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {c.updatedByName || "Utilisateur"}
              {isMine && <span className="ml-2 text-xs font-medium text-djibouti-primary">(Vous)</span>}
            </p>
            <p className="text-xs text-gray-500">
              {c.updatedByRoleLabel || EMPLOYEE_COMMENT_ROLES[c.updatedByRoleCode] || c.updatedByRoleCode}
              {c.updatedAt && <span className="ml-2">• {formatDate(c.updatedAt)}</span>}
            </p>
          </div>
        </div>
      </div>
      {c.comment && (
        <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">{c.comment}</p>
      )}
      {Array.isArray(c.files) && c.files.length > 0 && (
        <FileList
          files={c.files}
          fileDescriptions={(c.files || []).reduce((acc, f) => {
            if (f.description) acc[f.fileStoreId] = f.description;
            return acc;
          }, {})}
          onDescriptionChange={() => {}}
          onPreview={handlePreviewFile}
          onDownload={handleDownloadFile}
          onRemove={() => {}}
          loadingFiles={loadingFiles}
          isEditable={false}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <ToastNotification toast={showToast} onClose={() => setShowToast(null)} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-djibouti-primary/10 text-djibouti-primary">
          <LuMessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Commentaires internes</h3>
          <p className="text-xs text-gray-500">Échanges entre les agents traitant cette demande</p>
        </div>
      </div>

      {/* Existing comments from other users */}
      {otherComments.length > 0 && (
        <div className="space-y-3">
          {otherComments.map((c, i) => (
            <CommentCard key={`${c.updatedBy}-${i}`} c={c} isMine={false} />
          ))}
        </div>
      )}

      {/* My comment — view or edit mode */}
      {canComment ? (
        myComment && !isEditing ? (
          <div>
            <CommentCard c={myComment} isMine={true} />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <LuPencil className="h-3.5 w-3.5" /> Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <LuTrash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-djibouti-primary/20 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {myComment ? "Modifier mon commentaire" : "Ajouter un commentaire"}
              </h4>
              {primaryRole && (
                <span className="text-xs font-medium text-gray-500">{primaryRole.label}</span>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Saisissez votre commentaire..."
              rows="6"
              className="w-full p-4 border border-gray-300 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary transition-all"
            />

            <FileUploadZone onFileUpload={handleFileUpload} isUploading={uploadingFiles} />

            <FileList
              files={files}
              fileDescriptions={fileDescriptions}
              onDescriptionChange={handleDescriptionChange}
              onPreview={handlePreviewFile}
              onDownload={handleDownloadFile}
              onRemove={handleRemoveFile}
              loadingFiles={loadingFiles}
              isEditable={true}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // reset to saved values
                    setComment(myComment?.comment || "");
                    setFiles(myComment?.files || []);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !comment.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-djibouti-primary text-white rounded-xl text-sm font-semibold hover:bg-djibouti-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Fragment>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </Fragment>
                ) : (
                  <Fragment>
                    <LuSend className="h-4 w-4" />
                    {myComment ? "Mettre à jour" : "Publier"}
                  </Fragment>
                )}
              </button>
            </div>
          </div>
        )
      ) : (
        comments.length === 0 && <EmptyState isReadOnly={true} />
      )}

      {previewFile && (
        <PDFPreview
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownloadFile({ fileStoreId: previewFile.fileStoreId, fileName: previewFile.fileName })}
        />
      )}
    </div>
  );
};

export default EmployeeCommentsTab;
