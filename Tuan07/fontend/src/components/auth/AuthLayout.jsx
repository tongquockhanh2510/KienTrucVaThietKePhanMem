export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #E1F5EE 0%, #f8fdf9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🍽️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#0F6E56" }}>BepCongTy</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4, letterSpacing: 1 }}>INTERNAL FOOD ORDER SYSTEM</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8f5ef", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>{title}</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#888" }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
