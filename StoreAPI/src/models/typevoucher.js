'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TypeVoucher extends Model {
        static associate(models) {
            TypeVoucher.belongsTo(models.Allcode, { foreignKey: 'typeVoucher', targetKey: 'code', as: 'typeVoucherData' })
            TypeVoucher.hasMany(models.Voucher, { foreignKey: 'typeVoucherId', as: 'typeVoucherOfVoucherData' })
        }
    };
    TypeVoucher.init({
        typeVoucher: DataTypes.STRING,
        value: DataTypes.BIGINT,
        maxValue: DataTypes.BIGINT,
        minValue: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'TypeVoucher',
    });
    return TypeVoucher;
};