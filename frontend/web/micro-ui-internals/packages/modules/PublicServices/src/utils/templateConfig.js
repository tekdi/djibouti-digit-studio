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
    label: "Applicant Details ",
    type: "array",
    items: {
      type: "object",
      properties: [
        // {
        //   "name": "OwnerName",
        //   "label": "Owner Name ",
        //   "disable" : false,
        //   "type": "string",
        //   "format": "text",
        //   "maxLength": 256,
        //   "minLength": 0,
        //   "validation": {
        //     "regex": "^[1-9][0-9]{5}$",
        //     "message": "Only 6 numbers allowed"
        //   },
        //   "required": false,
        //   "orderNumber": 1
        // },
        // {
        //   "name": "mobileNumber",
        //   "label": "Mobile Number ",
        //   "disable" : false,
        //   "type": "mobileNumber",
        //   "format": "mobileNumber",
        //   "maxLength": 256,
        //   "minLength": 0,
        //   "validation": {
        //     "regex": "^[6-9]\d{9}$",
        //     "message": "Only 9 numbers allowed"
        //   },
        //   "required": false,
        //   "orderNumber": 1
        // },
        // {
        //   "name": "gender",
        //   "label": "Gender ",
        //   "disable" : false,
        //   "type": "string",
        //   "format": "radioordropdown",
        //   "reference": "mdms",
        //   "required": false,
        //   "schema": "common-masters.GenderType"
        // },
        {
          name: "wayToAddress",
          type: "string",
          placeholder: "ENTER_WAY_TO_ADDRESS",
          label: "Preferred Way to Address",
          format: "radioordropdown",
          schema: "common-masters.GenderType",
          required: true,
          reference: "mdms",
        },
        {
          name: "name",
          type: "string",
          label: "Legal Name",
          format: "text",
          placeholder: "ENTER_LEGAL_NAME",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "NAME_LENGTH_ERR",
          },
        },
        {
          name: "address",
          type: "string",
          label: "Address",
          placeholder: "ENTER_ADDRESS",
          format: "text",
          required: true,
          maxLength: 256,
          minLength: 2,
          validation: {
            regex: "^.{2,256}$",
            message: "NAME_LENGTH_ERR",
          },
        },
        {
          name: "idType",
          label: "ID type",
          type: "string",
          format: "radioordropdown",
          required: true,
          schema: "BPA.IdentityType",
          reference: "mdms",
        },
        {
          name: "nationalIdNumber",
          type: "string",
          label: "National Identification Number (CIN)",
          placeholder: "ENTER_NATIONAL_ID_NUMBER",
          format: "number",
          required: true,
          validation: {
            regex: "^\\d{1,30}$",
            message: "ID_NUMBER_ERR",
          },
          maxLength: 30,
          minLength: 1,
        },
        {
          name: "mobileNumber",
          type: "string",
          label: "Mobile number",
          format: "mobileNumber",
          required: true,
          validation: {
            regex: "(^$|^77[0-9]{6}$)",
            message: "TELEPHONE_NUMBER_ERR",
          },
          placeholder: "00 00 00 00",
          maxLength: 8,
          minLength: 8,
        },
        {
          name: "eligibilityDeclaration",
          type: "string",
          label: "I certify I am entitled to request this authorization",
          format: "checkbox",
          withoutLabel: true,
          required: true,
        },
        {
          name: "accuracyDeclaration",
          type: "string",
          label: "I, the undersigned, author of the request, certify that the information provided is correct",
          format: "checkbox",
          withoutLabel: true,
          required: true,
        },
        {
          name: "taxCalculationAgreement",
          type: "string",
          label:
            "I am aware that the information contained in this application will be used to calculate the taxes stipulated in the French Planning Code.",
          format: "checkbox",
          withoutLabel: true,
          required: true,
        },
        {
          name: "checkValidation",
          type: "string",
          label: "The phone number will be used for communication regarding the application and payment details",
          format: "checkbox",
          withoutLabel: true,
          required: true,
        },
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
