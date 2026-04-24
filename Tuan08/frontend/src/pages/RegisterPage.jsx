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
      setError('Mat khau phai co it nhat 6 ky tu')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await registerUser(form)
      const username = res.data?.user?.username || form.username
      setSuccess(`Dang ky thanh cong! Chao mung ${username}. Dang chuyen huong...`)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Dang ky that bai. Vui long thu lai.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Tao tai khoan</h1>
        <p className="auth-subtitle">Tham gia CinemaX va trai nghiem dat ve de dang</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ten dang nhap</label>
            <input
              className="form-control"
              name="username"
              placeholder="Ten dang nhap (toi thieu 3 ky tu)..."
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
            <label>Mat khau</label>
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Toi thieu 6 ky tu..."
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Dang xu ly...' : 'Dang ky ngay'}
          </button>
        </form>

        <div className="auth-footer">
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </div>
      </div>
    </div>
  )
}
