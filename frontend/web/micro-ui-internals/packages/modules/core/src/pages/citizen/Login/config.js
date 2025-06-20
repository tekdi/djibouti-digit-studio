export const loginSteps = [
  {
    texts: {
      header: "CORE_COMMON_LOGIN",
      cardText: "",
      nextText: "CS_COMMONS_NEXT",
      submitBarLabel: "CORE_COMMON_LOGIN",
      submitBarLabel2: "CS_COMMONS_LOGIN_AS_EMPLOYEE",
    },
    inputs: [
      {
        label: "CORE_COMMON_MOBILE_NUMBER",
        type: "text",
        name: "mobileNumber",
        error: "CORE_COMMON_MOBILE_NUMBER_VALIDMSG",
        validation: {
          required: true,
          minLength: 8,
          maxLength: 8,
        },
      },
    ],
  },
  {
    texts: {
      header: "CS_LOGIN_OTP",
      cardText: "CS_LOGIN_OTP_TEXT",
      nextText: "CS_COMMONS_NEXT",
      submitBarLabel: "CS_COMMONS_VERIFY",
    },
  },
  {
    texts: {
      header: "CS_LOGIN_PROVIDE_NAME",
      nextText: "CS_COMMONS_NEXT",
      submitBarLabel: "CS_COMMONS_NEXT",
    },
    inputs: [
      {
        label: "CORE_COMMON_NAME",
        type: "text",
        name: "name",
        error: "CORE_COMMON_NAME_VALIDMSG",
        placeholder: "CORE_COMMON_NAME",
        validation: {
          required: true,
          minLength: 1,
          pattern: /^[^{0-9}^\$\"<>?\\~!@#$%^()+={}\[\]*,/_:;""'']{1,50}$/i,
        },
      },
      {
        label: "CORE_COMMON_MOBILE_NUMBER",
        type: "text",
        name: "mobileNumber",
        error: "CORE_COMMON_MOBILE_NUMBER_VALIDMSG",
        placeholder: "+25312345678",
        validation: {
          required: true,
          minLength: 8,
          maxLength: 8,
        },
        disabled: true,
      },
    ],
  },
];
