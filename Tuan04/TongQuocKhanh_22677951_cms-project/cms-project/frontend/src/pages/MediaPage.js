import React, { useEffect, useState, useRef } from 'react';
import { mediaAPI } from '../services/api';

export default function MediaPage() {
  const [files,    setFiles]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState('');
  const inputRef = useRef();

  const load = () => {
    mediaAPI.list({ limit: 40 })
      .then(r => { setFiles(r.data.data); setTotal(r.data.total); })
      .catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      await mediaAPI.upload(file);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this file?')) return;
    await mediaAPI.delete(id);
    load();
  };

  const isImage = mime => mime?.startsWith('image/');

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <h1 style={s.heading}>Media <span style={s.count}>({total})</span></h1>
        <div>
          <input ref={inputRef} type="file" style={{ display:'none' }} onChange={handleUpload} />
          <button style={s.btnUpload} disabled={uploading}
            onClick={() => inputRef.current.click()}>
            {uploading ? 'Uploading...' : '+ Upload File'}
          </button>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {files.length === 0
        ? <div style={s.empty}>No files yet. Upload something!</div>
        : (
          <div style={s.grid}>
            {files.map(f => (
              <div key={f.id} style={s.card}>
                <div style={s.thumb}>
                  {isImage(f.mime_type)
                    ? <img src={f.url} alt={f.alt_text || f.original_name} style={s.img} />
                    : <div style={s.fileIcon}>{f.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                  }
                </div>
                <div style={s.info}>
                  <div style={s.fname} title={f.original_name}>{f.original_name}</div>
                  <div style={s.fmeta}>{(f.size / 1024).toFixed(1)} KB</div>
                </div>
                <div style={s.cardActions}>
                  <a href={f.url} target="_blank" rel="noreferrer" style={s.btnView}>View</a>
                  <button style={s.btnDel} onClick={() => handleDelete(f.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

const s = {
  page:        { padding:'2rem' },
  toolbar:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  heading:     { margin:0, fontSize:'1.5rem', fontWeight:600 },
  count:       { color:'#888', fontWeight:400, fontSize:'1rem' },
  btnUpload:   { padding:'0.5rem 1rem', background:'#4F46E5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 },
  error:       { background:'#fee', color:'#c00', padding:'0.75rem 1rem', borderRadius:8, marginBottom:'1rem' },
  empty:       { padding:'3rem', textAlign:'center', color:'#aaa', background:'#fff', borderRadius:10 },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem' },
  card:        { background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column' },
  thumb:       { height:140, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  img:         { width:'100%', height:'100%', objectFit:'cover' },
  fileIcon:    { fontSize:'1.2rem', fontWeight:700, color:'#999', padding:'0.5rem 1rem', background:'#e5e7eb', borderRadius:6 },
  info:        { padding:'0.75rem 0.75rem 0.25rem' },
  fname:       { fontSize:'0.82rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  fmeta:       { fontSize:'0.75rem', color:'#aaa', marginTop:'0.15rem' },
  cardActions: { display:'flex', gap:'0.5rem', padding:'0.5rem 0.75rem 0.75rem' },
  btnView:     { flex:1, padding:'0.3rem', background:'#ede9fe', color:'#4F46E5', borderRadius:6, textAlign:'center', fontSize:'0.82rem', textDecoration:'none' },
  btnDel:      { flex:1, padding:'0.3rem', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.82rem' },
};
