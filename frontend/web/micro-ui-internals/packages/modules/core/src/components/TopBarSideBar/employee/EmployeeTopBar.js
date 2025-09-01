import React from "react";
import PropTypes from "prop-types";
import AnimatedLogo from "../AnimatedLogo";
import EmployeeNavigation from "./EmployeeNavigation";
import UserDropdown from "../UserDropdown";
import EmployeeMobileMenu from "./EmployeeMobileMenu";
import LanguageSelector from "../LanguageSelector";

const EmployeeTopBar = ({ t, userDetails, userOptions, mobileView }) => {
  return (
    <header className="bg-white bg-opacity-95 shadow-sm border-b border-gray-200 border-opacity-60 sticky top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto py-3">
        <div className="flex items-center justify-between h-18">
          {/* Logo with Animation */}
          <AnimatedLogo /> 

          {/* Desktop Navigation */}
          <EmployeeNavigation mobileView={mobileView} />

          {/* Right Side - Language Selector, Notifications & User Menu */}
          <div className="flex items-center gap-3">
  
            {/* Language Selector */}
            <LanguageSelector />

            {/* User Dropdown */}
            <UserDropdown userDetails={userDetails} userOptions={userOptions} />

            {/* Mobile menu button */}
            {mobileView && <EmployeeMobileMenu mobileView={mobileView} />}
          </div>
        </div>
      </div>
    </header>
  );
};

EmployeeTopBar.propTypes = {
  t: PropTypes.func.isRequired,
  userDetails: PropTypes.shape({
    info: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      userInfo: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
  userOptions: PropTypes.array,
  handleUserDropdownSelection: PropTypes.func,
  mobileView: PropTypes.bool,
};

export default EmployeeTopBar;
