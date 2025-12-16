import { useState, useEffect } from "react";
import { checkIfCommissioner, getCurrentUserCommissionerRole } from "../utils/commissionerUtils";

export const useObservations = (response, isCommissioner, currentUserCommissionerRole) => {
  const [observations, setObservations] = useState("");
  const [files, setFiles] = useState([]);
  const [fileDescriptions, setFileDescriptions] = useState({});

  useEffect(() => {
    if (response?.additionalDetails?.commissionerObservations) {
      const data = response.additionalDetails.commissionerObservations;
      
      if (Array.isArray(data)) {
        if (isCommissioner && currentUserCommissionerRole) {
          const userObservation = data.find(
            (obs) => obs.updatedByRoleCode === currentUserCommissionerRole
          );
          
          if (userObservation) {
            setObservations(userObservation.observations || "");
            
            if (userObservation.files && Array.isArray(userObservation.files)) {
              setFiles(userObservation.files);
              const descriptions = {};
              userObservation.files.forEach((file) => {
                if (file.description) {
                  descriptions[file.fileStoreId] = file.description;
                }
              });
              setFileDescriptions(descriptions);
            }
          }
        }
      } else {
        setObservations(data.observations || "");
        
        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
          const descriptions = {};
          data.files.forEach((file) => {
            if (file.description) {
              descriptions[file.fileStoreId] = file.description;
            }
          });
          setFileDescriptions(descriptions);
        }
      }
    }
  }, [response, isCommissioner, currentUserCommissionerRole]);

  return {
    observations,
    setObservations,
    files,
    setFiles,
    fileDescriptions,
    setFileDescriptions,
  };
};







