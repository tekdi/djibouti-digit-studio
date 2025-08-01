import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const CustomActionDropdown = ({
  actions,
  isDisabled,
  onActionSelect,
  module,
  service,
  menuStyles,
  resetTrigger
}) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState("");

  const title = t(`${module?.toUpperCase()}_${service?.toUpperCase()}_ACTIONS`);


  // Reset dropdown when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setSelectedValue("");
    }
  }, [resetTrigger]);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);

    if (value) {
      const selectedAction = actions.find(action => action.action === value);
      if (selectedAction) {
        onActionSelect(selectedAction);
      }
    }
  };

  return (
    <div style={{ position: 'relative', padding: '15px' }}>
      <select
        className="custom-action-dropdown"
        disabled={isDisabled}
        value={selectedValue}
        onChange={handleSelectChange}
        style={{
          padding: "10px 35px",
          borderRadius: "4px",
          borderRadius: '10px',
          backgroundColor: isDisabled ? "#f0f0f0" : "white",
          cursor: isDisabled ? "not-allowed" : "pointer",
          minWidth: "200px",
          appearance: "none",
          fontSize: "16px",
          textAlign: "center",
          ...menuStyles
        }}
        title={title}
      >
        <option value="" disabled selected hidden>
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
              color: 'black'
            }}
          >
            {t(action.displayname)}
          </option>
        ))}
      </select>
      <style>
        {`
    .custom-action-dropdown {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='white' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 12px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      padding-right: 36px;
    }

    .custom-action-dropdown option:hover,
    .custom-action-dropdown option:focus {
      background-color: rgb(5, 156, 158) !important;
      color: black !important;
    }
  `}
      </style>

    </div>
  );
};

export default CustomActionDropdown;
