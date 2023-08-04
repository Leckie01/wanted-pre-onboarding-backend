const { DataTypes, Model } = require("sequelize");
const sequelize = require("../dbConfig");
const bcrypt = require("bcrypt");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: DataTypes.STRING,
  },
  {
    defaultScope: {
      attributes: {
        // 조회 시 패스워드는 제외
        exclude: ["password"],
      },
    },
    sequelize,
    hooks: {
      // 테이블에 저장하기전 패스워드 암호화
      beforeCreate: async (user) => {
        const hasedPassword = await bcrypt.hash(user.password, 10);
        user.password = hasedPassword;
      },
    },
  }
);

module.exports = User;
