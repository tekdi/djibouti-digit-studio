export const p6Data = {
  // Define which blocks should be shown for P6 (Demolition Permit)
  blocks: {
    landandProjectDesignDetails: {
      title: "Détails du projet de démolition",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Surface à démolir",
          key: "area",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Type de démolition",
          key: "demolitionType",
          icon: "LuBuilding"
        },
        {
          label: "Détails autres types",
          key: "otherOnDemolitionType",
          icon: "LuFileText"
        },
        {
          label: "Usage prévu",
          key: "intededUse",
          icon: "LuBuilding"
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
          label: "Nombre d'unités",
          key: "noOfUnits",
          icon: "LuHash"
        },
        {
          label: "Date de construction",
          key: "constructionDate",
          icon: "LuCalendar"
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
