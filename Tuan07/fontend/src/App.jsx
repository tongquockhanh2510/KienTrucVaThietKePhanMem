import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import { API } from "./constants/api";
import { CATEGORIES } from "./constants/categories";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function normalizeVietnamese(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function toVietnameseCategory(rawCategory) {
  const normalized = normalizeVietnamese(rawCategory);

  const map = {
    com: "Cơm",
    pho: "Phở",
    "banh mi": "Bánh mì",
    bun: "Bún",
    goi: "Gỏi",
    "hu tieu": "Hủ tiếu",
    "khai vi": "Khai vị",
    "do uong": "Đồ uống",
    khac: "Khác",
  };

  return map[normalized] || rawCategory || "Khác";
}

function mapFoodItem(item) {
  return {
    id: item.id ?? item._id ?? item.foodId,
    name: item.name ?? item.title ?? item.foodName ?? "Mon an",
    price: Number(item.price ?? item.foodPrice ?? item.amount ?? item.cost ?? item.subtotal ?? 0),
    category: toVietnameseCategory(item.category ?? item.type ?? "Khác"),
    image: item.image ?? item.imageUrl ?? item.icon ?? "🍽️",
    description: item.description ?? item.desc ?? "",
    available: item.available === 1 || item.available === true || item.isAvailable === 1 || item.isAvailable === true,
    qty: Number(item.qty ?? item.quantity ?? 1),
  };
}

function mapOrderItem(item) {
  const mappedItems = (item.items ?? item.products ?? []).map(mapFoodItem);
  const computedTotal = mappedItems.reduce(
    (sum, current) => sum + Number(current.price ?? 0) * Number(current.qty ?? 1),
    0
  );
  return {
    id: item.id ?? item._id ?? `#${Date.now()}`,
    items: mappedItems,
    total: Number(item.totalAmount ?? item.total ?? item.amount ?? computedTotal),
    status: item.status ?? "Dang chuan bi",
    paymentMethod: item.paymentMethod ?? item.payment_method ?? "COD",
    createdAt: item.createdAt ?? item.created_at ?? new Date().toLocaleTimeString("vi-VN"),
    user: item.user ?? item.customerName ?? "",
  };
}

function normalizeApiList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (data.id ?? data._id ?? data.foodId ?? data.orderId) return [data];
  }
  return [];
}

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const loadFoods = async () => {
      setLoadingFoods(true);
      try {
        const res = await fetch(API.url(API.FOOD_SERVICE), {
        });
        const data = await res.json().catch(() => ({}));
        const list = normalizeApiList(data);
        if (Array.isArray(list) && list.length > 0) {
          setFoods(list.map(mapFoodItem));
          return;
        }
        setFoods([]);
      } catch (err) {
        console.error("Khong tai duoc du lieu mon an", err);
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    loadFoods();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(API.url(API.ORDER_SERVICE), {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json().catch(() => ({}));
        const list = normalizeApiList(data);
        if (Array.isArray(list) && list.length > 0) {
          setOrders(list.map(mapOrderItem));
        }
      } catch (err) {
        console.error("Khong tai duoc du lieu don hang", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user]);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const addToCart = (food) => {
    if (!food.available) return;
    setCart((prev) => {
      const exists = prev.find((i) => i.id === food.id);
      if (exists) return prev.map((i) => (i.id === food.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...food, qty: 1 }];
    });
    showNotification(`Da them \"${food.name}\" vao gio hang!`);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filteredFoods = foods.filter((f) => {
    const matchCat =
      normalizeVietnamese(activeCategory) === normalizeVietnamese("Tất cả") ||
      normalizeVietnamese(f.category) === normalizeVietnamese(activeCategory);
    const matchSearch = normalizeVietnamese(f.name).includes(normalizeVietnamese(searchQuery));
    return matchCat && matchSearch;
  });

  const placeOrder = (paymentMethod) => {
    if (cart.length === 0) return;
    const createOrder = async () => {
      const token = localStorage.getItem("access_token");
      const items = cart.map((item) => ({
        foodId: item.id,
        quantity: item.qty,
        foodName: item.name,
        foodPrice: item.price,
      }));
      const res = await fetch(API.url(API.ORDER_SERVICE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user?.id,
          paymentMethod,
          items,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Khong tao duoc don hang");
      }

      const createdOrder = mapOrderItem(data.data ?? data);
      setOrders((prev) => [createdOrder, ...prev]);
      setCart([]);
      showNotification(`Dat hang thanh cong! Ma don: ${createdOrder.id} - Phuong thuc: ${paymentMethod}`);
      setTimeout(() => {
        console.log(`[NOTIFICATION] ${user?.name} da dat don ${createdOrder.id} thanh cong`);
      }, 500);
      setPage("orders");
    };

    createOrder().catch((err) => {
      console.error(err);
      showNotification("Khong the tao don hang tu API. Vui long thu lai.", "error");
    });
  };

  if (page === "login") return <LoginPage onLogin={(u) => { setUser(u); setPage("home"); }} onRegister={() => setPage("register")} />;
  if (page === "register") return <RegisterPage onRegister={(u) => { setUser(u); setPage("home"); }} onBack={() => setPage("login")} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "'Nunito', sans-serif" }}>
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: notification.type === "success" ? "#1D9E75" : "#D85A30",
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            maxWidth: 340,
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideIn 0.3s ease",
          }}
        >
          <span style={{ fontSize: 18 }}>{notification.type === "success" ? "✓" : "!"}</span>
          {notification.msg}
        </div>
      )}

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
            loadingFoods={loadingFoods}
          />
        )}
        {page === "cart" && <CartPage cart={cart} updateCartQty={updateCartQty} cartTotal={cartTotal} onPlaceOrder={placeOrder} setPage={setPage} />}
        {page === "orders" && <OrdersPage orders={orders} loadingOrders={loadingOrders} />}
      </div>
    </div>
  );
}
