import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/movieUtils'

const STATUS_MAP = {
  PENDING: { label: 'Dang xu ly', cls: 'status-pending', icon: '⏳' },
  CONFIRMED: { label: 'Thanh cong', cls: 'status-confirmed', icon: '✅' },
  FAILED: { label: 'That bai', cls: 'status-failed', icon: '❌' },
  CANCELLED: { label: 'Da huy', cls: 'status-failed', icon: '🚫' },
}

function normalizeBooking(booking) {
  const items = Array.isArray(booking.items) ? booking.items : []
  const seatNumbers = items.flatMap((item) => item.seatNumbers || [])
  const firstItem = items[0] || {}

  return {
    ...booking,
    movieTitle: firstItem.movieTitle || booking.movieTitle || 'Ten phim',
    seats: seatNumbers.length || firstItem.quantity || booking.seats || 0,
    seatNumbers,
    totalPrice: booking.totalAmount || booking.totalPrice || 0,
  }
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(() => {
    if (!user?.userId) {
      setBookings([])
      setLoading(false)
      return
    }

    getMyBookings(user.userId)
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : []
        setBookings(rows.map(normalizeBooking))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.userId])

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 3000)
    return () => clearInterval(interval)
  }, [fetchBookings])

  if (loading) {
    return (
      <div className="container">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="bookings-page">
        <div className="page-header">
          <h2 className="page-title">Ve cua toi</h2>
          <p className="page-subtitle">
            {bookings.length} booking · Tu dong cap nhat moi 3 giay
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3>Chua co ve nao</h3>
            <p>Hay dat ve phim yeu thich cua ban!</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/movies')}>
              Xem danh sach phim
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const status = STATUS_MAP[booking.status] || STATUS_MAP.PENDING

              return (
                <div className="booking-item" key={booking._id || booking.id}>
                  <div className="booking-icon">🎬</div>
                  <div className="booking-details">
                    <div className="booking-movie-name">{booking.movieTitle}</div>
                    <div className="booking-meta">
                      💺 {booking.seats} ghe · 💰 {formatCurrency(booking.totalPrice)} · 🕐 {new Date(booking.createdAt).toLocaleString('vi-VN')}
                    </div>
                    <div className="booking-meta" style={{ marginTop: '0.2rem' }}>
                      Ghe: {booking.seatNumbers.length ? booking.seatNumbers.join(', ') : 'Dang cap nhat'}
                    </div>
                    <div className="booking-meta" style={{ marginTop: '0.2rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      ID: {booking._id || booking.id}
                    </div>
                    {booking.status === 'PENDING' && (
                      <button
                        className="btn btn-outline"
                        style={{ marginTop: '0.8rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/payment/${booking._id || booking.id}`, { state: { booking } })}
                      >
                        Theo doi thanh toan
                      </button>
                    )}
                  </div>
                  <span className={`status-badge ${status.cls}`}>
                    {status.icon} {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
