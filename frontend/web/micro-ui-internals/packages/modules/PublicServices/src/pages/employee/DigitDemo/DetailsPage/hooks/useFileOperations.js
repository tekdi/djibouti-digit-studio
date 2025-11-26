import { useState } from "react";
import { getFileUrl, isPdfFile, uploadFile } from "../utils/fileUtils";

export const useFileOperations = (tenantId) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState({});

  const handlePreviewFile = async (file) => {
    if (!file.fileStoreId) return;
    
    setLoadingFiles((prev) => ({ ...prev, [`preview_${file.fileStoreId}`]: true }));
    
    try {
      const fileUrl = await getFileUrl(file.fileStoreId, tenantId);
      if (fileUrl) {
        if (isPdfFile(file.fileName)) {
          setPreviewFile({
            fileStoreId: file.fileStoreId,
            fileUrl,
            fileName: file.fileName,
          });
        } else {
          if (Digit.Toast) {
            Digit.Toast.info("La prévisualisation n'est disponible que pour les fichiers PDF");
          }
        }
      } else {
        if (Digit.Toast) {
          Digit.Toast.error("Impossible de charger le fichier");
        }
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors de la prévisualisation du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`preview_${file.fileStoreId}`]: false }));
    }
  };

  const handleDownloadFile = async (file) => {
    if (!file.fileStoreId) return;
    
    setLoadingFiles((prev) => ({ ...prev, [`download_${file.fileStoreId}`]: true }));
    
    try {
      const fileUrl = await getFileUrl(file.fileStoreId, tenantId);
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        if (Digit.Toast) {
          Digit.Toast.error("Impossible de télécharger le fichier");
        }
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      if (Digit.Toast) {
        Digit.Toast.error("Erreur lors du téléchargement du fichier");
      }
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [`download_${file.fileStoreId}`]: false }));
    }
  };

  const handleFileUpload = async (selectedFiles, setFiles, setUploadingFiles) => {
    const newFiles = [];
    const errors = [];

    for (const file of selectedFiles) {
      setUploadingFiles((prev) => ({ ...prev, [file.name]: true }));

      try {
        const fileData = await uploadFile(file, tenantId);
        newFiles.push(fileData);
      } catch (error) {
        console.error("Error uploading file:", error);
        errors.push(`${file.name}: ${error.message || "Erreur lors du téléchargement"}`);
      } finally {
        setUploadingFiles((prev) => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
      }
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      if (Digit.Toast) {
        Digit.Toast.success(`${newFiles.length} fichier(s) téléchargé(s) avec succès`);
      }
    }

    return { errors, newFiles };
  };

  return {
    previewFile,
    setPreviewFile,
    loadingFiles,
    handlePreviewFile,
    handleDownloadFile,
    handleFileUpload,
  };
};

