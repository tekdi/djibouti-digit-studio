import { Dropdown, Hamburger, TopBar as TopBarComponent } from "@egovernments/digit-ui-react-components";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";

const TextToImg = (props) => (
  <span className="user-img-txt" onClick={props.toggleMenu} title={props.name}>
    {props?.name?.[0]?.toUpperCase()}
  </span>
);
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
  console.log(userDetails?.access_token, ' is login');

  const [profilePic, setProfilePic] = React.useState(null);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const userObject = Digit.SessionStorage.get("User");
  const priorityRoles = [
    "BPA_ARCHITECT",
    "BPA_HOD",
    "BPA_AGENTS",
    "BPA_SDECC_HOD",
    "BPA_SDECC_AGENTS",
    "BPA_SDECC_COMM"
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
  const loggedin = userDetails?.access_token ? true : false;
  return (
    <div className="topbar" style={{ position: 'relative' }}>
      {mobileView ? (
        <Hamburger handleClick={() => setShowMobileMenu((prev) => !prev)} color="#9E9E9E" />
      ) : null}
      <img className="city" style={{ width: "40px", height: "56px", margin: 0, objectFit: "contain" }} src="https://egov-bucket.s3.af-south-1.amazonaws.com/new/LOGO+DATUH.jpg" alt="DATUH" />

      <img className="city" style={{ width: "56px", height: "56px", margin: 0, objectFit: "contain" }} src="https://egov-bucket.s3.af-south-1.amazonaws.com/new/logo+MVUH.png" alt="MVUH" />

      <span>

        {!mobileView && (
          <div className={mobileView ? "right" : "flex-right right w-80 column-gap-15"} style={{
            minWidth: "fit-content",
            ...(!loggedin ? { width: "30%" } : {})
          }}>

            <div className="">{showLanguageChange && <ChangeLanguage dropdown={true} />}</div>
            {userDetails?.access_token && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    {profilePic == null ? (
                      <TextToImg
                        name={
                          userDetails?.info?.name ||
                          userDetails?.info?.userInfo?.name ||
                          "Employee"
                        }
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
                    <small style={{ color: "#006769", fontSize: "12px" }}>
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
            )}

            {/* <img className="state" src={logoUrl} /> */}
          </div>
        )}
        {/* Mobile menu panel */}
        {mobileView && showMobileMenu && (
          <div className="mobile-menu-panel" style={{
            position: "absolute",
            top: "78px",
            right: 0,
            left: 0,
            background: 'rgba(34, 57, 77, var(--bg-opacity) !important',
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "16px"
          }}>

            <div>{showLanguageChange && <ChangeLanguage dropdown={true} />}</div>
            {userDetails?.access_token && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    {profilePic == null ? (
                      <TextToImg
                        name={
                          userDetails?.info?.name ||
                          userDetails?.info?.userInfo?.name ||
                          "Employee"
                        }
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
                    <small style={{ color: "#fff", fontSize: "12px" }}>
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
                    style={{ right: 0 }}
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
            )}
          </div>
        )}
      </span>
    </div>
  );
};

export default TopBar;
