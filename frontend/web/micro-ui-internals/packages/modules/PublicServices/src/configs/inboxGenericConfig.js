import React from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom";

export const InboxConfig = () => {
  const { module } = useParams();
  const prefix = `${module?.toUpperCase()}`;

  return {
    headerLabel: `${prefix}_INBOX_HEADER`,
    type: "inbox",
    apiDetails: {
      serviceName: "/inbox/v2/_search",
      requestParam: {},
      requestBody: {
        inbox: {
          processSearchCriteria: {
            businessService: [],
            moduleName: "public-services",
          },
          moduleSearchCriteria: {
            sortOrder: "ASC",
            module: "public-services",
          },
        },
      },
      minParametersForSearchForm: 0,
      minParametersForFilterForm: 0,
      masterName: "commonUiConfig",
      moduleName: "InboxGenericConfig",
      tableFormJsonPath: "requestBody.inbox",
      filterFormJsonPath: "requestBody.inbox.moduleSearchCriteria",
      searchFormJsonPath: "requestBody.inbox.moduleSearchCriteria",
    },
    sections: {
      search: {
        uiConfig: {
          headerStyle: {},
          formClassName: "custom-digit--search-field-wrapper-classname",
          primaryLabel: "ES_COMMON_SEARCH",
          secondaryLabel: "ES_COMMON_CLEAR_SEARCH",
          minReqFields: 1,
          defaultValues: {},
          fields: [
            {
              inline: true,
              label: ``,
              isMandatory: false,
              type: "text",
              disable: false,
              populators: { name: "applicationNumber", error: "Error!", placeholder: `SEARCH_BY_APPLICATION_NUMBER` },
            },
            // {
            //     label: `${prefix}_BUSINESS_SERVICE`,
            //     isMandatory: true,
            //     key: "businessService",
            //     type: "dropdown",
            //     disable: false,
            //     preProcess: {
            //         updateDependent: ["populators.options"]
            //     },
            //     populators: {
            //         name: "businessService",
            //         optionsKey: "name",
            //         options: []
            //     }
            // },
          ],
        },
        label: "",
        show: true,
      },
      links: {
        uiConfig: {
          links: [],
          label: "",
        },
        children: {},
        show: true,
      },
      filter: {
        uiConfig: {
          type: "filter",
          headerStyle: null,
          primaryLabel: `${prefix}_FILTER`,
          secondaryLabel: "",
          minReqFields: 1,
          defaultValues: {
            state: "",
            ward: [],
            locality: [],
            assignee: {
              code: `${prefix}_ASSIGNED_TO_ALL`,
              name: `${prefix}_ASSIGNED_TO_ALL`,
            },
          },
          fields: [
            {
              label: "",
              type: "radio",
              isMandatory: false,
              disable: false,
              populators: {
                name: "assignee",
                options: [
                  {
                    code: `${prefix}_RECENT`,
                    name: `${prefix}_RECENT`,
                  },
                  {
                    code: `${prefix}_OLDEST`,
                    name: `${prefix}_OLDEST`,
                  },
                ],
                optionsKey: "name",
              },
            },
            // {
            //     key: "boundaryComponent",
            //     type: "boundary",
            //     inline: true,
            //     label: "BoundaryFIlter",
            //     disable: false,
            //     populators: {
            //         name: "boundaryComponent",
            //         levelConfig: { lowestLevel: "LOCALITY", highestLevel: "PROVINCE", isSingleSelect: [] },
            //         hierarchyType: "NEWTEST00222",
            //         noCardStyle: true,
            //         preSelected: ["NEWTEST00222_MO", "NEWTEST00222_MO_11_MARYLAND", "NEWTEST00222_MO_11_06_PLEEBO"],                    // "frozenData":
            //         // [{
            //         //     code: "NEWTEST00222_MO",
            //         //     name: "NEWTEST00222_MO"
            //         //   },
            //         //   {
            //         //     code: "NEWTEST00222_MO.NEWTEST00222_MO_11_MARYLAND",
            //         //     name: "NEWTEST00222_MO_11_MARYLAND"
            //         //   },
            //         //   {
            //         //     code: "NEWTEST00222_MO.NEWTEST00222_MO_11_MARYLAND.NEWTEST00222_MO_11_06_PLEEBO",
            //         //     name: "NEWTEST00222_MO_11_06_PLEEBO"
            //         //   }]
            //     },
            // },
            {
              label: `${prefix}_BUSINESS_SERVICE`,
              isMandatory: true,
              key: "businessService",
              type: "multiselectdropdown",
              disable: false,
              preProcess: {
                updateDependent: ["populators.options"],
              },
              populators: {
                name: "businessService",
                optionsKey: "name",
                options: [],
              },
            },
            // {
            //     label: `${prefix}_COMMON_WARD`,
            //     type: "radioordropdown",
            //     isMandatory: false,
            //     disable: false,
            //     populators: {
            //         name: "ward",
            //         type: "ward",
            //         optionsKey: "i18nKey",
            //         // defaultText: "COMMON_SELECT_WARD",
            //         // selectedText: "COMMON_SELECTED",
            //         allowMultiSelect: true
            //     }
            // },
            {
              label: `${prefix}_COMMON_WORKFLOW_STATES`,
              type: "workflowstatesfilter",
              labelClassName: "checkbox-status-filter-label",
              isMandatory: false,
              disable: false,
              populators: {
                  name: "state",
                  labelPrefix: "",
                  businessService: "NEWTL",
              },
          },
          ],
        },
        label: `ES_COMMON_FILTERS`,
        show: true,
      },
      searchResult: {
        uiConfig: {
          columns: [
            {
              label: "APPLICATION_NUMBER",
              jsonPath: "businessObject.applicationNumber",
              additionalCustomization: true,
              secondaryLabel:"CREATION_DATE"
            },
            {
              label: "APPLICANT_NAME",
              jsonPath: "businessObject.applicants[0].name",
              additionalCustomization: true,
              secondaryLabel:"ARCHITECT_NAME"
            },
            {
              label: "BUSINESS_SERVICE_LABEL",
              jsonPath: "businessObject.businessService",
            },
            {
              label: "WORKFLOW_STATUS",
              jsonPath: "ProcessInstance.state.state",
              additionalCustomization: true,
            },
          ],
          tableProps: {
            tableClassName: "custom-classname-resultsdatatable",
          },
          actionProps: {
            actions: [
              {
                label: "Action1",
                variation: "secondary",
                icon: "Edit",
              },
              {
                label: "Action2",
                variation: "primary",
                icon: "CheckCircle",
              },
            ],
          },
          enableColumnSort: true,
          resultsJsonPath: "items",
          defaultSortAsc: true,
        },
        children: {},
        show: true,
      },
    },
  };
};
