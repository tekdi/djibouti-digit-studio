import { CardText, CloseSvg } from "@egovernments/digit-ui-react-components";
import React from "react";
import Modal from "../../../../../ui-components/src/hoc/Modal";
import { useTranslation } from "react-i18next";

const Heading = (props) => {
  return <h1 style={props?.style} className="heading-m">{props.label}</h1>;
};
const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);
const CloseBtn = (props) => {
  return (
    <div onClick={props?.onClick} style={props?.isMobileView ? { padding: 5 } : null}>
      {props?.isMobileView ? (
        <CloseSvg />
      ) : (
        <div className={"icon-bg-secondary"} style={{ backgroundColor: "#505A5F" }}>
          {" "}
          <Close />{" "}
        </div>
      )}
    </div>
  );
};
const LogoutDialog = ({ onSelect, onCancel, onDismiss }) => {
  const { t } = useTranslation();
  const mobileDeviceWidth = 780;
  const [isMobileView, setIsMobileView] = React.useState(window.innerWidth <= mobileDeviceWidth);
  const onResize = () => {
    if (window.innerWidth <= mobileDeviceWidth) {
      if (!isMobileView) {
        setIsMobileView(true);
      }
    } else {
      if (isMobileView) {
        setIsMobileView(false);
      }
    }
  };
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      onResize();
    });
    return () => {
      window.addEventListener("resize", () => {
        onResize();
      });
    };
  });
  return isMobileView ? (
    <Modal
      popupStyles={{
        height: "174px",
        maxHeight: "174px",
        width: "324px",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      popupModuleActionBarStyles={{
        display: "flex",
        flex: 1,
        justifyContent: "flex-start",
        width: "100%",
        position: "absolute",
        left: 0,
        bottom: 0,
        padding: "18px",
      }}
      style={{
        flex: 1,
      }}
      actionCancelLabelStyle={{
       backgroundColor: "#FFFFFF",
       borderRadius: "10px"
      }}
      actionCancleTextStyle={{
        width: "100%",
        fontSize: "14px",
      }}
      actionSaveOnSubmitStyle={{
        backgroundColor: "#006769",
        borderRadius: "10px",
        width: "100%",
        color: "white"
      }}
      actionSaveTextStyle={{
        width: "100%",
        fontSize: "14px",
        color: "white"
      }}
      popupModuleStyles={{
        height: "174px",
        maxHeight: "174px",
      }}
      popupModuleMianStyles={{
        padding: "18px",
      }}
      headerBarMain={<Heading style={{ fontSize: "24px" }} label={t("CORE_LOGOUT_WEB_HEADER")} />}
      actionCancelLabel={t("CORE_LOGOUT_CANCEL")}
      actionCancelOnSubmit={onCancel}
      actionSaveLabel={t("CORE_LOGOUT_WEB_YES")}
      actionSaveOnSubmit={onSelect}
      formId="modal-action"
    >
      <div>
        <CardText style={{ margin: 0 }}>{t("CORE_LOGOUT_WEB_CONFIRMATION_MESSAGE") + " "}</CardText>
      </div>
    </Modal>
  ) : (
    <Modal
      popupModuleMianStyles={{

      }}
      headerBarMain={<Heading label={t("CORE_LOGOUT_WEB_HEADER")} />}
      actionCancelLabel={t("CORE_LOGOUT_CANCEL")}
      actionCancelOnSubmit={onCancel}
      actionSaveLabel={t("CORE_LOGOUT_WEB_YES")}
      actionSaveOnSubmit={onSelect}
      formId="modal-action"
      popupModuleActionBarStyles={{
        display: "flex",
        flex: 1,
        width: "100%",
        padding: "5px",
        justifyContent: "end",
        gap: "20px",
      }}
      style={{
        borderRadius: "10px",
      }}
      popupModuleStyles={{
        width: "40%"
      }}
      actionCancelLabelStyle={{
        width:"90%",
        backgroundColor: "#FFFFFF",
        borderRadius: "10px"
      }}
       actionCancleTextStyle={{
        width: "100%",
        fontSize: "14px",
      }}
      actionSaveOnSubmitStyle={{
        backgroundColor: "#006769",
        borderRadius: "10px",
        color: "white",
        width: "90%",
      }}
      actionSaveTextStyle={{
        width: "100%",
        fontSize: "14px",
        color: "white"
      }}
    >
      <div>
        <CardText style={{ marginBottom: "54px", marginLeft: "15px", marginBottom: "8px", fontSize: "18px", fontFamily: "Inter" }}>
          {t("CORE_LOGOUT_WEB_CONFIRMATION_MESSAGE") + " "}
          <strong>{t("CORE_LOGOUT_MESSAGE")}?</strong>
        </CardText>
      </div>
    </Modal>
  );
};
export default LogoutDialog;
