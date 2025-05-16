// export const serviceConfig = {
//     "tenantId": "dev",
//     "moduleName": "CommonService",
//     "ServiceConfiguration": [
//       {
//         "module": "Tradelicense",
//         "service": "NewTL",
//         "fields": [
//           {
//             "name": "tradeDetails",
//             "label": "Trade Details ",
//             "type": "object",
//               "properties": [
//                 {
//                   "name": "financialYear",
//                   "label": "Financial Year ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   //"defaultValue" : "2025_26",
//                   //"prefix": "FINANCIALYEAR",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "egf-master.FinancialYear2", 
//                   "orderNumber": 1
//                 },
//                 {
//                   "name": "licenseType",
//                   "label": "License Type ",
//                   "defaultValue" : "PERMANENT",
//                   // "prefix": "LICENSETYPE",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "required": false,
//                   "orderNumber": 2
//                 },
//                 {
//                   "name": "tradeName",
//                   "label": "Trade Name ",
//                   "type": "string",
//                   "format": "text",
//                   "maxLength": 128,
//                   "minLength": 2,
//                   "validation": {
//                     "regex": "^[A-Za-z0-9 ]+$",
//                     "message": "Only letters and numbers allowed"
//                   },
//                   "required": false,
//                   "orderNumber": 3
//                 },
//                 {
//                   "name": "tradeStructureType",
//                   "label": "Trade Structure Type ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "Tradelicence.StructureType",
//                   "orderNumber": 4
//                 },
//                 {
//                   "name": "tradeStructureSubType",
//                   "label": "Trade Structure Sub Type ",
//                   //same master how to give custom output for options
//                   // 1st way is to separate out master
//                   // 2nd way to pass custom logck in mdms
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "dependencies": [
//                     "tradeStructureType"
//                   ],
//                   "required": false,
//                   "schema": "Tradelicence.StructureSubType",
//                   "orderNumber": 5
//                 },
//                 {
//                   "name": "tradeCommencementDate",
//                   "label": "Trade Commencement Date ",
//                   "type": "date",
//                   "format": "date",
//                   "required": false,
//                   "orderNumber": 6
//                 }
//               ]
//           },
//           {
//             "name": "tradeUnits",
//             "label": "Trade Units ",
//             "type": "object",
//               "properties": [
//                 {
//                   "name": "tradeCategory",
//                   "label": "Trade Category ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "Tradelicence.TradeCategory",
//                   "orderNumber": 1
//                 },
//                 {
//                   "name": "tradeType",
//                   "label": "Trade Type ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "Tradelicence.TradeType",
//                   "orderNumber": 2
//                 },
//                 {
//                   "name": "tradeSubType",
//                   "label": "Trade Sub Type ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "Tradelicence.TradeSubType",
//                   "orderNumber": 3
//                 }
//               ]
//           },
//           // {
//           //   "name": "tradeAddress",
//           //   "label": "Trade Address ",
//           //   "type": "object",
//           //     "properties": [
//           //       {
//           //         "name": "pincode",
//           //         "label": "Pincode ",
//           //         "disable" : false,
//           //         "type": "string",
//           //         "format": "pincode",
//           //         "maxLength": 6,
//           //         "minLength": 0,
//           //         "validation": {
//           //           "regex": "^[1-9][0-9]{5}$",
//           //           "message": "Only 6 numbers allowed"
//           //         },
//           //         "required": false,
//           //         "orderNumber": 1
//           //       },
//           //       {
//           //         "name": "city",
//           //         "label": "City ",
//           //         "disable" : false,
//           //         "defaultValue" : "DEV",
//           //         "prefix": "CITY",
//           //         "type": "string",
//           //         "format": "radioordropdown",
//           //         "required": false,
//           //       },
//           //       {
//           //         "name": "streetName",
//           //         "label": "Street Name ",
//           //         "disable" : false,
//           //         "type": "string",
//           //         "format": "text",
//           //         "maxLength": 256,
//           //         "minLength": 0,
//           //         "validation": {
//           //           "regex": "^[1-9][0-9]{5}$",
//           //           "message": "Only 6 numbers allowed"
//           //         },
//           //         "required": false,
//           //         "orderNumber": 1
//           //       },
//           //     ]
//           // },
//           // {
//           //   "name": "ownershipDetails",
//           //   "label": "Ownership Details ",
//           //   "type": "object",
//           //     "properties": [
//           //       {
//           //         "name": "OwnerName",
//           //         "label": "Owner Name ",
//           //         "disable" : false,
//           //         "type": "string",
//           //         "format": "text",
//           //         "maxLength": 256,
//           //         "minLength": 0,
//           //         "validation": {
//           //           "regex": "^[1-9][0-9]{5}$",
//           //           "message": "Only 6 numbers allowed"
//           //         },
//           //         "required": false,
//           //         "orderNumber": 1
//           //       },
//           //       {
//           //         "name": "mobileNumber",
//           //         "label": "Mobile Number ",
//           //         "disable" : false,
//           //         "type": "mobileNumber",
//           //         "format": "mobuleNumber",
//           //         "maxLength": 256,
//           //         "minLength": 0,
//           //         "validation": {
//           //           "regex": "^[6-9]\d{9}$",
//           //           "message": "Only 9 numbers allowed"
//           //         },
//           //         "required": false,
//           //         "orderNumber": 1
//           //       },
//           //       {
//           //         "name": "gender",
//           //         "label": "Gender ",
//           //         "disable" : false,
//           //         "type": "string",
//           //         "format": "radioordropdown",
//           //         "reference": "mdms",
//           //         "required": false,
//           //         "schema": "common-masters.GenderType" 
//           //       },
//           //     ]
//           // },
//           {
//             "name": "accessories",
//             "label": "Trade accessories ",
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": [
//                 {
//                   "name": "accessoryType",
//                   "label": "Accessory type ",
//                   "type": "string",
//                   "format": "radioordropdown",
//                   "reference": "mdms",
//                   "required": false,
//                   "schema": "TradeLicense.AccessoriesCategory",
//                   "orderNumber": 1
//                 }
//                 // {
//                 //   "name": "count",
//                 //   "label": "accessories count ",
//                 //   "type": "number"
//                 // }
//               ]
//             }
//           }
//         ],
//         "workflow": {
//           "businessService": "NewTL",
//           "ACTIVE": [
//             "APPROVED"
//           ],
//           "INACTIVE": [
//             "REJECTED",
//             "WITHDRAWN"
//           ]
//         },
//         "calculator": {
//           "billingSlabs": [
//             {
//               "key": "applicationFee",
//               "value": 2000
//             }
//           ]
//         },
//         "idgen": {
//           "format": "tl.application.number"
//         },
//         "localization": {
//           "modules": [
//             "digit-tradelicence"
//           ]
//         },
//         "notification": {
//           "sms": {
//             "TODO": "will fill later"
//           },
//           "email": {
//             "TODO": "will fill later"
//           }
//         },
//         "access": {
//           "roles": [
//             "TL_CREATOR"
//           ],
//           "actions": [
//             {
//               "url": "tl-services/v1/create"
//             }
//           ]
//         },
//         "rules": {
//           "validation": {
//             "type": "schema||api||custom||none",
//             "service": "tradelicence",
//             "schemaCode": "tradelicence.apply",
//             "customFunction": "eitherhookname||function"
//           },
//           "calculator": {
//             "type": "api||custom||none",
//             "service": "tradelicence",
//             "customFunction": "eitherhookname||function"
//           },
//           "registry": {
//             "type": "api||none",
//             "service": "tradelicence"
//           },
//           "references": [
//             {
//               "type": "initiate",
//               "service": "tradelicence"
//             }
//           ]
//         },
//         "documents": [
//           {
//             "category": "address-proof",
//             "documentTypes": [
//               "aadhar",
//               "voter"
//             ],
//             "active": true,
//             "isMandatory": false,
//             "allowedFileTypes": [
//               "pdf",
//               "doc",
//               "docx",
//               "xlsx",
//               "xls",
//               "jpeg",
//               "jpg",
//               "png"
//             ],
//             "maxSizeInMB": 5,
//             "maxFilesAllowed": 1
//           },
//           {
//             "category": "identity-proof",
//             "documentTypes": [
//               "aadhar",
//               "voter"
//             ],
//             "active": true,
//             "isMandatory": true,
//             "allowedFileTypes": [
//               "pdf",
//               "doc",
//               "docx",
//               "xlsx",
//               "xls",
//               "jpeg",
//               "jpg",
//               "png"
//             ],
//             "maxSizeInMB": 5,
//             "maxFilesAllowed": 1
//           },
//           {
//             "category": "owner-photo",
//             "documentTypes": [
//               "photo"
//             ],
//             "active": true,
//             "isMandatory": true,
//             "allowedFileTypes": [
//               "jpeg",
//               "jpg",
//               "png"
//             ],
//             "maxSizeInMB": 5,
//             "maxFilesAllowed": 1
//           }
//         ],
//         "pdf": [
//           {
//             "key": "tl-application",
//             "type": "application"
//           },
//           {
//             "key": "tl-bill",
//             "type": "bill"
//           },
//           {
//             "key": "tl-receipt",
//             "type": "receipt"
//           }
//         ],
//         "bill": {
//           "service": "ApplicationFee"
//         },
//         "payment": {
//           "gateway": "TODO"
//         },
//         "apiconfig": [
//           {
//             "type": "register",
//             "host": "https://staging.digit.org||http://tl-services.egov:8080",
//             "endpoint": "/tl-services/v1/create",
//             "method": "post",
//             "service": "tradelicence"
//           },
//           {
//             "type": "register||calculate||validate||authenticate",
//             "host": "https://staging.digit.org||http://tl-services.egov:8080",
//             "endpoint": "/tl-services/v1/search",
//             "method": "post",
//             "service": "tradelicence"
//           }
//         ],
//         "applicant": {
//           "minimum": 1,
//           "maximum": 3,
//           "types": [
//             "individual",
//             "organisation"
//           ]
//         },
//         "boundary": {
//           "hierarchyType": "REVENUE",
//           "lowestLevel": "locality"
//         },
//         "enabled": [
//           "citizen",
//           "employee"
//         ]
//       },
//     ]
//   }

export const serviceConfig = {
  "tenantId": "dj",
  "moduleName": "Studio",
  "ServiceConfiguration": [
    {
      "module": "BPA",
      "service": "BPA_PCO",
      "pdf": [
        {
          "key": "pco-application",
          "type": "application"
        },
        {
          "key": "pco-receipt",
          "type": "receipt"
        }
      ],
      "idgen": [
        {
          "name": "egov.idgen.bpa.applicationNum",
          "type": "application",
          "format": "DJ-BP-[cy:yyyy-MM-dd]-[SEQ_EG_BP_APN]"
        }
      ],
      "access": {
        "roles": ["BPA_ARCHITECT", "STUDIO_ADMIN"],
        "actions": [
          {
            "url": "/public-service/v1/application"
          }
        ]
      },
      "fields": [
        {
          "name": "landandProjectDesignDetails",
          "label": "Land and Project Design Details",
          "type": "array",
          "items": {
            "type": "object",
            "properties": [
              {
                "name": "siteLocation",
                "label": "Site Location",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 500,
                "required": false
              },
              {
                "name": "area",
                "label": "Area (in m²)",
                "type": "string",
                "format": "number",
                "validation": {
                  "min": 0,
                  "message": "Area should be non negative"
                },
                "required": false
              },
              {
                "name": "legalStatus",
                "label": "Legal Current Status",
                "type": "string",
                "format": "text",
                "validation": {
                  "min": 0,
                  "message": "Legal current status should not be empty"
                },
                "required": false
              },
              {
                "name": "registrationCertificate",
                "label": "Registration Certificate",
                "type": "radio",
                "reference": "enum",
                "required": false,
                "values": ["Yes", "No"]
              },
              {
                "name": "definitiveLandTitle",
                "label": "Definitive Land Title (TF)",
                "type": "radio",
                "reference": "enum",
                "required": false,
                "values": ["Yes", "No"]
              },
              {
                "name": "tfNo",
                "label": "If Yes, please indicate TF No",
                "type": "string",
                "format": "text",
                "maxLength": 20,
                "required": false
              },
              {
                "name": "other",
                "label": "Other",
                "type": "string",
                "format": "text",
                "maxLength": 256,
                "required": false
              },
              {
                "name": "workType",
                "label": "Type of Work",
                "type": "string",
                "reference": "mdms",
                "format": "radioordropdown",
                "required": false,
                "schema": "BPA.WorkType"
              },
              {
                "name": "noOfUnits",
                "label": "Number of Housing Units",
                "type": "number",
                "format": "number",
                "required": false,
                "validation": {
                  "min": 0,
                  "message": "Number of housing units should be non negative"
                }
              },
              {
                "name": "detailsOnOtherType",
                "label": "Details on other types",
                "type": "string",
                "format": "text",
                "maxLength": 256
              },
              {
                "name": "maximumAuthorizedCes",
                "label": "Maximum authorized C.E.S (2) for the zone",
                "type": "string",
                "format": "number",
                "required": false
              },
              {
                "name": "prjectedCes",
                "label": "Projected C.E.S.",
                "type": "string",
                "format": "number",
                "required": false
              },
              {
                "name": "maximumAuthorizedCos",
                "label": "Maximum authorized C.O.S (3) for the zone",
                "type": "string",
                "format": "number",
                "required": false
              },
              {
                "name": "projectedCos",
                "label": "Projected C.O.S.",
                "type": "string",
                "format": "number",
                "required": false
              },
              {
                "name": "coveredProjectArea",
                "label": "Covered project area (m²)",
                "type": "string",
                "format": "number",
                "required": false
              },
              {
                "name": "constructionCostPerSqMt",
                "label": "Construction cost per m² excluding work",
                "type": "string",
                "format": "number",
                "required": false,
                "minLength": 1
              }
            ]
          }
        },
        {
          "name": "designOfficeDetailing",
          "label": "Design office detailing",
          "type": "array",
          "items": {
            "type": "object",
            "properties": [
              {
                "name": "nameOfDesignOffice",
                "label": "Name of Design Office",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "architectName",
                "label": "Architect's Full Name",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 256,
                "required": false
              },
              {
                "name": "telephone",
                "label": "Telephone",
                "type": "number",
                "format": "text",
                "validation": {
                  "regex": "(^$|^77[0-9]{6}$)",
                  "message": "Only valid contact number is allowed"
                },
                "required": false
              },
              {
                "name": "officeEmail",
                "label": "Office email",
                "type": "string",
                "format": "text",
                "validation": {
                  "regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                  "message": "Invalid email id"
                },
                "required": false
              },
              {
                "name": "registrationNo",
                "label": "Registration no.",
                "type": "string",
                "format": "text",
                "required": false
              }
            ]
          }
        }
      ],
      "enabled": ["citizen", "employee"],
      "payment": {
        "gateway": "D-MONEY"
      },
      "boundary": {
        "lowestLevel": "locality",
        "hierarchyType": "REVENUE"
      },
      "workflow": {
        "BusinessService": [
          {
            "states": [
              {
                "sla": null,
                "state": "",
                "actions": [
                  {
                    "roles": ["BPA_ARCHITECT", "STUDIO_ADMIN"],
                    "action": "DRAFT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "INITIATED",
                    "currentState": ""
                  }
                ],
                "tenantId": "dj",
                "isStartState": true,
                "isStateUpdatable": true,
                "isTerminateState": false,
                "applicationStatus": "",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "INITIATED",
                "actions": [
                  {
                    "roles": ["BPA_ARCHITECT", "STUDIO_ADMIN"],
                    "action": "APPLY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AGENT_NOT_ASSIGNED",
                    "currentState": "INITIATED"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "INPROGRESS",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "AGENT_NOT_ASSIGNED",
                "actions": [
                  {
                    "roles": ["HOD", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AGENT_NOT_ASSIGNED",
                    "currentState": "AGENT_NOT_ASSIGNED"
                  },
                  {
                    "roles": ["HOD", "STUDIO_ADMIN"],
                    "action": "ASSIGN_TO_AGENT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "PENDING_ACTION_BY_AGENT",
                    "currentState": "AGENT_NOT_ASSIGNED"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "AGENT_NOT_ASSIGNED",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "PENDING_ACTION_BY_AGENT",
                "actions": [
                  {
                    "roles": ["AGENT", "STUDIO_ADMIN"],
                    "action": "SEND_TO_HOD",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AGENT_REPORT_READY",
                    "currentState": "PENDING_ACTION_BY_AGENT"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "PENDING_ACTION",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "AGENT_REPORT_READY",
                "actions": [
                  {
                    "roles": ["HOD", "STUDIO_ADMIN"],
                    "action": "NON_CONFORM",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "DECLARED_NON_CONFORM",
                    "currentState": "AGENT_REPORT_READY"
                  },
                  {
                    "roles": ["HOD", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AGENT_REPORT_READY",
                    "currentState": "AGENT_REPORT_READY"
                  },
                  {
                    "roles": ["HOD", "STUDIO_ADMIN"],
                    "action": "SEND_TO_DIRECTOR",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "NOT_FORWARDED_TO_COMMISSIONER",
                    "currentState": "AGENT_REPORT_READY"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "AGENT_REPORT_READY",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "DECLARED_NON_CONFORM",
                "actions": [
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "REJECT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "PERMIT_REJECTED",
                    "currentState": "DECLARED_NON_CONFORM"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "DECLARED_NON_CONFORM",
                    "currentState": "DECLARED_NON_CONFORM"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "SEND_TO_COMMISSIONER",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AWAITING_ON_COMMISSIONER",
                    "currentState": "DECLARED_NON_CONFORM"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "DECLARED_NON_CONFORM",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "NOT_FORWARDED_TO_COMMISSIONER",
                "actions": [
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "REJECT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "PERMIT_REJECTED",
                    "currentState": "NOT_FORWARDED_TO_COMMISSIONER"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "NOT_FORWARDED_TO_COMMISSIONER",
                    "currentState": "NOT_FORWARDED_TO_COMMISSIONER"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "SEND_TO_COMMISSIONER",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AWAITING_ON_COMMISSIONER",
                    "currentState": "NOT_FORWARDED_TO_COMMISSIONER"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "NOT_FORWARDED_TO_COMMISSIONER",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "AWAITING_ON_COMMISSIONER",
                "actions": [
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "REJECT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "PERMIT_REJECTED",
                    "currentState": "AWAITING_ON_COMMISSIONER"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AWAITING_ON_COMMISSIONER",
                    "currentState": "AWAITING_ON_COMMISSIONER"
                  },
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "SEND_TO_CITIZEN_PAYMENT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AWAITING_CITIZEN_PAYMENT",
                    "currentState": "AWAITING_ON_COMMISSIONER"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "AWAITING_ON_COMMISSIONER",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "AWAITING_CITIZEN_PAYMENT",
                "actions": [
                  {
                    "roles": ["CITIZEN", "STUDIO_ADMIN"],
                    "action": "ADD_QUERY",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "AWAITING_CITIZEN_PAYMENT",
                    "currentState": "AWAITING_CITIZEN_PAYMENT"
                  },
                  {
                    "roles": ["CITIZEN", "STUDIO_ADMIN"],
                    "action": "MAKE_PAYMENT",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "CITIZEN_PAYMENT_DONE",
                    "currentState": "AWAITING_CITIZEN_PAYMENT"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "AWAITING_CITIZEN_PAYMENT",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "CITIZEN_PAYMENT_DONE",
                "actions": [
                  {
                    "roles": ["DIRECTOR", "STUDIO_ADMIN"],
                    "action": "APPROVE",
                    "active": true,
                    "tenantId": "dj",
                    "nextState": "PERMIT_GRANTED",
                    "currentState": "CITIZEN_PAYMENT_DONE"
                  }
                ],
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": false,
                "applicationStatus": "CITIZEN_PAYMENT_DONE",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "PERMIT_GRANTED",
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": true,
                "applicationStatus": "PERMIT_GRANTED",
                "docUploadRequired": false
              },
              {
                "sla": null,
                "state": "PERMIT_REJECTED",
                "tenantId": "dj",
                "isStartState": false,
                "isStateUpdatable": false,
                "isTerminateState": true,
                "applicationStatus": "PERMIT_REJECTED",
                "docUploadRequired": false
              }
            ],
            "business": "public-service",
            "tenantId": "dj",
            "businessService": "BPA_PCO",
            "businessSericeSla": null
          }
        ],
        "businessService": "BPA_PCO"
      },
      "applicant": {
        "types": ["individual"],
        "maximum": 3,
        "minimum": 1
      },
      "documents": [
        {
          "active": true,
          "category": "address-proof",
          "isMandatory": false,
          "maxSizeInMB": 5,
          "documentTypes": ["aadhar", "voter"],
          "maxFilesAllowed": 1,
          "allowedFileTypes": [
            "pdf",
            "doc",
            "docx",
            "xlsx",
            "xls",
            "jpeg",
            "jpg",
            "png"
          ]
        },
        {
          "active": true,
          "category": "identity-proof",
          "isMandatory": true,
          "maxSizeInMB": 5,
          "documentTypes": ["aadhar", "voter"],
          "maxFilesAllowed": 1,
          "allowedFileTypes": [
            "pdf",
            "doc",
            "docx",
            "xlsx",
            "xls",
            "jpeg",
            "jpg",
            "png"
          ]
        },
        {
          "active": true,
          "category": "owner-photo",
          "isMandatory": true,
          "maxSizeInMB": 5,
          "documentTypes": ["photo"],
          "maxFilesAllowed": 1,
          "allowedFileTypes": ["jpeg", "jpg", "png"]
        }
      ],
      "localization": {
        "modules": ["digit-bpa"]
      },
      "notification": {
        "sms": {
          "TODO": "will fill later"
        },
        "email": {
          "TODO": "will fill later"
        }
      }
    }
  ]
}