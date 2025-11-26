export const getFileUrl = async (fileStoreId, tenantId) => {
  if (!fileStoreId) return null;

  try {
    const response = await Digit.CustomService.getResponse({
      url: `/filestore/v1/files/url`,
      method: "GET",
      headers: {
        "X-Tenant-Id": tenantId,
      },
      params: {
        tenantId: tenantId,
        fileStoreIds: fileStoreId,
      },
    });

    let urlString = null;

    if (response && response[fileStoreId]) {
      urlString = response[fileStoreId];
    } else if (response && response.fileStoreIds && Array.isArray(response.fileStoreIds)) {
      const fileInfo = response.fileStoreIds.find((item) => item.id === fileStoreId);
      if (fileInfo && fileInfo.url) {
        urlString = fileInfo.url;
      }
    }

    if (urlString) {
      if (urlString.includes(",")) {
        const urls = urlString.split(",");
        return urls[0].trim();
      }
      return urlString;
    }

    return null;
  } catch (error) {
    console.error("Error getting file URL:", error);
    return null;
  }
};

export const isPdfFile = (fileName) => {
  return fileName.toLowerCase().endsWith('.pdf');
};

export const uploadFile = async (file, tenantId) => {
  const maxSizeMB = 10;
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`La taille ne doit pas dépasser ${maxSizeMB}MB`);
  }

  const uploadResponse = await Digit.UploadServices.Filestorage(
    "DIGIT_DJIBOUTI_FILES",
    file,
    tenantId
  );

  if (uploadResponse?.data?.files?.[0]?.fileStoreId) {
    return {
      fileStoreId: uploadResponse.data.files[0].fileStoreId,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      description: "",
    };
  }

  throw new Error("Erreur lors du téléchargement");
};

