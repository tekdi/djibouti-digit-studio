// export const serviceConfigPGR = {
//     "tenantId": "pg",
//     "moduleName": "CommonService",
//     "ServiceConfiguration": [
//       {
//         "module": "PGR",
//         "service": "Newpgr",
//         "fields": [
//           {
//             "name": "mobileNumber",
//             "label": "Mobile Number ",
//             "format": "mobileNumber",
//             "disable" : false,
//             "type": "mobileNumber",
//             "required": true,
//           },
//           {
//             "name": "citizenName",
//             "label": "Citizen Name ",
//             "format": "text",
//             "disable" : false,
//             "type": "string",
//             "maxLength": 128,
//             "minLength": 2,
//             "validation": {
//               "regex": "^[A-Za-z0-9 ]+$",
//               "message": "Only letters and numbers allowed"
//             },
//             "required": true,
//             "orderNumber": 1
//           },
//           {
//             "name": "complaintType",
//             "label": "Complaint Type ",
//             "format": "radioordropdown",
//             "disable" : false,
//             "type": "string",
//             "reference": "mdms",
//             "required": true,
//             "schema": "RAINMAKER-PGR.ServiceDefs" 
//           },
//           {
//             "name": "complaintSubType",
//             "label": "Complaint Sub Type ",
//             "format": "radioordropdown",
//             //same master how to give custom output for options
//             // 1st way is to separate out master
//             // 2nd way to pass custom logck in mdms
//             "disable" : false,
//             "type": "string",
//             "reference": "mdms",
//             "dependencies": [
//               "complaintType"
//             ],
//             "required": true,
//             "schema": "RAINMAKER-PGR.ServiceDefs"
//           },
//           // {
//           //   "name": "complaintLocation",
//           //   "label": "Complaint Location ",
//           //   "type": "object",
//           //     "properties": [
//           //       {
//           //           "name": "pincode",
//           //           "label": "Pincode ",
//           //           "disable" : false,
//           //           "type": "string",
//           //           "format": "number",
//           //           "maxLength": 6,
//           //           "minLength": 2,
//           //           "validation": {
//           //             "regex": "^[1-9][0-9]{5}$",
//           //             "message": "Only numbers allowed",
//           //             "maxLength": 6,
//           //             "minLength": 2,
//           //           },
//           //           "required": true,
//           //           "orderNumber": 1
//           //         },
//           //         {
//           //           "name": "city",
//           //           "label": "City ",
//           //           "disable" : false,
//           //           "type": "string",
//           //           "format": "radioordropdown",
//           //           "maxLength": 6,
//           //           "minLength": 2,
//           //           "validation": {
//           //             "regex": "^[A-Za-z0-9 ]+$",
//           //             "message": "Only char and numbers allowed"
//           //           },
//           //           "required": true,
//           //           "orderNumber": 1
//           //         },
//           //         {
//           //           "name": "locality",
//           //           "label": "Locality ",
//           //           "disable" : false,
//           //           "type": "string",
//           //           "format": "text",
//           //           "maxLength": 6,
//           //           "minLength": 2,
//           //           "validation": {
//           //             "regex": "^[A-Za-z0-9 ]+$",
//           //             "message": "Only char and numbers allowed"
//           //           },
//           //           "required": true,
//           //           "orderNumber": 1
//           //         },
//           //     ]
//           // }
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
//       {
//         "service": "Tradelicence",
//         "fields": null,
//         "workflow": {
//           "businessService": "ApprovedTL"
//         },
//         "idgen": {
//           "format": "tl.licence.number"
//         },
//         "rules": [
//           {
//             "referenceType": "NewTL"
//           }
//         ],
//         "documents": null,
//         "pdf": [
//           {
//             "key": "tl-certificate",
//             "type": "certificate"
//           }
//         ],
//         "bill": null
//       },
//       {
//         "service": "Tradelicence",
//         "fields": null,
//         "workflow": {
//           "businessService": "RenewTL"
//         },
//         "idgen": {
//           "format": "tl.renewalapplication.number"
//         },
//         "rules": [
//           {
//             "referenceType": "ApprovedTL"
//           }
//         ],
//         "documents": [
//           {
//             "category": "owner-photo",
//             "documentTypes": [
//               "photo"
//             ],
//             "active": true,
//             "isMandatory": false,
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
//             "key": "tl-renew-application",
//             "type": "application"
//           }
//         ],
//         "calculator": {
//           "billingSlabs": [
//             {
//               "key": "applicationFee",
//               "value": 2000
//             }
//           ]
//         },
//         "bill": {
//           "service": "RenewalFee"
//         }
//       }
//     ]
//   }

