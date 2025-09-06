export const p14Data = {
  // Define which blocks should be shown for P14 (Project Validation)
  blocks: {
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
          label: "Surface du terrain",
          key: "plotArea",
          icon: "LuMapPin",
          
          suffix: " m²"
        },
        {
          label: "Surface de construction proposée",
          key: "proposedConstructionArea",
          icon: "LuMapPin",
          suffix: " m²"
        }
      ]
    }
  }
};




