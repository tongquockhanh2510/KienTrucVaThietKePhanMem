const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // Thời lượng (phút)
    genre: { type: String },
    posterUrl: { type: String },
    price: { type: Number, default: 75000 },
    availableSeats: { type: Number, default: 48 },
    rating: { type: Number, default: 8.0 },
    showtime: { type: String, default: '19:00' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
