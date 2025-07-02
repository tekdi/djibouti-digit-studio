import React, { useEffect } from "react";
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import CitizenApp from "./pages/citizen";
import EmployeeApp from "./pages/employee";

export const DigitApp = ({ stateCode, modules, appTenants, logoUrl, initData, defaultLanding = "citizen" }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const innerWidth = window.innerWidth;
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const userDetails = Digit.UserService.getUser();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const DSO = Digit.UserService.hasAccess(["FSM_DSO"]);
  let CITIZEN = userDetails?.info?.type === "CITIZEN" || !window.location.pathname.split("/").includes("employee") ? true : false;

  if (window.location.pathname.split("/").includes("employee")) CITIZEN = false;

  useEffect(() => {
    if (!pathname?.includes("application-details")) {
      if (!pathname?.includes("inbox")) {
        Digit.SessionStorage.del("fsm/inbox/searchParams");
      }
      if (pathname?.includes("search")) {
        Digit.SessionStorage.del("fsm/search/searchParams");
      }
    }
    if (!pathname?.includes("dss")) {
      Digit.SessionStorage.del("DSS_FILTERS");
    }
    if (pathname?.toString() === `/${window?.contextPath}/employee`) {
      Digit.SessionStorage.del("SEARCH_APPLICATION_DETAIL");
      Digit.SessionStorage.del("WS_EDIT_APPLICATION_DETAILS");
    }
    if (pathname?.toString() === `/${window?.contextPath}/citizen` || pathname?.toString() === `/${window?.contextPath}/employee`) {
      Digit.SessionStorage.del("WS_DISCONNECTION");
    }
  }, [pathname]);

  history.listen(() => {
    window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  const handleUserDropdownSelection = (option) => {
    option.func();
  };

  const mobileView = innerWidth <= 640;
  let sourceUrl = `${window.location.origin}/citizen`;
  const commonProps = {
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
  };

  useEffect(() => {
    const userType = Digit?.UserService?.getUser()?.info?.type?.toLowerCase();
    const pathUserType = location.pathname.split("/")[2]; // extract `employee` or `citizen`

    if (userType && pathUserType && userType !== pathUserType) {
      // Mismatch detected — logout user and redirect
      Digit.UserService.logout();
      setTimeout(() => {
        window.location.href = `/${window?.contextPath}/${pathUserType}/login`;
      }, 1000);
    }
  }, [pathname]);

  return (
    <Switch>
      <Route path={`/${window?.contextPath}/employee`}>
        <EmployeeApp {...commonProps} />
      </Route>
      <Route path={`/${window?.contextPath}/citizen`}>
        <CitizenApp {...commonProps} />
      </Route>
      <Route>
        <Redirect to={`/${window?.contextPath}/${defaultLanding}`} />
      </Route>
    </Switch>
  );
};
