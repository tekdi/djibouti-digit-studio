import { useState, useCallback } from "react";
import { useAPEInstructionSheetAPI } from "./useAPEInstructionSheetAPI";

export const useAPEInstructionSheetData = (applicationNumber, serviceCode) => {
  const [instructionData, setInstructionData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tenantId = Digit?.ULBService?.getCurrentTenantId();
  const { getInstructionSheet } = useAPEInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  const checkExistingInstructionSheet = useCallback(async () => {
    if (!applicationNumber || !serviceCode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getInstructionSheet();

      if (data) {
        setInstructionData(data);
        setIsSubmitted(data.action === "SUBMIT" || !!data.submittedAt);
      } else {
        setInstructionData(null);
        setIsSubmitted(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching APE instruction sheet:", error);
      setInstructionData(null);
      setIsSubmitted(false);
      setIsLoading(false);

      if (Digit.Toast) {
        Digit.Toast.error("Échec du chargement de la fiche d'instruction APE");
      }
    }
  }, [applicationNumber, serviceCode, getInstructionSheet]);

  return {
    instructionData,
    isSubmitted,
    isLoading,
    checkExistingInstructionSheet,
  };
};
