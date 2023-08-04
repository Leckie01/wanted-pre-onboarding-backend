const express = require("express");
const sequelize = require("./dbConfig");
const { body, validationResult } = require("express-validator");
const userValidates = require("./validates/user.validate");

const User = require("./entities/User");
const validateParameters = require("./validates");

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
server.post("/users/signup", userValidates.signup, async (req, res) => {
  validateParameters(req, res);

  const { email, password } = req.body;

  const existUser = await User.findOne({ where: { email } });
  if (existUser) {
    return res.status(400).json({ errors: "이미 존재하는 이메일입니다." });
  }

  const user = await User.create({ email, password });

  return res.json({ user, message: "정상적으로 회원가입되었습니다." });
});

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);
