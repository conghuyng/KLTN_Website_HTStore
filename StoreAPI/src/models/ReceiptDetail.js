'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ReceiptDetail extends Model {
<<<<<<< HEAD
=======
 
>>>>>>> main
        static associate(models) {
           

        }
    };
    ReceiptDetail.init({
        receiptId: DataTypes.INTEGER,
        productDetailSizeId:DataTypes.INTEGER,
        quantity:DataTypes.INTEGER,
        price:DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'ReceiptDetail',
    });
    return ReceiptDetail;
};