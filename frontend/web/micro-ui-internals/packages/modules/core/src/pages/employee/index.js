import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
import { AppModules } from "../../components/AppModules";
import ErrorBoundary from "../../components/ErrorBoundaries";
import TopBarSideBar from "../../components/TopBarSideBar";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import EmployeeLogin from "./Login";
import UserProfile from "../citizen/Home/UserProfile";
import ErrorComponent from "../../components/ErrorComponent";
import { PrivateRoute } from "@egovernments/digit-ui-react-components";

const userScreensExempted = ["user/profile", "user/error"];

const EmployeeApp = ({
  stateInfo,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  handleUserDropdownSelection,
  logoUrl,
  DSO,
  stateCode,
  modules,
  appTenants,
  sourceUrl,
  pathname,
  initData,
}) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const { path } = useRouteMatch();
  const location = useLocation();
  const showLanguageChange = location?.pathname?.includes("language-selection");
  const isUserProfile = userScreensExempted.some((url) => location?.pathname?.includes(url));

  // Fetch link data for the TopBarSideBar
  const { isLoading: islinkDataLoading, data: linkData, isFetched: isLinkDataFetched } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "ACCESSCONTROL-ACTIONS-TEST",
    [
      {
        name: "actions-test",
        filter: `[?(@.url == '${window.contextPath}-card')]`,
      },
    ],
    {
      select: (data) => {
        const formattedData = data?.["ACCESSCONTROL-ACTIONS-TEST"]?.["actions-test"]
          ?.filter((el) => el.enabled === true)
          .reduce((a, b) => {
            a[b.parentModule] = a[b.parentModule]?.length > 0 ? [b, ...a[b.parentModule]] : [b];
            return a;
          }, {});
        return formattedData;
      },
    }
  );

  useEffect(() => {
    Digit.UserService.setType("employee");
  }, []);

  return (
    <div className="employee">
      <Switch>
        <Route path={`${path}/user`}>
          {!location?.pathname?.includes('login') && (
            <TopBarSideBar
              t={t}
              stateInfo={stateInfo}
              userDetails={userDetails}
              CITIZEN={CITIZEN}
              cityDetails={cityDetails}
              mobileView={mobileView}
              handleUserDropdownSelection={handleUserDropdownSelection}
              logoUrl={logoUrl}
              showSidebar={isUserProfile ? true : false}
              showLanguageChange={!showLanguageChange}
              linkData={linkData}
              islinkDataLoading={islinkDataLoading}
            />
          )}
          <div
            className={isUserProfile ? "grounded-container" : "loginContainer"}
            style={
              isUserProfile
                ? { padding: 0, paddingTop: "80px", marginLeft: mobileView ? "" : "64px" }
                : { "--banner-url": `url(${stateInfo?.bannerUrl})`, padding: "0px" }
            }
          >
            <Switch>
              <Route path={`${path}/user/login`}>
                {userDetails?.access_token ? <Redirect to={`/${window?.contextPath}/employee`} /> : <EmployeeLogin />}
              </Route>
              <Route path={`${path}/user/language-selection`}>
                <Redirect to={`/${window?.contextPath}/employee/user/login`} />
              </Route>
              <Route path={`${path}/user/forgot-password`}>
                <ForgotPassword />
              </Route>
              <Route path={`${path}/user/change-password`}>
                <ChangePassword />
              </Route>
              <PrivateRoute path={`${path}/user/profile`}>
                <UserProfile stateCode={stateCode} userType={"employee"} cityDetails={cityDetails} />
              </PrivateRoute>
              <Route path={`${path}/user/error`}>
                <ErrorComponent
                  initData={initData}
                  goToHome={() => {
                    history.push(`/${window?.contextPath}/${Digit?.UserService?.getType?.()}/publicservices/modules?selectedPath=Apply`);
                  }}
                />
              </Route>
              <Route>
                <Redirect to={`${path}/login`} />
              </Route>
            </Switch>
          </div>
        </Route>
        <Route>
          <TopBarSideBar
            t={t}
            stateInfo={stateInfo}
            userDetails={userDetails}
            CITIZEN={CITIZEN}
            cityDetails={cityDetails}
            mobileView={mobileView}
            handleUserDropdownSelection={handleUserDropdownSelection}
            logoUrl={logoUrl}
            modules={modules}
            linkData={linkData}
            islinkDataLoading={islinkDataLoading}
          />
          <div className={`${DSO ? "m-auto" : ""}`}>
            <div>
              <ErrorBoundary initData={initData}>
                <AppModules stateCode={stateCode} userType="employee" modules={modules} appTenants={appTenants} />
              </ErrorBoundary>
            </div>
            <div className="employee-home-footer">
              <img
                alt="Powered by DIGIT"
                src={
                  i18n.language === "en_IN"
                    ? window?.globalConfigs?.getConfig?.("DIGIT_FOOTER")
                    : "https://egov-bucket.s3.af-south-1.amazonaws.com/new/Powered+by+DIGIT+French+(1).png"
                }
                style={{ height: "1.1em", cursor: "pointer" }}
                onClick={() => {
                  window.open(window?.globalConfigs?.getConfig?.("DIGIT_HOME_URL"), "_blank").focus();
                }}
              />
            </div>
          </div>
        </Route>
        <Route>
          <Redirect to={`${path}/login`} />
        </Route>
      </Switch>
    </div>
  );
};

export default EmployeeApp;
