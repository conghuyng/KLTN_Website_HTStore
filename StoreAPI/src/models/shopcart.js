'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ShopCart extends Model {
<<<<<<< HEAD
=======
   
>>>>>>> main
        static associate(models) {

        }
    };
    ShopCart.init({
        userId: DataTypes.INTEGER,
        productdetailsizeId: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        statusId: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'ShopCart',
    });
    return ShopCart;
};