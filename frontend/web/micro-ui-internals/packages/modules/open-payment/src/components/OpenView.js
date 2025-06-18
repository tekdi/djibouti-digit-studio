import { Loader, StatusTable, Row, Card, Header, SubmitBar, ActionBar, Toast } from "@egovernments/digit-ui-react-components";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { makePayment } from "../utils/payGov";
import { CustomisedHooks } from "../hooks";
import $ from "jquery";
import { useHistory, useLocation } from "react-router-dom";

const OpenView = () => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const queryParams = Digit.Hooks.useQueryParams();
  const mutation = CustomisedHooks?.Hooks?.openpayment?.useCreatePayment();
  const history = useHistory();
  const { state } = useLocation();

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
  const { isLoadingCalc, data:calculation } = Digit.Hooks.useCustomAPIHook(requestCalculation);
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

  const onSubmit = async () => {
    if (window.location.href.includes("employee")) {
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
            },
          ],
          tenantId: queryParams.tenantId,
          totalDue: bill?.totalAmount,
          totalAmountPaid: bill?.totalAmount,
          paymentMode: "CASH",
          payerName: bill?.payerName,
          paidBy: "OWNER",
        },
      };

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
                `/${window.contextPath}/employee/openpayment/success/${data?.Payments?.[0].paymentDetails[0].businessService}/${data?.Payments?.[0].paymentDetails?.[0]?.bill?.consumerCode}/${data?.Payments?.[0]?.tenantId}`,
                { iSuccess: true, applicationNumber: data?.Payments?.[0].paymentDetails?.[0]?.receiptNumber, ...state }
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
    if (!window.location.href.includes("employee")) {
      const filterData = {
        Transaction: {
          tenantId: bill?.tenantId,
          txnAmount: bill.totalAmount,
          module: bill.businessService,
          billId: bill.id,
          consumerCode: bill.consumerCode,
          productInfo: "Common Payment",
          gateway: "D-MONEY",
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
        //dummy response
        //   const data = {
        //     "ResponseInfo": {
        //         "apiId": "Rainmaker",
        //         "ver": null,
        //         "ts": null,
        //         "resMsgId": "uief87324",
        //         "msgId": "1718644477119|en_IN",
        //         "status": "SUCCESSFUL"
        //     },
        //     "Transaction": {
        //         "tenantId": "pb.abianakhurd",
        //         "txnAmount": "160",
        //         "billId": "3b27460b-d37e-4e0d-bd51-ed32f12e90e3",
        //         "module": "WS",
        //         "consumerCode": "WS/7141/2024-25/0316",
        //         "taxAndPayments": [
        //             {
        //                 "taxAmount": null,
        //                 "amountPaid": 160,
        //                 "billId": "3b27460b-d37e-4e0d-bd51-ed32f12e90e3"
        //             }
        //         ],
        //         "productInfo": "Common Payment",
        //         "gateway": "PAYGOV",
        //         "callbackUrl": "http://localhost:3000/mgramseva-web/employee/hrms/success?consumerCode=WS/7141/2024-25/0316&tenantId=pb.abianakhurd&businessService=WS&eg_pg_txnid=PB_PG_2024_06_17_0367_81",
        //         "txnId": "PB_PG_2024_06_17_0367_81",
        //         "user": {
        //             "uuid": "e18c2f5b-6035-4360-885b-dfd28b1159f0",
        //             "name": "hj",
        //             "userName": "9379239289",
        //             "mobileNumber": "9379239289",
        //             "emailId": null,
        //             "tenantId": "pb"
        //         },
        //         "redirectUrl": "https://pilot.surepay.ndml.in/SurePayPayment/sp/processRequest?additionalField3=pb.abianakhurd&orderId=PB_PG_2024_06_17_0367_81&additionalField4=WS/7141/2024-25/0316&requestDateTime=17-06-202417:14:078&additionalField5=WSabianakhurd&successUrl=https://mgramseva-uat.psegs.in/pg-service/transaction/v1/_redirect?originalreturnurl=/mgramseva-web/employee/hrms/success?consumerCode=WS/7141/2024-25/0316&tenantId=pb.abianakhurd&businessService=WS&eg_pg_txnid=PB_PG_2024_06_17_0367_81&failUrl=https://mgramseva-uat.psegs.in/pg-service/transaction/v1/_redirect?originalreturnurl=/mgramseva-web/employee/hrms/success?consumerCode=WS/7141/2024-25/0316&tenantId=pb.abianakhurd&businessService=WS&eg_pg_txnid=PB_PG_2024_06_17_0367_81&txURL=https://pilot.surepay.ndml.in/SurePayPayment/sp/processRequest&messageType=0100&merchantId=UATPWSSG0000001429&transactionAmount=160&customerId=e18c2f5b-6035-4360-885b-dfd28b1159f0&checksum=3463857141&additionalField1=9379239289&additionalField2=111111&serviceId=WSabianakhurd&currencyCode=INR",
        //         "txnStatus": "PENDING",
        //         "txnStatusMsg": "Transaction initiated",
        //         "gatewayTxnId": null,
        //         "gatewayPaymentMode": null,
        //         "gatewayStatusCode": null,
        //         "gatewayStatusMsg": null,
        //         "receipt": null,
        //         "auditDetails": {
        //             "createdBy": "d158721b-5c25-421b-8c26-c63cf5d38825",
        //             "createdTime": 1718644478078,
        //             "lastModifiedBy": null,
        //             "lastModifiedTime": null
        //         },
        //         "additionalDetails": {
        //             "isWhatsapp": false,
        //             "taxAndPayments": [
        //                 {
        //                     "taxAmount": null,
        //                     "amountPaid": 160,
        //                     "billId": "3b27460b-d37e-4e0d-bd51-ed32f12e90e3"
        //                 }
        //             ]
        //         },
        //         "bankTransactionNo": null
        //     }
        // }
        // const redirectUrl = data?.Transaction?.redirectUrl;
        //   // paygov
        //   try {
        //     const gatewayParam = redirectUrl
        //       ?.split("?")
        //       ?.slice(1)
        //       ?.join("?")
        //       ?.split("&")
        //       ?.reduce((curr, acc) => {
        //         var d = acc.split("=");
        //         curr[d[0]] = d[1];
        //         return curr;
        //       }, {});
        //     var newForm = $("<form>", {
        //       action: gatewayParam.txURL,
        //       method: "POST",
        //       target: "_top",
        //     });
        //     const orderForNDSLPaymentSite = [
        //       "checksum",
        //       "messageType",
        //       "merchantId",
        //       "serviceId",
        //       "orderId",
        //       "customerId",
        //       "transactionAmount",
        //       "currencyCode",
        //       "requestDateTime",
        //       "successUrl",
        //       "failUrl",
        //       "additionalField1",
        //       "additionalField2",
        //       "additionalField3",
        //       "additionalField4",
        //       "additionalField5",
        //     ];

        //     // override default date for UPYOG Custom pay
        //     gatewayParam["requestDateTime"] = gatewayParam["requestDateTime"]?.split(new Date().getFullYear()).join(`${new Date().getFullYear()} `);

        //     gatewayParam["successUrl"]= redirectUrl?.split("successUrl=")?.[1]?.split("eg_pg_txnid=")?.[0]+'eg_pg_txnid=' +gatewayParam?.orderId;
        //     gatewayParam["failUrl"]= redirectUrl?.split("failUrl=")?.[1]?.split("eg_pg_txnid=")?.[0]+'eg_pg_txnid=' +gatewayParam?.orderId;
        //     // gatewayParam["successUrl"]= data?.Transaction?.callbackUrl;
        //     // gatewayParam["failUrl"]= data?.Transaction?.callbackUrl;

        //     // var formdata = new FormData();

        //     for (var key of orderForNDSLPaymentSite) {

        //       // formdata.append(key,gatewayParam[key]);

        //       newForm.append(
        //         $("<input>", {
        //           name: key,
        //           value: gatewayParam[key],
        //           // type: "hidden",
        //         })
        //       );
        //     }
        //     $(document.body).append(newForm);
        //     newForm.submit();
        //     makePayment(gatewayParam.txURL,newForm);

        //   } catch (e) {
        //     console.log("Error in payment redirect ", e);
        //     //window.location = redirectionUrl;
        //   }

        // window.location = redirectUrl;
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

  if (isLoading || isLoadingCalc) {
    return <Loader />;
  }
  return (
    <div>
    <div style={{ backgroundColor: "white", borderRadius: "15px" }} className="digit-results-table-wrapper">
      <div style={{ width: "100%", padding: "20px", marginLeft: "20px" }}>
        <Header style={{ marginBottom: "20px" }}>{t("OP_PAYMENT_DETAILS")}</Header>
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

          <div style={{ marginTop: "24px", width: "100%", display: "flex", justifyContent: "end" }}>
            <SubmitBar
              style={{
                // width: "100%",
                marginRight: "55px",
                marginBottom: "0px",
                borderRadius: "10px",
              }}
              disabled={Number(bill?.totalAmount) === 0}
              onSubmit={onSubmit}
              label={t("OP_PROCEED_TO_PAY")}
            />
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

      {costEstimation ?
        <div className="digit-results-calculation-wrapper">
          <div>
            <Header className="calculation-header">{t('CALCULATION_TITLE')}</Header>
          </div>
          <div className="calculation-wrapper">

            <div className="fee-rates">
              <div className="fee-rate-card">
                <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_RESIDENTIAL')}</h3>
                <p className='fee-rate-card-value'>FDj {costEstimation?.costPerSqmLivingSpace?.toLocaleString()}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_COMMERCIAL')}</h3>
                <p className='fee-rate-card-value'>FDj {costEstimation?.costPerSqmCommercialSpace?.toLocaleString()}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES')}</h3>
                <p className='fee-rate-card-value'>{`${costEstimation?.royaltyPer} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES')}</h3>
                <p className='fee-rate-card-value'>{`${costEstimation?.eqResistancePer} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
              </div>

              <div className="fee-rate-card">
                <h3 className='fee-rate-card-title'>{t('CALCULATION_REGISTRY_SERVICE_FEE')}</h3>
                <p className='fee-rate-card-value'>FDj {costEstimation?.registryServiceFee?.toLocaleString()}</p>
              </div>
            </div>

            <div className="floor-table">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="niveau-col">{t('CALCULATION_NIVEAU')}</th>
                      <th className="area-col">{t('CALCULATION_SURFACE_HABITATION')}</th>
                      <th className="area-col">{t('CALCULATION_SURFACE_COMMERCIALE')}</th>
                      <th className="area-col">{t('CALCULATION_TOTAL_SUPERFICIE')}</th>
                      <th className="area-col">{t('CALCULATION_ESTIMATION_COUTS')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costEstimation?.floors?.map((floor, index) => (
                      <tr key={index}>
                        <td className="niveau-col floor-col">

                          {index === 0 ? t('CALCULATION_RDC') : ""}
                          {index === costEstimation?.floors.length - 1 ? t('CALCULATION_TERRASSE') : ""}
                          {index !== 0 && index !== costEstimation?.floors.length - 1 && t(`CALCULATION_${index}ER_ETAGE`)}</td>

                        <td className="area-col">
                          <div className="input-with-unit">
                            {floor?.builtUpAreaLiving === 0 ? "" : floor?.builtUpAreaLiving} m²
                          </div>
                        </td>
                        <td className="area-col">
                          <div className="input-with-unit">
                            {floor?.builtupAreaCommercial === 0 ? "" : floor?.builtupAreaCommercial} m²
                          </div>
                        </td>
                        <td className="total-col">
                          {floor?.totalAreaPerLevel > 0 ? `${floor?.totalAreaPerLevel} m²` : "0 m²"}
                        </td>
                        <td className="cost-col">
                          {floor?.floorCost ? floor?.floorCost?.toLocaleString() : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="calculations-section">
              <div className="plot-info">
                <h3 className='plot-info-title'>{t('CALCULATION_COEFFICIENTS_SOL')}</h3>
                <div className="info-content">
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_SURFACE_PARCELLE')}</span>
                    <span className='fee-rate-card-value'>{applicationData?.serviceDetails?.landandProjectDesignDetails?.[0]?.area}</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_COS')}</span>
                    <span className='fee-rate-card-value'>{applicationData?.serviceDetails?.landandProjectDesignDetails?.[0]?.projectedCos}</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES_CALCULATED')}</span>
                    <span className='fee-rate-card-value'>{costEstimation?.royaltyFee} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                    <span className='fee-rate-card-value'>{costEstimation?.eqResistanceCost?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES')}</span>
                    <span className='fee-rate-card-value'>{costEstimation?.totalTax?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES_WITH_SERVICE')}</span>
                    <span className='fee-rate-card-value'>{costEstimation?.totalTaxWithServiceCharge?.toLocaleString()} FDj</span>
                  </div>
                  <div className="fee-rate-card">
                    <span className='fee-rate-card-title'>{t('CALCULATION_PROJECT_TOTAL_VALUE')}</span>
                    <span className='fee-rate-card-value'>{costEstimation?.totalBuildingCost?.toLocaleString()} FDj</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cost-breakdown">
              <div className="table-wrapper cost-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="work-col">{t('CALCULATION_WORK_DESIGNATION')}</th>
                      <th className="percentage-col">{t('CALCULATION_WORK_PERCENTAGES')}</th>
                      <th className="amount-col">{t('CALCULATION_AMOUNT')}</th>
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
                      <td className="work-col">{t('CALCULATION_TOTAL')}</td>
                      <td className="percentage-col">{calculateTotalPercentage()}%</td>
                      <td className="amount-col">{calculateTotalCost() === 0 ? "0 FDj" : `${calculateTotalCost()?.toLocaleString()} FDj`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
        :
        ""
      }

    </div>
  );
};

export default OpenView;
