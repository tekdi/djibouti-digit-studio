export const AddressFields = [
  {
    name: "address",
    label: "Address ",
    type: "object",
    properties: [
      {
        name: "pincode",
        label: "Pincode ",
        disable: false,
        type: "string",
        format: "number",
        maxLength: 6,
        minLength: 0,
        validation: {
          regex: "^[1-9][0-9]{5}$",
          message: "Only 6 numbers allowed",
          maxLength: 6,
          minLength: 0,
        },
        required: false,
        orderNumber: 1,
      },
      {
        key: "city",
        type: "boundary",
        name: "city",
        inline: true,
        label: "city",
        disable: false,
        populators: {
          name: "city",
          levelConfig: { lowestLevel: "LOCALITY", highestLevel: "LOCALITY", isSingleSelect: ["LOCALITY"] },
          hierarchyType: "NEWTEST00222",
          noCardStyle: true,
          layoutConfig: {
            // isDropdownLayoutHorizontal: true,
            // isLabelFieldLayoutHorizontal: true,
            isLabelNeeded: false,
          },
          //"preSelected":["NEWTEST00222_MO","NEWTEST00222_MO_11_MARYLAND","NEWTEST00222_MO_11_06_PLEEBO"],

          // "frozenData":
          // [{
          //     code: "NEWTEST00222_MO",
          //     name: "NEWTEST00222_MO"
          //   },
          //   {
          //     code: "NEWTEST00222_MO.NEWTEST00222_MO_11_MARYLAND",
          //     name: "NEWTEST00222_MO_11_MARYLAND"
          //   },
          //   {
          //     code: "NEWTEST00222_MO.NEWTEST00222_MO_11_MARYLAND.NEWTEST00222_MO_11_06_PLEEBO",
          //     name: "NEWTEST00222_MO_11_06_PLEEBO"
          //   }]
        },
      },
      // {
      //   "name": "city",
      //   "label": "City ",
      //   "disable" : false,
      //   "defaultValue" : "DEV",
      //   "prefix": "CITY",
      //   "type": "string",
      //   "format": "radioordropdown",
      //   "required": false,
      // },
      {
        name: "streetName",
        label: "Street Name ",
        disable: false,
        type: "string",
        format: "text",
        maxLength: 256,
        minLength: 0,
        validation: {
          regex: "^[1-9][0-9]{5}$",
          message: "Only 6 numbers allowed",
        },
        required: false,
        orderNumber: 1,
      },
    ],
  },
];

