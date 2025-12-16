'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Receipts', 'statusId', {
            type: Sequelize.STRING,
            defaultValue: 'S1',
            allowNull: true
        });
        
        await queryInterface.addColumn('Receipts', 'image', {
            type: Sequelize.BLOB('long'),
            allowNull: true
        });
        
        await queryInterface.addColumn('Receipts', 'confirmedBy', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Receipts', 'statusId');
        await queryInterface.removeColumn('Receipts', 'image');
        await queryInterface.removeColumn('Receipts', 'confirmedBy');
    }
};
