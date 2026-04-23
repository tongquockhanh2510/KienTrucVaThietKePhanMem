const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// POST /movies - Thêm phim mới
router.post('/', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi thêm phim", error: error.message });
    }
});

// GET /movies - Lấy danh sách phim
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

module.exports = router;