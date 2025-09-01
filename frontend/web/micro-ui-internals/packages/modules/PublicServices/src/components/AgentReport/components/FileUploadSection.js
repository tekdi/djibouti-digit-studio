import React, { useState } from "react";
import PropTypes from "prop-types";

export const FileUploadSection = ({ 
  title, 
  fieldName, 
  accept, 
  maxFiles, 
  maxSizeMB, 
  required = false,
  formData,
  errors,
  uploadingFiles,
  isViewMode,
  isEditMode,
  handleFileUpload,
  removeFile,
  downloadFile,
  getFileUrl
}) => {
  const isReadOnly = isViewMode && !isEditMode;
  const [imagePreview, setImagePreview] = useState(null);
  const [fileUrls, setFileUrls] = useState({});

  const isImageFile = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const handleImageClick = async (file) => {
    if (isImageFile(file.fileName) && getFileUrl) {
      try {
        const imageUrl = await getFileUrl(file);
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      } catch (error) {
          console.error("Error getting image URL:", error);
      }
    }
  };

  // Load file URLs when component mounts or files change
  React.useEffect(() => {
    const loadFileUrls = async () => {
      if (formData[fieldName] && getFileUrl) {
        const urls = {};
        for (const file of formData[fieldName]) {
          try {
            const url = await getFileUrl(file);
            if (url) {
              urls[file.fileStoreId] = url;
            }
          } catch (error) {
            console.error("Error loading file URL:", error);
          }
        }
        setFileUrls(urls);
      }
    };

    loadFileUrls();
  }, [formData[fieldName], getFileUrl, fieldName]);

  const closeImagePreview = () => {
    setImagePreview(null);
  };
  
  return (
    <div className="mb-8">
      <label className="block mb-3 font-semibold text-base text-gray-800">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!isReadOnly && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 bg-gray-50 relative overflow-hidden hover:border-[#0f6769] hover:bg-[#f0f9f9] min-h-[160px] flex items-center justify-center"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-[#0f6769]', 'bg-[#f0f9f9]');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-[#0f6769]', 'bg-[#f0f9f9]');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-[#0f6769]', 'bg-[#f0f9f9]');
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            handleFileUpload({ target: { files } }, fieldName);
          }
        }}>
          
          <div className="flex flex-col items-center justify-center w-full">
            <div className="mb-4 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="mb-4">
              <p className="text-base font-semibold text-gray-700 mb-2">
                Glissez les fichiers ici ou cliquez pour parcourir
              </p>
              <p className="text-sm text-gray-500">
                Formats acceptés: {accept.replace(/\./g, "").toUpperCase()} (Max {maxFiles} fichiers, {maxSizeMB}MB chacun)
              </p>
            </div>
          </div>
          
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => handleFileUpload(e, fieldName)}
            disabled={uploadingFiles}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {uploadingFiles && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/90 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[#0f6769] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[#0f6769] text-sm font-semibold">
                  Téléchargement...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {errors[fieldName] && (
        <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          ⚠️ {errors[fieldName]}
        </div>
      )}

      {formData[fieldName] && formData[fieldName].length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {isReadOnly ? "Fichiers" : "Fichiers téléchargés"} ({formData[fieldName].length})
          </h4>
          {formData[fieldName].map((file, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg mb-2 border border-slate-200">
              <div className="flex items-center gap-3 flex-1">
                {/* File Icon or Image Thumbnail */}
                {isImageFile(file.fileName) && fileUrls[file.fileStoreId] ? (
                  <div 
                    className="w-12 h-12 rounded-md overflow-hidden cursor-pointer border-2 border-slate-200 transition-all duration-200 hover:border-[#0f6769] hover:scale-105"
                    onClick={() => handleImageClick(file)}
                    title="Cliquez pour prévisualiser"
                  >
                    <img 
                      src={fileUrls[file.fileStoreId]} 
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isPdfFile(file.fileName) ? 'bg-red-500' : 'bg-[#0f6769]'
                  }`}>
                    {isPdfFile(file.fileName) ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
                      </svg>
                    )}
                  </div>
                )}
                
                <div className="flex-1">
                  <p className={`text-sm font-medium text-gray-800 mb-0.5 ${
                    isImageFile(file.fileName) ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={() => isImageFile(file.fileName) && handleImageClick(file)}
                  title={isImageFile(file.fileName) ? "Cliquez pour prévisualiser" : ""}
                  >
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Download button */}
                <button
                  type="button"
                  onClick={() => downloadFile(file)}
                  className="bg-none border-none text-[#0f6769] cursor-pointer p-1 rounded transition-all duration-200 hover:bg-[#f0f9f9]"
                  title="Télécharger le fichier"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
                  </svg>
                </button>
                
                {/* Remove button - only show if not in read-only mode */}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeFile(fieldName, index)}
                    className="bg-none border-none text-red-500 cursor-pointer p-1 rounded transition-all duration-200 hover:bg-red-50"
                    title="Supprimer le fichier"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90 flex items-center justify-center z-[10000] p-5" onClick={closeImagePreview}>
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeImagePreview}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full border-none bg-white/20 text-white cursor-pointer flex items-center justify-center text-lg font-bold z-[10001] hover:bg-white/30"
            >
              ×
            </button>
            
            {/* Image */}
            <img 
              src={imagePreview} 
              alt="Aperçu"
              className="max-w-full max-h-full object-contain rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

FileUploadSection.propTypes = {
  title: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  accept: PropTypes.string.isRequired,
  maxFiles: PropTypes.number.isRequired,
  maxSizeMB: PropTypes.number.isRequired,
  required: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  uploadingFiles: PropTypes.bool.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
  getFileUrl: PropTypes.func.isRequired
}; 