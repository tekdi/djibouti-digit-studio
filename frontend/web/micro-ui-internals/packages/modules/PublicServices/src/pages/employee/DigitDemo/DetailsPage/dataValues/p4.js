export const p4Data = {
  // Define which blocks should be shown for P4 (Layout Permit)
  blocks: {
    landandProjectDesignDetails: {
      title: "Détails du projet de lotissement",
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
