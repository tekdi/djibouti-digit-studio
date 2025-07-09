import React, { useState, useEffect, useMemo } from "react";

// Importing configuration for modal
import configModal from "./modalConfig";
import Modal from "./Modal";

// External components
import { Loader, FormComposerV2 } from "@egovernments/digit-ui-components";

// Basic heading component
const Heading = (props) => {
  return <h1 className="heading-m">{props.label}</h1>;
};

// SVG Close icon
const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

// Payload builder for submitting workflow actions
const updatePayload = async (applicationDetails, data, action, businessService, tenantId, config) => {
  const assigneeUser = {
    uuid: data?.assignee?.user?.uuid || null,
    userName: data?.assignee?.user?.userName || null,
    name: data?.assignee?.user?.name || null,
    mobileNumber: data?.assignee?.user?.mobileNumber || null,
    emailId: data?.assignee?.user?.emailId || null,
    type: data?.assignee?.user?.type || null,
    roles: data?.assignee?.user?.roles || null,
    tenantId: data?.assignee?.user?.tenantId || null,
    active: data?.assignee?.user?.active || null,
    permanentCity: data?.assignee?.user?.permanentCity || null,
    locale: data?.assignee?.user?.locale || null,
  };

  const workflow = {
    comment: data.comments,
    documents: data?.document
      ? Object.values(data?.document)
        .flat()
        .map((document) => {
          return {
            documentType: action?.action + " DOC",
            fileName: document?.[1]?.file?.name,
            fileStoreId: document?.[1]?.fileStoreId?.fileStoreId,
            documentUid: document?.[1]?.fileStoreId?.fileStoreId,
            tenantId: document?.[1]?.fileStoreId?.tenantId,
          };
        })
      : [],
    action: action.action,
    businessService: businessService,
  };

  // Handle SEND_TO_COMMISSIONER action
  if (action.action === "SEND_TO_COMMISSIONER") {
    // Extract selected commissioner codes
    const selectedCommissioners = data.commissioner?.map((comm) => comm.commissionerCode || comm.code)?.join(",") || "";

    try {
      // Get commissioner codes and build URL with comma-separated businessServices
      const commissionerCodes = data.commissioner?.map((comm) => comm.commissionerCode || comm.code) || [];
      const businessServicesParam = commissionerCodes.join(",");
      const url = `/egov-workflow-v2/egov-wf/businessservice/_search?tenantId=${tenantId}&businessServices=${businessServicesParam}`;

      // Make direct API call to get workflow details
      const businessServiceResponse = await Digit.CustomService.getResponse({
        url: url,
      });

      // Extract roles from states where state is "INITIATED"
      const businessServiceRoles = [];
      console.log(businessServiceResponse, "businessServiceResponse");

      if (businessServiceResponse?.BusinessServices) {
        businessServiceResponse.BusinessServices.forEach((businessService) => {
          if (businessService.states) {
            businessService.states.forEach((state) => {
              if ((state.state === "" || state.state == null) && state.actions) {
                state.actions.forEach((action) => {
                  if (action.roles) {
                    action.roles.forEach((role) => {
                      // Add role if it's not STUDIO_ADMIN and not already in the array
                      if (!businessServiceRoles.includes(role)) {
                        businessServiceRoles.push(role);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

      console.log(businessServiceRoles, "businessServiceRoles");

      // Make direct API call to get HRMS employee list
      if (businessServiceRoles.length > 0) {
        const rolesParam = businessServiceRoles.join(",");
        const hrmsUrl = `/egov-hrms/employees/_search?tenantId=${tenantId}&roles=${rolesParam}&isActive=true`;

        const hrmsResponse = await Digit.CustomService.getResponse({
          url: hrmsUrl,
        });

        workflow.assignees = hrmsResponse?.Employees?.map(employee => ({
          id: employee?.user?.id || null,
          uuid: employee?.user?.uuid || null,
          userName: employee?.user?.userName || null,
          name: employee?.user?.name || null,
          mobileNumber: employee?.user?.mobileNumber || null,
          emailId: employee?.user?.emailId || null,
          locale: employee?.user?.locale || null,
          type: employee?.user?.type || null,
          roles: employee?.user?.roles?.map(role => ({
            name: role.name,
            code: role.code,
            tenantId: role.tenantId
          })) || null,
          active: employee?.user?.active || null,
          tenantId: employee?.user?.tenantId || null,
          permanentCity: employee?.user?.permanentCity || null,
        }));
      }
    } catch (error) {
      console.error("Error fetching workflow or HRMS data:", error);
    }

    // Add selectedParallelWorkflows to the payload
    workflow.triggerSelectiveParallelWorkflows = selectedCommissioners;
  } else if (action.action == "ADD_QUERY") {
    workflow.assignees = [Digit.UserService.getUser()?.info];
  } else if (
    action.action != "ADD_QUERY" &&
    !action.isTerminateState &&
    action.action != "SEND_BACK_TO_ARCHITECT" &&
    action.action != "SEND_TO_CITIZEN_PAYMENT" &&
    action.action != "SEND_TO_COMMISSIONER"
  ) {
    workflow.assignees = assigneeUser ? [assigneeUser] : [];
  }

  Object.keys(workflow).forEach((key) => {
    if (!workflow[key] || workflow[key]?.length === 0) delete workflow[key];
  });

  applicationDetails = { ...applicationDetails, workflow };
  return {
    Application: applicationDetails,
  };
};

const WorkflowPopup = ({ applicationDetails, ...props }) => {
  const { action, tenantId, t, closeModal, submitAction, businessService, moduleCode } = props;

  // Enable assignee dropdown based on config
  // const enableAssignee = Digit?.Customizations?.["commonUiConfig"]?.enableHrmsSearch(businessService, action);

  const [config, setConfig] = useState(null);
  const [modalSubmit, setModalSubmit] = useState(true);
  const roleCodes = Digit.UserService.getUser()?.info?.roles?.map((role) => role.code);
  const assigneeRoles = action?.assigneeRoles
    ?.toString()
    ?.split(",")
    ?.filter((role) => !roleCodes?.includes(role))
    ?.join(",");

  // Get HRMS employee list
  let { isLoading: isLoadingHrmsSearch, data: hrmsData } = Digit.Hooks.hrms.useHRMSSearch(
    { roles: assigneeRoles, isActive: true },
    tenantId,
    null,
    null,
    { enabled: action?.assigneeRoles?.length > 0 }
  );

  // Memoize assigneeOptions to prevent unnecessary re-renders
  const assigneeOptions = useMemo(() => {
    if (action?.action === "SEND_TO_COMMISSIONER") {
      return (
        action.triggerParallelWorkflows?.map((tg) => ({
          commissionerCode: tg,
          code: tg,
        })) || []
      );
    }

    const employees = hrmsData?.Employees;
    if (!employees) return undefined;

    // Add fallback name
    employees.forEach((emp) => (emp.nameOfEmp = emp?.user?.name || t("ES_COMMON_NA")));
    return employees;
  }, [action?.action, action?.triggerParallelWorkflows, hrmsData?.Employees, t]);

  // Request criteria for Document config
  const requestCriteria = {
    url: "/egov-mdms-service/v1/_search",
    body: {
      MdmsCriteria: {
        tenantId: Digit.ULBService.getCurrentTenantId(),
        moduleDetails: [
          {
            moduleName: "DigitStudio",
            masterDetails: [
              {
                name: "DocumentConfig",
              },
            ],
          },
        ],
      },
    },
    changeQueryName: "documentConfig",
  };

  // Load Document config
  const { isLoading, data } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  // Set config when HRMS and MDMS data is available
  useEffect(() => {
    if (data) {
      setConfig(
        configModal(
          t,
          action,
          assigneeOptions?.length >= 0 ? assigneeOptions : undefined,
          businessService,
          moduleCode,
          data?.MdmsRes?.DigitStudio?.DocumentConfig2
        )
      );
    }
  }, [assigneeOptions, data]);

  // Form submit handler
  const _submit = async (data) => {
    debugger;
    try {
      const customPayload = await updatePayload(applicationDetails, data, action, businessService, tenantId, config);
      submitAction(customPayload, action);
    } catch (error) {
      console.error("Error submitting workflow action:", error);
    }
  };

  // Optional: to enable or disable modal submit dynamically
  const modalCallBack = (setValue, formData) => {
    Digit?.Customizations?.["commonUiConfig"]?.enableModalSubmit(businessService, action, setModalSubmit, formData);
  };

  if (isLoadingHrmsSearch || isLoading) return <Loader />;

  return action && config?.form ? (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={(data) => {
        console.log(data.target.value, "data on save"); // Not required?
      }}
      formId="modal-action"
      isDisabled={!modalSubmit}
    >
      <FormComposerV2
        config={config.form}
        noBoxShadow
        inline
        childrenAtTheBottom
        onSubmit={_submit}
        defaultValues={{}}
        formId="modal-action"
        onFormValueChange={modalCallBack}
      />
    </Modal>
  ) : (
    <Loader />
  );
};

export default WorkflowPopup;
