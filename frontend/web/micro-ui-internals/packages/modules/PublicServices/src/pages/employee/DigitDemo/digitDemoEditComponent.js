import React, { useTransition } from "react";
import DigitDemoComponent from "./digitDemoComponent";
import { useParams } from "react-router-dom";
import { generateFormConfig } from "../../../utils/generateFormConfigFromSchemaUtil";
import { Loader } from "@egovernments/digit-ui-react-components";
import { useTranslation } from "react-i18next";

//field map to map the formdata unique identified and response unique identifier
const fieldNameMap = {
  streetName: "addressLine1",
};

//creating formdata documents array to prefill document data
const mapDocumentsToUploadedDocs = (documents = [], tenantId = "dj") => {
  const uploadedDocs = {};

  documents.forEach((doc) => {
    const docType = doc.documentType;
    const fileStoreId = doc.fileStoreId;

    if (!uploadedDocs[docType]) {
      uploadedDocs[docType] = [];
    }

    uploadedDocs[docType].push([
      docType, // filename if available elsewhere can be added here
      {
        file: {},
        fileStoreId: {
          fileStoreId,
          tenantId,
        },
      },
    ]);
  });

  return uploadedDocs;
};

//util to convert the search response in formdata srtucture to prefill the values
const generateFormDataFromSearch = (config = [], searchData = {}, module, service, tenantId, t) => {
  const formData = { response: searchData?.response || {} };

  config.forEach((section) => {
    const sectionName = section?.name;
    if (sectionName === "applicantDetails") {
      searchData[sectionName] = [
        {
          ...searchData[sectionName][0],
          ...formData?.response?.additionalDetails?.applicants,
        },
        ...searchData[sectionName].slice(1),
      ];
    }
    // if (!sectionName) return;
    if (section.type === "multiChildForm" && Array.isArray(searchData[sectionName])) {
      formData[sectionName] = searchData[sectionName].map((item) => {
        const entry = {};
        section.body?.forEach((field) => {
          const fieldName = field?.populators?.name;
          const fieldType = field?.type;
          const responseKey = fieldNameMap[fieldName] || fieldName;
          const schema = field?.populators?.mdmsConfig?.localePrefix;
          const rawValue = item?.[responseKey];
          if (fieldName) {
            entry[fieldName] = transformValue(fieldType, rawValue, schema ? schema : `${module}_${service}`, t);
          }
        });
        return entry;
      });
    } else if (section.type === "childform") {
      const child = {};
      section.body?.forEach((field) => {
        const fieldName = field?.populators?.name;
        const fieldType = field?.type;
        const responseKey = fieldNameMap[fieldName] || fieldName;
        const schema = field?.populators?.mdmsConfig?.localePrefix;
        const rawValue = searchData[sectionName]?.[responseKey];
        if (fieldName) {
          child[fieldName] = transformValue(fieldType, rawValue, schema ? schema : `${module}_${service}`, t);
        }
      });
      formData[sectionName] = child;
    } else if (section.type === "documents") {
      //formData["section_6"]["uploaded"] = "";
      if (!formData["section_4"]) {
        formData["section_4"] = {};
      }
      formData["section_4"]["uploadedDocs"] = mapDocumentsToUploadedDocs(searchData.documents || [], tenantId);
    }
  });

  return formData;
};

//function to transfer feild values
const transformValue = (type, rawValue, prefix, t) => {
  if (rawValue === undefined || rawValue === null) return rawValue;
  switch (type) {
    case "radioordropdown":
      return { code: rawValue, name: t(`${rawValue}`) };
    default:
      return rawValue;
  }
};

const DigitDemoEditComponent = () => {
  const { module, service } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  const { t } = useTranslation();

  //to get the fetched application details
  const request = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
    params: {
      applicationNumber: queryStrings?.applicationNumber,
      tenantId: tenantId,
    },
  };
  const { isLoading, data: response } = Digit.Hooks.useCustomAPIHook(request);

  // Fetch service configuration from MDMS
  const requestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
  };
  const { isLoading: moduleListLoading, data } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const config = data?.mdms?.find((item) => item?.uniqueIdentifier.toLowerCase() === `${module}.${service}`.toLowerCase());

  const Updatedconfig = {
    ServiceConfiguration: [config?.data],
    tenantId,
    module,
  };

  //logic to handle steps in apply screen flow
  const rawConfig = generateFormConfig(Updatedconfig, module?.toUpperCase(), service?.toUpperCase());

  let formdata = {
    applicantDetails: response?.Application?.[0]?.applicants,
    address: response?.Application?.[0]?.address,
    documents: response?.Application?.[0]?.documents,
    ...response?.Application?.[0]?.serviceDetails,
    response: response?.Application?.[0],
  };
  const updatedFormData = generateFormDataFromSearch(rawConfig, formdata, module?.toUpperCase(), service?.toUpperCase(), tenantId, t);

  if (moduleListLoading || isLoading) return <Loader />;
  return (
    <div>
      <DigitDemoComponent editdata={updatedFormData} />
    </div>
  );
};

export default DigitDemoEditComponent;
