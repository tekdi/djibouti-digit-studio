export const loginSteps = [
  {
    texts: {
      header: "CS_LOGIN_PROVIDE_MOBILE_NUMBER",
      cardText: "",
      nextText: "CS_COMMONS_NEXT",
      submitBarLabel: "Login",
      submitBarLabel2: "Login as Employee",
    },
    inputs: [
      {
        label: "CORE_COMMON_MOBILE_NUMBER",
        type: "text",
        name: "mobileNumber",
        error: "Enter a valid mobile number",
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
      submitBarLabel: "Verify",
    },
  },
  {
    texts: {
      header: "CS_LOGIN_PROVIDE_NAME",
      cardText: "CS_LOGIN_NAME_TEXT",
      nextText: "CS_COMMONS_NEXT",
      submitBarLabel: "CS_COMMONS_NEXT",
    },
    inputs: [
      {
        label: "CORE_COMMON_NAME",
        type: "text",
        name: "name",
        error: "CORE_COMMON_NAME_VALIDMSG",
        validation: {
          required: true,
          minLength: 1,
          pattern: /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;“”‘’]{1,50}$/i,
        },
      },
    ],
  },
];
