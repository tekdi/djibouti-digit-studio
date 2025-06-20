import React, { useState, useEffect } from "react";

const SelectName = ({ onSelect, t, isDisabled, mobileNumber: propMobileNumber = "" }) => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState(propMobileNumber);
  const [error, setError] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    setMobileNumber(propMobileNumber || "");
  }, [propMobileNumber]);

  useEffect(() => {
    const validMobile = mobileNumber.length === 8 && mobileNumber.startsWith("77");
    setCanSubmit(name.trim().length > 0 && validMobile);
    if (mobileNumber && mobileNumber.length > 1 && !mobileNumber.startsWith("77")) {
      setError("Mobile number should start with 77");
    } else {
      setError("");
    }
  }, [name, mobileNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onSelect({ name, mobileNumber });
    }
  };

  return (
    <div className="center-container">
      <div className="responsive-box">
        <div className="digit-card-component">
          <form onSubmit={handleSubmit}>
            <div>
              <header className="form-title">{t("REGISTER_AS_CITIZEN_USER")}</header>
              <h2 class="digit-card-label ">{t("BPA_BPA_PCO_LEGALNAME")}</h2>
              <input
                type="text"
                name="name"
                className="input-box"
                placeholder={t("ENTER_YOUR_LEGAL_NAME_AS_PER_DOCUMENTS")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div>
              <h2 class="digit-card-label ">{t("CORE_COMMON_MOBILE_NUMBER")}</h2>
              <input
                className="input-box"
                type="text"
                name="mobileNumber"
                value={mobileNumber}

              />
            </div>
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            <button
              type="submit"
              disabled={!canSubmit || isDisabled}
              style={{
                width: '100%',
                borderRadius: '10px',
                fontSize: '20px',
                color: '#fff',
                border: 'none',
                padding: '10px',
                marginTop: '10px',
                background: 'linear-gradient(90deg, rgb(1, 103, 105) 0%, rgb(114, 130, 105) 100%)',
                cursor: canSubmit && !isDisabled ? "pointer" : "not-allowed",
                opacity: canSubmit && !isDisabled ? 1 : 0.5
              }}
            >
              {t("REGISTER")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelectName;
