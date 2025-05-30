import React from "react";
import { Card, TextBlock, Button, Loader } from "@egovernments/digit-ui-components";
import { transformViewApplication } from "../utils/createUtils";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CheckListCard = (props) => {
  const [filled, setFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const history = useHistory();
  const { t } = useTranslation();

  const style = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    width: "100%",
    position: "relative",
    padding: "20px",
  };

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
          const allValid = field[0].additionalFields[0].action == "SUBMIT";
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

  return (
    <div>
      {loading ? (
        <Card type="primary" style={style}>
          {/* <span
              style={{
                fontSize: '0.75rem',
                position:'absolute',
                top:'10px',
                left:'20px',
                fontWeight: 500,
                color: '#166534',
                backgroundColor: '#dcfce7',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {t("READY")}
            </span> */}
          {/* <TextBlock style={{color:'black',fontSize:'40px', fontWeight:'700' }} body={props.t(props.item.code)} /> */}
          <p style={{ color: "black", fontSize: "24px", fontWeight: "700", wordBreak: "break-word", overflowWrap: "break-word" }}>
            {props.t(props.item.code)}
          </p>
          {filled ? (
            <button
              style={{
                border: "1px solid rgb(209, 213, 219)",
                width: "100%",
                backgroundColor: "",
                color: "white",
                borderRadius: "10px",
                padding: "8px",
              }}
              onClick={() =>
                history.push(
                  `/${window.contextPath}/employee/publicservices/viewresponse?accid=${props.accid}&id=${props.item.id}&code=${props.item.code}`
                )
              }
            >
              {t("VIEW_RESPONSE")}
            </button>
          ) : (
            <button
              style={{
                border: "1px solid rgb(209, 213, 219)",
                width: "100%",
                backgroundColor: "white",
                color: "#006769",
                borderRadius: "10px",
                padding: "8px",
              }}
              onClick={() =>
                history.push(
                  `/${window.contextPath}/employee/publicservices/checklist?accid=${props.accid}&id=${props.item.id}&code=${props.item.code}`,
                  { redirectionUrl: `${window.location.href}` }
                )
              }
            >
              {t("FILL_CHECKLIST")}
            </button>
          )}
        </Card>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default CheckListCard;
