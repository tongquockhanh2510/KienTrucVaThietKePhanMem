import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { createBooking } from '../api'
import { useAuth } from '../context/AuthContext'

export default function BookingPage() {
  const { movieId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const movie = location.state?.movie || { title: 'Phim đã chọn', price: 0, genre: '?' }
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const pricePerSeat = movie.price || 0
  const total = pricePerSeat * seats

  const handleBook = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await createBooking({
        userId: user.userId,
        movieId: movieId,
        movieTitle: movie.title,
        seats,
        totalPrice: total,
      })
      setSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt vé thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container">
        <div className="booking-page">
          <div className="booking-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Đặt vé thành công!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Booking ID: <strong style={{ color: 'var(--primary)' }}>#{success._id || success.id}</strong><br/>
              Đang xử lý thanh toán... Vui lòng chờ.
            </p>
            <div style={{
              background: 'var(--bg-card2)',
              borderRadius: 'var(--radius)',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid var(--border)'
            }}>
              <div className="summary-row"><span>🎬 Phim</span><span>{movie.title}</span></div>
              <div className="summary-row"><span>💺 Số ghế</span><span>{seats}</span></div>
              <div className="summary-row" style={{ fontWeight: 700, color: 'var(--text)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <span>💰 Tổng thanh toán</span>
                <span style={{ color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
                🎟️ Xem vé của tôi
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/movies')}>
                🎥 Xem phim khác
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="booking-page">
        <div className="booking-container">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ marginBottom: '1.5rem' }}
          >
            ← Quay lại
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            🎟️ Đặt vé
          </h2>

          {/* Movie Info */}
          <div className="booking-movie-info">
            <div className="booking-movie-icon">🎬</div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{movie.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {movie.genre} · {movie.duration} phút
              </p>
              <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.3rem' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerSeat)} / ghế
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form-card">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>Số ghế</label>
              <div className="seats-selector">
                <button
                  className="seats-btn"
                  onClick={() => setSeats(s => Math.max(1, s - 1))}
                  type="button"
                >−</button>
                <span className="seats-count">{seats}</span>
                <button
                  className="seats-btn"
                  onClick={() => setSeats(s => Math.min(movie.availableSeats || 10, s + 1))}
                  type="button"
                >+</button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  (Tối đa {movie.availableSeats || 10} ghế có sẵn)
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="booking-summary">
              <div className="summary-row"><span>Đơn giá</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerSeat)}</span>
              </div>
              <div className="summary-row"><span>Số ghế</span><span>× {seats}</span></div>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span style={{ color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(229,9,20,0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(229,9,20,0.2)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1.2rem'
            }}>
              👤 Đặt với tài khoản: <strong style={{ color: 'var(--text)' }}>{user?.username}</strong>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleBook}
              disabled={loading}
              style={{ fontSize: '1rem', padding: '0.9rem' }}
            >
              {loading ? '⏳ Đang xử lý...' : `🎟️ Xác nhận đặt ${seats} vé`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
