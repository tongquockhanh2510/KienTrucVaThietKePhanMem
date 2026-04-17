import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies } from '../api'
import { useAuth } from '../context/AuthContext'

const GENRES = ['Tất cả', 'Hành động', 'Tình cảm', 'Hài', 'Kinh dị', 'Khoa học viễn tưởng', 'Hoạt hình']

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Tất cả')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getMovies()
      .then(res => setMovies(res.data))
      .catch(() => setError('Không thể tải danh sách phim. Kiểm tra kết nối server.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = selectedGenre === 'Tất cả'
    ? movies
    : movies.filter(m => m.genre === selectedGenre)

  const handleBook = (movie) => {
    if (!user) { navigate('/login'); return }
    if (movie.availableSeats <= 0) return
    navigate(`/book/${movie._id || movie.id}`, { state: { movie } })
  }

  if (loading) return (
    <div className="container">
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  )

  return (
    <div className="container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Đặt vé phim <span>siêu tốc</span><br/>chỉ trong 30 giây!</h1>
          <p>Hàng ngàn suất chiếu mỗi ngày. Chọn phim, chọn ghế, thanh toán — xong!</p>
        </div>
        <div className="hero-emoji">🎬</div>
      </div>

      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Phim đang chiếu</h2>
        <p className="page-subtitle">{filtered.length} bộ phim đang chiếu</p>
      </div>

      {/* Genre Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              background: selectedGenre === g ? 'var(--primary)' : 'transparent',
              borderColor: selectedGenre === g ? 'var(--primary)' : 'var(--border)',
              color: selectedGenre === g ? '#fff' : 'var(--text-muted)',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {filtered.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>Không có phim nào</h3>
          <p>Chưa có phim nào trong danh mục này</p>
        </div>
      ) : (
        <div className="movies-grid">
          {filtered.map(movie => (
            <MovieCard key={movie._id || movie.id} movie={movie} onBook={handleBook} />
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
          <span>⏱ {movie.duration} phút</span>
          <span>⭐ {movie.rating || '8.0'}</span>
        </div>
        <div className="movie-price">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(movie.price)}
        </div>
        <div className={`seats-badge ${soldOut ? 'sold-out' : lowStock ? 'low' : ''}`}>
          💺 {soldOut ? 'Hết chỗ' : `Còn ${movie.availableSeats} ghế`}
        </div>
        <button
          className={`btn ${soldOut ? 'btn-outline' : 'btn-primary'} btn-full`}
          onClick={() => onBook(movie)}
          disabled={soldOut}
        >
          {soldOut ? '😢 Hết vé' : '🎟️ Đặt vé ngay'}
        </button>
      </div>
    </div>
  )
}
