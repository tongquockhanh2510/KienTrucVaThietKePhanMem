import { useState, useEffect } from "react";

const API = {
  USER_SERVICE: "http://192.168.1.x:8081",
  FOOD_SERVICE: "http://192.168.1.x:8082",
  ORDER_SERVICE: "http://192.168.1.x:8083",
  PAYMENT_SERVICE: "http://192.168.1.x:8084",
};

const MOCK_FOODS = [
  { id: 1, name: "Cơm tấm sườn bì chả", price: 45000, category: "Cơm", image: "🍚", description: "Cơm tấm đặc biệt với sườn nướng, bì và chả trứng", available: true },
  { id: 2, name: "Phở bò tái chín", price: 55000, category: "Phở", image: "🍜", description: "Phở bò thơm ngon với nước dùng hầm 12 tiếng", available: true },
  { id: 3, name: "Bánh mì thịt đặc biệt", price: 30000, category: "Bánh mì", image: "🥖", description: "Bánh mì giòn với đầy đủ nhân đặc biệt", available: true },
  { id: 4, name: "Bún bò Huế", price: 50000, category: "Bún", image: "🍲", description: "Bún bò Huế cay nồng đậm đà hương vị miền Trung", available: true },
  { id: 5, name: "Gỏi cuốn tôm thịt", price: 35000, category: "Gỏi", image: "🥗", description: "Gỏi cuốn tươi mát với tôm và thịt heo luộc", available: true },
  { id: 6, name: "Hủ tiếu Nam Vang", price: 48000, category: "Hủ tiếu", image: "🍝", description: "Hủ tiếu đặc sản với nước dùng trong và ngọt", available: false },
  { id: 7, name: "Chả giò chiên giòn", price: 25000, category: "Khai vị", image: "🥟", description: "Chả giò vàng giòn nhân thịt và rau củ", available: true },
  { id: 8, name: "Nước dừa tươi", price: 20000, category: "Đồ uống", image: "🥤", description: "Dừa tươi mát lạnh giải khát", available: true },
];

