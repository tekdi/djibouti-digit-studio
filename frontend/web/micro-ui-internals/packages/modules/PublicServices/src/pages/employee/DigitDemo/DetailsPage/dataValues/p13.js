export const p13Data = {
  // Define which blocks should be shown for P13 (Certificate of Conformity)
  blocks: {
    originalPermitDetails: {
      title: "Détails du projet",
      icon: "LuFileText",
      color: "purple",
      fields: [
        // `ccgNumber` is synthesized in ProjectTab.js from response.applicationNumber
        // (the originalPermitDetails array coming from the form has no CCG number —
        // the CCG number IS the application number).
        {
          label: "Numéro du Certificat de Conformité Générale",
          key: "ccgNumber",
          icon: "LuHash"
        },
        {
          label: "Numéro du Permis de Construire",
          key: "originalPermitNumber",
          icon: "LuHash"
        },
        {
          label: "Date de délivrance du Permis de Construire",
          key: "originalPermitDate",
          icon: "LuCalendar"
        },
        {
          label: "Date d'achèvement de la construction",
          key: "constructionCompletionDate",
          icon: "LuCalendar"
        },
        {
          label: "Localisation",
          key: "localisation",
          icon: "LuMapPin"
        },
        {
          label: "Type de projet autorisé",
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
      title: "Détails des documents des Certificats de Conformité",
      icon: "LuCircleCheck",
      color: "green",
      fields: [
        {
          label: "Numéro de Référence du Certificat d'Alignement",
          key: "alignmentCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date de délivrance du Certificat d'Alignement",
          key: "alignmentCertificateDate",
          icon: "LuCalendar"
        },
        {
          label: "Numéro de Référence du Certificat de Conformité Électrique",
          key: "electricalCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date de délivrance du Certificat de Conformité Électrique",
          key: "electricalCertificateDate",
          icon: "LuCalendar"
        },
        {
          label: "Numéro de Référence du Certificat de Conformité Parasismique",
          key: "seismicCertificateNumber",
          icon: "LuHash"
        },
        {
          label: "Date de délivrance du Certificat de Conformité Parasismique",
          key: "seismicCertificateDate",
          icon: "LuCalendar"
        }
      ]
    }
  }
};
