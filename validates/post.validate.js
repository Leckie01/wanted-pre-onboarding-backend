const { body, param, query } = require("express-validator");

const postValidates = {
  list: [
    query("perpage").isInt({ min: 1 }).toInt().default(10),
    query("page").isInt({ min: 1 }).toInt().default(1),
  ],
  read: [
    param("post_id")
      .notEmpty()
      .withMessage("조회할 게시글의 id를 입력해주세요.")
      .isInt({ min: 1 })
      .withMessage("유효하지 않는 게시글 id입니다."),
  ],
  create: [
    body("title").notEmpty().withMessage("제목을 입력해주세요."),
    body("content").notEmpty().withMessage("내용을 입력해주세요."),
  ],
  update: [
    param("post_id")
      .notEmpty()
      .withMessage("조회할 게시글의 id를 입력해주세요.")
      .isInt({ min: 1 })
      .withMessage("유효하지 않는 게시글 id입니다."),
  ],
  delete: [
    param("post_id")
      .notEmpty()
      .withMessage("조회할 게시글의 id를 입력해주세요.")
      .isInt({ min: 1 })
      .withMessage("유효하지 않는 게시글 id입니다."),
  ],
};

module.exports = postValidates;
