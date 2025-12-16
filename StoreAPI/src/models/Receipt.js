'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Receipt extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
           

        }
    };
    Receipt.init({
        userId: DataTypes.INTEGER,
        supplierId: DataTypes.INTEGER,
        statusId: DataTypes.STRING,
        image: DataTypes.BLOB('long'),
        confirmedBy: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Receipt',
    });
    return Receipt;
};