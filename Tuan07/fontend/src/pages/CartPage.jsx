import { useState } from "react";
import { formatPrice } from "../utils/formatPrice";

export default function CartPage({ cart, updateCartQty, cartTotal, onPlaceOrder, setPage }) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isPlacing, setIsPlacing] = useState(false);

  const handleOrder = () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    setTimeout(() => {
      onPlaceOrder(paymentMethod);
      setIsPlacing(false);
    }, 800);
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 20, color: "#1a1a1a" }}>🛒 Gio hang cua ban</h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333", marginBottom: 8 }}>Gio hang trong</div>
          <div style={{ color: "#999", marginBottom: 24 }}>Hay them mon an tu thuc don nhe!</div>
          <button className="btn-primary" onClick={() => setPage("home")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#1D9E75", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            Xem thuc don
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", overflow: "hidden" }}>
            {cart.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: idx < cart.length - 1 ? "1px solid #f5f2ed" : "none" }}>
                <div style={{ fontSize: 32, width: 48, height: 48, background: "#E1F5EE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.image}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#1D9E75", fontWeight: 600 }}>{formatPrice(item.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => updateCartQty(item.id, -1)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e0dbd4", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
                    -
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #1D9E75", background: "#1D9E75", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
                    +
                  </button>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", minWidth: 80, textAlign: "right" }}>{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", padding: "20px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#333" }}>Phuong thuc thanh toan</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "CASH", label: "Tien mat (CASH)", desc: "Thanh toan khi nhan hang" },
                { value: "BANK_TRANSFER", label: "Chuyen khoan", desc: "Qua ngan hang / vi dien tu" },
              ].map((m) => (
                <div
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `2px solid ${paymentMethod === m.value ? "#1D9E75" : "#e8e4df"}`,
                    background: paymentMethod === m.value ? "#E1F5EE" : "#fafaf8",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: paymentMethod === m.value ? "#0F6E56" : "#333" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#777", fontSize: 14 }}>Tam tinh ({cart.reduce((s, i) => s + i.qty, 0)} mon)</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#777", fontSize: 14 }}>Phi ship noi bo</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1D9E75" }}>Mien phi</span>
            </div>
            <div style={{ borderTop: "1px solid #f0ede8", paddingTop: 14, display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Tong cong</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "#1D9E75" }}>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" onClick={handleOrder} disabled={isPlacing} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: isPlacing ? "#9FE1CB" : "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: isPlacing ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: 0.3 }}>
              {isPlacing ? "Dang xu ly..." : `Dat hang • ${formatPrice(cartTotal)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
