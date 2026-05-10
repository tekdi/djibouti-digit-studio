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
import { PVImplantationChecklistCard } from "../../../components/PVImplantationChecklist";
import { CCGVisitChecklistCard } from "../../../components/CCGVisitChecklist";
import { CCPVisitChecklistCard } from "../../../components/CCPVisitChecklist";
import { BCIEInspectionChecklistCard } from "../../../components/BCIEInspectionChecklist";
import { ATARRInstructionSheetCard } from "../../../components/ATARRInstructionSheet";
import { PCSInstructionSheetCard } from "../../../components/PCSInstructionSheet";
import { PFInstructionSheetCard } from "../../../components/PFInstructionSheet";
import { PDInstructionSheetCard } from "../../../components/PDInstructionSheet";
import { ACELocauxPublicChecklistCard } from "../../../components/ACELocauxPublicChecklist";
import { ACEHabitationChecklistCard } from "../../../components/ACEHabitationChecklist";
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
  
  // Citizens, architects, and commissioners can only view — never edit checklists
  const isCitizen = Digit.UserService.getType()?.toLowerCase() === "citizen";
  const isArchitect = userRoles.some((role) => role.code === "BPA_ARCHITECT");
  const isCommissioner = userRoles.some((role) =>
    role.code === "BPA_SDECC_COMM" || role.code === "BPA_DGDCF_COMM" ||
    role.code === "BPA_ONEAD_COMM" || role.code === "BPA_DNPC_COMM" ||
    role.code === "BPA_EDD_COMM" || role.code === "BPA_INSPD_COMM" ||
    role.code === "BPA_PL_COMM" || role.code === "BPA_DJITELECOM_COMM"
  );
  const isViewOnly = isCitizen || isArchitect || isCommissioner;

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

            // Add PV Implantation checklist if configured (Procès-Verbal d'Implantation)
            if (allowedCodes.includes("customPVImplantationChecklist")) {
              items.push({
                id: "custom-pv-implantation-checklist",
                code: "customPVImplantationChecklist",
                clientId: "PV_IMPLANTATION_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 6 }
              });
            }

            // Add CCP Visit checklist if configured (Procès-verbal de visite — CCP)
            if (allowedCodes.includes("customCCPVisitChecklist")) {
              items.push({
                id: "custom-ccp-visit-checklist",
                code: "customCCPVisitChecklist",
                clientId: "CCP_VISIT_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 8 }
              });
            }

            // Add CCG Visit checklist if configured (Procès-Verbal de Visite — Certificat de Conformité Générale)
            if (allowedCodes.includes("customCCGVisitChecklist")) {
              items.push({
                id: "custom-ccg-visit-checklist",
                code: "customCCGVisitChecklist",
                clientId: "CCG_VISIT_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 7 }
              });
            }

            // Add BCIE Inspection checklist if configured (Certificat de Conformité Électrique)
            if (allowedCodes.includes("customBCIEInspectionChecklist")) {
              items.push({
                id: "custom-bcie-inspection-checklist",
                code: "customBCIEInspectionChecklist",
                clientId: "BCIE_INSPECTION_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 8 }
              });
            }

            // Add ATARR Instruction Sheet if configured (P10 - Autorisation de Travaux d'Agrandissement/Réparation/Rénovation)
            if (allowedCodes.includes("customATARRInstructionSheet")) {
              items.push({
                id: "custom-atarr-instruction-sheet",
                code: "customATARRInstructionSheet",
                clientId: "INSTRUCTION_SHEET_ATARR",
                auditDetails: { createdTime: Date.now() + 9 }
              });
            }

            // Add PCS Instruction Sheet if configured (P7 - Permis de Construire Simplifié)
            if (allowedCodes.includes("customPCSInstructionSheet")) {
              items.push({
                id: "custom-pcs-instruction-sheet",
                code: "customPCSInstructionSheet",
                clientId: "INSTRUCTION_SHEET_PCS",
                auditDetails: { createdTime: Date.now() + 12 }
              });
            }

            // Add PF Instruction Sheet if configured (P8 - Permis de Clôture)
            if (allowedCodes.includes("customPFInstructionSheet")) {
              items.push({
                id: "custom-pf-instruction-sheet",
                code: "customPFInstructionSheet",
                clientId: "INSTRUCTION_SHEET_PF",
                auditDetails: { createdTime: Date.now() + 13 }
              });
            }

            // Add PD Instruction Sheet if configured (P9 - Permis de Démolition)
            if (allowedCodes.includes("customPDInstructionSheet")) {
              items.push({
                id: "custom-pd-instruction-sheet",
                code: "customPDInstructionSheet",
                clientId: "INSTRUCTION_SHEET_PD",
                auditDetails: { createdTime: Date.now() + 14 }
              });
            }

            // Add ACE (Attestation de Conformité Électrique) — Locaux accueillant du public variant
            if (allowedCodes.includes("customACELocauxPublicChecklist")) {
              items.push({
                id: "custom-ace-locaux-public-checklist",
                code: "customACELocauxPublicChecklist",
                clientId: "ACE_LOCAUX_PUBLIC_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 10 }
              });
            }

            // Add ACE (Attestation de Conformité Électrique) — Habitation variant
            if (allowedCodes.includes("customACEHabitationChecklist")) {
              items.push({
                id: "custom-ace-habitation-checklist",
                code: "customACEHabitationChecklist",
                clientId: "ACE_HABITATION_CHECKLIST",
                auditDetails: { createdTime: Date.now() + 11 }
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
          // Only SRA users (BPA_AGENTS, BPA_HOD) can edit — citizens, architects, everyone else view-only
          if (item.code === "customInstructionSheet") {
            return (
              <InstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly || !isSRA}
              />
            );
          }

          // SDECC instruction sheet — only SDECC users can edit
          if (item.code === "customSDECCInstructionSheet") {
            return (
              <SDECCInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly || !isSDECC}
              />
            );
          }

          // APE instruction sheet — only SDECC users can edit
          if (item.code === "customAPEInstructionSheet") {
            return (
              <APEInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly || !isSDECC}
              />
            );
          }

          // PS-specific SDECC instruction sheet — only SDECC users can edit
          if (item.code === "customPSSDECCInstructionSheet") {
            return (
              <PSSDECCInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly || !isSDECC}
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

          if (item.code === "customPVImplantationChecklist") {
            return (
              <PVImplantationChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customCCGVisitChecklist") {
            return (
              <CCGVisitChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customCCPVisitChecklist") {
            return (
              <CCPVisitChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customBCIEInspectionChecklist") {
            return (
              <BCIEInspectionChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customATARRInstructionSheet") {
            return (
              <ATARRInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customPCSInstructionSheet") {
            return (
              <PCSInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customPFInstructionSheet") {
            return (
              <PFInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customPDInstructionSheet") {
            return (
              <PDInstructionSheetCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customACELocauxPublicChecklist") {
            return (
              <ACELocauxPublicChecklistCard
                key={index}
                service={service}
                state={state}
                t={t}
                isViewOnly={isViewOnly}
              />
            );
          }

          if (item.code === "customACEHabitationChecklist") {
            return (
              <ACEHabitationChecklistCard
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
