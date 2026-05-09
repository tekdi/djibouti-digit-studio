export const p10Data = {
  // Define which blocks should be shown for P10 (Backfill Verification Certificate)
  blocks: {
    originalPermitDetails: {
      title: "Détails du permis original",
      icon: "LuFileText",
      color: "blue",
      fields: [
        {
          label: "Numéro du Certificat de Conformité de Remblai",
          key: "ccrNumber",
          icon: "LuHash"
        },
        {
          label: "Numéro du Permis de Remblai",
          key: "originalPermitNumber",
          icon: "LuHash"
        },
        {
          label: "Date de délivrance du Permis de Remblai",
          key: "prDeliveryDate",
          icon: "LuCalendar"
        },
        {
          label: "Date du permis original",
          key: "originalPermitDate",
          icon: "LuCalendar"
        },
        {
          label: "Date d'achèvement des travaux",
          key: "workCompletionDate",
          icon: "LuCalendar"
        }
      ]
    },
    terrainVerificationDetails: {
      title: "Vérification du terrain",
      icon: "LuMapPin",
      color: "green",
      fields: [
        {
          label: "Localisation du terrain",
          key: "terrainLocation",
          icon: "LuMapPin"
        },
        {
          label: "Surface du terrain",
          key: "terrainSurface",
          icon: "LuMapPin",
          suffix: " m²"
        },
        {
          label: "Volume de remblai réel",
          key: "actualFillVolume",
          icon: "LuHash",
          suffix: " m³"
        }
      ]
    },
    testResultsDetails: {
      title: "Résultats des tests",
      icon: "LuFileText",
      color: "orange",
      fields: [
        {
          label: "Nom du laboratoire",
          key: "laboratoryName",
          icon: "LuBuilding"
        },
        {
          label: "Numéro de test du laboratoire",
          key: "laboratoryTestNumber",
          icon: "LuHash"
        },
        {
          label: "Date du test",
          key: "testDate",
          icon: "LuCalendar"
        },
        {
          label: "Résultats du test",
          key: "testResults",
          icon: "LuFileText"
        }
      ]
    }
  }
};





