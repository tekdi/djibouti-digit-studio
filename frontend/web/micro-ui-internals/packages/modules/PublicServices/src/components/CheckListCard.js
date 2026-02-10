import React from "react";
import { Loader } from "@egovernments/digit-ui-components";
import { transformViewApplication } from "../utils/createUtils";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuClipboardList, LuCircleCheck } from "react-icons/lu";

const CheckListCard = (props) => {
  const { isViewOnly = false } = props;
  const [filled, setFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const history = useHistory();
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();

  //To fetch the checklist data
  const request = {
    url: "/health-service-request/service/v1/_search",
    params: {},
    body: {},
    method: "POST",
    headers: {},
    config: {
      enable: false,
    },
  };
  const mutation = Digit.Hooks.useCustomAPIMutationHook(request);

  //To check if the checklist is in filled or pending to fill state
  const isFilled = async (id, accid) => {
    await mutation.mutate(
      {
        url: "/health-service-request/service/v1/_search",
        method: "POST",
        body: transformViewApplication(id, accid, tenantId),
        config: {
          enable: false,
        },
      },
      {
        onSuccess: (res) => {
          let field = res.Services.filter((items) => items.serviceDefId == id);
          const allValid = field?.[0]?.additionalFields?.[0].action == "SUBMIT";
          if (field && field.length > 0) {
            setFilled(allValid);
          }
          setLoading(true);
        },
        onError: () => {
          console.log("Error checking filled status");
          setLoading(true);
        },
      }
    );
  };

  useEffect(() => {
    isFilled(props.item.id, props.accid);
  }, [props.item.id, props.accid]);

  if (!loading) {
    return (
      <div className="flex w-full items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark" />

      {filled && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <LuCircleCheck className="h-4 w-4" />
          {t("REPORT_DONE")}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-djibouti-primary">
              <LuClipboardList className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide text-djibouti-primary/80">
                {t("CHECKLIST")}
              </span>
            </div>
            <h2 className="text-2xl font-semibold leading-snug text-gray-900 break-words">
              {props.t(props.item.clientId)}
            </h2>
          </div>
        </div>

        <div className="pt-4">
          {!isViewOnly ? (
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-djibouti-primary bg-djibouti-primary/10 px-4 py-3 text-base font-semibold text-djibouti-primary transition-all duration-200 hover:bg-djibouti-primary hover:text-white"
              onClick={() =>
                history.push(
                  `/${window.contextPath}/${userType}/publicservices/checklist?accid=${props.accid}&id=${props.item.id}&code=${props.item.code}&clientId=${props.item.clientId}&state=${props?.state}`,
                  { redirectionUrl: `${window.location.href}` }
                )
              }
            >
              {filled ? t("VIEW_CHECKLIST") : t("FILL_CHECKLIST")}
            </button>
          ) : (
            filled ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-djibouti-primary bg-djibouti-primary/10 px-4 py-3 text-base font-semibold text-djibouti-primary transition-all duration-200 hover:bg-djibouti-primary hover:text-white"
                onClick={() =>
                  history.push(
                    `/${window.contextPath}/${userType}/publicservices/checklist?accid=${props.accid}&id=${props.item.id}&code=${props.item.code}&clientId=${props.item.clientId}&state=${props?.state}&viewOnly=true`,
                    { redirectionUrl: `${window.location.href}` }
                  )
                }
              >
                {t("VIEW_CHECKLIST")}
              </button>
            ) : (
              <span className="text-sm text-gray-500 italic block text-center py-2">
                {t("CHECKLIST_NOT_SUBMITTED")}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckListCard;
