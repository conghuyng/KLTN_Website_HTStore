'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Banner extends Model {
<<<<<<< HEAD
=======
   
>>>>>>> main
        static associate(models) {

        }
    };
    Banner.init({
        description: DataTypes.STRING,
        name: DataTypes.STRING,
        statusId: DataTypes.STRING,
        image: DataTypes.BLOB('long')
    }, {
        sequelize,
        modelName: 'Banner',
    });
    return Banner;
};