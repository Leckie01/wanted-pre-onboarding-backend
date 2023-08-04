const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbConfig');
const User = require('./User');

class Post extends Model { }

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
        }
    },
    {
        sequelize
    }
)

module.exports = Post;