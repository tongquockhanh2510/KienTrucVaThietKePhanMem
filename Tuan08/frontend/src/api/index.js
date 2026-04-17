import axios from 'axios'

// API Gateway URL
const API_GATEWAY = 'http://localhost:8080/api'

// Create instances with base URL points to the Gateway
const USER_API    = axios.create({ baseURL: API_GATEWAY })
const MOVIE_API   = axios.create({ baseURL: API_GATEWAY })
const BOOKING_API = axios.create({ baseURL: API_GATEWAY })

// Attach JWT token to booking requests
BOOKING_API.interceptors.request.use((config) => {
  const saved = localStorage.getItem('cinema_user')
  if (saved) {
    const { token } = JSON.parse(saved)
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ── User Service (Commands) ──────────────────────────────────────────────
export const registerUser = (data) => USER_API.post('/c/auth/register', data)
export const loginUser    = (data) => USER_API.post('/c/auth/login', data)

// ── Movie Service (Commands & Queries) ─────────────────────────────────────────────
export const getMovies   = ()     => MOVIE_API.get('/q/movies')
export const addMovie    = (data) => MOVIE_API.post('/c/movies', data)

// ── Booking Service (Commands & Queries) ───────────────────────────────────────────
export const createBooking  = (data) => BOOKING_API.post('/c/bookings', data)
export const getMyBookings  = (userId) => BOOKING_API.get(`/q/bookings?userId=${userId}`)
export const getBookingById = (id)    => BOOKING_API.get(`/q/bookings/${id}`)
