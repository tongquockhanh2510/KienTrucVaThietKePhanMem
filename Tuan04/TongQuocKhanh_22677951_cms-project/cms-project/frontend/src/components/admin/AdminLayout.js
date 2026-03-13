import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const navItems = [
  { to: '/admin',        label: 'Dashboard', exact: true },
  { to: '/admin/posts',  label: 'Posts' },
  { to: '/admin/media',  label: 'Media' },
  { to: '/admin/users',  label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>CMS</div>
        <nav style={s.nav}>
          {navItems.map(({ to, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={s.userBox}>
          <div style={s.userName}>{user?.name}</div>
          <div style={s.userRole}>{user?.role}</div>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell:     { display:'flex', minHeight:'100vh', fontFamily:'system-ui,sans-serif' },
  sidebar:   { width:220, background:'#1e1e2e', color:'#cdd6f4', display:'flex', flexDirection:'column', flexShrink:0 },
  logo:      { padding:'1.5rem 1.25rem', fontSize:'1.4rem', fontWeight:700, color:'#cba6f7', borderBottom:'1px solid #313244' },
  nav:       { flex:1, display:'flex', flexDirection:'column', padding:'1rem 0' },
  link:      { padding:'0.65rem 1.25rem', color:'#bac2de', textDecoration:'none', fontSize:'0.95rem', borderLeft:'3px solid transparent' },
  active:    { color:'#cba6f7', background:'#313244', borderLeftColor:'#cba6f7' },
  userBox:   { padding:'1rem 1.25rem', borderTop:'1px solid #313244' },
  userName:  { fontWeight:600, fontSize:'0.9rem', marginBottom:'0.15rem' },
  userRole:  { fontSize:'0.75rem', color:'#6c7086', marginBottom:'0.75rem', textTransform:'capitalize' },
  logoutBtn: { width:'100%', padding:'0.4rem', background:'#313244', color:'#f38ba8', border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.85rem' },
  main:      { flex:1, background:'#f8f8fc', overflow:'auto' },
};
