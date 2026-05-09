export const p3Data = {
  // Define which blocks should be shown for P3 (Fill Permit)
  blocks: {
    terrainDetails: {
      title: "Détails du Permis de Remblai",
      icon: "LuMapPin",
      color: "purple",
      fields: [
        {
          label: "Numéro du Permis de Remblai",
          key: "prNumber",
          icon: "LuFileText"
        },
        {
          label: "Nom du pétitionnaire",
          key: "applicantName",
          icon: "LuUser"
        },
        {
          label: "Surface de la parcelle",
          key: "terrainSurface",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Localisation de la parcelle",
          key: "terrainLocation",
          icon: "LuMapPin"
        },
        {
          label: "Région",
          key: "region",
          icon: "LuMapPin"
        },
        {
          label: "Numéro du Titre Foncier",
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
