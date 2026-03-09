/**
 * P13 / BPA_CCE - Certificat de Conformité Electrique (CCE)
 * Field keys match the actual API response structure from the public-service API
 */
export const p13CceData = {
  blocks: {
    originalPermitDetails: {
      title: "Détails du permis original",
      icon: "LuFileText",
      color: "purple",
      fields: [
        {
          label: "Type de document",
          key: "documentType",
          icon: "LuFileText"
        },
        {
          label: "Numéro du document",
          key: "documentNumber",
          icon: "LuHash"
        }
      ]
    },
    propertyDetails: {
      title: "Détails de la propriété",
      icon: "LuBuilding",
      color: "teal",
      fields: [
        {
          label: "Nom du/des propriétaire(s)",
          key: "ownerNames",
          icon: "LuUser"
        },
        {
          label: "Localisation de la construction",
          key: "constructionLocation",
          icon: "LuMapPin"
        },
        {
          label: "Surface de la parcelle",
          key: "plotSurface",
          icon: "LuHash"
        },
        {
          label: "Type de projet",
          key: "projectType",
          icon: "LuBuilding"
        },
        {
          label: "Destination",
          key: "destination",
          icon: "LuBuilding"
        },
        {
          label: "Type de construction",
          key: "constructionType",
          icon: "LuBuilding"
        }
      ]
    }
  }
};
