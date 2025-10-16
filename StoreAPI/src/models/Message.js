'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
<<<<<<< HEAD
       
=======
   
>>>>>>> main
        static associate(models) {
          

        }
    };
    Message.init({
        text: DataTypes.TEXT('long'),
        userId: DataTypes.INTEGER,
        roomId: DataTypes.INTEGER,
        unRead:DataTypes.BOOLEAN,
       
    }, {
        sequelize,
        modelName: 'Message',
    });
    return Message;
};