import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { createBooking } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  normalizeMovie,
  getSeatAvailabilityByType,
  getSeatPrice,
  SEAT_TYPE_CONFIG,
  formatCurrency,
} from '../utils/movieUtils'

export default function BookingPage() {
  const { movieId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const movie = normalizeMovie(location.state?.movie || { _id: movieId, title: 'Phim da chon' })
  const availabilityByType = getSeatAvailabilityByType(movie)
  const initialSeatType = Object.keys(SEAT_TYPE_CONFIG).find((type) => availabilityByType[type] > 0) || 'standard'

  const [selectedSeatType, setSelectedSeatType] = useState(initialSeatType)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSelectedSeats([])
  }, [selectedSeatType, movie.id])

  const visibleSeats = movie.seatLayout.filter((seat) => seat.type === selectedSeatType)
  const seatPrice = getSeatPrice(movie, selectedSeatType)
  const total = seatPrice * selectedSeats.length
  const availableSeatCount = availabilityByType[selectedSeatType] || 0

  const toggleSeat = (seat) => {
    if (seat.isReserved) return

    setSelectedSeats((currentSeats) => {
      if (currentSeats.includes(seat.id)) {
        return currentSeats.filter((seatId) => seatId !== seat.id)
      }

      return [...currentSeats, seat.id]
    })
  }

  const handleBook = async () => {
    if (!user?.userId) {
      setError('Tai khoan hien tai chua co thong tin userId. Vui long dang nhap lai.')
      return
    }

    if (selectedSeats.length === 0) {
      setError('Hay chon it nhat mot ghe truoc khi dat ve.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await createBooking({
        userId: user.userId,
        userName: user.username,
        items: [
          {
            movieId,
            quantity: selectedSeats.length,
            seatNumbers: selectedSeats,
          },
        ],
      })

      const booking = res.data?.data
      navigate(`/payment/${booking?._id || booking?.id}`, {
        state: {
          booking,
          movie,
          selectedSeats,
          selectedSeatType,
          total,
        },
      })
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Dat ve that bai. Vui long thu lai.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="booking-page">
        <div className="booking-container">
          <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
            ← Quay lai
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Chon ghe va dat ve
          </h2>

          <div className="booking-movie-info">
            <div className="booking-movie-icon">🎬</div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{movie.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {movie.genre} · {movie.duration} phut · Suat {movie.showtime}
              </p>
              <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.3rem' }}>
                Gia tu {formatCurrency(movie.price)}
              </p>
            </div>
          </div>

          <div className="booking-form-card">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>Loai ghe</label>
              <div className="seat-type-list">
                {Object.entries(SEAT_TYPE_CONFIG).map(([type, config]) => {
                  const typePrice = getSeatPrice(movie, type)
                  const isDisabled = (availabilityByType[type] || 0) === 0

                  return (
                    <button
                      key={type}
                      type="button"
                      className={`seat-type-card ${selectedSeatType === type ? 'active' : ''}`}
                      onClick={() => setSelectedSeatType(type)}
                      disabled={isDisabled}
                    >
                      <span className="seat-type-dot" style={{ background: config.color }} />
                      <strong>{config.label}</strong>
                      <span>{formatCurrency(typePrice)}</span>
                      <small>{availabilityByType[type] || 0} ghe trong</small>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-group">
              <label>So do ghe</label>
              <div className="screen-indicator">Man hinh</div>
              <div className="seat-grid">
                {visibleSeats.map((seat) => {
                  const isSelected = selectedSeats.includes(seat.id)
                  const className = [
                    'seat-chip',
                    `seat-chip-${seat.type}`,
                    seat.isReserved ? 'reserved' : '',
                    isSelected ? 'selected' : '',
                  ].filter(Boolean).join(' ')

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={className}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.isReserved}
                    >
                      {seat.label}
                    </button>
                  )
                })}
              </div>
              <div className="seat-legend">
                <span><i className="legend-box" /> Trong</span>
                <span><i className="legend-box selected" /> Dang chon</span>
                <span><i className="legend-box reserved" /> Da dat</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                Con {availableSeatCount} ghe {SEAT_TYPE_CONFIG[selectedSeatType].label.toLowerCase()} co the chon.
              </div>
            </div>

            <div className="booking-summary">
              <div className="summary-row"><span>Loai ghe</span><span>{SEAT_TYPE_CONFIG[selectedSeatType].label}</span></div>
              <div className="summary-row"><span>Don gia</span><span>{formatCurrency(seatPrice)}</span></div>
              <div className="summary-row"><span>So ghe da chon</span><span>{selectedSeats.length}</span></div>
              <div className="summary-row"><span>Vi tri</span><span>{selectedSeats.length ? selectedSeats.join(', ') : 'Chua chon'}</span></div>
              <div className="summary-total">
                <span>Tong cong</span>
                <span style={{ color: 'var(--primary)' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(229,9,20,0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(229,9,20,0.2)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.2rem',
              }}
            >
              Dat voi tai khoan: <strong style={{ color: 'var(--text)' }}>{user?.username || user?.email}</strong>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleBook}
              disabled={loading || selectedSeats.length === 0}
              style={{ fontSize: '1rem', padding: '0.9rem' }}
            >
              {loading ? 'Dang xu ly...' : `Xac nhan dat ${selectedSeats.length || 0} ve`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
