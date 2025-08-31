export const p13Data = {
  // Define which blocks should be shown for P13 (Certificate of Conformity)
  blocks: {
    originalPermitDetails: {
      title: "Détails du permis de construction original",
      icon: "LuFileText",
      color: "purple",
      fields: [
        {
          label: "Numéro de permis original",
          key: "originalPermitNumber",
          icon: "LuHash"
        },
        {
          label: "Date du permis original",
          key: "originalPermitDate",
          icon: "LuCalendar"
        },
        {
          label: "Date d'achèvement de construction",
          key: "constructionCompletionDate",
          icon: "LuCalendar"
        },
        {
          label: "Localisation",
          key: "localisation",
          icon: "LuMapPin"
        },
        {
          label: "Type de construction",
          key: "constructionType",
          icon: "LuBuilding"
        },
        {
          label: "Numéro de titre foncier",
          key: "landTitleNumber",
          icon: "LuHash"
        }
      ]
    },
    conformityCertificatesDetails: {
      title: "Détails des certificats de conformité",
      icon: "LuCircleCheck",
      color: "green",
      fields: [
        {
          label: "Numéro de certificat d'alignement",
          key: "alignmentCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date du certificat d'alignement",
          key: "alignmentCertificateDate",
          icon: "LuCalendar"
        },
        {
          label: "Numéro de certificat électrique",
          key: "electricalCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date du certificat électrique",
          key: "electricalCertificateDate",
          icon: "LuCalendar"
        },
        {
          label: "Numéro de certificat sismique",
          key: "seismicCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date du certificat sismique",
          key: "seismicCertificateDate",
          icon: "LuCalendar"
        }
      ]
    }
  }
};
