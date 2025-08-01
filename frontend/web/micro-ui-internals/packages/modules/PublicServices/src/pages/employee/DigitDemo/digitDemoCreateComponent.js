import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Loader } from "@egovernments/digit-ui-react-components";
import { assigneeMapping } from "../../../utils/templateConfig";

const DigitDemoCreateComponent = () => {
  const history = useHistory();
  const { module, service } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  const serviceCode = queryStrings?.serviceCode;
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();

  // Fetch application
  const { isLoading, data: response } = Digit.Hooks.useCustomAPIHook({
    url: `/public-service/v1/application/${serviceCode}`,
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    params: {
      applicationNumber: queryStrings?.applicationNumber,
      tenantId,
    },
  });

  // Mutation hook
  const mutation = Digit.Hooks.useCustomAPIMutationHook({
    url: `/public-service/v1/application/${serviceCode}`,
    method: "PUT",
    headers: { "x-tenant-id": tenantId },
  });

  // Get assignees
  const permit = assigneeMapping?.find((item) => item.permit === service);
  const role = permit?.role || null;

  const { isLoading: isLoadingHrmsSearch, data: assigneeOptions } = Digit.Hooks.hrms.useHRMSSearch(
    { roles: role, isActive: true },
    tenantId,
    null,
    null,
    { enabled: role != null }
  );

  useEffect(() => {
    const submitApplication = async () => {
      if (isLoading || isLoadingHrmsSearch) return;

      const application = response?.Application?.[0];

      const requestBody = {
        Application: {
          id: application?.id || null,
          applicationNumber: application?.applicationNumber || null,
          serviceCode: application?.serviceCode || null,
          tenantId: application?.tenantId || null,
          module: application?.module || null,
          businessService: application?.businessService || null,
          status: "ACTIVE",
          channel: application?.channel || "counter",
          reference: application?.reference || null,
          workflowStatus: application?.workflowStatus || "applied",
          serviceDetails: application?.serviceDetails || {},
          applicants:
            application?.applicants?.map((applicant) => ({
              id: applicant?.id || null,
              type: applicant?.type || "CITIZEN",
              name: applicant?.name || "",
              mobileNumber: applicant?.mobileNumber || "",
              emailId: applicant?.emailId || "",
              prefix: applicant?.prefix || "253",
              active: true,
              userId: applicant?.userId || "",
            })) || [],
          address: {
            id: application?.address?.id || null,
            tenantId: application?.address?.tenantId || null,
            latitude: application?.address?.latitude || 0,
            longitude: application?.address?.longitude || 0,
            addressNumber: application?.address?.addressNumber || "1",
            addressLine1: application?.address?.addressLine1 || "",
            addressLine2: application?.address?.addressLine2 || "",
            landmark: application?.address?.landmark || "",
            city: application?.address?.city || "",
            pincode: application?.address?.pincode || "",
            hierarchyType: application?.address?.hierarchyType || "",
            boundarylevel: application?.address?.boundarylevel || "",
            boundarycode: application?.address?.boundarycode || "",
          },
          documents: application?.documents || [],
          additionalDetails: application?.additionalDetails || {},
          Workflow: {
            action: "CREATE",
            comment: "",
            assignees: assigneeOptions?.Employees?.map((emp) => emp?.user).filter(Boolean) || [],
            businessService: application?.workflow?.businessService || application?.businessService,
          },
          auditDetails: {
            createdTime: application?.auditDetails?.createdTime || null,
            createdBy: application?.auditDetails?.createdBy || null,
          },
        },
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: Digit.UserService.getUser()?.access_token,
          userInfo: Digit.UserService.getUser()?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
      };

      try {
        const data = await mutation.mutateAsync({ body: requestBody });

        localStorage.removeItem("formData");
        localStorage.removeItem("currentStep");
        sessionStorage.removeItem("formData");

        history.push({
          pathname: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/response`,
          search: `?isSuccess=true&applicationNumber=${data?.Application?.applicationNumber}&serviceCode=${serviceCode}`,
          state: {
            message: "COMMON_APPLICATION_CREATED",
            showID: true,
            applicationNumber: data?.Application?.applicationNumber,
            workflowStatus: data?.Application?.processInstance?.[0]?.state?.state,
            redirectionUrl: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/ViewScreen?applicationNumber=${data?.Application?.applicationNumber}&serviceCode=${serviceCode}`,
          },
        });
      } catch (error) {
        history.push({
          pathname: `/${window.contextPath}/${userType}/publicservices/${module}/${service}/response`,
          search: "?isSuccess=false",
          state: {
            message: "COMMON_APPLICATION_FAILED",
            showID: false,
          },
        });
      }
    };

    submitApplication();
  }, [isLoading, isLoadingHrmsSearch]);

  return <Loader />;
};

export default DigitDemoCreateComponent;
