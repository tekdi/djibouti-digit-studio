import { Link, useHistory } from "react-router-dom";
import _ from "lodash";
import { useParams } from "react-router-dom/cjs/react-router-dom";
import React from "react";

//create functions here based on module name set in mdms(eg->SearchProjectConfig)
//how to call these -> Digit?.Customizations?.[masterName]?.[moduleName]
// these functions will act as middlewares
// var Digit = window.Digit || {};

const businessServiceMap = {};

const inboxModuleNameMap = {};

export const colorCodes = {
  INITIATED: ["#DDDDDD", "#4B4B4B"],
  AGENT_NOT_ASSIGNED: ["#DDDDDD", "#4B4B4B"],
  PENDING_ACTION_BY_AGENT: ["#F1F4CF", "#746D00"],
  AGENT_REPORT_READY: ["#CFF4E2", "#00703C"],
  DECLARED_NON_CONFORM: ["#F4DECF", "#9C4900"],
  NOT_FORWARDED_TO_COMMISSIONER: ["#DDDDDD", "#4B4B4B"],
  AWAITING_ON_COMMISSIONER: ["#F1F4CF", "#746D00"],
  AWAITING_CITIZEN_PAYMENT: ["#F4CFD0", "#9C0003"],
  CITIZEN_PAYMENT_DONE: ["#CFF4E2", "#00703C"],
  PERMIT_GRANTED: ["#CFF4E2", "#00703C"],
  PERMIT_REJECTED: ["#F4DECF", "#9C4900"],
};

