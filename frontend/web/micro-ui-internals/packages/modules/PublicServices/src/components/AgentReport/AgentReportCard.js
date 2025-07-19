import React, { useState, useEffect } from "react";
import { Card, Button } from "@egovernments/digit-ui-components";
import AgentReportModal from "./AgentReportModal";
import { useAgentReportData } from "./hooks/useAgentReportData";

const AgentReportCard = ({ service, state, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    serviceCode,
    applicationNumber,
  } = Digit.Hooks.useQueryParams();

  const {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist
  } = useAgentReportData(applicationNumber, serviceCode);

  // Check if checklist is already submitted
  useEffect(() => {
    if (applicationNumber && serviceCode) {
      checkExistingChecklist();
    }
  }, [applicationNumber, serviceCode, checkExistingChecklist]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    checkExistingChecklist(); // Refresh data
  };

  const handleViewReport = () => {
    setIsModalOpen(true);
  };

  // Don't render if required props are missing
  if (!applicationNumber || !service) {
    return null;
  }

  if (isSubmitted && checklistData) {
    return (
      <React.Fragment>
        <Card type="primary" style={{ 
          padding: "0", 
          marginBottom: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}>
          {/* Report Header */}
          <div style={{
            background: "linear-gradient(135deg, #0f6769 0%, #73836a 100%)",
            padding: "20px 24px",
            color: "white"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: "24px", 
                    fontWeight: "700", 
                    margin: "0 0 4px 0",
                    color: "white"
                  }}>
                    Field Inspection Report
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                      COMPLETED
                    </span>
                    <span style={{ fontSize: "12px", opacity: 0.8 }}>
                      Report ID: {applicationNumber}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                label="View Full Report"
                onClick={handleViewReport}
                variation="secondary"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              />
            </div>
          </div>

          {/* Report Content */}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              {/* Submission Info */}
              <div style={{
                padding: "16px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  SUBMITTED ON
                </div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                  {new Date(checklistData.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Files Count */}
              <div style={{
                padding: "16px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  ATTACHED FILES
                </div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                  {((checklistData.report && checklistData.report.length) || 0) + 
                   ((checklistData.photos && checklistData.photos.length) || 0)} files
                </div>
              </div>
            </div>

            {/* Notes Section - Full Width */}
            <div style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>
                INSPECTION NOTES
              </div>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "500", 
                color: "#1f2937",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}>
                {checklistData.notes ? checklistData.notes : "— No notes provided"}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: "flex",
              gap: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb"
            }}>
              <Button
                label="Download Report"
                onClick={handleViewReport}
                variation="secondary"
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              />
              <Button
                label="View Details"
                onClick={handleViewReport}
                variation="primary"
                style={{
                  backgroundColor: "#0f6769",
                  color: "white !important",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              />
            </div>
          </div>
        </Card>

        <AgentReportModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          applicationNumber={applicationNumber}
          service={service}
          serviceCode={serviceCode}
          state={state}
          t={t}
          onSuccess={handleSuccess}
          isViewMode={isSubmitted}
          existingChecklistData={checklistData}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Card type="primary" style={{ 
        padding: "0", 
        marginBottom: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}>
        {/* Report Header */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          padding: "20px 24px",
          color: "white"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h2 style={{ 
                  fontSize: "24px", 
                  fontWeight: "700", 
                  margin: "0 0 4px 0",
                  color: "white"
                }}>
                  Field Inspection Report
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fbbf24",
                    backgroundColor: "rgba(251, 191, 36, 0.2)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="currentColor"/>
                    </svg>
                    PENDING
                  </span>
                  <span style={{ fontSize: "12px", opacity: 0.8 }}>
                    Report ID: {applicationNumber}
                  </span>
                </div>
              </div>
            </div>
            <Button
              label={isLoading ? "Loading..." : "Create Report"}
              onClick={handleOpenModal}
              disabled={isLoading}
              variation="secondary"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
            />
          </div>
        </div>

        {/* Report Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            {/* Status */}
            <div style={{
              padding: "16px",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              border: "1px solid #f59e0b"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#92400e", marginBottom: "4px" }}>
                STATUS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#92400e" }}>
                ⏳ Awaiting Submission
              </div>
            </div>

            {/* Required Fields */}
            <div style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                REQUIRED FIELDS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                • Field Report Files<br/>
                • Inspection Notes<br/>
                • Field Photos (Optional)
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                INSTRUCTIONS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                Upload your field inspection documents and provide detailed notes about your findings
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <Button
              label="Start Report"
              onClick={handleOpenModal}
              variation="primary"
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            />
            <Button
              label="View Requirements"
              onClick={handleOpenModal}
              variation="secondary"
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            />
          </div>
        </div>
      </Card>

      <AgentReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationNumber={applicationNumber}
        service={service}
        serviceCode={serviceCode}
        state={state}
        t={t}
        onSuccess={handleSuccess}
        isViewMode={isSubmitted}
        existingChecklistData={checklistData}
      />
    </React.Fragment>
  );
};

export default AgentReportCard; 