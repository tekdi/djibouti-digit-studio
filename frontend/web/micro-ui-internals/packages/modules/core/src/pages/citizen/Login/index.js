import { AppContainer, Toast } from "@egovernments/digit-ui-react-components";
import Modal from "../../../../../../ui-components/src/hoc/Modal";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { loginSteps } from "./config";
import SelectMobileNumber from "./SelectMobileNumber";
import SelectName from "./SelectName";
import SelectOtp from "./SelectOtp";

const TYPE_REGISTER = { type: "register" };
const TYPE_LOGIN = { type: "login" };
const DEFAULT_USER = "digit-user";
const DEFAULT_REDIRECT_URL = `/${window?.contextPath || "digit-studio"}/citizen`;


const setCitizenDetail = (userObject, token, tenantId) => {
  let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
  localStorage.setItem("Citizen.tenant-id", tenantId);
  localStorage.setItem("tenant-id", tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Citizen.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Citizen.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
};

const getFromLocation = (state, searchParams) => {
  return state?.from || searchParams?.from || DEFAULT_REDIRECT_URL;
};

const Login = ({ stateCode, isUserRegistered = true }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [tokens, setTokens] = useState(null);
  const [params, setParmas] = useState(isUserRegistered ? {} : location?.state?.data);
  const [errorTO, setErrorTO] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchParams = Digit.Hooks.useQueryParams();
  const [canSubmitName, setCanSubmitName] = useState(false);
  const [canSubmitOtp, setCanSubmitOtp] = useState(true);
  const [canSubmitNo, setCanSubmitNo] = useState(true);

  useEffect(() => {
    let errorTimeout;
    if (error) {
      if (errorTO) {
        clearTimeout(errorTO);
        setErrorTO(null);
      }
      errorTimeout = setTimeout(() => {
        setError("");
      }, 5000);
      setErrorTO(errorTimeout);
    }
    return () => {
      errorTimeout && clearTimeout(errorTimeout);
    };
  }, [error]);

  useEffect(() => {
    if (!user) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    Digit.UserService.setUser(user);
    setCitizenDetail(user?.info, user?.access_token, stateCode);
    // const redirectPath = location.state?.from || DEFAULT_REDIRECT_URL;
    // if (!Digit.ULBService.getCitizenCurrentTenant(true)) {
    //   history.replace(`/${window?.contextPath}/citizen/select-location`, {
    //     redirectBackTo: redirectPath,
    //   });
    // } else {
    // history.replace(redirectPath);
    // }
  }, [user]);

  const stepItems = useMemo(() =>
    loginSteps.map(
      (step) => {
        const texts = {};
        for (const key in step.texts) {
          texts[key] = t(step.texts[key]);
        }
        return { ...step, texts };
      },
      [loginSteps]
    )
  );

  const getUserType = () => Digit.UserService.getType();

  const handleOtpChange = (otp) => {
    setParmas({ ...params, otp });
  };

  const handleMobileChange = (event) => {
    // Handle both event objects and direct values safely
    let value;
    if (typeof event === 'string' || typeof event === 'number') {
      value = event.toString();
    } else if (event && event.target && event.target.value !== undefined) {
      value = event.target.value;
    } else {
      value = '';
    }
    setParmas({ ...params, mobileNumber: value });
  };

  const selectMobileNumber = async (mobileNumber) => {
    setCanSubmitNo(false);

    // Check if mobile number starts with 77
    if (!mobileNumber?.mobileNumber?.startsWith("77")) {
      setError(t("CORE_COMMON_MOBILE_NUMBER_INVALID") + " " + t("CORE_COMMON_MOBILE_NUMBER_SHOULD_START_WITH_77"));
      setCanSubmitNo(true);
      return;
    }

    setParmas({ ...params, ...mobileNumber });
    const data = {
      ...mobileNumber,
      tenantId: stateCode,
      userType: getUserType(),
    };
    if (isUserRegistered) {
      const [res, err] = await sendOtp({ otp: { ...data, ...TYPE_LOGIN } });
      if (!err) {
        setCanSubmitNo(true);
        history.replace(`${path}/otp`, { from: getFromLocation(location.state, searchParams), role: location.state?.role });
        return;
      } else {
        setCanSubmitNo(true);
        if (!(location.state && location.state.role === "FSM_DSO")) {
          history.push(`/${window?.contextPath}/citizen/register/name`, { from: getFromLocation(location.state, searchParams), data: data });
        }
      }
      if (location.state?.role) {
        setCanSubmitNo(true);
        setError(location.state?.role === "FSM_DSO" ? t("ES_ERROR_DSO_LOGIN") : "User not registered.");
      }
    } else {
      const [res, err] = await sendOtp({ otp: { ...data, ...TYPE_REGISTER } });
      if (!err) {
        setCanSubmitNo(true);
        history.replace(`${path}/otp`, { from: getFromLocation(location.state, searchParams) });
        return;
      }
      setCanSubmitNo(true);
    }
  };

  const selectName = async (name) => {
    const data = {
      ...params,
      tenantId: stateCode,
      userType: getUserType(),
      ...name,
    };
    setParmas({ ...params, ...name });
    setCanSubmitName(true);
    const [res, err] = await sendOtp({ otp: { ...data, ...TYPE_REGISTER } });
    if (res) {
      setCanSubmitName(false);
      history.replace(`${path}/otp`, { from: getFromLocation(location.state, searchParams) });
    } else {
      setCanSubmitName(false);
    }
  };

  const selectOtp = async () => {
    try {
      setIsOtpValid(true);
      setCanSubmitOtp(false);
      const { mobileNumber, otp, name } = params;
      if (isUserRegistered) {
        const requestData = {
          username: mobileNumber,
          password: otp,
          tenantId: stateCode,
          userType: getUserType(),
        };
        const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);

        if (location.state?.role) {
          const roleInfo = info.roles.find((userRole) => userRole.code === location.state.role);
          if (!roleInfo || !roleInfo.code) {
            setError(t("ES_ERROR_USER_NOT_PERMITTED"));
            setTimeout(() => history.replace(DEFAULT_REDIRECT_URL), 5000);
            return;
          }
        }
        if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
          info.tenantId = Digit.ULBService.getStateId();
        }

        // Show success modal and then set user after a short delay
        setUser({ info, ...tokens });
        Digit.UserService.setUser(user);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          const redirectPath = location.state?.from || DEFAULT_REDIRECT_URL;
          history.replace(redirectPath);
        }, 2000);
      } else {
        // Registration flow
        const requestData = {
          name: name,
          username: mobileNumber,
          otpReference: otp,
          tenantId: stateCode,
        };

        const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.registerUser(requestData, stateCode);

        if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
          info.tenantId = Digit.ULBService.getStateId();
        }
        setUser({ info, ...tokens });
        Digit.UserService.setUser(user);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          const redirectPath = location.state?.from || DEFAULT_REDIRECT_URL;
          history.replace(redirectPath);
        }, 2000);
      }
    } catch (err) {
      setCanSubmitOtp(true);
      setIsOtpValid(false);
    }
  };

  const resendOtp = async () => {
    setIsOtpValid(true);
    const { mobileNumber } = params;
    setParmas({ ...params, otp: "" });
    const data = {
      mobileNumber,
      tenantId: stateCode,
      userType: getUserType(),
    };
    if (!isUserRegistered) {
      const [res, err] = await sendOtp({ otp: { ...data, ...TYPE_REGISTER } });
    } else if (isUserRegistered) {
      const [res, err] = await sendOtp({ otp: { ...data, ...TYPE_LOGIN } });
    }
  };

  const sendOtp = async (data) => {
    try {
      const res = await Digit.UserService.sendOtp(data, stateCode);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
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
                <p style={{ fontSize: "16px", textAlign: "center", margin: "0", fontFamily: "Inter" }}>{t("CITIZEN_MOBILE_LOGIN_SUCCESSFUL")}</p>
              </div>
            </Modal>
          )}
          <Route path={`${path}`} exact>
            <SelectMobileNumber
              onSelect={selectMobileNumber}
              config={stepItems[0]}
              mobileNumber={params.mobileNumber || ""}
              onMobileChange={handleMobileChange}
              canSubmit={canSubmitNo}
              showRegisterLink={isUserRegistered && !location.state?.role}
              t={t}
            />
          </Route>
          <Route path={`${path}/otp`}>
            <SelectOtp
              config={{ ...stepItems[1], texts: { ...stepItems[1].texts, cardText: `+253 ${params.mobileNumber || ""}` } }}
              onOtpChange={handleOtpChange}
              onResend={resendOtp}
              onSelect={selectOtp}
              otp={params.otp}
              error={isOtpValid}
              canSubmit={canSubmitOtp}
              mobileNumber={params.mobileNumber || ""}
              t={t}
            />
          </Route>
          <Route path={`${path}/name`}>
            <SelectName
              config={{
                ...stepItems[2],
                texts: { ...stepItems[1].texts, cardText: `+253 ${params.mobileNumber || ""}` }
              }}
              onSelect={selectName}
              t={t}
              mobileNumber={params.mobileNumber || ""}
              isDisabled={canSubmitName}
            />
          </Route>
          {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
        </AppContainer>
      </Switch>
    </div>
  );
};

export default Login;