const CATEGORIES = ["Tất cả", "Cơm", "Phở", "Bánh mì", "Bún", "Gỏi", "Hủ tiếu", "Khai vị", "Đồ uống"];

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState(MOCK_FOODS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const addToCart = (food) => {
    if (!food.available) return;
    setCart((prev) => {
      const exists = prev.find((i) => i.id === food.id);
      if (exists) return prev.map((i) => i.id === food.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...food, qty: 1 }];
    });
    showNotification(`Đã thêm "${food.name}" vào giỏ hàng!`);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filteredFoods = foods.filter((f) => {
    const matchCat = activeCategory === "Tất cả" || f.category === activeCategory;
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const placeOrder = (paymentMethod) => {
    if (cart.length === 0) return;
    const order = {
      id: `#${String(orders.length + 1).padStart(3, "0")}`,
      items: [...cart],
      total: cartTotal,
      status: "Đang chuẩn bị",
      paymentMethod,
      createdAt: new Date().toLocaleTimeString("vi-VN"),
      user: user?.name,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    showNotification(`Đặt hàng thành công! Mã đơn: ${order.id} — Phương thức: ${paymentMethod}`, "success");
    setTimeout(() => {
      console.log(`[NOTIFICATION] ${user?.name} đã đặt đơn ${order.id} thành công`);
    }, 500);
    setPage("orders");
  };

  if (page === "login") return <LoginPage onLogin={(u) => { setUser(u); setPage("home"); }} onRegister={() => setPage("register")} />;
  if (page === "register") return <RegisterPage onRegister={(u) => { setUser(u); setPage("home"); }} onBack={() => setPage("login")} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: notification.type === "success" ? "#1D9E75" : "#D85A30",
          color: "#fff", padding: "14px 20px", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", maxWidth: 340,
          fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10,
          animation: "slideIn 0.3s ease"
        }}>
          <span style={{ fontSize: 18 }}>{notification.type === "success" ? "✓" : "!"}</span>
          {notification.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .food-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .food-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
        .nav-btn { transition: all 0.15s; }
        .nav-btn:hover { opacity: 0.8; }
        .btn-primary { transition: all 0.15s; }
        .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-primary:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .cat-pill { transition: all 0.15s; cursor: pointer; }
        .cat-pill:hover { opacity: 0.8; }
      `}</style>

      <Navbar user={user} cartCount={cartCount} page={page} setPage={setPage} onLogout={() => { setUser(null); setPage("login"); }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {page === "home" && (
          <HomePage
            user={user}
            foods={filteredFoods}
            allFoods={foods}
            categories={CATEGORIES}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addToCart={addToCart}
          />
        )}
        {page === "cart" && (
          <CartPage cart={cart} updateCartQty={updateCartQty} cartTotal={cartTotal} onPlaceOrder={placeOrder} setPage={setPage} />
        )}
        {page === "orders" && (
          <OrdersPage orders={orders} />
        )}
      </div>
    </div>
  );
}

function Navbar({ user, cartCount, page, setPage, onLogout }) {
  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #f0ede8",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 64, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "#0F6E56", lineHeight: 1 }}>BếpCông Ty</div>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>INTERNAL FOOD ORDER</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "home", label: "🏠 Thực đơn" },
            { key: "orders", label: "📋 Đơn hàng" },
          ].map(({ key, label }) => (
            <button key={key} className="nav-btn" onClick={() => setPage(key)} style={{
              padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: page === key ? "#E1F5EE" : "transparent",
              color: page === key ? "#0F6E56" : "#666",
            }}>{label}</button>
          ))}
          <button className="nav-btn" onClick={() => setPage("cart")} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
            background: page === "cart" ? "#1D9E75" : "#E1F5EE",
            color: page === "cart" ? "#fff" : "#0F6E56",
            position: "relative"
          }}>
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6, background: "#D85A30",
                color: "#fff", borderRadius: "50%", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800
              }}>{cartCount}</span>
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
          <button onClick={onLogout} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #eee", background: "none", color: "#999", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Đăng xuất</button>
        </div>
      </div>
    </nav>
  );
}

function HomePage({ user, foods, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, addToCart, allFoods }) {
  const available = allFoods.filter(f => f.available).length;
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: "linear-gradient(135deg, #1D9E75 0%, #085041 100%)", borderRadius: 20, padding: "32px 36px", marginBottom: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, top: -10, fontSize: 90, opacity: 0.12 }}>🍽️</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Xin chào 👋</div>
        <h1 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>
          {user?.name}!
        </h1>
        <p style={{ margin: "0 0 20px", opacity: 0.85, fontSize: 14 }}>Hôm nay bạn muốn ăn gì? Chúng tôi có {available} món ngon đang phục vụ.</p>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Tổng món", value: allFoods.length },
            { label: "Đang có", value: available },
            { label: "Danh mục", value: categories.length - 1 },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 18px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "11px 14px 11px 42px", borderRadius: 12,
              border: "1.5px solid #e8e4df", background: "#fff", fontSize: 14,
              outline: "none", boxSizing: "border-box", fontFamily: "inherit"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {categories.map((cat) => (
          <button key={cat} className="cat-pill" onClick={() => setActiveCategory(cat)} style={{
            padding: "8px 18px", borderRadius: 30, border: "1.5px solid", whiteSpace: "nowrap",
            fontWeight: 600, fontSize: 13, fontFamily: "inherit",
            background: activeCategory === cat ? "#1D9E75" : "#fff",
            color: activeCategory === cat ? "#fff" : "#555",
            borderColor: activeCategory === cat ? "#1D9E75" : "#e8e4df",
          }}>{cat}</button>
        ))}
      </div>

      {foods.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontWeight: 600 }}>Không tìm thấy món nào</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {foods.map((food) => <FoodCard key={food.id} food={food} onAdd={addToCart} />)}
        </div>
      )}
    </div>
  );
}

function FoodCard({ food, onAdd }) {
  return (
    <div className="food-card" style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      border: "1px solid #f0ede8", opacity: food.available ? 1 : 0.55
    }}>
      <div style={{
        height: 120, background: food.available ? "linear-gradient(135deg, #E1F5EE, #9FE1CB)" : "#f5f5f5",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative"
      }}>
        {food.image}
        {!food.available && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.5
          }}>HẾT MÓN</div>
        )}
        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#1D9E75" }}>
          {food.category}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>{food.name}</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>{food.description}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1D9E75" }}>{formatPrice(food.price)}</div>
          <button className="btn-primary" onClick={() => onAdd(food)} disabled={!food.available} style={{
            padding: "8px 16px", borderRadius: 10, border: "none", cursor: food.available ? "pointer" : "not-allowed",
            background: food.available ? "#1D9E75" : "#ccc", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "inherit"
          }}>+ Thêm</button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, updateCartQty, cartTotal, onPlaceOrder, setPage }) {
  const [paymentMethod, setPaymentMethod] = useState("COD");
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
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 20, color: "#1a1a1a" }}>
        🛒 Giỏ hàng của bạn
      </h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333", marginBottom: 8 }}>Giỏ hàng trống</div>
          <div style={{ color: "#999", marginBottom: 24 }}>Hãy thêm món ăn từ thực đơn nhé!</div>
          <button className="btn-primary" onClick={() => setPage("home")} style={{
            padding: "12px 28px", borderRadius: 12, border: "none", background: "#1D9E75",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit"
          }}>Xem thực đơn</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", overflow: "hidden" }}>
            {cart.map((item, idx) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                borderBottom: idx < cart.length - 1 ? "1px solid #f5f2ed" : "none"
              }}>
                <div style={{ fontSize: 32, width: 48, height: 48, background: "#E1F5EE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.image}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#1D9E75", fontWeight: 600 }}>{formatPrice(item.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => updateCartQty(item.id, -1)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #e0dbd4", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>−</button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #1D9E75", background: "#1D9E75", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>+</button>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", minWidth: 80, textAlign: "right" }}>
                  {formatPrice(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", padding: "20px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#333" }}>💳 Phương thức thanh toán</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "COD", label: "💵 Tiền mặt (COD)", desc: "Thanh toán khi nhận hàng" },
                { value: "Banking", label: "🏦 Chuyển khoản", desc: "Qua ngân hàng / ví điện tử" },
              ].map((m) => (
                <div key={m.value} onClick={() => setPaymentMethod(m.value)} style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${paymentMethod === m.value ? "#1D9E75" : "#e8e4df"}`,
                  background: paymentMethod === m.value ? "#E1F5EE" : "#fafaf8",
                  transition: "all 0.15s"
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: paymentMethod === m.value ? "#0F6E56" : "#333" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#777", fontSize: 14 }}>Tạm tính ({cart.reduce((s, i) => s + i.qty, 0)} món)</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#777", fontSize: 14 }}>Phí ship nội bộ</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1D9E75" }}>Miễn phí 🎉</span>
            </div>
            <div style={{ borderTop: "1px solid #f0ede8", paddingTop: 14, display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "#1D9E75" }}>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" onClick={handleOrder} disabled={isPlacing} style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              background: isPlacing ? "#9FE1CB" : "linear-gradient(135deg, #1D9E75, #0F6E56)",
              color: "#fff", fontWeight: 800, fontSize: 16, cursor: isPlacing ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: 0.3
            }}>
              {isPlacing ? "⏳ Đang xử lý..." : `🍽️ Đặt hàng • ${formatPrice(cartTotal)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersPage({ orders }) {
  const STATUS_COLOR = {
    "Đang chuẩn bị": { bg: "#FAEEDA", color: "#854F0B" },
    "Đang giao": { bg: "#E6F1FB", color: "#185FA5" },
    "Hoàn thành": { bg: "#EAF3DE", color: "#3B6D11" },
    "Đã hủy": { bg: "#FCEBEB", color: "#A32D2D" },
  };
  return (
    <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 20, color: "#1a1a1a" }}>
        📋 Lịch sử đơn hàng
      </h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>Chưa có đơn hàng nào</div>
          <div style={{ color: "#999", marginTop: 8 }}>Hãy đặt món từ thực đơn nhé!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.status] || STATUS_COLOR["Đang chuẩn bị"];
            return (
              <div key={order.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ede8", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f2ed", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>Đơn {order.id}</span>
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
                      <span>{item.image} {item.name} × {item.qty}</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px dashed #e8e4df", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#333" }}>Tổng</span>
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

function LoginPage({ onLogin, onRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Vui lòng nhập đầy đủ thông tin!"); return; }
    setLoading(true);
    try {
      // Real: const res = await axios.post(`${API.USER_SERVICE}/login`, form);
      // Mock:
      await new Promise(r => setTimeout(r, 700));
      onLogin({ name: form.email.split("@")[0], email: form.email, role: form.email.includes("admin") ? "ADMIN" : "USER" });
    } catch {
      setError("Email hoặc mật khẩu không đúng!");
    }
    setLoading(false);
  };

  return <AuthLayout title="Chào mừng trở lại!" subtitle="Đăng nhập để đặt món ăn cho hôm nay">
    <InputField label="Email công ty" type="email" value={form.email} placeholder="ten@congty.com" onChange={v => setForm(p => ({ ...p, email: v }))} />
    <InputField label="Mật khẩu" type="password" value={form.password} placeholder="••••••••" onChange={v => setForm(p => ({ ...p, password: v }))} />
    {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{error}</div>}
    <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{
      width: "100%", padding: 15, borderRadius: 12, border: "none",
      background: "linear-gradient(135deg, #1D9E75, #0F6E56)",
      color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit"
    }}>{loading ? "⏳ Đang đăng nhập..." : "Đăng nhập →"}</button>
    <div style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
      Chưa có tài khoản? <span onClick={onRegister} style={{ color: "#1D9E75", fontWeight: 700, cursor: "pointer" }}>Đăng ký ngay</span>
    </div>
  </AuthLayout>;
}

function RegisterPage({ onRegister, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError("Vui lòng nhập đầy đủ thông tin!"); return; }
    if (form.password !== form.confirm) { setError("Mật khẩu xác nhận không khớp!"); return; }
    setLoading(true);
    try {
      // Real: const res = await axios.post(`${API.USER_SERVICE}/register`, { name: form.name, email: form.email, password: form.password });
      await new Promise(r => setTimeout(r, 700));
      onRegister({ name: form.name, email: form.email, role: "USER" });
    } catch {
      setError("Đăng ký thất bại! Email đã được sử dụng.");
    }
    setLoading(false);
  };

  return <AuthLayout title="Tạo tài khoản mới" subtitle="Đăng ký để bắt đầu đặt món nội bộ">
    <InputField label="Họ và tên" value={form.name} placeholder="Nguyễn Văn A" onChange={v => setForm(p => ({ ...p, name: v }))} />
    <InputField label="Email công ty" type="email" value={form.email} placeholder="ten@congty.com" onChange={v => setForm(p => ({ ...p, email: v }))} />
    <InputField label="Mật khẩu" type="password" value={form.password} placeholder="Tối thiểu 6 ký tự" onChange={v => setForm(p => ({ ...p, password: v }))} />
    <InputField label="Xác nhận mật khẩu" type="password" value={form.confirm} placeholder="Nhập lại mật khẩu" onChange={v => setForm(p => ({ ...p, confirm: v }))} />
    {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{error}</div>}
    <button className="btn-primary" onClick={handleRegister} disabled={loading} style={{
      width: "100%", padding: 15, borderRadius: 12, border: "none",
      background: "linear-gradient(135deg, #1D9E75, #0F6E56)",
      color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit"
    }}>{loading ? "⏳ Đang đăng ký..." : "Đăng ký tài khoản →"}</button>
    <div style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
      Đã có tài khoản? <span onClick={onBack} style={{ color: "#1D9E75", fontWeight: 700, cursor: "pointer" }}>Đăng nhập</span>
    </div>
  </AuthLayout>;
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #E1F5EE 0%, #f8fdf9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style>{`.btn-primary { transition: all 0.15s; } .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); } .btn-primary:active { transform: scale(0.97); }`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #1D9E75, #0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🍽️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#0F6E56" }}>BếpCông Ty</div>
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

function InputField({ label, type = "text", value, placeholder, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#444", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e4df",
          fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
          transition: "border-color 0.15s"
        }}
        onFocus={e => e.target.style.borderColor = "#1D9E75"}
        onBlur={e => e.target.style.borderColor = "#e8e4df"}
      />
    </div>
  );
}
