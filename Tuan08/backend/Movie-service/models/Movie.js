const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // Thời lượng (phút)
    genre: { type: String },
    posterUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);