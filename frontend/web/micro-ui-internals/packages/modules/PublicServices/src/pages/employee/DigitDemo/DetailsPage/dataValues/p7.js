export const p7Data = {
  // BPA_PF (Permis de Clôture) — serviceDetails only carries:
  // area, perimeter, region, siteLocation, tfNo
  blocks: {
    landandProjectDesignDetails: {
      title: "Détails du projet",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Numéro de titre foncier",
          key: "tfNo",
          icon: "LuFileText"
        },
        {
          label: "Surface du terrain",
          key: "area",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Périmètre",
          key: "perimeter",
          icon: "LuMapPin",
          suffix: " ml"
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
        }
      ]
    }
  }
};
