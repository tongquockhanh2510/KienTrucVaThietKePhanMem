import FoodCard from "../components/food/FoodCard";

export default function HomePage({ user, foods, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, addToCart, allFoods, loadingFoods }) {
  const available = allFoods.filter((f) => f.available).length;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: "linear-gradient(135deg, #1D9E75 0%, #085041 100%)", borderRadius: 20, padding: "32px 36px", marginBottom: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, top: -10, fontSize: 90, opacity: 0.12 }}>🍽️</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Xin chao</div>
        <h1 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>{user?.name}!</h1>
        <p style={{ margin: "0 0 20px", opacity: 0.85, fontSize: 14 }}>Hom nay ban muon an gi? Chung toi co {available} mon ngon dang phuc vu.</p>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Tong mon", value: allFoods.length },
            { label: "Dang co", value: available },
            { label: "Danh muc", value: categories.length - 1 },
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
            placeholder="Tim kiem mon an..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "11px 14px 11px 42px", borderRadius: 12, border: "1.5px solid #e8e4df", background: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className="cat-pill"
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              border: "1.5px solid",
              whiteSpace: "nowrap",
              fontWeight: 600,
              fontSize: 13,
              fontFamily: "inherit",
              background: activeCategory === cat ? "#1D9E75" : "#fff",
              color: activeCategory === cat ? "#fff" : "#555",
              borderColor: activeCategory === cat ? "#1D9E75" : "#e8e4df",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loadingFoods ? (
        <div style={{ textAlign: "center", padding: 60, color: "#777", background: "#fff", borderRadius: 16, border: "1px solid #f0ede8" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <div style={{ fontWeight: 600 }}>Dang tai du lieu mon an...</div>
        </div>
      ) : foods.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontWeight: 600 }}>Khong tim thay mon nao</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
