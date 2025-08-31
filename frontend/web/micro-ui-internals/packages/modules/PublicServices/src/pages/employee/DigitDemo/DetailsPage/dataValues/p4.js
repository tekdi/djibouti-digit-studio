export const p4Data = {
  // Define which blocks should be shown for P4 (BPA_PL) - Layout Permit
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
          label: "Usage prévu",
          key: "intededUse",
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
          label: "Statut légal",
          key: "legalStatus",
          icon: "LuFileText"
        },
        {
          label: "Titre foncier définitif",
          key: "definitiveLandTitle",
          icon: "LuFileText"
        },
        {
          label: "Certificat d'enregistrement",
          key: "registrationCertificate",
          icon: "LuFileText"
        },
        {
          label: "Numéro de titre foncier",
          key: "tfNo",
          icon: "LuHash"
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
          label: "Coût par m²",
          key: "constructionCostPerSqMt",
          icon: "LuHash",
          suffix: " Fdj"
        },
        {
          label: "Autres détails",
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
          label: "Numéro d'enregistrement",
          key: "registrationNumber",
          icon: "LuHash"
        }
      ]
    }
  }
};
