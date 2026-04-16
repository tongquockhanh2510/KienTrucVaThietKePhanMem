import { formatPrice } from "../../utils/formatPrice";

export default function FoodCard({ food, onAdd }) {
  return (
    <div className="food-card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #f0ede8", opacity: food.available ? 1 : 0.55 }}>
      <div
        style={{
          height: 120,
          background: food.available ? "linear-gradient(135deg, #E1F5EE, #9FE1CB)" : "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          position: "relative",
        }}
      >
        
        <img src={`${food.image}`} alt="" />
        {!food.available && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
            }}
          >
            HET MON
          </div>
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
          <button
            className="btn-primary"
            onClick={() => onAdd(food)}
            disabled={!food.available}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              cursor: food.available ? "pointer" : "not-allowed",
              background: food.available ? "#1D9E75" : "#ccc",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            + Them
          </button>
        </div>
      </div>
    </div>
  );
}
