export default function Navbar({ user, cartCount, page, setPage, onLogout }) {
  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #f0ede8",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 64, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "#0F6E56", lineHeight: 1 }}>BepCongTy</div>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>INTERNAL FOOD ORDER</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "home", label: "🏠 Thuc don" },
            { key: "orders", label: "📋 Don hang" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className="nav-btn"
              onClick={() => setPage(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: page === key ? "#E1F5EE" : "transparent",
                color: page === key ? "#0F6E56" : "#666",
              }}
            >
              {label}
            </button>
          ))}
          <button
            className="nav-btn"
            onClick={() => setPage("cart")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              background: page === "cart" ? "#1D9E75" : "#E1F5EE",
              color: page === "cart" ? "#fff" : "#0F6E56",
              position: "relative",
            }}
          >
            🛒 Gio hang
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#D85A30",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600 }}>{user?.role}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #eee", background: "none", color: "#999", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            Dang xuat
          </button>
        </div>
      </div>
    </nav>
  );
}
