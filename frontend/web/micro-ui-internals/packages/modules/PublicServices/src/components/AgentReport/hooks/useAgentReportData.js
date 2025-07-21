import { useState, useCallback } from "react";

export const useAgentReportData = (applicationNumber, serviceCode) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkExistingChecklist = useCallback(async () => {
    if (!applicationNumber || !serviceCode) return;
    
    try {
      const tenantId = Digit?.ULBService?.getCurrentTenantId();
      
      if (!tenantId) {
        console.warn("Tenant ID not available");
        return;
      }

      const request = {
        url: `/public-service/v1/application/${serviceCode}`,
        method: "GET",
        params: {
          applicationNumber,
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
    }
  }, [applicationNumber, serviceCode]);

  return {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist,
    setChecklistData,
    setIsSubmitted,
    setIsLoading
  };
}; 