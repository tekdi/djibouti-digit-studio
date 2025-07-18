import React from "react";
import { Card, TextBlock, Button } from "@egovernments/digit-ui-components";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import transformViewCheckList from "../../../utils/createUtils.js";
import CheckListCard from "../../../components/CheckListCard.js";
// import CustomCheckListCard from "../../../components/CustomCheckListCard.js";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";
import { checklistByService } from "../../../utils/templateConfig.js";

const ViewCheckListCards = ({ checkListCodes, applicationId, state }) => {
  const { t } = useTranslation();
  const { service } = useParams();
  const code = checkListCodes;
  //businessService.workflowstate
  //applicationid
  const accountID = applicationId;
  const [cardItems, setCardItems] = useState([]);

  const request = {
    url: "/health-service-request/service/definition/v1/_search",
    params: {},
    body: {},
    method: "POST",
    headers: {},
    config: {
      enable: false,
    },
  };
  const mutation = Digit.Hooks.useCustomAPIMutationHook(request);

  const getcarditems = async (code) => {
    await mutation.mutate(
      {
        url: "/health-service-request/service/definition/v1/_search",
        method: "POST",
        body: transformViewCheckList(code),
        config: {
          enable: false,
        },
      },
      {
        onSuccess: (res) => {
          let items = res?.ServiceDefinitions || [];

          // Find checklistConfig for current service
          const checklistConfig = checklistByService.find(list => list.service === service);

          // If there's a checklistConfig, filter the items accordingly
          if (checklistConfig) {
            const allowedCodes = checklistConfig.checklist;
            items = items.filter(item => allowedCodes.includes(item.code));
            
            // Add custom checklist if configured
            if (allowedCodes.includes("customAgentChecklist")) {
              items.push({
                id: "custom-agent-checklist",
                code: "customAgentChecklist",
                clientId: "AGENT_FIELD_REPORT",
                auditDetails: {
                  createdTime: Date.now()
                }
              });
            }
          }

          setCardItems(items);
          localStorage.setItem("checklistStatus", res?.ServiceDefinitions?.[0]?.code);
        },
        onError: () => {
          console.log("Error occured");
        },
      }
    );
  };

  useEffect(() => {
    getcarditems(code);
  }, []);

  return (
    <React.Fragment>
      {cardItems
        .sort((a, b) => a.auditDetails.createdTime - b.auditDetails.createdTime)
        .map((item, index) => {
          // Check if this is a custom checklist
          // if (item.code === "customAgentChecklist") {
          //   return (
          //     <CustomCheckListCard 
          //       key={index}
          //       applicationId={accountID} 
          //       service={service} 
          //       state={state} 
          //       t={t} 
          //     />
          //   );
          // }
          
          // Regular checklist
          return (
            <CheckListCard 
              key={index}
              item={item} 
              t={t} 
              accid={accountID} 
              state={state} 
            />
          );
        })}
    </React.Fragment>
  );
};

export default ViewCheckListCards;