function formatCreatedTime(timestamp) {
  const date = new Date(Number(timestamp));
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

const userType = Digit.UserService.getType().toLowerCase();

export const UICustomizations = {
  searchGenericConfig: {
    customValidationCheck: (data) => {
      //checking both to and from date are present
      const { createdFrom, createdTo, field, value } = data;
      if ((createdFrom === "" && createdTo !== "") || (createdFrom !== "" && createdTo === ""))
        return { type: "warning", label: "ES_COMMON_ENTER_DATE_RANGE" };

      if ((field && !value) || (!field && value)) {
        return {
          type: "warning",
          label: "WBH_MDMS_SEARCH_VALIDATION_FIELD_VALUE_PAIR",
        };
      }

      return false;
    },
    preProcess: (data, additionalDetails) => {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      data.body.SearchCriteria.tenantId = tenantId;
      //   const filters = {};
      const custom = data.body.SearchCriteria.custom;
      data.headers = { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token };
      data.params = { tenantId: tenantId };
      data.method = "GET";
      data.config = { enabled: false };
      if (custom?.applicationNumber) data.params.applicationNumber = custom?.applicationNumber;
      if (custom?.status) data.params.status = custom?.status;
      if (custom?.todate) data.params.todate = Digit.Utils.date.convertDateToEpoch(custom?.todate);
      if (custom?.fromdate) data.params.todate = Digit.Utils.date.convertDateToEpoch(custom?.fromdate);
      if (data?.state?.searchForm?.businessService) data.url = `${data.url}/${data?.state?.searchForm?.businessService?.serviceCode}`;
      if (data?.state?.searchForm?.businessService) data.config = { enabled: true };
      delete data.body.SearchCriteria.custom;
      //   const { field, value, isActive } = custom || {};
      //   filters[field?.code] = value;
      //   if (isActive) {
      //     if (isActive.value === "all") delete data.body.MdmsCriteria.isActive;
      //     else data.body.MdmsCriteria.isActive = isActive?.value;
      //   } else {
      //     delete data.body.MdmsCriteria.isActive;
      //   }
      //   data.body.MdmsCriteria.filters = filters;
      //   // data.body.MdmsCriteria.limit = 100
      //   data.body.MdmsCriteria.limit = data.state.tableForm.limit;
      //   data.body.MdmsCriteria.offset = data.state.tableForm.offset;
      //   data.body.MdmsCriteria.schemaCode =
      //     // additionalDetails?.currentSchemaCode
      //     "ACCESSCONTROL-ACTIONS-TEST.actions-test";
      //   delete data.body.MdmsCriteria.custom;
      return data;
    },
    additionalCustomizations: (row, key, column, value, t, searchResult) => {
      switch (key) {
        case `${row?.module.toUpperCase()}_APPLICATION_NUMBER`:
          return (
            <span className="link">
              <Link
                to={`/${window.contextPath}/${userType}/publicservices/${row?.module}/${row?.businessService}/ViewScreen?applicationNumber=${row?.applicationNumber}&serviceCode=${row?.serviceCode}`}
              >
                {String(value ? value : t("ES_COMMON_NA"))}
              </Link>
            </span>
          );
        default:
          return t("ES_COMMON_NA");
      }
    },
    MobileDetailsOnClick: (row, tenantId) => {
      let link;
      Object.keys(row).map((key) => {
        if (key === "MASTERS_WAGESEEKER_ID")
          link = `/${window.contextPath}/${userType}/masters/view-wageseeker?tenantId=${tenantId}&wageseekerId=${row[key]}`;
      });
      return link;
    },
    additionalValidations: (type, data, keys) => {
      if (type === "date") {
        return data[keys.start] && data[keys.end] ? () => new Date(data[keys.start]).getTime() <= new Date(data[keys.end]).getTime() : true;
      }
    },
    selectionHandler: (event) => {}, // selectionHandler : Is used to handle row selections. gets on object which containes 3 key value pairs:  allSelected(whether all rows are selected or not), selectedCount (no, of rows selected),selectedRows( an array of selected rows)
    actionSelectHandler: (index, label, selectedRows) => {}, // actionSelectHandler : Is used to handle onClick functions of table action button on row selections, gets index,label and selectedRows as props
    footerActionHandler: (index, event) => {}, // footerActionHandler : Is used to handle onclick functions of footer action buttons, gets index and event as props
    linkColumnHandler: (row) => {
      const url = `/${window.contextPath}/${userType}/microplan/view-main?tenantId=${row?.tenantId}&uniqueIdentifier=${row?.uniqueIdentifier}`;
      window.location.href = url;
    },
  },

  InboxGenericConfig: {
    preProcess: (data, additionalDetails) => {
      const { module } = useParams();
      const tenantId = Digit.ULBService.getCurrentTenantId();
      // data.body.inbox.moduleSearchCriteria.businessService = `${data?.state?.filterForm?.businessService?.[0]?.code}`;
      data.body.inbox.moduleSearchCriteria.businessService = "BPA_PCO";
      data.body.inbox.moduleSearchCriteria.module = `${module}`;
      // data.body.inbox.processSearchCriteria.businessService = [`${data?.state?.filterForm?.businessService?.[0]?.code}`];
      data.body.inbox.processSearchCriteria.businessService = ["BPA_PCO"];
      data.body.inbox.processSearchCriteria.tenantId = tenantId;
      data.body.inbox.tenantId = tenantId;
      delete data.body.inbox.moduleSearchCriteria.assignee;
      data.method = "POST";
      data.body.inbox.moduleSearchCriteria.sortOrder = data?.state?.filterForm?.assignee?.code === "BPA_RECENT" ? "DESC" : "ASC";

      return data;
    },
    additionalCustomizations: (row, key, column, value, t, searchResult) => {
      const statusKey = row?.ProcessInstance?.state?.state?.toUpperCase();
      const [bgColor, textColor] = colorCodes[statusKey] || ["#DDDDDD", "#4B4B4B"];

      console.log(row, key, column, value, t, searchResult);
      if (key === "APPLICATION_NUMBER") {
        return (
          <span className="link">
            <Link
              to={`/${window.contextPath}/${userType}/publicservices/${row?.businessObject?.module}/${row?.businessObject?.businessService}/ViewScreen?applicationNumber=${row?.businessObject?.applicationNumber}&serviceCode=${row?.businessObject?.serviceCode}`}
            >
              {String(value ? value : t("ES_COMMON_NA"))}
            </Link>
            <div style={{ color: "#949494" }}>{formatCreatedTime(row?.businessObject?.auditDetails?.createdTime)}</div>
          </span>
        );
      }
      if (key === "APPLICANT_NAME") {
        return (
          <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: "4px" }}>
            <div>{row?.businessObject?.applicants[0]?.name}</div>
            <div style={{ color: "#949494" }}>{row?.ProcessInstance?.assigner?.name}</div>
          </div>
        );
      }
      if (key === "WORKFLOW_STATUS") {
        return (
          <div>
            <span style={{ backgroundColor: bgColor, color: textColor, width: "fit-content", padding: "4px 12px", borderRadius: "6px" }}>
              {t(`${row?.businessObject?.businessService}_${row?.ProcessInstance?.state?.state}`.toUpperCase())}
            </span>
          </div>
        );
      }
      if (key === "BUSINESS_SERVICE_LABEL") {
        return (
          <div>
            {t(`${row?.businessObject?.businessService}`)}
          </div>
        );
      }
    },
    selectionHandler: (event) => {}, // selectionHandler : Is used to handle row selections. gets on object which containes 3 key value pairs:  allSelected(whether all rows are selected or not), selectedCount (no, of rows selected),selectedRows( an array of selected rows)
    actionSelectHandler: (index, label, selectedRows) => {}, // actionSelectHandler : Is used to handle onClick functions of table action button on row selections, gets index,label and selectedRows as props
    footerActionHandler: (index, event) => {}, // footerActionHandler : Is used to handle onclick functions of footer action buttons, gets index and event as props
  },
};
