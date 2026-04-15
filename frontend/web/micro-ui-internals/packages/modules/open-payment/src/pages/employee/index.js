import React from "react";
import { Switch, Route } from "react-router-dom";
import OpenView from "../../components/OpenView";
import ResponseEmployee from "../../components/ResponseEmployee";


const EmployeeApp = ({ path }) => {
  return (
    <React.Fragment>
      <div style={{ background: "rgba(26, 154, 141, 0.06)", minHeight: "100vh" }}>
      <Switch>
          <Route path={`${path}/open-view`} render={()=><OpenView />} />
          <Route path={`${path}/success/:businessService/:consumerCode/:tenantId`}>
            <ResponseEmployee  />
          </Route>
          <Route path={`${path}/failure`}>
            <ResponseEmployee />
          </Route>
      </Switch>
      </div>
    </React.Fragment>
  );
};

export default EmployeeApp;
