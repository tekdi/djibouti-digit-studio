import { Dropdown, Hamburger, TopBar as TopBarComponent } from "@egovernments/digit-ui-react-components";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";
import PropTypes from "prop-types";
import CitizenTopBar from "./citizen/CitizenTopBar";
import EmployeeTopBar from "./employee/EmployeeTopBar";

const TextToImg = (props) => (
  <span className="user-img-txt" onClick={props.toggleMenu} title={props.name}>
    {props?.name?.[0]?.toUpperCase()}
  </span>
);


const UserInfoBlock = ({ profilePic, userDetails, roleLabel, t, userOptions, handleUserDropdownSelection, mobileView, roleColor = "#22a4d9" }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', maxWidth: '340px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div>
        {profilePic == null ? (
          <TextToImg
            name={userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee"}
          />
        ) : (
          <img
            src={profilePic}
            alt="Profile"
            style={{
              height: "48px",
              width: "48px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        )}
      </div>
      <div>
        <h5 style={{ margin: 0 }}>
          {userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee"}
        </h5>
        <small style={{ color: roleColor, fontSize: "12px" }}>
          {t(roleLabel)}
        </small>
      </div>
    </div>
    <div className="no-border left">
      <Dropdown
        option={userOptions}
        optionKey="name"
        select={handleUserDropdownSelection}
        showArrow={true}
        freeze={true}
        style={mobileView ? { right: 0 } : {}}
        optionCardStyles={{
          overflow: "visible",
          display: "table",
          position: "absolute",
          marginRight: "30px"
        }}
        topbarOptionsClassName="topbarOptionsClassName"
      />
    </div>
  </div>
);
UserInfoBlock.propTypes = {
  profilePic: PropTypes.string,
  userDetails: PropTypes.shape({
    info: PropTypes.shape({
      name: PropTypes.string,
      userInfo: PropTypes.shape({
        name: PropTypes.string,
      }),
      access_token: PropTypes.string,
    }),
  }),
  roleLabel: PropTypes.string,
  t: PropTypes.func.isRequired,
  userOptions: PropTypes.array,
  handleUserDropdownSelection: PropTypes.func,
  mobileView: PropTypes.bool,
  roleColor: PropTypes.string,
};

const TopBar = ({
  t,
  stateInfo,
  toggleSidebar,
  isSidebarOpen,
  handleLogout,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  userOptions,
  handleUserDropdownSelection,
  logoUrl,
  showLanguageChange = true,
  configs
}) => {

  const [profilePic, setProfilePic] = React.useState(null);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const userObject = Digit.SessionStorage.get("User");
  const priorityRoles = [
    "BPA_ARCHITECT",
    "BPA_HOD",
    "BPA_AGENTS",
    "BPA_SDECC_HOD",
    "BPA_SDECC_AGENTS",
    "BPA_SDECC_COMM",
    "BPA_INSPD_COMM",
    "BPA_EDD_COMM",
    "BPA_DNPC_COMM",
    "BPA_ONEAD_COMM",
    "TOPOGRAPHY_HOD",
    "TOPOGRAPHY_AGENT",
    "BPA_SRA_SUB_DIRECTOR",
    "BPA_CAD_DGDCF_SUB_DIRECTOR",
    "BPA_SUB_DIRECTOR",
    "BPA_CAD_DGDCF_HOD",
    "BPA_CAD_DGDCF_AGENT",
    "BPA_CAD_DGDCF_COMM",
    "BPA_CAD_DGDCF_SUB_DIRECTOR",
    "BPA_CAD_DGDCF_SUB_DIRECTOR",
  ];

  const roles = userObject?.info?.roles;
  const roleLabel = roles?.find((role) => priorityRoles.includes(role?.code))?.code || roles?.[0]?.code;

  React.useEffect(async () => {
    const tenant = Digit.ULBService.getCurrentTenantId();
    const uuid = userDetails?.info?.uuid;
    if (uuid) {
      const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {});
      if (usersResponse && usersResponse.user && usersResponse.user.length) {
        const userDetails = usersResponse.user[0];
        const thumbs = userDetails?.photo?.split(",");
        setProfilePic(thumbs?.at(0));
      }
    }
  }, [profilePic !== null, userDetails?.info?.uuid]);

  const CitizenHomePageTenantId = Digit.ULBService.getCitizenCurrentTenant(true);

  let history = useHistory();
  const { pathname } = useLocation();

  const conditionsToDisableNotificationCountTrigger = () => {
    if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false;
    if (Digit.UserService?.getUser()?.info?.type === "CITIZEN") {
      if (!CitizenHomePageTenantId) return false;
      else return true;
    }
    return false;
  };

  const { data: { unreadCount: unreadNotificationCount } = {}, isSuccess: notificationCountLoaded } = Digit.Hooks.useNotificationCount({
    tenantId: CitizenHomePageTenantId,
    config: {
      enabled: conditionsToDisableNotificationCountTrigger(),
    },
  });

  const updateSidebar = () => {
    if (!Digit.clikOusideFired) {
      toggleSidebar(true);
    } else {
      Digit.clikOusideFired = false;
    }
  };

  function onNotificationIconClick() {
    history.push(`/${window?.contextPath}/citizen/engagement/notifications`);
  }

  const urlsToDisableNotificationIcon = (pathname) =>
    !!Digit.UserService?.getUser()?.access_token
      ? false
      : [`/${window?.contextPath}/citizen/select-language`, `/${window?.contextPath}/citizen/select-location`].includes(pathname);

  if (CITIZEN) {
    return (
      <div>
        <TopBarComponent
          img={stateInfo?.logoUrlWhite}
          isMobile={true}
          toggleSidebar={updateSidebar}
          logoUrl={stateInfo?.logoUrlWhite}
          onLogout={handleLogout}
          userDetails={userDetails}
          notificationCount={unreadNotificationCount < 99 ? unreadNotificationCount : 99}
          notificationCountLoaded={notificationCountLoaded}
          cityOfCitizenShownBesideLogo={t(CitizenHomePageTenantId)}
          onNotificationIconClick={onNotificationIconClick}
          hideNotificationIconOnSomeUrlsWhenNotLoggedIn={urlsToDisableNotificationIcon(pathname)}
          changeLanguage={!mobileView ? <ChangeLanguage dropdown={true} /> : null}
        />
      </div>
    );
  }
  
  // Check if user is citizen or architect - show modern header
  const isCitizen = roles?.length === 1 && roles[0].code === "CITIZEN";
  const isArchitect = roles?.some((role) => role.code === "BPA_ARCHITECT");
  const isEmployee = roles?.some((role) => priorityRoles.includes(role.code));
  
  if (isCitizen || isArchitect) {
    return (
      <CitizenTopBar
        t={t}
        userDetails={userDetails}
        userOptions={userOptions}
        mobileView={mobileView}
      />
    );
  }else{
    return (
      <EmployeeTopBar
        t={t}
        userDetails={userDetails}
        userOptions={userOptions}
        mobileView={mobileView}
      />
    );
  }
  
  const loggedin = userDetails?.access_token ? true : false;
  return (
    <div className="topbar" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {mobileView && (
          <Hamburger handleClick={() => setShowMobileMenu((prev) => !prev)} color="#9E9E9E" />
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <img className="city" style={{ width: "40px", height: "56px", margin: 0, objectFit: "contain" }} src="https://egov-bucket.s3.af-south-1.amazonaws.com/new/LOGO+DATUH.jpg" alt="DATUH" />
        </div>

        <div className="city-logo">
          <img className="city" style={{ width: "56px", height: "56px", margin: 0, objectFit: "contain" }} src="https://egov-bucket.s3.af-south-1.amazonaws.com/new/logo+MVUH.png" alt="MVUH" />
        </div>

        {!mobileView && (
          <div className="flex-right right w-80 column-gap-15" style={{ flex: 1, minWidth: "fit-content", justifyContent: 'flex-end', display: 'flex', alignItems: 'center', ...(!loggedin ? { width: "30%" } : {}) }}>
            {showLanguageChange && <ChangeLanguage dropdown={true} />}
            {userDetails?.access_token && (
              <UserInfoBlock
                profilePic={profilePic}
                userDetails={userDetails}
                roleLabel={roleLabel}
                t={t}
                userOptions={userOptions}
                handleUserDropdownSelection={handleUserDropdownSelection}
                mobileView={mobileView}
                roleColor="#22a4d9"
              />
            )}
          </div>
        )}
      </div>
      {/* Mobile menu panel (separate from main bar) */}
      {mobileView && showMobileMenu && (
        <div className="mobile-menu-panel" style={{
          position: "absolute",
          top: "70px",
          right: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "16px"
        }}>
          <div className="mobile-view-topbar" >
            {/* Center-aligned logo (mobile menu only) */}

            {showLanguageChange && <ChangeLanguage dropdown={true} />}
            {userDetails?.access_token && (
              <UserInfoBlock
                profilePic={profilePic}
                userDetails={userDetails}
                roleLabel={roleLabel}
                t={t}
                userOptions={userOptions}
                handleUserDropdownSelection={handleUserDropdownSelection}
                mobileView={true}
                roleColor="#fff"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

TopBar.propTypes = {
  t: PropTypes.func.isRequired,
  stateInfo: PropTypes.object,
  toggleSidebar: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
  handleLogout: PropTypes.func,
  userDetails: PropTypes.shape({
    access_token: PropTypes.string,
    info: PropTypes.shape({
      uuid: PropTypes.string,
      name: PropTypes.string,
      userInfo: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
  CITIZEN: PropTypes.bool,
  cityDetails: PropTypes.object,
  mobileView: PropTypes.bool,
  userOptions: PropTypes.array,
  handleUserDropdownSelection: PropTypes.func,
  logoUrl: PropTypes.string,
  showLanguageChange: PropTypes.bool,
  configs: PropTypes.object,
};

export default TopBar;