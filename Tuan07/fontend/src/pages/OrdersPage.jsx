import { formatPrice } from "../utils/formatPrice";

const STATUS_COLOR = {
  "Dang chuan bi": { bg: "#FAEEDA", color: "#854F0B" },
  "Dang giao": { bg: "#E6F1FB", color: "#185FA5" },
  "Hoan thanh": { bg: "#EAF3DE", color: "#3B6D11" },
  "Da huy": { bg: "#FCEBEB", color: "#A32D2D" },
};

export default function OrdersPage({ orders, loadingOrders }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 20, color: "#1a1a1a" }}>Lich su don hang</h2>

      {loadingOrders ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⏳</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>Dang tai don hang...</div>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>Chua co don hang nao</div>
          <div style={{ color: "#999", marginTop: 8 }}>Hay dat mon tu thuc don nhe!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.status] || STATUS_COLOR["Dang chuan bi"];
            return (
              <div key={order.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f2ed", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>Don {order.id}</span>
                    <span style={{ marginLeft: 12, fontSize: 13, color: "#aaa" }}>🕐 {order.createdAt}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>{order.status}</span>
                    <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#f5f2ed", color: "#666" }}>{order.paymentMethod}</span>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", color: "#444" }}>
                      <span>{item.image} {item.name} x {item.qty}</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px dashed #e8e4df", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#333" }}>Tong</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#1D9E75" }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
