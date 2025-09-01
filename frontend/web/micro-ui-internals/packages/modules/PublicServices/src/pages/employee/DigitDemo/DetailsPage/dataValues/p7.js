export const p7Data = {
  // Define which blocks should be shown for P7 (Project File)
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
          label: "Surface du terrain",
          key: "plotArea",
          icon: "LuMapPin",
          suffix: " m²"
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
          label: "CES maximum autorisé",
          key: "maximumAuthorizedCes",
          icon: "LuHash"
        },
        {
          label: "COS maximum autorisé",
          key: "maximumAuthorizedCos",
          icon: "LuHash"
        },
        {
          label: "CES projeté",
          key: "projectedCes",
          icon: "LuHash"
        },
        {
          label: "COS projeté",
          key: "projectedCos",
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
    },
    legalEntityDetails: {
      title: "Entité légale",
      icon: "LuBuilding",
      color: "teal",
      fields: [
        {
          label: "Raison sociale",
          key: "corporateName",
          icon: "LuBuilding"
        },
        {
          label: "Type de société",
          key: "companyType",
          icon: "LuBuilding"
        },
        {
          label: "Autre type de société",
          key: "otherCompanyType",
          icon: "LuBuilding"
        },
        {
          label: "Numéro d'enregistrement",
          key: "registrationNumber",
          icon: "LuHash"
        }
      ]
    }
  }
};
