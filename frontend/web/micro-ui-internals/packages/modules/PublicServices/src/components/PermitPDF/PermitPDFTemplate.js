import React from "react";
import P1_PermisRemblai from "./templates/P1_PermisRemblai";

// Map each business service to its permit template
var TEMPLATES = {
  BPA_PR: P1_PermisRemblai,
  // Future: add more templates here
  // BPA_PCO: P2_PermisConstruire,
  // BPA_PL: P4_PermisLotir,
  // etc.
};

var PermitPDFTemplate = React.forwardRef(function (props, ref) {
  var Template = TEMPLATES[props.businessService];

  if (!Template) {
    return (
      <div ref={ref} style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
        <h2>Modèle de permis non disponible</h2>
        <p>Le modèle pour le service "{props.businessService}" n'est pas encore configuré.</p>
      </div>
    );
  }

  return <Template ref={ref} response={props.response} />;
});

PermitPDFTemplate.displayName = "PermitPDFTemplate";
export default PermitPDFTemplate;
