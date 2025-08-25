import { AppContainer, PrivateRoute } from "@egovernments/digit-ui-react-components";
import { BreadCrumb } from "@egovernments/digit-ui-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "react-router-dom";
import DigitDemoComponent from "./DigitDemo/digitDemoComponent";
import DigitDemoSearch from "./DigitDemo/DigitDemoSearch";
import Response from "./Response";
import DigitDemoViewComponent from "./DigitDemo/DetailsPage";
import ModulePageComponent from "./DigitDemo/modulePageComponent";
import InboxService from "./DigitDemo/InboxService";
import ViewCheckListCards from "./CheckList/viewCheckListCards";
import CreateCheckList from "./CheckList/createCheckList";
import ViewApplication from "./CheckList/viewApplication";
import Calculation from "../../../../core/src/pages/citizen/Calculation";
import CitizenInboxService from "./DigitDemo/CitizenInboxService";
import DigitDemoEditComponent from "./DigitDemo/digitDemoEditComponent";
import DigitDemoCreateComponent from "./DigitDemo/digitDemoCreateComponent";

// citizen
import Apply from "../citizen/apply";
import ServiceDetailPage from "../citizen/apply/ServiceDetailPage";
import CitizenDashboard from "../citizen/Dashboard";
import CitizenHelp from "../citizen/help";
import CitizenApplications from "../citizen/applications";
import CitizenApplicationsCompleted from "../citizen/applications/CitizenApplicationsCompleted";
import CitizenApplicationsPendingPayment from "../citizen/applications/CitizenApplicationsPendingPayment";
import Settings from "../citizen/Settings";

const SampleBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();
  const pathname = location.pathname.replace(/\/$/, "").split("/").pop();

  const homeLink =
    userType === "citizen"
      ? `/${window?.contextPath}/${userType}/publicservices/apply`
      : `/${window?.contextPath}/${userType}/publicservices/modules?selectedPath=Apply`;

  const crumbs = [
    {
      internalLink: homeLink,
      content: t("HOME"),
      show: true,
    },
  ];

  if (pathname && pathname !== "modules" && pathname !== "apply") {
    crumbs.push({
      content: t(pathname.toUpperCase()),
      show: true,
    });
  }
  return <BreadCrumb crumbs={crumbs} />;
};

const App = ({ path, stateCode, userType, tenants }) => {
  const location = window.location;

  return (
    <Switch>
      <AppContainer>
        {/* <React.Fragment>
          <SampleBreadCrumbs location={location} />
        </React.Fragment> */}
        <div style={{ background: "#1a9a8d0f" }} className="pb-10">
          {/* citizen */}
          <PrivateRoute exact path={`${path}/dashboard`} component={() => <CitizenDashboard />} />
          <PrivateRoute exact path={`${path}/apply`} component={() => <Apply />} />
          <PrivateRoute exact path={`${path}/service/:serviceId`} component={() => <ServiceDetailPage />} />
          <PrivateRoute exact path={`${path}/applications/pending`} component={() => <CitizenApplications />} />
          <PrivateRoute exact path={`${path}/applications/completed`} component={() => <CitizenApplicationsCompleted />} />
          <PrivateRoute exact path={`${path}/applications/pending-payment`} component={() => <CitizenApplicationsPendingPayment />} />
          <PrivateRoute exact path={`${path}/settings`} component={() => <Settings />} />
          <PrivateRoute exact path={`${path}/help`} component={() => <CitizenHelp />} />

          {/* employee */}
          <PrivateRoute path={`${path}/:module/:service/Apply`} component={() => <DigitDemoComponent />} />
          <PrivateRoute path={`${path}/:module/:service/response`} component={() => <Response />} />
          <PrivateRoute path={`${path}/:module/search`} component={() => <DigitDemoSearch />} />
          <PrivateRoute path={`${path}/:module/:service/ViewScreen`} component={() => <DigitDemoViewComponent />} />
          <PrivateRoute path={`${path}/modules`} component={() => <ModulePageComponent />} />
          <PrivateRoute path={`${path}/:module/inbox`} component={() => <InboxService />} />
          <PrivateRoute path={`${path}/:module/CitizenInbox`} component={() => <CitizenInboxService />} />
          <PrivateRoute path={`${path}/viewapp`} component={() => <ViewCheckListCards />} />
          <PrivateRoute path={`${path}/checklist`} component={() => <CreateCheckList />} />
          <PrivateRoute path={`${path}/viewresponse`} component={() => <ViewApplication />} />
          <PrivateRoute path={`${path}/calculation`} component={() => <Calculation />} />
          <PrivateRoute path={`${path}/:module/:service/Edit`} component={() => <DigitDemoEditComponent />} />
          <PrivateRoute path={`${path}/:module/:service/Create`} component={() => <DigitDemoCreateComponent />} />
        </div>
      </AppContainer>
    </Switch>
  );
};

export default App;
