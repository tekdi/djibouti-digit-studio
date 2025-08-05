import { AppContainer, Loader, Toast } from "@egovernments/digit-ui-react-components";
import Modal from "../../../../../../ui-components/src/hoc/Modal";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { loginConfig } from "./config";
import SelectEmail from "./SelectEmail";
import SelectOtp from "./SelectOtp";

/* set employee details to enable backward compatiable */
const setEmployeeDetail = (userObject, token) => {
  let locale = JSON.parse(sessionStorage.getItem("Digit.locale"))?.value || Digit.Utils.getDefaultLanguage();
  localStorage.setItem("Employee.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Employee.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Employee.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Employee.user-info", JSON.stringify(userObject));
};

const DEFAULT_REDIRECT_URL = `/${window?.contextPath}/employee`;

const Login = ({ config: propsConfig, t, isDisabled }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const { data: storeData, isLoading: isStoreLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const searchParams = Digit.Hooks.useQueryParams();

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({});
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [canSubmitEmail, setCanSubmitEmail] = useState(true);
  const [canSubmitOtp, setCanSubmitOtp] = useState(true);
  const [formError, setFormError] = useState("");
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    Digit.SessionStorage.set("citizen.userRequestObject", user);
    const filteredRoles = user?.info?.roles?.filter((role) => role.tenantId === Digit.SessionStorage.get("Employee.tenantId"));
    if (user?.info?.roles?.length > 0) user.info.roles = filteredRoles;
    Digit.UserService.setUser(user);
    setEmployeeDetail(user?.info, user?.access_token);

    // Determine redirect path based on roles and from parameter
    let redirectPath = DEFAULT_REDIRECT_URL;

    /* logic to redirect back to same screen where we left off  */
    if (window?.location?.href?.includes("from=")) {
      redirectPath = decodeURIComponent(window?.location?.href?.split("from=")?.[1]) || DEFAULT_REDIRECT_URL;
    }

    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "NATADMIN")) {
      redirectPath = `/${window?.contextPath}/employee/dss/landing/NURT_DASHBOARD`;
    }
    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "STADMIN")) {
      redirectPath = `/${window?.contextPath}/employee/dss/landing/home`;
    }

    if (window?.location?.href?.includes("digit-studio/employee")) {
      redirectPath = `/${window?.contextPath}/employee/publicservices/modules?selectedPath=Apply`;
    }

    history.replace(redirectPath);
  }, [user]);

  useEffect(() => {
    // Check if we have email in location.state and update params accordingly
    if (location.state?.email) {
      setParams((prev) => ({ ...prev, username: location.state.email }));
    }
  }, [location]);

  const isValidEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleEmailChange = (event) => {
    const { value } = event.target;
    setParams({ ...params, username: value });
    setFormError("");
  };

  const reqCreate = {
    url: `/user-otp/v1/_send`,
    params: { tenantId: Digit.ULBService.getStateId() },
    body: {},
    config: {
      enable: false,
    },
  };
  const mutation = Digit.Hooks.useCustomAPIMutationHook(reqCreate);

  const onOtpLogin = async (data) => {
    const inputEmail = data.username;

    if (!inputEmail) {
      setFormError("Please enter an email address");
      return;
    }

    if (!isValidEmail(inputEmail)) {
      setFormError("Please enter a valid email address");
      return;
    }

    setCanSubmitEmail(false);
    setDisable(true);
    try {
      await mutation.mutate(
        {
          body: {
            otp: {
              username: inputEmail,
              type: "login",
              tenantId: Digit.ULBService.getStateId(),
              userType: "EMPLOYEE",
            },
          },
          config: {
            enable: true,
          },
        },
        {
          onError: (error, variables) => {
            setFormError(
              error?.response?.data?.Errors?.[0]?.code
                ? `SANDBOX_RESEND_OTP${error?.response?.data?.Errors?.[0]?.code}`
                : "Failed to send OTP. Please try again."
            );
            setCanSubmitEmail(true);
            setDisable(false);
          },
          onSuccess: async (data) => {
            setParams({ ...params, username: inputEmail });

            // Clear any previous errors
            setError(null);
            setFormError("");

            // Navigate to OTP page with state
            history.push({
              pathname: `${path}/otp`,
              state: {
                email: inputEmail,
                tenant: Digit.ULBService.getStateId(),
              },
            });

            setCanSubmitEmail(true);
            setDisable(false);
          },
        }
      );
    } catch (err) {
      // setError(err?.response?.data?.error_description || t("INVALID_LOGIN_CREDENTIALS"));
      setCanSubmitEmail(true);
      setDisable(false);
    }
  };

  const handleOtpChange = (otp) => {
    setParams({ ...params, otp });
    setFormError("");
  };

  const selectOtp = async () => {
    try {
      setIsOtpValid(true);
      setCanSubmitOtp(false); // Disable during submission
      const { username, otp } = params;

      if (!otp || otp.length !== 6) {
        setIsOtpValid(false);
        setCanSubmitOtp(true); // Re-enable if validation fails
        setError(t("INVALID_OTP"));
        return;
      }

      const requestData = {
        username,
        password: otp,
        tenantId: Digit.ULBService.getStateId(),
        userType: "EMPLOYEE",
      };

      const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      Digit.SessionStorage.set("Employee.tenantId", info?.tenantId);
      setShowSuccessModal(true);
      setTimeout(() => {
        setUser({ info, ...tokens });
        Digit.UserService.setUser(user);
        setShowSuccessModal(false);
      }, 2000);
    } catch (err) {
      setCanSubmitOtp(true); // Re-enable if submission fails
      setIsOtpValid(false);
      // setError(err?.response?.data?.error_description || t("INVALID_LOGIN_CREDENTIALS"));
    }
  };

  const resendOtp = async () => {
    setIsOtpValid(true);
    try {
      const { username } = params;
      setParams({ ...params, otp: "" });

      const otpData = {
        otp: {
          username: username,
          userType: "EMPLOYEE",
          type: "login",
          tenantId: Digit.ULBService.getStateId(),
        },
      };

      await Digit.UserService.sendOtp(otpData, Digit.ULBService.getStateId());
    } catch (err) {
      // setError(err?.response?.data?.error_description || t("INVALID_LOGIN_CREDENTIALS"));
    }
  };

  const onForgotPassword = () => {
    history.push(`/${window?.contextPath}/employee/user/forgot-password`);
  };

  const defaultValue = {
    code: Digit.ULBService.getStateId(),
    name: Digit.Utils.locale.getTransformedLocale(`TENANT_TENANTS_${Digit.ULBService.getStateId()}`),
  };

  let config = [{ body: propsConfig?.inputs }];

  const { mode } = Digit.Hooks.useQueryParams();
  if (mode === "admin" && config?.[0]?.body?.[2]?.disable == false && config?.[0]?.body?.[2]?.populators?.defaultValue == undefined) {
    config[0].body[2].disable = true;
    config[0].body[2].isMandatory = false;
    config[0].body[2].populators.defaultValue = defaultValue;
  }

  if (isLoading || isStoreLoading) {
    return <Loader />;
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }} className="employee-login-wrapper">
      <Switch>
        <AppContainer>
          {showSuccessModal && (
            <Modal popupModuleMianStyles={{}} hideSubmit={true} showClose={false} headerBarMain={null} headerBarEnd={null}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_51_5398)">
                      <path
                        d="M38.71 17.6867L23.3333 33.0633L14.9566 24.71L11.6666 28L23.3333 39.6667L42 21L38.71 17.6867ZM28 4.66666C15.12 4.66666 4.66663 15.12 4.66663 28C4.66663 40.88 15.12 51.3333 28 51.3333C40.88 51.3333 51.3333 40.88 51.3333 28C51.3333 15.12 40.88 4.66666 28 4.66666ZM28 46.6667C17.6866 46.6667 9.33329 38.3133 9.33329 28C9.33329 17.6867 17.6866 9.33332 28 9.33332C38.3133 9.33332 46.6666 17.6867 46.6666 28C46.6666 38.3133 38.3133 46.6667 28 46.6667Z"
                        fill="#006769"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_51_5398">
                        <rect width="56" height="56" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p style={{ fontSize: "24px", textAlign: "center", margin: "10px", fontWeight: "700", fontFamily: "Inter" }}>
                  {t("MODEL_LOGIN_SUCCESSFUL_HEADER")}
                </p>
                <p style={{ fontSize: "16px", textAlign: "center", margin: "0", fontFamily: "Inter" }}>{t("EMPLOYEE_EMAIL_LOGIN_SUCCESSFUL")}</p>
              </div>
            </Modal>
          )}

          <Route path={`${path}`} exact>
            <div className="application-header">
              <SelectEmail
                t={t}
                onSelect={onOtpLogin}
                email={params.username || ""}
                onEmailChange={handleEmailChange}
                config={loginConfig[0]}
                canSubmit={canSubmitEmail}
                onForgotPassword={onForgotPassword}
                isDisabled={isDisabled}
                disable={disable}
              />
            </div>
            {formError && <Toast error={true} label={formError} onClose={() => setFormError("")} />}
          </Route>

          <Route path={`${path}/otp`}>
            <div className="application-header">
              <SelectOtp
                config={{
                  ...loginConfig[0],
                  email: params.username || location.state?.email || "",
                  inputs: [
                    {
                      label: "CORE_LOGIN_OTP",
                      // type: "text",
                      name: "otp",
                      validation: {
                        required: true,
                        minlength: 0,
                        maxlength: 6,
                        pattern: /^[0-9]*$/,
                        title: "Please enter a valid OTP",
                      },
                      error: "CORE_COMMON_INVALID_OTP",
                    },
                  ],
                  texts: {
                    header: "CS_LOGIN_OTP",
                    cardText: `${params.username || location.state?.email || ""}`,
                    submitBarLabel: "CS_COMMONS_VERIFY",
                  },
                }}
                onOtpChange={handleOtpChange}
                onResend={resendOtp}
                onSelect={selectOtp}
                otp={params.otp || ""}
                error={isOtpValid}
                canSubmit={true}
                t={t}
              />
            </div>
          </Route>

          {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
        </AppContainer>
      </Switch>
    </div>
  );
};

Login.propTypes = {
  loginParams: PropTypes.any,
};

Login.defaultProps = {
  loginParams: null,
};

export default Login;
