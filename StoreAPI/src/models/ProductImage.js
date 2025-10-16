'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
<<<<<<< HEAD
=======
     
>>>>>>> main
        static associate(models) {
            ProductImage.belongsTo(models.ProductDetail, { foreignKey: 'productdetailId', targetKey: 'id', as: 'productImageData' })
        }
    };
    ProductImage.init({
        caption: DataTypes.STRING,
        productdetailId: DataTypes.INTEGER,
        image: DataTypes.BLOB('long')
    }, {
        sequelize,
        modelName: 'ProductImage',
    });
    return ProductImage;
};