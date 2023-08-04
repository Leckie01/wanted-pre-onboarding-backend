const express = require("express");
const sequelize = require("./dbConfig");
const { body, validationResult } = require("express-validator");
const User = require("./entities/User");

// * 모델 영역
require("./entities/User");
require("./entities/Post");
// 모델 관계 정의용 설정 파일
require("./entities/index");

// * 데이터베이스 영역
// 시퀄라이즈 모델 데이터베이스에 동기화 후 연결
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database is connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error : ", err);
  });

const server = express();

// * 미들웨어 영역
// 요청 본문 형식이 json인 경우 파싱해주는 미들웨어
server.use(express.json());

// 요청 본문이 URL 인코딩된 경우 파싱해주는 미들웨어
server.use(express.urlencoded({ extended: true }));

// 에러 핸들링 미들웨어
server.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({
    errors: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주시기 바랍니다.",
  });
});

// * routes 영역

// 사용자: 회원가입
server.post(
  "/users/signup",
  // 유효성 체크
  [
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
  ],
  async (req, res) => {
    const validResult = validationResult(req);

    if (!validResult.isEmpty()) {
      return res.status(400).json({ errors: validResult.array() });
    }

    const { email, password } = req.body;

    const existUser = await User.findOne({ where: { email } });
    if (existUser) {
      return res.status(400).json({ errors: "이미 존재하는 이메일입니다." });
    }

    const user = await User.create({ email, password });

    return res.json({ user, message: "정상적으로 회원가입되었습니다." });
  }
);

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);
