import { formatPrice } from "../../utils/formatPrice";

export default function FoodCard({ food, onAdd }) {
  return (
    <div
      className="food-card"
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #f0ede8",
        opacity: food.available ? 1 : 0.55
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          height: 140,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <img
          src={food.image || "https://via.placeholder.com/300x200"}
          alt={food.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // 🔥 quan trọng
            display: "block"
          }}
        />

        {/* Overlay hết món */}
        {!food.available && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 1
            }}
          >
            HẾT MÓN
          </div>
        )}

        {/* Category */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#fff",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "#1D9E75"
          }}
        >
          {food.category}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1a1a1a",
            marginBottom: 4
          }}
        >
          {food.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#888",
            marginBottom: 12,
            lineHeight: 1.5,
            minHeight: 36 // giữ chiều cao đồng đều
          }}
        >
          {food.description}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "#1D9E75"
            }}
          >
            {formatPrice(food.price)}
          </div>

          <button
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
              fontSize: 13
            }}
          >
            + Thêm
          </button>
        </div>
      </div>
    </div>
  );
}