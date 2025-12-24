import { Loader, Toast } from "@egovernments/digit-ui-react-components";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomisedHooks } from "../hooks";
import { useHistory, useLocation } from "react-router-dom";
import TextInput from "../../../../ui-components/src/atoms/TextInput";
import MultiUploadWrapper from "../../../../ui-components/src/molecules/MultiUploadWrapper";
import { 
  LuCreditCard, 
  LuReceipt, 
  LuCalendar, 
  LuUpload, 
  LuUser, 
  LuMapPin, 
  LuPhone,
  LuBanknote,
  LuArrowRight,
  LuCircleCheck,
  LuFileText
} from "react-icons/lu";
import CostEstimationCard from "./CostEstimationCard";

// Beautiful Loading Overlay Component
const PaymentLoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 animate-scaleIn max-w-sm mx-4">
        {/* Animated Payment Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-primary rounded-full p-6">
            <LuCreditCard className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement du paiement</h3>
          <p className="text-gray-500">Veuillez patienter...</p>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progressBar" />
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <LuCircleCheck className="w-4 h-4" />
          <span>Transaction sécurisée</span>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progressBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-progressBar { animation: progressBar 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const OpenView = () => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentGateway, setPaymentGateway] = useState("D-MONEY");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const arrears =
    bill?.billDetails
      ?.sort((a, b) => b.fromPeriod - a.fromPeriod)
      ?.reduce((total, current, index) => (index === 0 ? total : total + current.amount), 0) || 0;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (userType === "employee") {
      const mandatoryFields = [
        { value: formData.receiptNo, name: "receiptNo" },
        { value: formData.receiptDate, name: "receiptDate" },
        { value: formData.fileStoreId, name: "fileStoreId" },
      ];

      if (paymentMode === "CHEQUE") {
        mandatoryFields.push({ value: formData.chequeNo, name: "chequeNo" }, { value: formData.chequeDate, name: "chequeDate" });
      }

      const emptyFields = mandatoryFields.filter((field) => field.value === "" || field.value === null || field.value === undefined);

      if (emptyFields.length > 0) {
        setShowToast({
          key: true,
          label: t("ES_COMMON_PLEASE_ENTER_ALL_MANDATORY_FIELDS"),
        });
        setIsSubmitting(false);
        return;
      }

      const body = {
        Payment: {
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
            } else {
              history.push(`/${window.contextPath}/employee/openpayment/failure`, { iSuccess: false, ...state });
              console.error("Missing redirect data in payment response");
            }
            setIsSubmitting(false);
          },
          onError: (error) => {
            console.error("Payment creation failed:", error.message);
            setIsSubmitting(false);
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
              setIsSubmitting(false);
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
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileStoreId = (files) => {
    if (files.length > 0) {
      const fileStoreId = files[0][1]?.fileStoreId?.fileStoreId || "";
      setFormData((prev) => ({ ...prev, fileStoreId }));
    } else {
      setFormData((prev) => ({ ...prev, fileStoreId: "" }));
    }
  };

  if (isLoading || isLoadingCalc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl p-8 shadow-xl flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-primary rounded-full p-4">
              <LuCreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <PaymentLoadingOverlay isVisible={isSubmitting} />
      
      <div>
        <form id="payment-form" onSubmit={handlePaymentSubmit} noValidate className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-primary rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <LuCreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{t("MODE_OF_PAYMENT")}</h1>
                <p className="text-white/80 mt-1">Procédez au paiement de votre demande</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <LuBanknote className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{t("SELECT_PAYMENT_METHOD")}</h2>
                </div>
              </div>
              
              <div className="p-6">
                {userType === "employee" && (
                  <div className="space-y-6">
                    {/* Payment Mode Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <label 
                        className={`relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentMode === "CASH" 
                            ? "border-primary bg-primary/10 shadow-md" 
                            : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value="CASH"
                          checked={paymentMode === "CASH"}
                          onChange={() => setPaymentMode("CASH")}
                          className="sr-only"
                        />
                        <LuBanknote className={`w-6 h-6 ${paymentMode === "CASH" ? "text-primary" : "text-gray-400"}`} />
                        <span className={`font-semibold ${paymentMode === "CASH" ? "text-primary" : "text-gray-600"}`}>
                          {t("PAYMENT_CASH")}
                        </span>
                        {paymentMode === "CASH" && (
                          <div className="absolute top-2 right-2">
                            <LuCircleCheck className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </label>
                      
                      <label 
                        className={`relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentMode === "CHEQUE" 
                            ? "border-primary bg-primary/10 shadow-md" 
                            : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value="CHEQUE"
                          checked={paymentMode === "CHEQUE"}
                          onChange={() => setPaymentMode("CHEQUE")}
                          className="sr-only"
                        />
                        <LuReceipt className={`w-6 h-6 ${paymentMode === "CHEQUE" ? "text-primary" : "text-gray-400"}`} />
                        <span className={`font-semibold ${paymentMode === "CHEQUE" ? "text-primary" : "text-gray-600"}`}>
                          {t("PAYMENT_CHEQUE")}
                        </span>
                        {paymentMode === "CHEQUE" && (
                          <div className="absolute top-2 right-2">
                            <LuCircleCheck className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Receipt Number */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <LuReceipt className="w-4 h-4 text-primary" />
                        {t("RECEIPT_NO")}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="receiptNo"
                        value={formData.receiptNo}
                        onChange={handleChange}
                        placeholder={t("ENTER_RECEIPT_NUMBER")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>

                    {/* Receipt Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <LuCalendar className="w-4 h-4 text-primary" />
                        {t("RECEIPT_DATE")}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="receiptDate"
                        value={formData.receiptDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>

                    {/* Cheque Fields */}
                    {paymentMode === "CHEQUE" && (
                      <div className="space-y-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <LuReceipt className="w-4 h-4 text-amber-600" />
                            {t("CHEQUE_NO")}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="chequeNo"
                            value={formData.chequeNo}
                            onChange={handleChange}
                            placeholder={t("ENTER_CHEQUE_NUMBER")}
                            maxLength={6}
                            className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <LuCalendar className="w-4 h-4 text-amber-600" />
                            {t("CHEQUE_DATE")}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="chequeDate"
                            value={formData.chequeDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <LuUpload className="w-4 h-4 text-primary" />
                        {t("UPLOAD_PAYMENT_RECEIPT")}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary transition-colors duration-200 bg-gray-50">
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
                  </div>
                )}

                {userType === "citizen" && (
                  <div className="space-y-6">
                    {/* Payment Gateway Selection */}
                    <label 
                      className="relative flex items-center gap-4 p-5 rounded-xl border-2 border-primary bg-primary/10 cursor-pointer shadow-md"
                    >
                      <input
                        type="radio"
                        name="paymentGateway"
                        value="D-MONEY"
                        checked={true}
                        onChange={() => setPaymentGateway("D-MONEY")}
                        className="sr-only"
                      />
                      <div className="bg-primary p-3 rounded-xl">
                        <LuCreditCard className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-lg text-primary">{t("PAYMENT_DMONEY")}</span>
                        <p className="text-sm text-gray-500 mt-1">Paiement mobile sécurisé</p>
                      </div>
                      <LuCircleCheck className="w-6 h-6 text-primary" />
                    </label>
                    
                    {/* Offline Payment Note */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <LuFileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-blue-800 font-medium">{t("PAYMENT_OFFLINE_NOTE")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden self-start">
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <LuReceipt className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{t("OP_PAYMENT_DETAILS")}</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Consumer Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <LuUser className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{t("OP_CONSUMER_NAME")}</p>
                      <p className="font-semibold text-gray-900 truncate">{bill?.payerName || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <LuPhone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{t("OP_CONSUMER_PHNO")}</p>
                      <p className="font-semibold text-gray-900">{bill?.mobileNumber || "-"}</p>
                    </div>
                  </div>
                  
                  {bill?.payerAddress && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <LuMapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">{t("OP_CONSUMER_ADDRESS")}</p>
                        <p className="font-semibold text-gray-900 truncate">{bill?.payerAddress}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Breakdown */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-700">{t("ES_PAYMENT_TAXHEADS")}</span>
                    <span className="font-semibold text-gray-700">{t("ES_PAYMENT_AMOUNT")}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {bill?.billDetails?.[0]?.billAccountDetails
                      ?.sort((a, b) => a.order - b.order)
                      .map((amountDetails, index) => (
                        <div key={index + "taxheads"} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">{t(amountDetails.taxHeadCode)}</span>
                          <span className="font-semibold text-gray-900">FDj {amountDetails.amount?.toFixed(0)}</span>
                        </div>
                      ))}
                    
                    {arrears > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-200">
                        <span className="text-orange-700">{t("COMMON_ARREARS")}</span>
                        <span className="font-semibold text-orange-700">FDj {arrears?.toFixed?.(0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-primary rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-lg">{t("CS_PAYMENT_TOTAL_AMOUNT")}</span>
                    <span className="text-white font-bold text-2xl">FDj {Number(bill?.totalAmount).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Estimation Section */}
          {costEstimation && (
            <CostEstimationCard 
              costEstimation={costEstimation} 
              applicationData={applicationData} 
            />
          )}

          {/* Submit Button */}
          <div className="flex justify-center pb-6">
            <button
              type="submit"
              disabled={Number(bill?.totalAmount) === 0 || isSubmitting}
              className={`
                group flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform
                ${Number(bill?.totalAmount) === 0 || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 hover:shadow-2xl hover:scale-105 active:scale-95"
                }
              `}
            >
              <LuCreditCard className="w-6 h-6" />
              <span>{t("OP_PROCEED_TO_PAY")}</span>
              <LuArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </form>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
            <Toast
              error={showToast.key}
              label={t(showToast.label)}
              onClose={() => setShowToast(null)}
            />
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default OpenView;
