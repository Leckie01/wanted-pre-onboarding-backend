const { body } = require("express-validator");

const authValidate = [
  body("email")
    .notEmpty()
    .withMessage("이메일을 입력해주세요.")
    .custom((email) => {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error("유효한 이메일 형식으로 입력해주세요.");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("비밀번호를 입력해주세요.")
    .isLength({ min: 8 })
    .withMessage("비밀번호는 8자 이상 입력해주세요."),
];

const userValidates = {
  signup: authValidate,
  signin: authValidate,
};

module.exports = userValidates;
