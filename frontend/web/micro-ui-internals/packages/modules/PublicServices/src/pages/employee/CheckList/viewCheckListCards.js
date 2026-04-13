import React from "react";
import { Card, TextBlock, Button } from "@egovernments/digit-ui-components";
import { useEffect, useState } from "react";
import transformViewCheckList from "../../../utils/createUtils.js";
import CheckListCard from "../../../components/CheckListCard.js";
import { AgentReportCard } from "../../../components/AgentReport";
import AgentReportInline from "../../../components/AgentReport/AgentReportInline";
import { CommissionersCheckListCard } from "../../../components/CommissionersCheckList";
import { InstructionSheetCard } from "../../../components/InstructionSheet";
import { SDECCInstructionSheetCard } from "../../../components/SDECCInstructionSheet";
import { APEInstructionSheetCard } from "../../../components/APEInstructionSheet";
import { CCRChecklistCard } from "../../../components/CCRChecklist";
import { PSSDECCInstructionSheetCard } from "../../../components/PSSDECCInstructionSheet";
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

  const userDetails = Digit.UserService.getUser();
  const userRoles = userDetails?.info?.roles || [];
  const showCommunisionersChecklist = userRoles.some((role) => 
    role.code === "BPA_AGENTS" || 
    role.code === "BPA_HOD" || 
    role.code === "BPA_DIRECTOR" || 
    role.code === "BPA_SRA_SUB_DIRECTOR" || 
    role.code === "BPA_SUB_DIRECTOR"
  );
  
  // Citizens and architects can only view — never edit checklists
  const isCitizen = Digit.UserService.getType()?.toLowerCase() === "citizen";
  const isArchitect = userRoles.some((role) => role.code === "BPA_ARCHITECT");
  const isViewOnly = isCitizen || isArchitect;

  // Check if user is SRA (BPA_AGENTS or BPA_HOD)
  const isSRA = userRoles.some((role) => role.code === "BPA_AGENTS" || role.code === "BPA_HOD");
  
  // Check if user is SDECC (role code includes "SDECC")
  const isSDECC = userRoles.some((role) => role.code?.includes("SDECC"));
 
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

            // Add commissioners checklist if configured
            if (allowedCodes.includes("customCommissionersChecklist")) {
              items.push({
                id: "custom-commissioners-checklist",
                code: "customCommissionersChecklist",
                clientId: "COMMISSIONERS_CHECKLIST",
                auditDetails: {
                  createdTime: Date.now() + 1
                }
              });
            }

            // Add instruction sheet (SRA) if configured
            if (allowedCodes.includes("customInstructionSheet")) {
              items.push({
                id: "custom-instruction-sheet",
                code: "customInstructionSheet",
                clientId: "INSTRUCTION_SHEET_SRA",
                auditDetails: {
                  createdTime: Date.now() + 2
                }
              });
            }

            // Add SDECC instruction sheet if configured
            if (allowedCodes.includes("customSDECCInstructionSheet")) {
              items.push({
                id: "custom-sdecc-instruction-sheet",
                code: "customSDECCInstructionSheet",
                clientId: "INSTRUCTION_SHEET_SDECC",
                auditDetails: {
                  createdTime: Date.now() + 3
                }
              });
            }

            // Add APE instruction sheet if configured (P12 - Approbation de Plan d'Exécution)
            if (allowedCodes.includes("customAPEInstructionSheet")) {
              items.push({
                id: "custom-ape-instruction-sheet",
                code: "customAPEInstructionSheet",
                clientId: "INSTRUCTION_SHEET_APE",
                auditDetails: {
                  createdTime: Date.now() + 4
                }
              });
            }

            // Add PS-specific SDECC instruction sheet
            if (allowedCodes.includes("customPSSDECCInstructionSheet")) {
              items.push({
                id: "custom-ps-sdecc-instruction-sheet",
                code: "customPSSDECCInstructionSheet",
                clientId: "INSTRUCTION_SHEET_PS_SDECC",
                auditDetails: { createdTime: Date.now() + 5 }
              });
            }

            // Add CCR checklist if configured (Certificat de Conformité de Remblai)
            if (allowedCodes.includes("customCCRChecklist")) {
              items.push({
                id: "custom-ccr-checklist",
                code: "customCCRChecklist",
                clientId: "CCR_CHECKLIST",
                auditDetails: {
                  createdTime: Date.now() + 5
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
          // Check if this is a custom agent checklist
          if (item.code === "customAgentChecklist") {
            // Services that use the simple inline version (comments + photos only)
            const inlineServices = ["BPA_ATARR"];
            if (inlineServices.includes(service)) {
              return (
                <AgentReportInline
                  key={index}
                  service={service}
                  state={state}
                  t={t}
                  isViewOnly={isViewOnly}
                />
              );
            }
            // All other services use the full card with modal (côtes table, etc.)
            return (
              <AgentReportCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          // Check if this is a commissioners checklist
          // Only show for: BPA_HOD, BPA_AGENTS, BPA_DIRECTOR, BPA_SUB_DIRECTOR, BPA_SRA_SUB_DIRECTOR
          // Skip completely for all other roles (architects, citizens, etc.)
          if (item.code === "customCommissionersChecklist") {
            if (!showCommunisionersChecklist) {
              return null; // Don't render anything for unauthorized users
            }
            return (
              <CommissionersCheckListCard 
                key={index}
                service={service} 
                state={state} 
                t={t}
                isViewOnly={isViewOnly}
                applicationId={accountID}
              />
            );
          }

          // Check if this is an instruction sheet (SRA)
          // Only SRA users (BPA_AGENTS, BPA_HOD) can edit, everyone else (SDECC, architects, etc.) can only view
          if (item.code === "customInstructionSheet") {
            const isSRAInstructionViewOnly = !isSRA;
            return (
              <InstructionSheetCard 
                key={index}
                service={service} 
                state={state} 
                t={t}
                isViewOnly={isSRAInstructionViewOnly}
              />
            );
          }

          // Check if this is a SDECC instruction sheet
          // Only SDECC users can edit, everyone else (SRA, architects, etc.) can only view
          if (item.code === "customSDECCInstructionSheet") {
            const isSDECCInstructionViewOnly = !isSDECC;
            return (
              <SDECCInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isSDECCInstructionViewOnly}
              />
            );
          }

          // APE instruction sheet (P12 - Approbation de Plan d'Exécution)
          // Editable by SDECC users, view-only for everyone else
          if (item.code === "customAPEInstructionSheet") {
            const isAPEInstructionViewOnly = !isSDECC;
            return (
              <APEInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isAPEInstructionViewOnly}
              />
            );
          }

          // PS-specific SDECC instruction sheet (Surélévation)
          if (item.code === "customPSSDECCInstructionSheet") {
            var isPSSDECCViewOnly = !isSDECC;
            return (
              <PSSDECCInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isPSSDECCViewOnly}
              />
            );
          }

          // CCR checklist (Certificat de Conformité de Remblai)
          if (item.code === "customCCRChecklist") {
            return (
              <CCRChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          // Skip any custom checklist items that weren't handled above
          // (safety check to prevent rendering with CheckListCard)
          if (item.code?.startsWith("custom")) {
            return null;
          }
          
          // Regular checklist
          return (
            <CheckListCard 
              key={index}
              item={item} 
              t={t} 
              accid={accountID} 
              state={state}
              isViewOnly={isViewOnly}
            />
          );
        })}
    </React.Fragment>
  );
};

export default ViewCheckListCards;
