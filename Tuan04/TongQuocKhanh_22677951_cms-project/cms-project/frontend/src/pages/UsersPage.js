import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [showForm,setShowForm]= useState(false);
  const [form,    setForm]    = useState({ email:'', password:'', name:'', role:'editor' });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const load = () => authAPI.users().then(r => setUsers(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await authAPI.register(form);
      setShowForm(false);
      setForm({ email:'', password:'', name:'', role:'editor' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const roleColor = role => ({
    admin:  { background:'#ede9fe', color:'#5b21b6' },
    editor: { background:'#dbeafe', color:'#1e40af' },
    viewer: { background:'#f3f4f6', color:'#6b7280' },
  }[role] || {});

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <h1 style={s.heading}>Users <span style={s.count}>({users.length})</span></h1>
        <button style={s.btnNew} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.form}>
          <h3 style={{ margin:'0 0 1rem' }}>New User</h3>
          {error && <div style={s.error}>{error}</div>}
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Name</label>
              <input style={s.input} value={form.name} onChange={set('name')} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Role</label>
              <select style={s.input} value={form.role} onChange={set('role')}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button style={s.btnSave} type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Name','Email','Role','Joined',''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={5} style={s.empty}>No users</td></tr>}
            {users.map(u => (
              <tr key={u.id} style={s.tr}>
                <td style={s.td}><b>{u.name}</b></td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...roleColor(u.role) }}>{u.role}</span>
                </td>
                <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={s.td}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page:      { padding:'2rem' },
  toolbar:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  heading:   { margin:0, fontSize:'1.5rem', fontWeight:600 },
  count:     { color:'#888', fontWeight:400, fontSize:'1rem' },
  btnNew:    { padding:'0.5rem 1rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  form:      { background:'#fff', borderRadius:10, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'1.5rem' },
  row:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' },
  field:     { display:'flex', flexDirection:'column', gap:'0.4rem' },
  label:     { fontSize:'0.82rem', fontWeight:600, color:'#555' },
  input:     { padding:'0.5rem 0.75rem', border:'1px solid #ddd', borderRadius:8, fontSize:'0.9rem' },
  btnSave:   { padding:'0.5rem 1.5rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  error:     { background:'#fee', color:'#c00', padding:'0.6rem 0.75rem', borderRadius:6, marginBottom:'1rem' },
  tableWrap: { background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { padding:'0.75rem 1rem', textAlign:'left', background:'#f8f8fc', fontSize:'0.8rem', color:'#888', fontWeight:600, textTransform:'uppercase', borderBottom:'1px solid #eee' },
  tr:        { borderBottom:'1px solid #f0f0f0' },
  td:        { padding:'0.85rem 1rem', fontSize:'0.9rem' },
  badge:     { padding:'0.2rem 0.6rem', borderRadius:20, fontSize:'0.78rem', fontWeight:500 },
  empty:     { padding:'3rem', textAlign:'center', color:'#aaa' },
};
