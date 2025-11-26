import { useState, useCallback } from "react";
import { useSDECCInstructionSheetAPI } from "./useSDECCInstructionSheetAPI";

/**
 * Hook pour gérer les données de la Fiche d'instruction SDECC (Structure)
 */
export const useSDECCInstructionSheetData = (applicationNumber, serviceCode) => {
  const [instructionData, setInstructionData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tenantId = Digit?.ULBService?.getCurrentTenantId();
  const { getInstructionSheet } = useSDECCInstructionSheetAPI(tenantId, serviceCode, applicationNumber);

  /**
   * Vérifie si une fiche d'instruction existe déjà
   */
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
      console.error("Error fetching instruction sheet:", error);
      setInstructionData(null);
      setIsSubmitted(false);
      setIsLoading(false);
      
      if (Digit.Toast) {
        Digit.Toast.error("Échec du chargement des données de la fiche d'instruction");
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

