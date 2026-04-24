import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getBookingById } from '../api'
import { normalizeMovie, SEAT_TYPE_CONFIG, formatCurrency } from '../utils/movieUtils'

const PAYMENT_METHODS = [
  { id: 'momo', label: 'Vi MoMo', detail: 'Quet ma QR gia lap trong 15 giay', icon: '📱' },
  { id: 'bank', label: 'The ATM', detail: 'Thanh toan online qua ngan hang', icon: '💳' },
  { id: 'counter', label: 'Thanh toan tai quay', detail: 'Giu ghe va thanh toan sau', icon: '🏦' },
]

const STATUS_COPY = {
  PENDING: {
    title: 'Dang xu ly thanh toan',
    description: 'He thong dang mo phong giao dich va doi ket qua tu payment service.',
    badge: 'Dang thanh toan',
    className: 'payment-state-pending',
  },
  CONFIRMED: {
    title: 'Thanh toan thanh cong',
    description: 'Booking cua ban da duoc xac nhan thanh cong.',
    badge: 'Thanh cong',
    className: 'payment-state-confirmed',
  },
  FAILED: {
    title: 'Thanh toan that bai',
    description: 'Giao dich gia lap khong thanh cong. Ban co the dat lai ngay.',
    badge: 'That bai',
    className: 'payment-state-failed',
  },
}

export default function PaymentPage() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const initialBooking = location.state?.booking || null
  const movie = normalizeMovie(location.state?.movie || {})
  const selectedSeats = location.state?.selectedSeats || initialBooking?.items?.flatMap((item) => item.seatNumbers || []) || []
  const selectedSeatType = location.state?.selectedSeatType || inferSeatType(selectedSeats)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [booking, setBooking] = useState(initialBooking)
  const [loading, setLoading] = useState(!initialBooking)
  const [error, setError] = useState('')

  const currentStatus = booking?.status || 'PENDING'
  const currentCopy = STATUS_COPY[currentStatus] || STATUS_COPY.PENDING
  const totalAmount = booking?.totalAmount || location.state?.total || 0

  useEffect(() => {
    let intervalId
    let isMounted = true

    const fetchBooking = () => {
      if (!bookingId) return

      getBookingById(bookingId)
        .then((res) => {
          const nextBooking = res.data?.data || null
          if (!isMounted || !nextBooking) return

          setBooking(nextBooking)
          setLoading(false)

          if (nextBooking.status === 'CONFIRMED' || nextBooking.status === 'FAILED') {
            if (intervalId) clearInterval(intervalId)
          }
        })
        .catch((err) => {
          if (!isMounted) return
          setLoading(false)
          setError(err.response?.data?.error || err.response?.data?.message || 'Khong the tai trang thai thanh toan.')
        })
    }

    fetchBooking()
    intervalId = setInterval(fetchBooking, 2000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [bookingId])

  const seatTypeLabel = useMemo(() => {
    return SEAT_TYPE_CONFIG[selectedSeatType]?.label || 'Thuong'
  }, [selectedSeatType])

  return (
    <div className="container">
      <div className="payment-page">
        <div className="payment-layout">
          <section className="payment-panel">
            <div className="payment-header">
              <div>
                <p className="payment-kicker">Thanh toan gia lap</p>
                <h1>{currentCopy.title}</h1>
                <p>{currentCopy.description}</p>
              </div>
              <span className={`status-badge ${currentCopy.className}`}>{currentCopy.badge}</span>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-method-card ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={currentStatus !== 'PENDING'}
                >
                  <span className="payment-method-icon">{method.icon}</span>
                  <strong>{method.label}</strong>
                  <span>{method.detail}</span>
                </button>
              ))}
            </div>

            <div className="payment-visual-card">
              <div className="payment-card-top">
                <span>Gateway Demo</span>
                <span>{PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label}</span>
              </div>
              <div className="payment-card-number">**** **** **** 2404</div>
              <div className="payment-card-bottom">
                <div>
                  <small>Booking ID</small>
                  <strong>#{booking?._id || booking?.id || bookingId}</strong>
                </div>
                <div>
                  <small>Amount</small>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>

            <div className="payment-timeline">
              <div className={`timeline-step ${currentStatus ? 'active' : ''}`}>1. Booking da tao</div>
              <div className={`timeline-step ${currentStatus === 'PENDING' || currentStatus === 'CONFIRMED' || currentStatus === 'FAILED' ? 'active' : ''}`}>2. Gui yeu cau thanh toan</div>
              <div className={`timeline-step ${currentStatus === 'CONFIRMED' ? 'active success' : currentStatus === 'FAILED' ? 'active failed' : ''}`}>
                3. {currentStatus === 'FAILED' ? 'Giao dich that bai' : 'Nhan ket qua'}
              </div>
            </div>

            {currentStatus === 'PENDING' && (
              <div className="payment-processing-box">
                <div className="payment-radar" />
                <div>
                  <strong>Dang doi ket qua tu payment service</strong>
                  <p>Trang thai booking se tu dong cap nhat sau moi 2 giay.</p>
                </div>
              </div>
            )}

            {currentStatus === 'CONFIRMED' && (
              <div className="alert alert-success">
                Booking #{booking?._id || booking?.id} thanh cong!
              </div>
            )}

            {currentStatus === 'FAILED' && (
              <div className="alert alert-error">
                Thanh toan gia lap that bai. Ban co the quay lai danh sach phim va dat lai.
              </div>
            )}
          </section>

          <aside className="payment-summary-card">
            <h3>Tom tat giao dich</h3>
            <div className="summary-row"><span>Phim</span><span>{movie.title || booking?.items?.[0]?.movieTitle || 'Dang cap nhat'}</span></div>
            <div className="summary-row"><span>Loai ghe</span><span>{seatTypeLabel}</span></div>
            <div className="summary-row"><span>Vi tri</span><span>{selectedSeats.length ? selectedSeats.join(', ') : 'Dang cap nhat'}</span></div>
            <div className="summary-row"><span>Trang thai</span><span>{currentCopy.badge}</span></div>
            <div className="summary-total">
              <span>Tong thanh toan</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            <div className="payment-actions">
              <button className="btn btn-primary btn-full" onClick={() => navigate('/my-bookings')}>
                Xem booking cua toi
              </button>
              <button className="btn btn-outline btn-full" onClick={() => navigate('/movies')}>
                Quay ve danh sach phim
              </button>
            </div>

            <p className="payment-footnote">
              {loading ? 'Dang tai du lieu booking...' : 'Day la giao dien mo phong, ket qua duoc sinh ngau nhien tu payment service.'}
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

function inferSeatType(selectedSeats) {
  if (!selectedSeats.length) return 'standard'
  if (selectedSeats.some((seat) => String(seat).startsWith('F'))) return 'couple'
  if (selectedSeats.some((seat) => ['A', 'B'].includes(String(seat)[0]))) return 'vip'
  return 'standard'
}
