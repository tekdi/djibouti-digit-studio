import FormStep from '../../../../../../ui-components/src/molecules/FormStep'
import OTPInput from "../../../../../../ui-components/src/atoms/OTPInput"
import CardText from "../../../../../../ui-components/src/atoms/CardText"
import CardLabelError from "../../../../../../ui-components/src/atoms/CardLabelError"
import React, { Fragment, useState } from "react";
import useInterval from "../../../hooks/useInterval";

const SelectOtp = ({ config, otp, onOtpChange, onResend, onSelect, t, error, userType = "citizen", canSubmit }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useInterval(
    () => {
      setTimeLeft(timeLeft - 1);
    },
    timeLeft > 0 ? 1000 : null
  );

  const handleResendOtp = () => {
    onResend();
    setTimeLeft(2);
  };

  if (userType === "employee") {
    return (
      <Fragment>
        <OTPInput length={6} onChange={onOtpChange} value={otp} />
        {timeLeft > 0 ? (
          <CardText style={{ fontSize: "16px", color: "#111827", textAlign: "center", fontFamily: "Inter" }}>{`${t("CS_RESEND_ANOTHER_OTP")} ${timeLeft} ${t("CS_RESEND_SECONDS")}`}</CardText>
        ) : (
          <p className="card-text-button resend-otp" onClick={handleResendOtp}>
            {t("CS_RESEND_OTP")}
          </p>
        )}
        {!error && <CardLabelError>{t("CS_INVALID_OTP")}</CardLabelError>}
      </Fragment>
    );
  }

  return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "50px" }}>
    <FormStep onSelect={onSelect} config={config} t={t} isDisabled={!(otp?.length === 4 && canSubmit)} cardStyle={{ width: "fit-content", minWidth: "476px" }}>
      <OTPInput length={4} onChange={onOtpChange} value={otp} />
      {timeLeft > 0 ? (
        <CardText style={{ fontSize: "16px", color: "#111827", textAlign: "center", fontFamily: "Inter" }}>{`${t("CS_RESEND_ANOTHER_OTP")} ${timeLeft} ${t("CS_RESEND_SECONDS")}`}</CardText>
      ) : (
        <p className="card-text-button" onClick={handleResendOtp}>
          {t("CS_RESEND_OTP")}
        </p>
      )}
      {!error && <CardLabelError>{t("CS_INVALID_OTP")}</CardLabelError>}
    </FormStep>
      </div>
  );
};

export default SelectOtp;
