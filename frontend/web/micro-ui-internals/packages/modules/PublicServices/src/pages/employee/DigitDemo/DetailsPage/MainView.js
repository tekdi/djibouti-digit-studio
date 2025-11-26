import React from "react";
import ProjectTab from "./ProjectTab";
import DocumentsTab from "./DocumentsTab";
import PaymentsTab from "./PaymentsTab";
import ActivitiesTab from "./ActivitiesTab";
import ChecklistTab from "./ChecklistTab";
import ObservationsTab from "./ObservationsTab";

const MainView = ({ 
  activeTab, 
  response, 
  applicant, 
  projectDetails, 
  designOffice, 
  documents, 
  costEstimation, 
  timelineWorkflowDetails, 
  workflowDetails, 
  service, 
  queryStrings,
  isCitizen,
  shouldShowChecklist,
  checkListCodes,
  data,
  serviceConfig,
  selectedBusinessService
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {activeTab === "project" && (
        <ProjectTab 
          response={response}
          serviceConfig={serviceConfig}
          queryStrings={queryStrings}
          selectedBusinessService={selectedBusinessService}
          workflowDetails={workflowDetails}
        />
      )}

      {activeTab === "documents" && (
        <DocumentsTab documents={documents} />
      )}

      {activeTab === "payments" && (
        <PaymentsTab 
          costEstimation={costEstimation}
          checkListCodes={checkListCodes}
          data={data}
          isCitizen={isCitizen}
          service={service}
        />
      )}

      {activeTab === "activities" && (
        <ActivitiesTab 
          timeline={
            service === queryStrings?.businessService
              ? timelineWorkflowDetails?.timeline
              : workflowDetails?.timeline
          }
          response={response}
          isCitizen={isCitizen}
          isParallelWorkflow={service !== queryStrings?.businessService}
        />
      )}

      {activeTab === "checklist" && (
        <ChecklistTab 
          isCitizen={isCitizen}
          shouldShowChecklist={shouldShowChecklist}
          checkListCodes={checkListCodes}
          data={data}
        />
      )}

      {activeTab === "observations" && (
        <ObservationsTab 
          response={response}
          queryStrings={queryStrings}
        />
      )}
    </div>
  );
};

export default MainView;
