import React from "react";

export const ModalHeader = ({ isViewMode, isEditMode, setIsEditMode, onSubmitChecklist, isLoading }) => {
  return (
    <div style={{ 
      padding: "0",
      background: "linear-gradient(135deg, #0f6769 0%, #73836a 100%)",
      borderRadius: "20px 20px 0 0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative elements */}
      <div style={{
        position: "absolute",
        top: "-60px",
        right: "-60px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-40px",
        left: "-40px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)"
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        right: "10%",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)"
      }} />
      
      <div style={{ padding: "40px 40px 32px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              color: "white", 
              fontSize: "32px", 
              fontWeight: "700", 
              margin: 0,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              Field Inspection Report
            </h2>
            <p style={{ 
              color: "rgba(255, 255, 255, 0.9)", 
              fontSize: "16px", 
              margin: "8px 0 0 0",
              fontWeight: "400"
            }}>
              {isViewMode ? "View submitted field inspection details" : "Submit your comprehensive field inspection details"}
            </p>
          </div>
          
          {/* Edit button for view mode */}
          {isViewMode && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: "12px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
              </svg>
              Edit Report
            </button>
          )}
          
          {/* Save/Cancel buttons for edit mode */}
          {isViewMode && isEditMode && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsEditMode(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSubmitChecklist}
                disabled={isLoading}
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  color: "#0f6769",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.2s ease"
                }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 