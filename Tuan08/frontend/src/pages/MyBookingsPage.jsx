import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_MAP = {
  PENDING:   { label: 'Đang xử lý', cls: 'status-pending',   icon: '⏳' },
  CONFIRMED: { label: 'Thành công', cls: 'status-confirmed', icon: '✅' },
  FAILED:    { label: 'Thất bại',   cls: 'status-failed',    icon: '❌' },
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(() => {
    getMyBookings(user.userId)
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.userId])

  useEffect(() => {
    fetchBookings()
    // Poll every 3 seconds to catch payment status updates
    const interval = setInterval(fetchBookings, 3000)
    return () => clearInterval(interval)
  }, [fetchBookings])

  if (loading) return (
    <div className="container">
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  )

  return (
    <div className="container">
      <div className="bookings-page">
        <div className="page-header">
          <h2 className="page-title">🎟️ Vé của tôi</h2>
          <p className="page-subtitle">
            {bookings.length} vé · Tự động cập nhật mỗi 3 giây
            <span style={{
              display: 'inline-block',
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)', marginLeft: 8, verticalAlign: 'middle',
              animation: 'spin 2s linear infinite'
            }}/>
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3>Chưa có vé nào</h3>
            <p>Hãy đặt vé phim yêu thích của bạn!</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/movies')}>
              🎬 Xem danh sách phim
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => {
              const st = STATUS_MAP[b.status] || STATUS_MAP.PENDING
              return (
                <div className="booking-item" key={b._id || b.id}>
                  <div className="booking-icon">🎬</div>
                  <div className="booking-details">
                    <div className="booking-movie-name">{b.movieTitle || 'Tên phim'}</div>
                    <div className="booking-meta">
                      💺 {b.seats} ghế ·{' '}
                      💰 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalPrice)} ·{' '}
                      🕐 {new Date(b.createdAt).toLocaleString('vi-VN')}
                    </div>
                    <div className="booking-meta" style={{ marginTop: '0.2rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {b._id || b.id}
                    </div>
                  </div>
                  <span className={`status-badge ${st.cls}`}>
                    {st.icon} {st.label}
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