export const serviceConfigPGR = {
  "tenantId": "dj",
  "moduleName": "CommonService",
  "ServiceConfiguration": [
    {
      "module": "BPA",
      "service": "PCO",
      "fields": [
        {
          "name": "identity",
          "label": "Applicant's Identity",
          "type": "array",
          "items": {
            "type": "object",
            "properties": [
              {
                "name": "applicantType",
                "label": "Applicant Type",
                "type": "enum",
                // "reference": "mdms",
                "format": "radio",
                "required": false,
                // "schema": "BPA.ApplicantType"
                "values": ["Madam", "Sir"]
              },
              {
                "name": "docs",
                "label": "docs Type",
                "type": "multiupload",
                // "reference": "mdms",
                "format": "multiupload",
                "required": false,
                // "schema": "BPA.ApplicantType"
                // "values": ["Madam", "Sir"]
              },
              {
                "name": "firstName",
                "label": "First Name",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": true
              },
              {
                "name": "lastName",
                "label": "Last Name",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "address",
                "label": "Address",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "Telephone",
                "label": "Telephone",
                "type": "string",
                "format": "text",
                "validation": { 
                  "regex": "(^$|^77[0-9]{6}$)",
                  "message": "Only letters and numbers allowed"
                },
                "required": false
              },
              {
                "name": "name",
                "label": "Name",
                "type": "string",
                "format": "text",
                "required": false
              },
              {
                "name": "companyName",
                "label": "Company Name",
                "type": "string",
                "format": "text",
                "required": false
              },
              {
                "name": "registration",
                "label": "Registration",
                "type": "string",
                "format": "text",
                "required": false
              },
              {
                "name": "companyType",
                "label": "Type of Company",
                "type": "enum",
                "format": "radioordropdown",
                // "reference": "mdms",
                // "required": true,
                // "schema": "BPA.CompanyType"
                "values": ["A", "B"]
              },
              {
                "name": "representative",
                "label": "Representative of the Legal Entity",
                "type":"enum",
                "format": "radio",
                "required": false,
                "values": ["Madam", "Sir"]
              },
              {
                "name": "lastName",
                "label": "Last Name",
                "type":"string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "firstName",
                "label": "First Name",
                "type":"string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "siteLocation",
                "label": "Site Location",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "area",
                "label": "Area (in m²)",
                "type": "text",
                "format": "number",
                "validation": { 
                  "min": 0,
                  "message": "Area should be non negative"
                },
                "required": false
              },
              {
                "name": "legalStatus",
                "label": "Legal Status",
                "type": "string",
                "format": "text"
              },
              {
                "name": "titreFoncierDefinitif",
                "label": "Titre Foncier Definitif",
                "type": "enum",
                "format": "radioordropdown",
                "values": ["Yes", "No"]
                // "required": true
              },
              {
                "name": "tfNo",
                "label": "If Yes, please indicate TF No",
                "type": "string",
                "format": "text",
                "required": false
              },
              {
                "name": "registrationCertificate",
                "label": "Registration Certificate",
                "type": "enum",
                "format": "radio",
                "values": ["Yes", "No"]
              },
              {
                "name": "other",
                "label": "Other",
                "type": "string",
                "format": "text"
              },
              {
                "name": "name",
                "label": "Name of Design Office",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100
              },
              {
                "name": "lastName",
                "label": "Architect's Last Name",
                "type": "number",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "firstName",
                "label": "Architect's First Name",
                "type": "string",
                "format": "text",
                "minLength": 2,
                "maxLength": 100,
                "required": false
              },
              {
                "name": "telephone",
                "label": "Telephone",
                "type": "number",
                "format":"text",
                "required": false
              },
              {
                "name": "email",
                "label": "Email Address",
                "type": "string",
                "format":"text",
                "validation": { 
                  "regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                  "message": "Invalid email id"
                },
                "required": false
              },
              {
                "name": "registrationNumber",
                "label": "Registration Number",
                "type": "string",
                "format":"text",
                "required": false
              },
              {
                "name": "typeOfWork",
                "label": "Type of Work",
                "type": "enum",
                "format": "radioordropdown",
                "values": ["Yes", "No"]
                // "required": true
              },
              {
                "name": "numberOfUnits",
                "label": "Number of Housing Units",
                "type": "number",
                "format": "text"
              },
              {
                "name": "others",
                "label": "Others",
                "type": "string",
                "format":"text"
              }
            ]
          }
        },
        // ,
        // {
        //   "name": "individual",
        //   "label": "Individual",
        //   "type": "array",
        //   "items": {
        //     "type": "object",
        //     "properties": [
              
        //     ]
        //   }
        // },
        // {
        //   "name": "legalEntity",
        //   "label": "legal entity",
        //   "type": "array",
        //   "items": {
        //     "type": "object",
        //     "properties": [
                
        //     ]
        //   }
        // },
        // {
        //   "name": "landandProjectDesignDetails",
        //   "label": "Land and Project Design Details",
        //   "type": "array",
        //   "items": {
        //     "type": "object",
        //     "properties": [
                     
        //     ]
        //   }
        // },
        {
          "name": "buildingDensity",
          "label": "Building Density",
          "type": "array",
          "items": {
            "type": "object",
            "properties": [
              {
                "name": "maximumAuthorizedCes",
                "label": "Maximum authorized C.E.S (2) for the zone",
                "type":"string",
                "format": "text",
                "required": false
              },
              {
                "name": "prjectedCes",
                "label": "Projected C.E.S.",
                "type":"string",
                "format": "text",
                "required": false
              },
              {
                "name": "maximumAuthorizedCos",
                "label": "Maximum authorized C.O.S (3) for the zone",
                "type":"string",
                "format": "text",
                "required": false
              },
              {
                "name": "projectedCos",
                "label": "Projected C.O.S.",
                "type":"string",
                "format": "text",
                "required": false
              },
              {
                "name": "coveredProjectArea",
                "label": "Covered project area",
                "type":"string",
                "format": "text",
                "required": false
              },
              {
                "name": "constructionCostPerSqM",
                "label": "Construction cost per m² excluding work",
                "type":"string",
                "format": "text",
                "required": false
              }           
            ]
          }
        },
        {
          "name": "applicantsCommitment",
          "label": "Applicant's commitment",
          "type": "array",
          "items": {
            "type": "object",
            "properties": [
              {
                "name": "eligibilityDeclaration",
                "label": "Declaration of Eligibility",
                "type":"string",
                "format": "checkbox",
                "required": false
              },
              {
                "name": "accuracyDeclaration",
                "label": "Declaration of Accuracy",
                "type":"string",
                "format": "checkbox",
                "required": false
              },
              {
                "name": "taxCalculationAgreement",
                "label": "Agreement for Tax Calculation",
                "type":"enum",
                "format": "checkbox",
                "required": false,
                
              }          
            ]
          }
        }
      ],
      "workflow": {
        "businessService": "NewTL",
        "ACTIVE": [
          "APPROVED"
        ],
        "INACTIVE": [
          "REJECTED",
          "WITHDRAWN"
        ]
      },
      "documents": [
        {
          "category": "address-proof",
          "documentTypes": [
            "aadhar",
            "voter"
          ],
          "active": true,
          "isMandatory": false,
          "allowedFileTypes": [
            "pdf",
            "doc",
            "docx",
            "xlsx",
            "xls",
            "jpeg",
            "jpg",
            "png"
          ],
          "maxSizeInMB": 5,
          "maxFilesAllowed": 1
        },
        {
          "category": "identity-proof",
          "documentTypes": [
            "aadhar",
            "voter"
          ],
          "active": true,
          "isMandatory": true,
          "allowedFileTypes": [
            "pdf",
            "doc",
            "docx",
            "xlsx",
            "xls",
            "jpeg",
            "jpg",
            "png"
          ],
          "maxSizeInMB": 5,
          "maxFilesAllowed": 1
        },
        {
          "category": "owner-photo",
          "documentTypes": [
            "photo"
          ],
          "active": true,
          "isMandatory": true,
          "allowedFileTypes": [
            "jpeg",
            "jpg",
            "png"
          ],
          "maxSizeInMB": 5,
          "maxFilesAllowed": 1
        }
      ],
      "idgen": {
        "format": "tl.application.number"
      },
      "localization": {
        "modules": [
          "digit-tradelicence"
        ]
      },
      "applicant": {
        "minimum": 1,
        "maximum": 3,
        "types": [
          "individual",
          "organisation"
        ]
      },
      "boundary": {
        "hierarchyType": "REVENUE",
        "lowestLevel": "locality"
      },
      "notification": {
        "sms": {
          "TODO": "will fill later"
        },
        "email": {
          "TODO": "will fill later"
        }
      },
      "access": {
        "roles": [
          "TL_CREATOR"
        ],
        "actions": [
          {
            "url": "tl-services/v1/create"
          }
        ]
      },
      "rules": {
        "validation": {
          "type": "schema||api||custom||none",
          "service": "tradelicence",
          "schemaCode": "tradelicence.apply",
          "customFunction": "eitherhookname||function"
        },
        "calculator": {
          "type": "api||custom||none",
          "service": "tradelicence",
          "customFunction": "eitherhookname||function"
        },
        "registry": {
          "type": "api||none",
          "service": "tradelicence"
        },
        "references": [
          {
            "type": "initiate",
            "service": "tradelicence"
          }
        ]
      },
      "pdf": [
        {
          "key": "tl-application",
          "type": "application"
        },
        {
          "key": "tl-bill",
          "type": "bill"
        },
        {
          "key": "tl-receipt",
          "type": "receipt"
        }
      ],
      "bill": {
        "service": "ApplicationFee"
      },
      "payment": {
        "gateway": "TODO"
      },
      "apiconfig": [
        {
          "type": "register",
          "host": "https://staging.digit.org||http://tl-services.egov:8080",
          "endpoint": "/tl-services/v1/create",
          "method": "post",
          "service": "tradelicence"
        },
        {
          "type": "register||calculate||validate||authenticate",
          "host": "https://staging.digit.org||http://tl-services.egov:8080",
          "endpoint": "/tl-services/v1/search",
          "method": "post",
          "service": "tradelicence"
        }
      ],
      "calculator": {
        "billingSlabs": [
          {
            "key": "applicationFee",
            "value": 2000
          }
        ]
      },
      "enabled": [
        "citizen",
        "employee"
      ]
    },
    {
      "module": "Tradelicence",
      "service": "RenewTL",
      "fields": null,
      "workflow": {
        "businessService": "ApprovedTL"
      },
      "idgen": {
        "format": "tl.licence.number"
      },
      "rules": [
        {
          "referenceType": "NewTL"
        }
      ],
      "documents": null,
      "pdf": [
        {
          "key": "tl-certificate",
          "type": "certificate"
        }
      ],
      "bill": null
    },
    {
      "module": "Tradelicence",
      "service": "EditRenewTL",
      "fields": null,
      "workflow": {
        "businessService": "RenewTL"
      },
      "idgen": {
        "format": "tl.renewalapplication.number"
      },
      "rules": [
        {
          "referenceType": "ApprovedTL"
        }
      ],
      "documents": [
        {
          "category": "owner-photo",
          "documentTypes": [
            "photo"
          ],
          "active": true,
          "isMandatory": false,
          "allowedFileTypes": [
            "jpeg",
            "jpg",
            "png"
          ],
          "maxSizeInMB": 5,
          "maxFilesAllowed": 1
        }
      ],
      "pdf": [
        {
          "key": "tl-renew-application",
          "type": "application"
        }
      ],
      "calculator": {
        "billingSlabs": [
          {
            "key": "applicationFee",
            "value": 2000
          }
        ]
      },
      "bill": {
        "service": "RenewalFee"
      }
    }
  ]
}
