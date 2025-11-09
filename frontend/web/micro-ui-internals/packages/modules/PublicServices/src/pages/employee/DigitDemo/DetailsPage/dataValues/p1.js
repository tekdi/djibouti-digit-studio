export const p1Data = {
  // Define which blocks should be shown for P1 (Construction Permit)
  blocks: {
    landandProjectDesignDetails: {
      title: "Informations de la demande",
      icon: "LuBuilding",
      color: "purple",
      fields: [
        {
          label: "Type de projet",
          key: "workType",
          icon: "LuBuilding"
        },
        {
          label: "Localisation de parcelle",
          key: "siteLocation",
          icon: "LuMapPin"
        },
        {
          label: "Surface de la parcelle",
          key: "area",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Surface totale bâtie",
          key: "coveredProjectArea",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Destination du projet",
          key: "intededUse",
          icon: "LuBuilding"
        }
      ]
    },
    designOfficeDetailing: {
      title: "Cabinet d’Architecture / Bureau d’Étude",
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
