import React from "react";
import { useTranslation } from "react-i18next";

const CustomActionDropdown = ({
  workflowDetails,
  actions,
  isDisabled,
  onActionSelect,
  module,
  service,
  menuStyles
}) => {
  const { t } = useTranslation();

  const title = t(`${module.toUpperCase()}_${service.toUpperCase()}_ACTIONS`);

  return (
    <div style={{ position: 'relative', padding:'15px' }}>
      <select
        className="custom-action-dropdown"
        disabled={isDisabled}
        onChange={(e) => {
          const selectedAction = actions.find(action => action.action === e.target.value);
          if (selectedAction) {
            onActionSelect(selectedAction);
          }
        }}
        style={{
          padding: "10px 12px",
          borderRadius: "4px",
          borderRadius:'10px',
          backgroundColor: isDisabled ? "#f0f0f0" : "white",
          cursor: isDisabled ? "not-allowed" : "pointer",
          minWidth: "200px",
          appearance: "none",
          ...menuStyles
        }}
        title={title}
      >
        <option  value="" disabled selected hidden>
          {title}
        </option>
        {actions?.map((action) => (
          <option
            key={action.action}
            value={action.action}
            style={{
              backgroundColor: "white",
              padding: "10px",
              cursor: "pointer",
              color:'black'
            }}
          >
            {t(action.displayname)}
          </option>
        ))}
      </select>
      <style>
        {`
          .custom-action-dropdown option:hover,
          .custom-action-dropdown option:focus {
            background-color:rgb(5, 156, 158) !important;
            color: black !important;
          }
          .custom-action-dropdown {
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 8px;
            padding-right: 24px;
          }
        `}
      </style>
    </div>
  );
};

export default CustomActionDropdown;
