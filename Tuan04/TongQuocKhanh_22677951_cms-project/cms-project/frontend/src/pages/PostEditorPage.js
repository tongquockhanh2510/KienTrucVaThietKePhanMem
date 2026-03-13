import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI } from '../services/api';

export default function PostEditorPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', status: 'draft', tags: '',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    postsAPI.list({ status: '', limit: 100 })
      .then(r => {
        const post = r.data.data.find(p => p.id === id);
        if (post) setForm({
          title:   post.title   || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          status:  post.status  || 'draft',
          tags:    Array.isArray(post.tags) ? post.tags.join(', ') : '',
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async (overrideStatus) => {
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        status: overrideStatus || form.status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) await postsAPI.update(id, payload);
      else        await postsAPI.create(payload);
      navigate('/admin/posts');
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:'2rem' }}>Loading...</div>;

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <h1 style={s.heading}>{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <div style={s.actions}>
          <button style={s.btnSecondary} onClick={() => navigate('/admin/posts')}>Cancel</button>
          <button style={s.btnDraft}   disabled={saving} onClick={() => handleSave('draft')}>Save Draft</button>
          <button style={s.btnPublish} disabled={saving} onClick={() => handleSave('published')}>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.layout}>
        <div style={s.main}>
          <input style={s.titleInput} placeholder="Post title..."
            value={form.title} onChange={set('title')} />
          <textarea style={s.content} placeholder="Write your content here..."
            value={form.content} onChange={set('content')} rows={20} />
        </div>

        <aside style={s.sidebar}>
          <div style={s.sideCard}>
            <label style={s.label}>Status</label>
            <select style={s.select} value={form.status} onChange={set('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={s.sideCard}>
            <label style={s.label}>Excerpt</label>
            <textarea style={s.textarea} rows={4} placeholder="Short description..."
              value={form.excerpt} onChange={set('excerpt')} />
          </div>

          <div style={s.sideCard}>
            <label style={s.label}>Tags <span style={s.hint}>(comma separated)</span></label>
            <input style={s.input} placeholder="tech, news, tutorial"
              value={form.tags} onChange={set('tags')} />
          </div>
        </aside>
      </div>
    </div>
  );
}

const s = {
  page:        { padding:'2rem' },
  toolbar:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  heading:     { margin:0, fontSize:'1.5rem', fontWeight:600 },
  actions:     { display:'flex', gap:'0.5rem' },
  btnSecondary:{ padding:'0.5rem 1rem', background:'#fff', border:'1px solid #ddd', borderRadius:8, cursor:'pointer' },
  btnDraft:    { padding:'0.5rem 1rem', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  btnPublish:  { padding:'0.5rem 1.2rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  error:       { background:'#fee', color:'#c00', padding:'0.75rem 1rem', borderRadius:8, marginBottom:'1rem' },
  layout:      { display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.5rem', alignItems:'start' },
  main:        { display:'flex', flexDirection:'column', gap:'0.75rem' },
  titleInput:  { padding:'0.75rem 1rem', fontSize:'1.3rem', border:'1px solid #ddd', borderRadius:8, outline:'none', fontWeight:600 },
  content:     { padding:'1rem', fontSize:'1rem', border:'1px solid #ddd', borderRadius:8, outline:'none', resize:'vertical', fontFamily:'inherit', lineHeight:1.7 },
  sidebar:     { display:'flex', flexDirection:'column', gap:'1rem' },
  sideCard:    { background:'#fff', borderRadius:10, padding:'1rem', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:'0.5rem' },
  label:       { fontSize:'0.82rem', fontWeight:600, color:'#555' },
  hint:        { fontWeight:400, color:'#aaa' },
  select:      { padding:'0.45rem 0.6rem', border:'1px solid #ddd', borderRadius:6, fontSize:'0.9rem' },
  textarea:    { padding:'0.5rem 0.6rem', border:'1px solid #ddd', borderRadius:6, fontSize:'0.9rem', resize:'vertical', fontFamily:'inherit' },
  input:       { padding:'0.45rem 0.6rem', border:'1px solid #ddd', borderRadius:6, fontSize:'0.9rem' },
};
