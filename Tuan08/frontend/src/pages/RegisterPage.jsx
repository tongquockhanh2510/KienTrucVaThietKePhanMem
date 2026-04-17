import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await registerUser(form)
      setSuccess(`✅ Đăng ký thành công! Chào mừng ${res.data.username}. Đang chuyển hướng...`)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Tham gia CinemaX và trải nghiệm đặt vé dễ dàng</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              className="form-control"
              name="username"
              placeholder="Tên đăng nhập (tối thiểu 3 ký tự)..."
              value={form.username}
              onChange={handleChange}
              minLength={3}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Tối thiểu 6 ký tự..."
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : '🚀 Đăng ký ngay'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
