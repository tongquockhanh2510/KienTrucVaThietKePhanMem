import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies } from '../api'
import { useAuth } from '../context/AuthContext'
import { normalizeMovie, formatCurrency } from '../utils/movieUtils'

const ALL_GENRES_LABEL = 'Tat ca'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES_LABEL)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getMovies()
      .then((res) => {
        const movieList = Array.isArray(res.data) ? res.data : []
        setMovies(movieList.map(normalizeMovie))
      })
      .catch(() => setError('Khong the tai danh sach phim. Kiem tra ket noi server.'))
      .finally(() => setLoading(false))
  }, [])

  const genres = [ALL_GENRES_LABEL, ...new Set(movies.map((movie) => movie.genre).filter(Boolean))]
  const filtered = selectedGenre === ALL_GENRES_LABEL
    ? movies
    : movies.filter((movie) => movie.genre === selectedGenre)

  const handleBook = (movie) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (movie.availableSeats <= 0) return
    navigate(`/book/${movie.id}`, { state: { movie } })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Dat ve phim <span>sieu toc</span><br />chi trong 30 giay!</h1>
          <p>Chon phim, chon loai ghe, chon vi tri va dat ve trong mot luong don gian.</p>
        </div>
        <div className="hero-emoji">🎬</div>
      </div>

      <div className="page-header">
        <h2 className="page-title">Phim dang chieu</h2>
        <p className="page-subtitle">{filtered.length} bo phim san sang dat ve</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              background: selectedGenre === genre ? 'var(--primary)' : 'transparent',
              borderColor: selectedGenre === genre ? 'var(--primary)' : 'var(--border)',
              color: selectedGenre === genre ? '#fff' : 'var(--text-muted)',
            }}
          >
            {genre}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {filtered.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>Khong co phim nao</h3>
          <p>Chua co phim nao trong danh muc nay</p>
        </div>
      ) : (
        <div className="movies-grid">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onBook={handleBook} />
          ))}
        </div>
      )}
    </div>
  )
}

function MovieCard({ movie, onBook }) {
  const soldOut = movie.availableSeats <= 0
  const lowStock = movie.availableSeats > 0 && movie.availableSeats <= 10

  return (
    <div className="movie-card">
      <div className="movie-poster-placeholder">
        🎬
        <span>{movie.genre}</span>
      </div>
      <div className="movie-info">
        <span className="movie-genre">{movie.genre}</span>
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span>⏱ {movie.duration} phut</span>
          <span>⭐ {movie.rating}</span>
        </div>
        <div className="movie-price">{formatCurrency(movie.price)}</div>
        <div className={`seats-badge ${soldOut ? 'sold-out' : lowStock ? 'low' : ''}`}>
          💺 {soldOut ? 'Het cho' : `Con ${movie.availableSeats} ghe`}
        </div>
        <button
          className={`btn ${soldOut ? 'btn-outline' : 'btn-primary'} btn-full`}
          onClick={() => onBook(movie)}
          disabled={soldOut}
        >
          {soldOut ? 'Het ve' : 'Dat ve ngay'}
        </button>
      </div>
    </div>
  )
}
