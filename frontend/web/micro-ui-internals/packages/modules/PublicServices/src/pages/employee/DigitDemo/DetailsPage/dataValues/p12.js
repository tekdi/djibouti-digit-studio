export const p12Data = {
  // Define which blocks should be shown for P12 (Construction Progress Certificate)
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
          label: "Type de construction",
          key: "typeDeConstruction",
          icon: "LuBuilding"
        },
        {
          label: "Localisation",
          key: "localisation",
          icon: "LuMapPin"
        },
        {
          label: "Date de début de construction",
          key: "constructionStartDate",
          icon: "LuCalendar"
        },
        {
          label: "Date d'achèvement de la construction",
          key: "constructionCompletionDate",
          icon: "LuCalendar"
        }
      ]
    }
  }
};