export const ApplicantFields = [
  {
    name: "applicantDetails",
    label: "Identité du demandeur",
    type: "array",
    items: {
      type: "object",
      properties: [
        // Person Type Selector - Always shown first
        {
          name: "personType",
          type: "component",
          format: "component",
          component: "PersonTypeSelector",
          required: true,
          hideInReview: true,
          options: [
            { value: "INDIVIDUAL", label: "Personne physique" },
            { value: "LEGAL_ENTITY", label: "Personne morale" },
          ],
          orderNumber: 1,
          label: "Type de personne",
        },

        // Personal Information Fields - Shown for both individual and legal entity (representative)
        {
          name: "wayToAddress",
          type: "string",
          label: "Civilité *",
          format: "radioordropdown",
          schema: "common-masters.GenderType",
          required: true,
          reference: "mdms",
          orderNumber: 16, // After representative section header
        },
        {
          name: "name",
          type: "string",
          label: "Nom complet *",
          format: "text",
          placeholder: "Nom et prénom complets",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "NAME_LENGTH_ERR",
          },
          orderNumber: 17,
        },
        {
          name: "idType",
          label: "Type de pièce d'identité *",
          type: "string",
          format: "radioordropdown",
          required: true,
          schema: "BPA.IdentityType",
          reference: "mdms",
          orderNumber: 19,
        },
        {
          name: "nationalIdNumber",
          type: "string",
          label: "Numéro de pièce d'identité *",
          placeholder: "Numéro de la pièce",
          format: "text",
          required: true,
          validation: {
            regex: "^[a-zA-Z0-9]{1,30}$",
            message: "ID_ALPHANUMERIC_ERR",
          },
          maxLength: 30,
          minLength: 1,
          orderNumber: 20,
        },
        {
          name: "mobileNumber",
          type: "string",
          label: "Numéro de téléphone *",
          format: "mobileNumber",
          required: true,
          validation: {
            regex: "(^$|^77[0-9]{6}$)",
            message: "TELEPHONE_NUMBER_ERR",
          },
          placeholder: "77 XX XX XX",
          maxLength: 8,
          minLength: 8,
          orderNumber: 21,
        },

        // Section Header for Company Information
        {
          name: "companyInfoHeader",
          type: "section",
          label: "Informations de l'entité",
          orderNumber: 7,
        },

        // Legal Entity Fields - Only shown when personType === "LEGAL_ENTITY"
        {
          name: "corporateName",
          type: "string",
          label: "Raison sociale *",
          format: "text",
          placeholder: "Nom de l'entreprise",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "CORPORATE_NAME_LENGTH_ERR",
          },
          orderNumber: 8,
        },
        {
          name: "companyType",
          type: "string",
          label: "Forme juridique *",
          format: "radioordropdown",
          required: true,
          schema: "BPA.CompanyType",
          reference: "mdms",
          orderNumber: 9,
        },
        {
          name: "otherCompanyType",
          type: "string",
          label: "Autre forme juridique",
          format: "text",
          placeholder: "Préciser la forme juridique",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "OTHER_COMPANY_TYPE_ERR",
          },
          orderNumber: 10,
          showWhen: "personType === 'LEGAL_ENTITY' && companyType === 'OTHER'",
        },
        {
          name: "telephone",
          type: "string",
          label: "Téléphone *",
          format: "mobileNumber",
          required: true,
          validation: {
            regex: "(^$|^77[0-9]{6}$)",
            message: "TELEPHONE_NUMBER_ERR",
          },
          placeholder: "77 XX XX XX",
          maxLength: 8,
          minLength: 8,
          orderNumber: 14, // Part of company information
        },

        // Section Header for Representative Information
        {
          name: "representativeInfoHeader",
          type: "section",
          label: "Informations du représentant",
          orderNumber: 15,
        },

        // Representative's personal information - using same fields as individual, labels will be changed dynamically
        {
          name: "qualiteRepresentant",
          type: "string",
          label: "Qualité du représentant *",
          format: "text",
          placeholder: "Directeur général, Gérant, etc.",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "QUALITE_REPRESENTANT_ERR",
          },
          orderNumber: 15.5, // After representative section header, before other representative fields
        },

        // Common fields for both types
        // Email field removed as requested

        // Declarations - Always shown at the end
        // {
        //   name: "eligibilityDeclaration",
        //   type: "string",
        //   label: "Je certifie être habilité à demander cette autorisation",
        //   format: "checkbox",
        //   withoutLabel: true,
        //   required: true,
        //   orderNumber: 17,
        // },
        // {
        //   name: "accuracyDeclaration",
        //   type: "string",
        //   label: "Je certifie que les informations fournies sont exactes",
        //   format: "checkbox",
        //   withoutLabel: true,
        //   required: true,
        //   excludeServices: ["BPA_PD"],
        //   orderNumber: 18,
        // },
        // {
        //   name: "taxCalculationAgreement",
        //   type: "string",
        //   label: "J'accepte que les informations soient utilisées pour le calcul des taxes",
        //   format: "checkbox",
        //   withoutLabel: true,
        //   required: true,
        //   excludeServices: ["BPA_PCS", "BPA_PD", "BPA_ATARR"],
        //   orderNumber: 19,
        // },
        // {
        //   name: "checkValidation",
        //   type: "string",
        //   label: "J'accepte que le téléphone soit utilisé pour les communications",
        //   format: "checkbox",
        //   withoutLabel: true,
        //   required: true,
        //   excludeServices: ["BPA_PD"],
        //   orderNumber: 20,
        // },
      ],
    },
  },
];

export const documentFields = [
  {
    head: "documents",
    body: [
      {
        type: "documentUploadAndDownload",
        withoutLabel: true,
        mdmsModuleName: "DigitStudio",
        module: "BPA.BPA_PCO",
        error: "BPA_DOC_REQUIRED_ERR",
        name: "uploadedDocs",
        populators: {
          name: "uploaded",
          action: "APPLY",
        },
        customClass: "input-emp",
        localePrefix: "PCO_DOC",
      },
    ],
  },
];

export const checklistByService = [
  {
    // p1
    service: "BPA_PCO",
    checklist: ["customInstructionSheet", "customSDECCInstructionSheet", "calculationFees", "customCommissionersChecklist"],
  },
  {
    // p2
    service: "BPA_PCO_SIMPLE",
    checklist: ["customInstructionSheet", "customSDECCInstructionSheet", "calculationFees", "customCommissionersChecklist"],
  },
  {
    // p3
    service: "BPA_PR",
    checklist: ["customAgentChecklist"],
  },
  {
    service: "BPA_PL",
    checklist: ["customInstructionSheet", "calculationFees", "customCommissionersChecklist"],
  },
  {
    service: "BPA_PCS",
    checklist: ["calculationFees"],
  },
  {
    service: "BPA_PD",
    checklist: ["BPA_PCO.PENDING_ACTION_BY_AGENT", "customAgentChecklist"],
  },
  {
    service: "BPA_PS",
    checklist: ["customInstructionSheet", "customPSSDECCInstructionSheet", "calculationFees", "customCommissionersChecklist"],
  },
  {
    service: "BPA_ATARR",
    checklist: ["customATARRInstructionSheet", "calculationFees"],
  },
  {
    service: "BPA_CCR",
    checklist: ["customCCRChecklist"],
  },
  {
    service: "BPA_CCE",
    checklist: ["customBCIEInspectionChecklist"],
  },
  {
    service: "BPA_CCP",
    checklist: ["customAgentChecklist"],
  },
  {
    service: "BPA_CCG",
    checklist: ["customCCGVisitChecklist"],
  },
  {
    service: "BPA_PV",
    checklist: ["customPVImplantationChecklist"],
  },
  {
    // p12
    service: "BPA_APE",
    checklist: ["customAPEInstructionSheet"],
  },
  {
    service: "BPA_PF",
    checklist: ["customCommissionersChecklist", "calculationFees"],
  },
];
