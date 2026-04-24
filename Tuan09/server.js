const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://admin:password123@localhost:27017/movie_db?authSource=admin");

// Model
const Movie = mongoose.model("Movie", {
  title: String,
  year: Number,
});

// Redis
const redisClient = redis.createClient();
redisClient.connect();

// RabbitMQ
let channel;
async function connectRabbit() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertQueue("write_queue");
}
connectRabbit();


// =========================
// 🔵 READ PATH
// =========================
app.get("/movies", async (req, res) => {
  try {
    // 1. Check cache
    const cache = await redisClient.get("movies");

    if (cache) {
      console.log("🔥 Cache HIT");
      return res.json(JSON.parse(cache));
    }

    console.log("❌ Cache MISS");

    // 2. Read DB
    const movies = await Movie.find();

    // 3. Save cache
    await redisClient.set("movies", JSON.stringify(movies), {
      EX: 60, // expire 60s
    });

    res.json(movies);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// =========================
// 🟢 WRITE PATH
// =========================
app.post("/movies", async (req, res) => {
  try {
    // push vào queue
    channel.sendToQueue(
      "write_queue",
      Buffer.from(JSON.stringify(req.body))
    );

    res.json({
      message: "Đã gửi vào queue, xử lý async",
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


app.listen(3000, () => console.log("API chạy port 3000"));