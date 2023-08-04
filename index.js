const express = require("express");
const sequelize = require("./dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const userValidates = require("./validates/user.validate");
const postValidates = require("./validates/post.validate");

const User = require("./entities/User");
const Post = require("./entities/Post");

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

// 권한 인증용 미들웨어
const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ errors: "로그인이 필요합니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ errors: "인증 정보가 올바르지 않습니다." });
    }
    req.user = user;
    next();
  });
};

// * routes 영역
// 사용자: 회원가입
server.post("/users/signup", userValidates.signup, async (req, res) => {
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
});

// 사용자: 로그인
server.post("/users/signin", userValidates.signin, async (req, res) => {
  const validResult = validationResult(req);

  if (!validResult.isEmpty()) {
    return res.status(400).json({ errors: validResult.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email },
    attributes: { include: ["password"] },
  });
  if (!user) {
    return res.status(401).json({ errors: "계정 정보가 올바르지 않습니다." });
  }

  const isCorrectPW = await bcrypt.compare(password, user.password);
  if (!isCorrectPW) {
    return res.status(401).json({ errors: "계정 정보가 올바르지 않습니다." });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );

  delete user.dataValues.password;

  return res.json({ user, token, message: "정상적으로 로그인되었습니다." });
});

// 게시글: 추가
server.post("/posts", postValidates.create, validateToken, async (req, res) => {
  const validResult = validationResult(req);

  if (!validResult.isEmpty()) {
    return res.status(400).json({ errors: validResult.array() });
  }

  const { title, content } = req.body;

  const post = await Post.create({ title, content, userId: req.user.userId });

  return res.json({ post, message: "게시글이 생성되었습니다." });
});

// 게시글: 수정
server.put(
  "/posts/:post_id",
  postValidates.update,
  validateToken,
  async (req, res) => {
    const validResult = validationResult(req);

    if (!validResult.isEmpty()) {
      return res.status(400).json({ errors: validResult.array() });
    }

    const postId = req.params.post_id;
    const userId = req.user.userId;

    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) {
      return res.status(404).json({ errors: "존재하지 않는 게시글입니다." });
    }

    const { title, content } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    await Post.update(updateData, {
      where: { id: postId, userId },
    });

    const updatedPost = await Post.findOne({ where: { id: postId, userId } });

    return res.json({ post: updatedPost, message: "게시글이 수정되었습니다." });
  }
);

// 게시글: 삭제
server.delete(
  "/posts/:post_id",
  postValidates.delete,
  validateToken,
  async (req, res) => {
    const validResult = validationResult(req);

    if (!validResult.isEmpty()) {
      return res.status(400).json({ errors: validResult.array() });
    }

    const postId = req.params.post_id;
    const userId = req.user.userId;

    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) {
      return res.status(404).json({ errors: "존재하지 않는 게시글입니다." });
    }

    await Post.destroy({ where: { id: postId, userId } });
    return res.json({ message: "게시글이 삭제되었습니다." });
  }
);

// 게시글: 단일조회
server.get("/posts/:post_id", postValidates.read, async (req, res) => {
  const { post_id } = req.params;

  const post = await Post.findOne({ where: { id: post_id } });
  if (!post) {
    return res.status(404).json({ errors: "존재하지 않는 게시글입니다." });
  }

  return res.json({ post });
});

// 게시글: 리스트 조회
server.get("/posts", postValidates.list, async (req, res) => {
  const { perpage, page } = req.query;

  const offset = (page - 1) * perpage;

  const posts = await Post.findAll({
    offset,
    limit: perpage,
  });

  return res.json({ posts });
});

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);
