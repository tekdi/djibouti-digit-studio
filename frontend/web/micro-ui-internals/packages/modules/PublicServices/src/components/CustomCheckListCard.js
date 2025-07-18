import React, { useState, useEffect, Fragment } from "react";
import { Card, Button } from "@egovernments/digit-ui-components";
import CustomCheckListModal from "./CustomCheckListModal";

const CustomCheckListCard = ({ applicationId, service, state, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if checklist is already submitted
  useEffect(() => {
    if (applicationId && service) {
      checkExistingChecklist();
    }
  }, [applicationId, service]);

  const checkExistingChecklist = async () => {
    if (!applicationId || !service) return;
    
    try {
      setIsLoading(true);
      const tenantId = Digit?.ULBService?.getCurrentTenantId();
      
      if (!tenantId) {
        console.warn("Tenant ID not available");
        return;
      }

      const request = {
        url: `/public-service/v1/application/${service}`,
        method: "GET",
        params: {
          applicationNumber: applicationId,
          tenantId: tenantId,
        },
      };
      
      const response = await Digit.CustomService.getResponse(request);
      const application = response?.Application?.[0];
      
      if (application?.additionalDetails?.agentChecklist) {
        setChecklistData(application.additionalDetails.agentChecklist);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error checking existing checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsSubmitted(true);
    checkExistingChecklist(); // Refresh data
  };

  const handleViewReport = () => {
    // Navigate to the report page
    window.open(`/employee/application/${service}/${applicationId}/report`, '_blank');
  };

  // Don't render if required props are missing
  if (!applicationId || !service) {
    return null;
  }

  if (isSubmitted && checklistData) {
    return (
      <Card type="primary" style={{ padding: "20px", marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#166534",
                backgroundColor: "#dcfce7",
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              ✓ Completed
            </span>
            <h2 style={{ color: "black", fontSize: "20px", fontWeight: "700", margin: 0 }}>
              Agent Field Report
            </h2>
          </div>
          <Button
            label="View Report"
            onClick={handleViewReport}
            variation="primary"
            style={{
              backgroundColor: "#006769",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          />
        </div>
        
        <div style={{ fontSize: "12px", color: "#666" }}>
          Submitted on: {new Date(checklistData.submittedAt).toLocaleString()}
        </div>
      </Card>
    );
  }

  return (
    <Fragment>
      <Card type="primary" style={{ padding: "20px", marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: "black", fontSize: "20px", fontWeight: "700", marginBottom: "0.5rem" }}>
              Agent Field Report
            </h2>
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
              Submit your field inspection report with files and notes
            </p>
          </div>
          <Button
            label={isLoading ? "Loading..." : "Add Report"}
            onClick={handleOpenModal}
            disabled={isLoading}
            variation="primary"
            style={{
              backgroundColor: "#006769",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1
            }}
          />
        </div>
      </Card>

      <CustomCheckListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationId={applicationId}
        service={service}
        state={state}
        t={t}
        onSuccess={handleSuccess}
      />
    </Fragment>
  );
};

export default CustomCheckListCard; 