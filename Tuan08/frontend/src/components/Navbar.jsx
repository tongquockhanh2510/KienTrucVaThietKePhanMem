import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🎬 <span>Cinema</span>X
      </Link>

      <ul className="navbar-links">
        <li><Link to="/movies" className={isActive('/movies')}>🎥 Phim</Link></li>

        {user ? (
          <>
            <li><Link to="/my-bookings" className={isActive('/my-bookings')}>🎟️ Vé của tôi</Link></li>
            <li>
              <div className="nav-user-info">
                <div className="nav-avatar">{user.username?.[0]?.toUpperCase()}</div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{user.username}</span>
              </div>
            </li>
            <li><button onClick={handleLogout} style={{ color: 'var(--danger)' }}>Đăng xuất</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className={isActive('/login')}>Đăng nhập</Link></li>
            <li><Link to="/register" className={`btn-primary-sm ${isActive('/register')}`}>Đăng ký</Link></li>
          </>
        )}
      </ul>
    </nav>
  )
}
