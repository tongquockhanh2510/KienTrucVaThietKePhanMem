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
}

export const SEAT_TYPE_CONFIG = {
  standard: { label: 'Thuong', priceMultiplier: 1, color: '#94a3b8' },
  vip: { label: 'VIP', priceMultiplier: 1.35, color: '#f59e0b' },
  couple: { label: 'Doi', priceMultiplier: 2, color: '#ec4899' },
}

function getBasePrice(movie) {
  if (Number.isFinite(movie?.price)) return movie.price
  return DEFAULT_PRICE_BY_GENRE[movie?.genre] || 75000
}

function getMovieId(movie) {
  return movie?._id || movie?.id || 'unknown-movie'
}

function getReservedSeatCodes(movieId) {
  const chars = String(movieId).split('')
  const seed = chars.reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const reserved = new Set()
  const seatPool = ['A3', 'A7', 'B2', 'B6', 'C4', 'C8', 'D1', 'D5', 'E3', 'E7', 'F2']

  seatPool.forEach((seatCode, index) => {
    if ((seed + index) % 4 === 0) reserved.add(seatCode)
  })

  return reserved
}

export function buildSeatLayout(movie) {
  const reserved = getReservedSeatCodes(getMovieId(movie))
  const rows = [
    { row: 'A', count: 8, type: 'vip' },
    { row: 'B', count: 8, type: 'vip' },
    { row: 'C', count: 8, type: 'standard' },
    { row: 'D', count: 8, type: 'standard' },
    { row: 'E', count: 8, type: 'standard' },
    { row: 'F', count: 6, type: 'couple' },
  ]

  return rows.flatMap(({ row, count, type }) =>
    Array.from({ length: count }, (_, index) => {
      const seatNumber = `${row}${index + 1}`
      return {
        id: seatNumber,
        label: seatNumber,
        type,
        isReserved: reserved.has(seatNumber),
      }
    })
  )
}

export function normalizeMovie(movie = {}) {
  const seatLayout = buildSeatLayout(movie)
  const generatedAvailableSeats = seatLayout.filter((seat) => !seat.isReserved).length
  const configuredSeats = Number.isFinite(movie.availableSeats) ? movie.availableSeats : generatedAvailableSeats

  return {
    ...movie,
    id: getMovieId(movie),
    title: movie.title || 'Phim dang cap nhat',
    description: movie.description || 'Thong tin phim dang duoc cap nhat.',
    genre: movie.genre || 'Drama',
    duration: Number.isFinite(movie.duration) ? movie.duration : 120,
    rating: Number.isFinite(movie.rating) ? movie.rating : 8.0,
    posterUrl: movie.posterUrl || '',
    price: getBasePrice(movie),
    availableSeats: Math.min(configuredSeats, generatedAvailableSeats),
    showtime: movie.showtime || '19:00',
    seatLayout,
  }
}

export function getSeatPrice(movie, seatType) {
  const normalizedMovie = normalizeMovie(movie)
  const config = SEAT_TYPE_CONFIG[seatType] || SEAT_TYPE_CONFIG.standard
  return Math.round(normalizedMovie.price * config.priceMultiplier)
}

export function getSeatAvailabilityByType(movie) {
  const normalizedMovie = normalizeMovie(movie)
  return normalizedMovie.seatLayout.reduce((acc, seat) => {
    if (!acc[seat.type]) acc[seat.type] = 0
    if (!seat.isReserved) acc[seat.type] += 1
    return acc
  }, {})
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}
