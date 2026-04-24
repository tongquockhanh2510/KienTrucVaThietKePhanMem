const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

const DEFAULT_PRICE_BY_GENRE = {
  Action: 90000,
  'Sci-Fi': 95000,
  Drama: 70000,
  Horror: 80000,
  Animation: 75000,
  Romance: 72000,
  Comedy: 70000,
  Thriller: 82000,
  Biography: 85000,
  Fantasy: 88000,
  Musical: 76000,
};

function normalizeMovie(movieDoc) {
  const movie = movieDoc?.toObject ? movieDoc.toObject() : movieDoc;
  const inferredPrice = DEFAULT_PRICE_BY_GENRE[movie.genre] || 75000;

  return {
    ...movie,
    price: Number.isFinite(movie.price) ? movie.price : inferredPrice,
    availableSeats: Number.isFinite(movie.availableSeats) ? movie.availableSeats : 48,
    rating: Number.isFinite(movie.rating) ? movie.rating : 8.0,
    showtime: movie.showtime || '19:00',
  };
}

router.post('/', async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    res.status(201).json(normalizeMovie(savedMovie));
  } catch (error) {
    res.status(400).json({ message: 'Loi khi them phim', error: error.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies.map(normalizeMovie));
  } catch (error) {
    res.status(500).json({ message: 'Loi server', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Khong tim thay phim' });
    }

    return res.status(200).json(normalizeMovie(movie));
  } catch (error) {
    return res.status(500).json({ message: 'Loi server', error: error.message });
  }
});

module.exports = router;
