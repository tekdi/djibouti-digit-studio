export const p15Data = {
  // Define which blocks should be shown for P15 (Execution Permit)
  blocks: {
    projectDetails: {
      title: "Détails du projet",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Type de construction",
          key: "constructionType",
          icon: "LuBuilding"
        },
        {
          label: "Localisation du projet",
          key: "projectLocation",
          icon: "LuMapPin"
        },
        {
          label: "Type de fondation",
          key: "foundationType",
          icon: "LuBuilding"
        },
        {
          label: "Nombre total d'étages",
          key: "totalFloors",
          icon: "LuHash"
        },
        {
          label: "Cabinet d'architecture",
          key: "architecturalFirm",
          icon: "LuBuilding"
        },
        {
          label: "Ingénieur structure",
          key: "structuralEngineer",
          icon: "LuUser"
        }
      ]
    }
  }
};
