export const p11Data = {
  // Define which blocks should be shown for P11 (Construction Completion Certificate)
  blocks: {
    originalPermitDetails: {
      title: "Détails du permis original",
      icon: "LuFileText",
      color: "blue",
      fields: [
        {
          label: "Numéro du permis original",
          key: "originalPermitNumber",
          icon: "LuHash"
        },
        {
          label: "Date du permis original",
          key: "originalPermitDate",
          icon: "LuCalendar"
        },
        {
          label: "Date d'achèvement de la construction",
          key: "constructionCompletionDate",
          icon: "LuCalendar"
        }
      ]
    },
    propertyDetails: {
      title: "Détails de la propriété",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Type de propriété",
          key: "propertyType",
          icon: "LuBuilding"
        },
        {
          label: "Localisation de la propriété",
          key: "propertyLocation",
          icon: "LuMapPin"
        },
        {
          label: "Numéro du titre foncier",
          key: "landTitleNumber",
          icon: "LuHash"
        },
        {
          label: "Type de titre foncier",
          key: "landTitleType",
          icon: "LuFileText"
        }
      ]
    }
  }
};
