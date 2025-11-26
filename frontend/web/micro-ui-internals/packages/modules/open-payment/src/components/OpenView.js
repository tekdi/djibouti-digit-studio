import { Loader, StatusTable, Row, Card, Header, SubmitBar, ActionBar, Toast } from "@egovernments/digit-ui-react-components";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomisedHooks } from "../hooks";
import { useHistory, useLocation } from "react-router-dom";
import TextInput from "../../../../ui-components/src/atoms/TextInput";
import MultiUploadWrapper from "../../../../ui-components/src/molecules/MultiUploadWrapper";

const OpenView = () => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentGateway, setPaymentGateway] = useState("D-MONEY");
  const [formData, setFormData] = useState({
    receiptNo: "",
    receiptDate: "",
    chequeNo: "",
    chequeDate: "",
    fileStoreId: "",
  });
  const queryParams = Digit.Hooks.useQueryParams();
  const mutation = CustomisedHooks?.Hooks?.openpayment?.useCreatePayment();
  const history = useHistory();
  const { state } = useLocation();
  const userType = Digit.UserService.getType().toLowerCase();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const requestCriteria = {
    url: "/billing-service/bill/v2/_fetchbill",
    params: queryParams,
    body: {},
    options: {
      userService: true,
      auth: true,
    },
    config: {
      enabled: !!queryParams.consumerCode && !!queryParams.tenantId && !!queryParams.businessService,
      select: (data) => {
        return data?.Bill?.[0];
      },
    },
  };
  const { isLoading, data: bill, revalidate, isFetching, error } = Digit.Hooks.useCustomAPIHook(requestCriteria);

  const requestCalculation = {
    url: `/public-service/v1/application/${queryParams?.serviceCode}`,
    headers: {
      "X-Tenant-Id": queryParams?.tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
    params: {
      applicationNumber: queryParams?.applicationNumber,
      tenantId: queryParams?.tenantId,
    },
  };
  const { isLoadingCalc, data: calculation } = Digit.Hooks.useCustomAPIHook(requestCalculation);
  const costEstimation = calculation?.Application[0]?.additionalDetails?.costEstimation;
  const applicationData = calculation?.Application[0];

  const calculateTotalPercentage = () => {
    return costEstimation?.totalCostBreakdown?.reduce((total, item) => total + item.percentage, 0);
  };

  const calculateTotalCost = () => {
    return costEstimation?.totalCostBreakdown?.reduce((total, item) => total + item.amount, 0);
  };

  const arrears =
    bill?.billDetails
      ?.sort((a, b) => b.fromPeriod - a.fromPeriod)
      ?.reduce((total, current, index) => (index === 0 ? total : total + current.amount), 0) || 0;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (userType === "employee") {
      const mandatoryFields = [
        { value: formData.receiptNo, name: "receiptNo" },
        { value: formData.receiptDate, name: "receiptDate" },
        { value: formData.fileStoreId, name: "fileStoreId" }, // Must not be empty string
      ];

      if (paymentMode === "CHEQUE") {
        mandatoryFields.push({ value: formData.chequeNo, name: "chequeNo" }, { value: formData.chequeDate, name: "chequeDate" });
      }

      // Check for empty fields
      const emptyFields = mandatoryFields.filter((field) => field.value === "" || field.value === null || field.value === undefined);

      if (emptyFields.length > 0) {
        setShowToast({
          key: true,
          label: t("ES_COMMON_PLEASE_ENTER_ALL_MANDATORY_FIELDS"),
        });

        return;
      }

      const body = {
        Payment: {
          // mobileNumber: paymentData.mobileNumber,
          // paymentDetails: [
          //   {
          //     businessService: queryParams?.businessService,
          //     billId: "7ff19cf8-7abe-48e0-b249-a1e1d2d4ec8f",
          //     totalDue: 784,
          //     totalAmountPaid: 784,
          //   },
          // ],
          // tenantId: paymentData.tenantId,
          // totalDue: paymentData.totalDue,
          // totalAmountPaid: paymentData.totalAmountPaid,
          // paymentMode: paymentData.paymentMode,
          // payerName: paymentData.payerName,
          // paidBy: paymentData.paidBy,
          mobileNumber: bill?.mobileNumber,
          paymentDetails: [
            {
              businessService: queryParams.businessService,
              billId: bill?.id,
              totalDue: bill?.totalAmount,
              totalAmountPaid: bill?.totalAmount,
              manualReceiptNumber: formData?.receiptNo,
              manualReceiptDate: formData?.receiptDate ? new Date(formData?.receiptDate).getTime() : null,
            },
          ],
          tenantId: queryParams.tenantId,
          totalDue: bill?.totalAmount,
          totalAmountPaid: bill?.totalAmount,
          paymentMode: paymentMode,
          payerName: bill?.payerName,
          paidBy: "OWNER",
          fileStoreId: formData?.fileStoreId,
        },
      };

      if (paymentMode === "CHEQUE") {
        body.Payment.instrumentNumber = formData?.chequeNo;
        body.Payment.instrumentDate = formData?.chequeDate ? new Date(formData?.chequeDate).getTime() : null;
      }

      mutation.mutate(
        {
          url: `/collection-services/payments/_create?tenantId=${queryParams.tenantId}`,
          body,
          headers: { "X-Tenant-Id": queryParams.tenantId },
        },
        {
          onSuccess: (data) => {
            if (
              data?.Payments?.[0].paymentDetails[0].businessService &&
              data?.Payments?.[0].paymentDetails?.[0]?.bill?.consumerCode &&
              data?.Payments?.[0]?.tenantId
            ) {
              history.push(
                `/${window.contextPath}/employee/openpayment/success/${data?.Payments?.[0].paymentDetails[0].businessService}/${data?.Payments?.[0].paymentDetails?.[0]?.bill?.consumerCode}/${data?.Payments?.[0]?.tenantId}?serviceCode=${queryParams?.serviceCode}`,
                { iSuccess: true, applicationNumber: data?.Payments?.[0].paymentDetails?.[0]?.bill?.consumerCode, ...state }
              );
              //setHasRedirected(true);  // Mark that redirection has happened
            } else {
              history.push(`/${window.contextPath}/employee/openpayment/failure`, { iSuccess: false, ...state });
              console.error("Missing redirect data in payment response");
            }
          },
          onError: (error) => {
            console.error("Payment creation failed:", error.message);
          },
        }
      );
    }
    if (userType === "citizen") {
      const filterData = {
        Transaction: {
          tenantId: bill?.tenantId,
          txnAmount: bill.totalAmount,
          module: bill.businessService,
          billId: bill.id,
          consumerCode: bill.consumerCode,
          productInfo: "Common Payment",
          gateway: paymentGateway,
          taxAndPayments: [
            {
              billId: bill.id,
              amountPaid: bill.totalAmount,
            },
          ],
          user: {
            name: bill?.payerName,
            mobileNumber: bill?.mobileNumber,
            tenantId: bill?.tenantId,
            emailId: bill?.payerEmail,
          },
          // success
          // callbackUrl: `${window.location.protocol}//${window.location.host}/${window.contextPath}/citizen/openpayment/success?consumerCode=${queryParams.consumerCode}&tenantId=${queryParams.tenantId}&businessService=${queryParams.businessService}`,
          callbackUrl: `${window.location.protocol}//${window.location.host}/${window.contextPath}/citizen/openpayment/success/${queryParams.businessService}/${queryParams.consumerCode}/${queryParams.tenantId}`,
          additionalDetails: {
            isWhatsapp: false,
          },
        },
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: Digit.UserService.getUser()?.access_token,
          userInfo: Digit.UserService.getUser()?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
      };

      try {
        mutation.mutate(
          {
            url: `/pg-service/transaction/v1/_create?tenantId=${bill?.tenantId}`,
            body: filterData,
            headers: { "X-Tenant-Id": bill?.tenantId },
          },
          {
            onSuccess: (data) => {
              const redirectUrl = data?.Transaction?.redirectUrl;
              window.location = redirectUrl;
            },
            onError: (error) => {
              let messageToShow = "CS_PAYMENT_UNKNOWN_ERROR_ON_SERVER";
              if (error.response?.data?.Errors?.[0]) {
                const { code, message } = error.response?.data?.Errors?.[0];
                messageToShow = code;
              } else if (error.message) {
                messageToShow = error.message;
              }
              setShowToast({ key: true, label: t(messageToShow) });
            },
          }
        );
      } catch (error) {
        let messageToShow = "CS_PAYMENT_UNKNOWN_ERROR_ON_SERVER";
        if (error.response?.data?.Errors?.[0]) {
          const { code, message } = error.response?.data?.Errors?.[0];
          messageToShow = code;
        }
        setShowToast({ key: true, label: t(messageToShow) });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileStoreId = (files) => {
    if (files.length > 0) {
      // Extract just the fileStoreId string from the object
      const fileStoreId = files[0][1]?.fileStoreId?.fileStoreId || "";
      setFormData((prev) => ({ ...prev, fileStoreId }));
    } else {
      setFormData((prev) => ({ ...prev, fileStoreId: "" }));
    }
  };

  if (isLoading || isLoadingCalc) {
    return <Loader />;
  }
  return (
    <form className="cards-container" id="payment-form" onSubmit={handlePaymentSubmit} noValidate>
      <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
        <SubmitBar
          style={{
            // width: "100%",
            marginRight: "55px",
            marginBottom: "0px",
            borderRadius: "10px",
          }}
          disabled={Number(bill?.totalAmount) === 0}
          label={t("OP_PROCEED_TO_PAY")}
          form="payment-form"
          submit={true}
        />
      </div>

      <div className="digit-results-payment-mode-wrapper">
        <div className="payment-mode-card">
          <Header className="header">{t("MODE_OF_PAYMENT")}</Header>
          <div className="payment-mode-wrapper">
            {userType === "employee" && (
              <div className="form">
                <div className="radio-wrapper">
                  <label className="input-label">{t("SELECT_PAYMENT_METHOD")}</label>
                  <div className="radio-label-wrapper">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="paymentMode"
                        value="CASH"
                        checked={paymentMode === "CASH"}
                        onChange={() => setPaymentMode("CASH")}
                        className="custom-radio"
                      />
                      {t("PAYMENT_CASH")}
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="paymentMode"
                        value="CHEQUE"
                        checked={paymentMode === "CHEQUE"}
                        onChange={() => setPaymentMode("CHEQUE")}
                        className="custom-radio"
                      />
                      {t("PAYMENT_CHEQUE")}
                    </label>
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label">
                    {t("RECEIPT_NO")}
                    <span className="star">*</span>
                  </label>
                  <TextInput
                    t={t}
                    style={{ width: "100%" }}
                    type={"text"}
                    required={true}
                    optionKey="i18nKey"
                    name="receiptNo"
                    value={formData.receiptNo}
                    onChange={handleChange}
                    placeholder={"ENTER_RECEIPT_NUMBER"}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">
                    {t("RECEIPT_DATE")}
                    <span className="star">*</span>
                  </label>
                  <TextInput
                    t={t}
                    style={{ width: "100%" }}
                    type={"date"}
                    required={true}
                    optionKey="i18nKey"
                    name="receiptDate"
                    value={formData.receiptDate}
                    onChange={handleChange}
                    placeholder={"ENTER_RECEIPT_DATE"}
                  />
                </div>

                {paymentMode === "CHEQUE" && (
                  <>
                    <div className="input-wrapper">
                      <label className="input-label">
                        {t("CHEQUE_NO")}
                        <span className="star">*</span>
                      </label>

                      <TextInput
                        t={t}
                        style={{ width: "100%" }}
                        type={"text"}
                        required={paymentMode === "CHEQUE"}
                        optionKey="i18nKey"
                        name="chequeNo"
                        value={formData.chequeNo}
                        onChange={handleChange}
                        placeholder={"ENTER_CHEQUE_NUMBER"}
                        populators={{
                          minLength: 6,
                          maxLength: 6,
                        }}
                      />
                    </div>

                    <div className="input-wrapper">
                      <label className="input-label">
                        {t("CHEQUE_DATE")}
                        <span className="star">*</span>
                      </label>

                      <TextInput
                        t={t}
                        style={{ width: "100%" }}
                        type={"date"}
                        required={paymentMode === "CHEQUE"}
                        optionKey="i18nKey"
                        name="chequeDate"
                        value={formData.chequeDate}
                        onChange={handleChange}
                        placeholder={"ENTER_CHEQUE_DATE"}
                      />
                    </div>
                  </>
                )}

                <div className="input-wrapper">
                  <label className="input-label">
                    {t("UPLOAD_PAYMENT_RECEIPT")}
                    <span className="star">*</span>
                  </label>

                  <MultiUploadWrapper
                    t={t}
                    module="works"
                    tenantId={Digit.ULBService.getCurrentTenantId()}
                    getFormState={handleFileStoreId}
                    allowedFileTypesRegex={/pdf|jpg|jpeg|png|heic/}
                    allowedMaxSizeInMB={10}
                    maxFilesAllowed={5}
                    containerStyles={{ width: "100%" }}
                    acceptFiles=".pdf, .jpg, .jpeg, .png, .heic"
                    required={true}
                  />
                </div>
              </div>
            )}
            {userType === "citizen" && (
              <div className="form">
                <div className="radio-wrapper radio-wrapper-citizen">
                  <label className="input-label">{t("SELECT_PAYMENT_GATEWAY")}</label>
                  <div className="radio-label-wrapper">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="paymentGateway"
                        value="D-MONEY"
                        checked={true}
                        className="custom-radio"
                        onChange={() => setPaymentGateway("D-MONEY")}
                      />
                      {t("PAYMENT_DMONEY")}
                    </label>
                  </div>
                </div>
                <div style={{ margin: "20px 0", padding: "16px", background: "#FAFAFA", borderRadius: "4px", border: "1px solid #D6D5D4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ color: "#505A5F", fontSize: "16px" }}>
                      {t("PAYMENT_OFFLINE_NOTE")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "15px" }} className="digit-results-table-wrapper">
        <div style={{ width: "100%", padding: "20px", marginLeft: "20px" }}>
          <Header>{t("OP_PAYMENT_DETAILS")}</Header>
          <StatusTable>
            <div style={{ marginTop: "16px" }}>
              <Row
                label={t("OP_CONSUMER_NAME")}
                text={bill?.payerName || t("ES_COMMON_NA")}
                textStyle={{ paddingLeft: "12px", textAlign: "right" }}
                labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
              />
              <Row
                label={t("OP_CONSUMER_EMAIL")}
                text={bill?.payerEmail || t("ES_COMMON_NA")}
                textStyle={{ paddingLeft: "12px", textAlign: "right" }}
                labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
              />
              <Row
                label={t("OP_CONSUMER_ADDRESS")}
                text={bill?.payerAddress || t("ES_COMMON_NA")}
                textStyle={{ paddingLeft: "12px", textAlign: "right" }}
                labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
              />
              <Row
                label={t("OP_CONSUMER_PHNO")}
                text={bill?.mobileNumber || t("ES_COMMON_NA")}
                textStyle={{ paddingLeft: "12px", textAlign: "right" }}
                labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
              />
            </div>

            <div style={{ margin: "24px 0" }}>
              <Row
                label={t("ES_PAYMENT_TAXHEADS")}
                labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
                textStyle={{ fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                text={t("ES_PAYMENT_AMOUNT")}
              />
              <div style={{ margin: "16px 0" }}>
                {bill?.billDetails?.[0]?.billAccountDetails
                  ?.sort((a, b) => a.order - b.order)
                  .map((amountDetails, index) => (
                    <Row
                      key={index + "taxheads"}
                      labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
                      textStyle={{ fontSize: "18px", textAlign: "right", color: "#0B0C0C" }}
                      label={t(amountDetails.taxHeadCode)}
                      text={"FDj " + amountDetails.amount?.toFixed(0)}
                    />
                  ))}
              </div>

              {arrears?.toFixed?.(2) ? (
                <div style={{ margin: "16px 0", paddingTop: "16px" }}>
                  <Row
                    labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
                    textStyle={{ fontSize: "18px", textAlign: "right", color: "#0B0C0C" }}
                    label={t("COMMON_ARREARS")}
                    text={"FDj " + arrears?.toFixed?.(0) || Number(0).toFixed(0)}
                  />
                </div>
              ) : null}

              <div style={{ borderTop: "1px solid #D6D5D4", margin: "16px 0", paddingTop: "16px" }}>
                <Row
                  label={t("CS_PAYMENT_TOTAL_AMOUNT")}
                  labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
                  textStyle={{ fontWeight: "bold", fontSize: "18px", textAlign: "right", color: "#0B0C0C" }}
                  text={"FDj " + Number(bill?.totalAmount).toFixed(0)}
                />
              </div>
            </div>
          </StatusTable>
        </div>
        {showToast && (
          <Toast
            error={showToast.key}
            label={t(showToast.label)}
            onClose={() => {
              setShowToast(null);
            }}
          />
        )}
      </div>

      {costEstimation ? (
        <div className="digit-results-calculation-wrapper">
          <div>
            <Header className="calculation-header">{t("CALCULATION_TITLE")}</Header>
          </div>
          <div className="calculation-wrapper">
            <div className="fee-rates">
              <div className="fee-rate-card">
                <h3 className="fee-rate-card-title">{t("CALCULATION_COST_RESIDENTIAL")}</h3>
                <p className="fee-rate-card-value">FDj {costEstimation?.costPerSqmLivingSpace?.toLocaleString()}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className="fee-rate-card-title">{t("CALCULATION_COST_COMMERCIAL")}</h3>
                <p className="fee-rate-card-value">FDj {costEstimation?.costPerSqmCommercialSpace?.toLocaleString()}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className="fee-rate-card-title">{t("CALCULATION_ROYALTY_FEES")}</h3>
                <p className="fee-rate-card-value">{`${costEstimation?.royaltyPer} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className="fee-rate-card-title">{t("CALCULATION_SEISMIC_FEES")}</h3>
                <p className="fee-rate-card-value">{`${costEstimation?.eqResistancePer} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className="fee-rate-card-title">{t("CALCULATION_REGISTRY_SERVICE_FEE")}</h3>
                <p className="fee-rate-card-value">FDj {costEstimation?.registryServiceFee?.toLocaleString()}</p>
              </div>
            </div>

            <div className="floor-table">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="niveau-col">{t("CALCULATION_NIVEAU")}</th>
                      <th className="area-col">{t("CALCULATION_SURFACE_HABITATION")}</th>
                      <th className="area-col">{t("CALCULATION_SURFACE_COMMERCIALE")}</th>
                      <th className="area-col">{t("CALCULATION_TOTAL_SUPERFICIE")}</th>
                      <th className="area-col">{t("CALCULATION_ESTIMATION_COUTS")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costEstimation?.floors?.map((floor, index) => (
                      <tr key={index}>
                        <td className="niveau-col floor-col">
                          {index === 0 ? t("CALCULATION_RDC") : ""}
                          {index === costEstimation?.floors.length - 1 ? t("CALCULATION_TERRASSE") : ""}
                          {index !== 0 && index !== costEstimation?.floors.length - 1 && t(`CALCULATION_${index}ER_ETAGE`)}
                        </td>

                        <td className="area-col">
                          <div className="input-with-unit">{floor?.builtUpAreaLiving === 0 ? "" : floor?.builtUpAreaLiving} m²</div>
                        </td>
                        <td className="area-col">
                          <div className="input-with-unit">{floor?.builtupAreaCommercial === 0 ? "" : floor?.builtupAreaCommercial} m²</div>
                        </td>
                        <td className="total-col">{floor?.totalAreaPerLevel > 0 ? `${floor?.totalAreaPerLevel} m²` : "0 m²"}</td>
                        <td className="cost-col">{floor?.floorCost ? floor?.floorCost?.toLocaleString() : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="calculations-section">
              <div className="plot-info">
                <h3 className="plot-info-title">{t("CALCULATION_COEFFICIENTS_SOL")}</h3>
                <div className="info-content">
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_SURFACE_PARCELLE")}</span>
                    <span className="fee-rate-card-value">{applicationData?.serviceDetails?.landandProjectDesignDetails?.[0]?.area}</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_ROYALTY_FEES_CALCULATED")}</span>
                    <span className="fee-rate-card-value">{costEstimation?.royaltyFee} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_SEISMIC_FEES_CALCULATED")}</span>
                    <span className="fee-rate-card-value">{costEstimation?.eqResistanceCost?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_TOTAL_TAXES")}</span>
                    <span className="fee-rate-card-value">{costEstimation?.totalTax?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}</span>
                    <span className="fee-rate-card-value">{costEstimation?.totalTaxWithServiceCharge?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_PROJECT_TOTAL_VALUE")}</span>
                    <span className="fee-rate-card-value">{costEstimation?.totalBuildingCost?.toLocaleString()} FDj</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cost-breakdown">
              <div className="table-wrapper cost-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="work-col">{t("CALCULATION_WORK_DESIGNATION")}</th>
                      <th className="percentage-col">{t("CALCULATION_WORK_PERCENTAGES")}</th>
                      <th className="amount-col">{t("CALCULATION_AMOUNT")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costEstimation?.totalCostBreakdown?.map((item, index) => (
                      <tr key={index} className="cost-breakdown-row-wrapper">
                        <td className="work-col">{t(item?.designationOfWorks)}</td>
                        <td className="percentage-col">{item?.percentage}%</td>
                        <td className="amount-col">{item?.amount === 0 ? "0 FDj" : `${item?.amount?.toLocaleString()} FDj`}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td className="work-col">{t("CALCULATION_TOTAL")}</td>
                      <td className="percentage-col">{calculateTotalPercentage()}%</td>
                      <td className="amount-col">{calculateTotalCost() === 0 ? "0 FDj" : `${calculateTotalCost()?.toLocaleString()} FDj`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "24px", width: "100%", display: "flex", justifyContent: "end" }}>
            <SubmitBar
              style={{
                // width: "100%",
                marginRight: "55px",
                marginBottom: "0px",
                borderRadius: "10px",
              }}
              disabled={Number(bill?.totalAmount) === 0}
              label={t("OP_PROCEED_TO_PAY")}
              form="payment-form"
              submit={true}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </form>
  );
};

export default OpenView;
