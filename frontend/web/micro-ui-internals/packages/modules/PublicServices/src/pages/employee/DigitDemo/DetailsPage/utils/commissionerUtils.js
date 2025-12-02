// Mapping des codes de rôles vers les noms complets des directions
export const COMMISSIONER_ORGANIZATIONS = {
  "BPA_SDECC_COMM": {
    name: "SDECC",
    fullName: "Sous-Direction Expertise et Contrôle des Constructions",
  },
  "BPA_DGDCF_COMM": {
    name: "DGDCF",
    fullName: "Direction Générale des Domaines et de la Conservation Foncière",
  },
  "BPA_ONEAD_COMM": {
    name: "ONEAD",
    fullName: "Office National des Eaux et de l'Assainissement de Djibouti",
  },
  "BPA_DNPC_COMM": {
    name: "DNPC",
    fullName: "Direction Nationale de la Protection Civile",
  },
  "BPA_EDD_COMM": {
    name: "EDD",
    fullName: "Direction Générale de l'Électricité de Djibouti",
  },
  "BPA_INSPD_COMM": {
    name: "INSPD",
    fullName: "Institut National de la Santé Publique de Djibouti",
  },
};

export const getOrganizationInfo = (roleCode) => {
  return COMMISSIONER_ORGANIZATIONS[roleCode] || { name: "Inconnu", fullName: "Organisation inconnue" };
};

export const isCommissionerRole = (roleCode) => {
  return !!COMMISSIONER_ORGANIZATIONS[roleCode];
};

export const checkIfCommissioner = (userDetails) => {
  return userDetails?.info?.roles?.some((role) => 
    isCommissionerRole(role.code)
  );
};

export const getCurrentUserCommissionerRole = (userDetails) => {
  return userDetails?.info?.roles?.find((role) => 
    COMMISSIONER_ORGANIZATIONS[role.code]
  )?.code;
};


