const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbConfig');

class User extends Model { }

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: DataTypes.STRING,
    },
    {
        defaultScope: {
            attributes: {
                // 조회 시 패스워드는 제외
                exclude: ['password']
            }
        },
        sequelize
    }
)



module.exports = User;