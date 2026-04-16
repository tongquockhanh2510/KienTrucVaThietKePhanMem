const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false, // Tắt log các câu lệnh SQL trong console
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Database connected successfully via Sequelize');
        // sync() giúp tự động tạo bảng nếu chưa tồn tại
        await sequelize.sync({ force: false }); 
    } catch (error) {
        if (error?.original?.code === 'ER_NOT_SUPPORTED_AUTH_MODE' || error?.original?.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED') {
            console.error(
                " Database connection failed: the current auth plugin is not supported by the Node driver. " +
                "Use a SQL user configured with mysql_native_password (or another supported plugin) or switch DB credentials."
            );
            return;
        }

        console.error(' Database connection failed:', error.message || error);
    }
};

module.exports = { sequelize, connectDB };