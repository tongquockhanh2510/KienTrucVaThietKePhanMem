import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('admin@cms.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>CMS Admin</h2>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} required />
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)} required />
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' },
  card:  { background:'#fff', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'380px', boxShadow:'0 2px 16px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'0.75rem' },
  title: { margin:'0 0 0.5rem', fontSize:'1.5rem', fontWeight:600, textAlign:'center' },
  label: { fontSize:'0.85rem', color:'#555', marginBottom:'-0.5rem' },
  input: { padding:'0.6rem 0.8rem', border:'1px solid #ddd', borderRadius:'8px', fontSize:'1rem', outline:'none' },
  btn:   { marginTop:'0.5rem', padding:'0.75rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'1rem', cursor:'pointer', fontWeight:500 },
  error: { background:'#fee', color:'#c00', padding:'0.5rem 0.75rem', borderRadius:'8px', fontSize:'0.9rem' },
};
