'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
<<<<<<< HEAD
=======

>>>>>>> main
        static associate(models) {

        }
    };
    Comment.init({
        content: DataTypes.TEXT('long'),
        parentId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
        blogId: DataTypes.INTEGER,
        star: DataTypes.INTEGER,
        image: DataTypes.BLOB('long')
    }, {
        sequelize,
        modelName: 'Comment',
    });
    return Comment;
};