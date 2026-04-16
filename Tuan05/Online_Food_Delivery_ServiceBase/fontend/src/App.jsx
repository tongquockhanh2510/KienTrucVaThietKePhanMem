import { useEffect, useMemo, useState } from 'react';
import api from './api';

function App() {
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [newFood, setNewFood] = useState({ name: '', description: '', price: '' });

  const cartTotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart.items]
  );

  const summaryCards = [
    { label: 'Mon an', value: foods.length, hint: 'Lay tu menu-service' },
    { label: 'Mon trong gio', value: cart.items.length, hint: 'Lam viec qua cart-service' },
    { label: 'Don hang', value: orders.length, hint: 'Luu trong order-service' }
  ];

  const latestOrders = orders.slice(0, 3);

  const loadAll = async () => {
    const [foodsRes, cartRes, ordersRes] = await Promise.all([
      api.get('/foods'),
      api.get('/cart'),
      api.get('/orders')
    ]);
    setFoods(foodsRes.data);
    setCart(cartRes.data);
    setOrders(ordersRes.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createFood = async (event) => {
    event.preventDefault();
    if (!newFood.name || !newFood.price) {
      return;
    }

    await api.post('/foods', { ...newFood, price: Number(newFood.price) });
    setNewFood({ name: '', description: '', price: '' });
    await loadAll();
  };

  const addToCart = async (foodId) => {
    await api.post('/cart/items', { foodId, quantity: 1 });
    await loadAll();
  };

  const updateQuantity = async (foodId, quantity) => {
    await api.patch(`/cart/items/${foodId}`, { quantity: Number(quantity) });
    await loadAll();
  };

  const removeItem = async (foodId) => {
    await api.delete(`/cart/items/${foodId}`);
    await loadAll();
  };

  const checkout = async () => {
    await api.post('/orders/checkout');
    await loadAll();
  };

  return (
    <div className="page-shell">
      <header className="hero card service-hero">
        <div className="hero-copy">
          <span className="eyebrow">Service-based architecture</span>
          <h1>Online Food Delivery</h1>
          <p>
            Frontend goi Gateway, sau do dieu huong qua tung microservice rieng.
            Cac chuc nang van giu nguyen, nhung kien truc ro rang hon.
          </p>
        </div>

        <div className="hero-badges">
          <div className="badge-card">
            <span>Gateway</span>
            <strong>Port 6000</strong>
          </div>
          <div className="badge-card">
            <span>Services</span>
            <strong>menu / cart / order</strong>
          </div>
          <div className="badge-card">
            <span>Frontend</span>
            <strong>ReactJS</strong>
          </div>
        </div>
      </header>

      <section className="stats-grid">
        {summaryCards.map((card) => (
          <article className="stat-card card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.hint}</small>
          </article>
        ))}
      </section>

      <div className="content-grid">
        <main className="main-column">
          <section className="card section-card">
            <div className="section-head">
              <div>
                <span className="section-kicker">Step 1</span>
                <h2>Quan ly mon an</h2>
              </div>
              <p>Du lieu duoc dieu phoi qua gateway den menu-service.</p>
            </div>

            <form className="form" onSubmit={createFood}>
              <input
                placeholder="Ten mon"
                value={newFood.name}
                onChange={(e) => setNewFood((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                placeholder="Mo ta ngan"
                value={newFood.description}
                onChange={(e) => setNewFood((prev) => ({ ...prev, description: e.target.value }))}
              />
              <input
                placeholder="Gia"
                type="number"
                min="0"
                value={newFood.price}
                onChange={(e) => setNewFood((prev) => ({ ...prev, price: e.target.value }))}
              />
              <button type="submit">Them mon</button>
            </form>

            <div className="grid">
              {foods.length === 0 ? (
                <div className="empty-state">Chua co mon an nao. Hay them mon dau tien.</div>
              ) : (
                foods.map((food) => (
                  <article key={food._id} className="food-item">
                    <div className="food-topline">
                      <h3>{food.name}</h3>
                      <span className="price-chip">{food.price.toLocaleString()} VND</span>
                    </div>
                    <p>{food.description || 'Khong co mo ta'}</p>
                    <button onClick={() => addToCart(food._id)}>Them vao gio</button>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="card section-card">
            <div className="section-head">
              <div>
                <span className="section-kicker">Step 3</span>
                <h2>Dat hang</h2>
              </div>
              <p>Checkout se goi order-service va tu dong xoa gio hang.</p>
            </div>

            <div className="section-toolbar">
              <button className="primary-button" disabled={cart.items.length === 0} onClick={checkout}>
                Checkout
              </button>
              <span className="muted-text">Tong don: {orders.length}</span>
            </div>

            <div className="orders">
              {latestOrders.length === 0 ? (
                <div className="empty-state">Chua co don hang nao.</div>
              ) : (
                latestOrders.map((order) => (
                  <article key={order._id} className="order-item">
                    <div className="order-head">
                      <h3>Don #{order._id.slice(-6)}</h3>
                      <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                    <strong>{order.totalAmount.toLocaleString()} VND</strong>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>

        <aside className="side-column">
          <section className="card section-card sticky-card service-sidebar">
            <div className="section-head">
              <div>
                <span className="section-kicker">Step 2</span>
                <h2>Gio hang</h2>
              </div>
              <p>Quan ly mon trong gio thong qua cart-service.</p>
            </div>

            {cart.items.length === 0 ? <div className="empty-state">Gio hang rong.</div> : null}

            <div className="cart-list">
              {cart.items.map((item) => (
                <div className="cart-row" key={item.foodId}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.price.toLocaleString()} VND / phan</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.foodId, e.target.value)}
                  />
                  <span className="cart-sum">{(item.price * item.quantity).toLocaleString()} VND</span>
                  <button className="ghost-button" onClick={() => removeItem(item.foodId)}>Xoa</button>
                </div>
              ))}
            </div>

            <div className="total-panel">
              <span>Tong tien</span>
              <strong>{cartTotal.toLocaleString()} VND</strong>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
