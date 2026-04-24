const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");

// MongoDB
mongoose.connect("mongodb://admin:password123@localhost:27017/movie_db?authSource=admin");

const Movie = mongoose.model("Movie", {
  title: String,
  year: Number,
});

// Redis
const redisClient = redis.createClient();
redisClient.connect();

async function startWorker() {
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertQueue("write_queue");

  console.log("🚀 Worker đang chạy...");

  channel.consume("write_queue", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    console.log("📥 Nhận job:", data);

    // 1. Ghi DB
    await Movie.create(data);

    // 2. Xóa cache (invalidate)
    await redisClient.del("movies");

    console.log("✅ Đã ghi DB + clear cache");

    channel.ack(msg);
  });
}

startWorker();