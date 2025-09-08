export const p5Data = {
  // Define which blocks should be shown for P5 (Simplified Construction Permit)
  blocks: {
    landandProjectDesignDetails: {
      title: "Détails du projet simplifié",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Type de travail",
          key: "workType",
          icon: "LuBuilding"
        },
        {
          label: "Surface couverte",
          key: "coveredProjectArea",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Surface totale",
          key: "area",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Région",
          key: "region",
          icon: "LuMapPin"
        },
        {
          label: "Localisation",
          key: "siteLocation",
          icon: "LuMapPin"
        },
        {
          label: "Coût par m²",
          key: "constructionCostPerSqMt",
          icon: "LuHash",
          suffix: " Fdj"
        },
        {
          label: "Nombre d'unités",
          key: "noOfUnits",
          icon: "LuHash"
        },
        {
          label: "Titre foncier définitif",
          key: "definitiveLandTitle",
          icon: "LuFileText"
        },
        {
          label: "Statut légal",
          key: "legalStatus",
          icon: "LuFileText"
        },
        {
          label: "Certificat d'enregistrement",
          key: "registrationCertificate",
          icon: "LuFileText"
        },
        {
          label: "Numéro TF",
          key: "tfNo",
          icon: "LuHash"
        },
        {
          label: "Détails autres types",
          key: "detailsOnOtherType",
          icon: "LuFileText"
        },
        {
          label: "Autres informations",
          key: "other",
          icon: "LuFileText"
        }
      ]
    }
  }
};

