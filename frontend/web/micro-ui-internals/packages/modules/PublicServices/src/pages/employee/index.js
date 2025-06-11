import { AppContainer, PrivateRoute } from "@egovernments/digit-ui-react-components";
import { BreadCrumb } from "@egovernments/digit-ui-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "react-router-dom";
import DigitDemoComponent from "./DigitDemo/digitDemoComponent";
import DigitDemoSearch from "./DigitDemo/DigitDemoSearch";
import Response from "./Response";
import DigitDemoViewComponent from "./DigitDemo/digitDemoViewComponent";
import ModulePageComponent from "./DigitDemo/modulePageComponent";
import InboxService from "./DigitDemo/InboxService";
import ViewCheckListCards from "./CheckList/viewCheckListCards";
import CreateCheckList from "./CheckList/createCheckList";
import ViewApplication from "./CheckList/viewApplication";
import Calculation from "../../../../core/src/pages/citizen/Calculation";
import CitizenInboxService from "./DigitDemo/CitizenInboxService";

const SampleBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();

  const crumbs = [
    {
      internalLink: `/${window?.contextPath}/${Digit.UserService.getType().toLowerCase()}/publicservices/modules?selectedPath=Apply`,
      content: t("HOME"),
      show: true,
    },
    {
      content: t(location.pathname.split("/").pop().toUpperCase()),
      show: true,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = ({ path, stateCode, userType, tenants }) => {
  const location = window.location;

  return (
    <Switch>
      <AppContainer className="ground-container">
        <React.Fragment>
          <SampleBreadCrumbs location={location} />
        </React.Fragment>
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
      </AppContainer>
    </Switch>
  );
};

export default App;
