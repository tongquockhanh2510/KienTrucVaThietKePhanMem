import React, { useEffect, useState } from 'react';
import { postsAPI, mediaAPI } from '../services/api';
import { useAuth } from '../store/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ posts: 0, drafts: 0, media: 0 });

  useEffect(() => {
    Promise.all([
      postsAPI.list({ status: 'published', limit: 1 }),
      postsAPI.list({ status: 'draft',     limit: 1 }),
      mediaAPI.list({ limit: 1 }),
    ]).then(([pub, draft, media]) => {
      setStats({
        posts: pub.data.total   || 0,
        drafts: draft.data.total || 0,
        media: media.data.total  || 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Published Posts', value: stats.posts,  color: '#4F46E5' },
    { label: 'Drafts',          value: stats.drafts, color: '#F59E0B' },
    { label: 'Media Files',     value: stats.media,  color: '#10B981' },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Welcome back, {user?.name}</h1>
      <div style={s.grid}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.card, borderTopColor: c.color }}>
            <div style={{ ...s.cardNum, color: c.color }}>{c.value}</div>
            <div style={s.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={s.info}>
        <h2 style={s.sub}>Quick start</h2>
        <ul style={s.list}>
          <li>Go to <b>Posts</b> to create or edit content</li>
          <li>Upload images and files in <b>Media</b></li>
          <li>Manage team accounts in <b>Users</b></li>
          <li>Database schema is in <code>database/schema.sql</code> — import via HeidiSQL</li>
        </ul>
      </div>
    </div>
  );
}

const s = {
  page:      { padding:'2rem' },
  heading:   { margin:'0 0 1.5rem', fontSize:'1.6rem', fontWeight:600 },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' },
  card:      { background:'#fff', borderRadius:10, padding:'1.25rem', borderTop:'4px solid', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  cardNum:   { fontSize:'2.2rem', fontWeight:700, lineHeight:1 },
  cardLabel: { marginTop:'0.4rem', color:'#666', fontSize:'0.9rem' },
  info:      { background:'#fff', borderRadius:10, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  sub:       { margin:'0 0 1rem', fontSize:'1.1rem' },
  list:      { margin:0, paddingLeft:'1.25rem', lineHeight:2, color:'#555' },
};
