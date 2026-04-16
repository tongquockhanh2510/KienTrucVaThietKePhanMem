const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Food = sequelize.define('Food', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(191),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(191),
        allowNull: true,
        defaultValue: null
    },
    price: {
        // Decimal 65,30 như trong hình
        type: DataTypes.DECIMAL(65, 30),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(191),
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING(191),
        allowNull: true,
        defaultValue: null
    },
    available: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1 // Mặc định là '1' (true)
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Food',
    timestamps: false
});

module.exports = Food;