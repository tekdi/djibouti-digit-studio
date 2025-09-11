import { useState, useEffect, useCallback } from "react";
import { useCommissionersAPI } from "./useCommissionersAPI";

export const useCommissionersData = (applicationNumber, serviceCode) => {
  const [checklistData, setChecklistData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { getCommissionersChecklist } = useCommissionersAPI(
    Digit.ULBService.getCurrentTenantId(),
    serviceCode,
    applicationNumber
  );

  const checkExistingChecklist = useCallback(async () => {
    if (!applicationNumber || !serviceCode) return;

    setIsLoading(true);
    try {
      const existingData = await getCommissionersChecklist();
      
      if (existingData) {
        setChecklistData(existingData);
        setIsSubmitted(true);
      } else {
        setChecklistData(null);
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error("Error checking existing commissioners checklist:", error);
      setChecklistData(null);
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  }, [applicationNumber, serviceCode, getCommissionersChecklist]);

  useEffect(() => {
    checkExistingChecklist();
  }, [checkExistingChecklist]);

  // Provide an imperative refresh helper for callers that want to ensure latest state
  const refresh = useCallback(async () => {
    await checkExistingChecklist();
  }, [checkExistingChecklist]);

  return {
    checklistData,
    isSubmitted,
    isLoading,
    checkExistingChecklist,
    refresh,
  };
};
