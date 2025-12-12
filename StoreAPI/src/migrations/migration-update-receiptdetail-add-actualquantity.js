'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('ReceiptDetails');
        
        if (!tableInfo.actualQuantity) {
            await queryInterface.addColumn('ReceiptDetails', 'actualQuantity', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Số lượng thực tế kiểm tra khi xác nhận'
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('ReceiptDetails', 'actualQuantity');
    }
};
