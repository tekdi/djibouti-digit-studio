export const p3Data = {
  // Define which blocks should be shown for P3 (Fill Permit)
  blocks: {
    terrainDetails: {
      title: "Détails du terrain",
      icon: "LuMapPin",
      color: "purple",
      fields: [
        {
          label: "Surface du terrain",
          key: "terrainSurface",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Localisation du terrain",
          key: "terrainLocation",
          icon: "LuMapPin"
        },
        {
          label: "Numéro du titre foncier",
          key: "landTitleNumber",
          icon: "LuFileText"
        },
        {
          label: "Situation juridique",
          key: "juridicalSituation",
          icon: "LuFileText"
        },
        {
          label: "Titre foncier définitif",
          key: "hasDefinitiveLandTitle",
          icon: "LuFileText"
        },
        {
          label: "Certificat d'enregistrement",
          key: "hasRegistrationCertificate",
          icon: "LuFileText"
        },
        {
          label: "Plan de situation",
          key: "hasSituationPlan",
          icon: "LuFileText"
        }
      ]
    }
  }
};
