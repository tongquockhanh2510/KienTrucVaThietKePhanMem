import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Khởi tạo bảng Payment và Notification khi ứng dụng start
export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Tạo bảng Payment
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Payment\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId INT NOT NULL,
        amount DECIMAL(65,30) NOT NULL,
        method ENUM('CASH', 'BANKING', 'MOMO') NOT NULL,
        status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
        transactionRef VARCHAR(191),
        paidAt DATETIME(3),
        INDEX idx_orderId (orderId),
        INDEX idx_status (status)
      )
    `);

    // Tạo bảng Notification
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Notification\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        orderId INT NOT NULL,
        message VARCHAR(191) NOT NULL,
        type ENUM('ORDER', 'PAYMENT', 'SYSTEM') NOT NULL,
        isRead TINYINT(1) DEFAULT 0,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX idx_userId (userId),
        INDEX idx_orderId (orderId),
        INDEX idx_isRead (isRead)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    connection.release();
  }
}

export default pool;
