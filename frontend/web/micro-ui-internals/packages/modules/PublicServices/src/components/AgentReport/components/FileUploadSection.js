import React, { useState } from "react";

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
    <div style={{ marginBottom: "2rem" }}>
      <label style={{ 
        display: "block", 
        marginBottom: "12px", 
        fontWeight: "600",
        fontSize: "16px",
        color: "#1f2937"
      }}>
        {title} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      
      {!isReadOnly && (
        <div style={{
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          transition: "all 0.2s ease",
          backgroundColor: "#fafafa",
          position: "relative",
          overflow: "hidden"
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "#0f6769";
          e.currentTarget.style.backgroundColor = "#f0f9f9";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
          e.currentTarget.style.backgroundColor = "#fafafa";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "#d1d5db";
          e.currentTarget.style.backgroundColor = "#fafafa";
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            handleFileUpload({ target: { files } }, fieldName);
          }
        }}>
          
          <div style={{ marginBottom: "16px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#9ca3af"/>
            </svg>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <p style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#374151", 
              margin: "0 0 8px 0" 
            }}>
              Drop files here or click to browse
            </p>
            <p style={{ 
              fontSize: "14px", 
              color: "#6b7280", 
              margin: 0 
            }}>
              Accepted formats: {accept.replace(/\./g, "").toUpperCase()} (Max {maxFiles} files, {maxSizeMB}MB each)
            </p>
          </div>
          
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => handleFileUpload(e, fieldName)}
            disabled={uploadingFiles}
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer"
            }}
          />
          
          {uploadingFiles && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #e5e7eb",
                  borderTop: "3px solid #0f6769",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 8px auto"
                }} />
                <p style={{ color: "#0f6769", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                  Uploading...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {errors[fieldName] && (
        <div style={{ 
          color: "#ef4444", 
          fontSize: "14px", 
          marginTop: "8px",
          padding: "12px",
          backgroundColor: "#fef2f2",
          borderRadius: "8px",
          border: "1px solid #fecaca"
        }}>
          ⚠️ {errors[fieldName]}
        </div>
      )}

      {formData[fieldName] && formData[fieldName].length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4 style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            color: "#374151", 
            margin: "0 0 12px 0" 
          }}>
            {isReadOnly ? "Files" : "Uploaded files"} ({formData[fieldName].length})
          </h4>
          {formData[fieldName].map((file, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              marginBottom: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                {/* File Icon or Image Thumbnail */}
                {isImageFile(file.fileName) && fileUrls[file.fileStoreId] ? (
                  <div 
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px solid #e2e8f0",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => handleImageClick(file)}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#0f6769";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.transform = "scale(1)";
                    }}
                    title="Click to preview"
                  >
                    <img 
                      src={fileUrls[file.fileStoreId]} 
                      alt={file.fileName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: isPdfFile(file.fileName) ? "#ef4444" : "#0f6769",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
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
                
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: "14px", 
                    fontWeight: "500", 
                    color: "#1f2937", 
                    margin: "0 0 2px 0",
                    cursor: isImageFile(file.fileName) ? "pointer" : "default"
                  }}
                  onClick={() => isImageFile(file.fileName) && handleImageClick(file)}
                  title={isImageFile(file.fileName) ? "Click to preview" : ""}
                  >
                    {file.fileName}
                  </p>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#6b7280", 
                    margin: 0 
                  }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "8px" }}>
                {/* Download button */}
                <button
                  type="button"
                  onClick={() => downloadFile(file)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0f6769",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f9f9";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                  title="Download file"
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
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#fef2f2";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                    title="Remove file"
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }} onClick={closeImagePreview}>
          <div style={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeImagePreview}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold",
                zIndex: 10001
              }}
            >
              ×
            </button>
            
            {/* Image */}
            <img 
              src={imagePreview} 
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 