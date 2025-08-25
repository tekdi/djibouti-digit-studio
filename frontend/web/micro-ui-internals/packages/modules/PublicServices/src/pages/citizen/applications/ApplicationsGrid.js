import React from "react";
import ApplicationCard from "./ApplicationCard";
import EmptyState from "./EmptyState";

const ApplicationsGrid = ({ applications }) => {
  if (applications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </div>
  );
};

export default ApplicationsGrid;
