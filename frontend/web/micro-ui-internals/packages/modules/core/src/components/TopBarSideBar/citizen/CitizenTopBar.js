import React from "react";
import PropTypes from "prop-types";
import AnimatedLogo from "../AnimatedLogo";
import CitizenNavigation from "./CitizenNavigation";
import UserDropdown from "../UserDropdown";
import CitizenMobileMenu from "./CitizenMobileMenu";

const CitizenTopBar = ({ t, userDetails, userOptions, mobileView }) => {
  return (
    <header className="bg-white bg-opacity-95 shadow-sm border-b border-gray-200 border-opacity-60 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo with Animation */}
          <AnimatedLogo />

          {/* Desktop Navigation */}
          <CitizenNavigation mobileView={mobileView} />

          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center gap-3">
          
            {/* User Dropdown */}
            <UserDropdown userDetails={userDetails} userOptions={userOptions} />

            {/* Mobile menu button */}
            {mobileView && <CitizenMobileMenu mobileView={mobileView} />}
          </div>
        </div>
      </div>
    </header>
  );
};

CitizenTopBar.propTypes = {
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

export default CitizenTopBar;