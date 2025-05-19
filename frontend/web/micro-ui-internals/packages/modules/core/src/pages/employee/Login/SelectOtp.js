import FormStep from '../../../../../../ui-components/src/molecules/FormStep'
import OTPInput from "../../../../../../ui-components/src/atoms/OTPInput"
import CardText from "../../../../../../ui-components/src/atoms/CardText"
import CardLabelError from "../../../../../../ui-components/src/atoms/CardLabelError"
import React, { Fragment, useState, useEffect } from "react";
import useInterval from "../../../hooks/useInterval";

const SelectOtp = ({ config, otp, onOtpChange, onResend, onSelect, t, error, canSubmit }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [otpValue, setOtpValue] = useState(otp || "");

  // Sync with props
  useEffect(() => {
    setOtpValue(otp || "");
  }, [otp]);

  // Handle OTP input change
  const handleOtpInputChange = (value) => {
    setOtpValue(value);
    // Call parent handler
    onOtpChange(value);
  };

  useInterval(
    () => {
      setTimeLeft(timeLeft - 1);
    },
    timeLeft > 0 ? 1000 : null
  );

  const handleResendOtp = () => {
    onResend();
    setOtpValue("");
    setTimeLeft(30);
  };

  // Create a modified config with OTP-specific settings
  const modifiedConfig = {
    ...config,
    texts: {
      ...config.texts,
      header: "CS_LOGIN_OTP",
      cardText: `${config.email || ""}`,
      submitBarLabel: config.texts?.submitButtonLabel || "CS_COMMONS_VERIFY",
    }
  };


  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "80px" }}>
      <FormStep
        onSelect={onSelect}
        config={modifiedConfig}
        t={t}
        isDisabled={otpValue?.length !== 6}
        cardStyle={{ width: "fit-content", minWidth: "476px" }}
      >
        <OTPInput
          length={6}
          onChange={handleOtpInputChange}
          value={otpValue}
        />
        {timeLeft > 0 ? (
          <CardText style={{ fontSize: "16px", color: "#111827", textAlign: "center", fontFamily: "Inter" }}>{`${t("CS_RESEND_ANOTHER_OTP")} ${timeLeft} ${t("CS_RESEND_SECONDS")}`}</CardText>
        ) : (
          <p className="card-text-button resend-otp" onClick={handleResendOtp}>
            {t("CS_RESEND_OTP")}
          </p>
        )}
        {!error && <CardLabelError>{t("CS_INVALID_OTP")}</CardLabelError>}
      </FormStep>
    </div>
  );
};

export default SelectOtp;
