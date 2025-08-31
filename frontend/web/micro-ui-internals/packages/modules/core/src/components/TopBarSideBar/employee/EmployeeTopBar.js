import React from "react";
import PropTypes from "prop-types";
import AnimatedLogo from "../AnimatedLogo";
import EmployeeNavigation from "./EmployeeNavigation";
import UserDropdown from "../UserDropdown";
import EmployeeMobileMenu from "./EmployeeMobileMenu";

const EmployeeTopBar = ({ t, userDetails, userOptions, mobileView }) => {
  return (
    <header className="bg-white bg-opacity-95 shadow-sm border-b border-gray-200 border-opacity-60 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo with Animation */}
          <AnimatedLogo />

          {/* Desktop Navigation */}
          <EmployeeNavigation mobileView={mobileView} />

          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center gap-3">
  
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
