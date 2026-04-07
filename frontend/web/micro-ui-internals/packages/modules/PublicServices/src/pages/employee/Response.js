import React, { useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuCircleCheck, LuCircleX, LuArrowRight } from "react-icons/lu";

const Response = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const queryStrings = Digit.Hooks.useQueryParams();
  const { module, service } = useParams();
  const { state } = useLocation();
  const [isResponseSuccess] = useState(
    queryStrings?.isSuccess === "true" ? true : queryStrings?.isSuccess === "false" ? false : true
  );

  const handleViewDetails = () => {
    if (state?.redirectionUrl) {
      history.push(state.redirectionUrl);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      <div
        className={`rounded-2xl border p-10 text-center shadow-lg transition-all duration-300 ${
          isResponseSuccess
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100"
            : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100"
        }`}
      >
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isResponseSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isResponseSuccess ? (
            <LuCircleCheck className="h-12 w-12 text-green-600" />
          ) : (
            <LuCircleX className="h-12 w-12 text-red-600" />
          )}
        </div>

        <h1
          className={`text-3xl font-bold mb-3 ${
            isResponseSuccess ? "text-green-900" : "text-red-900"
          }`}
        >
          {t(state?.message || (isResponseSuccess ? "SUCCESS" : "FAILURE"))}
        </h1>

        {state?.showID && state?.applicationNumber && (
          <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-6 py-4">
            <span className="text-sm font-medium text-gray-500">
              {t("COMMON_APPLICATION_ID")}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {state.applicationNumber}
            </span>
          </div>
        )}
      </div>

      {isResponseSuccess && state?.redirectionUrl && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-djibouti-primary-dark hover:shadow-lg"
          >
            {t(`${module?.toUpperCase()}_${service?.toUpperCase()}_VIEW_APPLICATION`)}
            <LuArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Response;
