'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AddressUser extends Model {
<<<<<<< HEAD
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
=======

>>>>>>> main
        static associate(models) {

        }
    };
    AddressUser.init({
        userId: DataTypes.INTEGER,
        shipName: DataTypes.STRING,
        shipAdress: DataTypes.STRING,
        shipEmail: DataTypes.STRING,
        shipPhonenumber: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'AddressUser',
    });
    return AddressUser;
};