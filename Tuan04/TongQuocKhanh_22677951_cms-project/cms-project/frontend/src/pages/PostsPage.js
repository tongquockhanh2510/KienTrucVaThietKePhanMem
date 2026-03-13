import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

export default function PostsPage() {
  const [posts,   setPosts]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 10;

  const load = useCallback(() => {
    setLoading(true);
    postsAPI.list({ status: status || undefined, page, limit })
      .then(r => { setPosts(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this post?')) return;
    await postsAPI.delete(id);
    load();
  };

  const badge = st => ({
    published: { background:'#d1fae5', color:'#065f46' },
    draft:     { background:'#fef3c7', color:'#92400e' },
    archived:  { background:'#f3f4f6', color:'#6b7280' },
  }[st] || {});

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <h1 style={s.heading}>Posts <span style={s.count}>({total})</span></h1>
        <div style={s.actions}>
          <select style={s.select} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button style={s.btnNew} onClick={() => navigate('/admin/posts/new')}>+ New Post</button>
        </div>
      </div>

      {loading ? <div style={s.loading}>Loading...</div> : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Title','Status','Author','Date',''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={5} style={s.empty}>No posts found</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.postTitle}>{p.title}</span>
                    <span style={s.slug}>/{p.slug}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...badge(p.status) }}>{p.status}</span>
                  </td>
                  <td style={s.td}>{p.author_name || '—'}</td>
                  <td style={s.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{ ...s.td, display:'flex', gap:'0.5rem' }}>
                    <button style={s.btnEdit} onClick={() => navigate(`/admin/posts/${p.id}/edit`)}>Edit</button>
                    <button style={s.btnDel}  onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={s.pageInfo}>Page {page} / {totalPages}</span>
          <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

const s = {
  page:      { padding:'2rem' },
  toolbar:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  heading:   { margin:0, fontSize:'1.5rem', fontWeight:600 },
  count:     { color:'#888', fontWeight:400, fontSize:'1rem' },
  actions:   { display:'flex', gap:'0.75rem', alignItems:'center' },
  select:    { padding:'0.45rem 0.75rem', border:'1px solid #ddd', borderRadius:8, fontSize:'0.9rem' },
  btnNew:    { padding:'0.5rem 1rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  loading:   { padding:'2rem', textAlign:'center', color:'#888' },
  tableWrap: { background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { padding:'0.75rem 1rem', textAlign:'left', background:'#f8f8fc', fontSize:'0.8rem', color:'#888', fontWeight:600, textTransform:'uppercase', borderBottom:'1px solid #eee' },
  tr:        { borderBottom:'1px solid #f0f0f0' },
  td:        { padding:'0.85rem 1rem', verticalAlign:'middle', fontSize:'0.9rem' },
  postTitle: { fontWeight:500, display:'block' },
  slug:      { fontSize:'0.78rem', color:'#aaa' },
  badge:     { padding:'0.2rem 0.6rem', borderRadius:20, fontSize:'0.78rem', fontWeight:500 },
  btnEdit:   { padding:'0.3rem 0.7rem', background:'#ede9fe', color:'#4F46E5', border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.82rem' },
  btnDel:    { padding:'0.3rem 0.7rem', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.82rem' },
  pagination:{ display:'flex', alignItems:'center', gap:'1rem', marginTop:'1.5rem', justifyContent:'center' },
  pageBtn:   { padding:'0.4rem 0.9rem', border:'1px solid #ddd', background:'#fff', borderRadius:8, cursor:'pointer' },
  pageInfo:  { fontSize:'0.9rem', color:'#555' },
  empty:     { padding:'3rem', textAlign:'center', color:'#aaa' },
};
