export const p2Data = {
  // Define which blocks should be shown for P2 (Extension Permit)
  blocks: {
    landandProjectDesignDetails: {
      title: "Détails du projet",
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
          label: "Surface totale",
          key: "area",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Coût par m²",
          key: "constructionCostPerSqMt",
          icon: "LuHash",
          suffix: " Fdj"
        }
      ]
    },
    designOfficeDetailing: {
      title: "Bureau d'études",
      icon: "LuBuilding",
      color: "orange",
      fields: [
        {
          label: "Nom du bureau",
          key: "nameOfDesignOffice",
          icon: "LuBuilding"
        },
        {
          label: "Architecte",
          key: "architectName",
          icon: "LuUser"
        },
        {
          label: "Téléphone",
          key: "telephone",
          icon: "LuPhone",
          prefix: "+253 "
        },
        {
          label: "Email",
          key: "officeEmail",
          icon: "LuMail"
        },
        {
          label: "Numéro d'enregistrement",
          key: "registrationNo",
          icon: "LuHash"
        },
        {
          label: "Numéro professionnel",
          key: "registrationNoOnProfessionalRoll",
          icon: "LuHash"
        }
      ]
    }
  }
};
