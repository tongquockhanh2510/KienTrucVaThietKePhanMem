export default function InputField({ label, type = "text", value, placeholder, onChange }) {
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
        onFocus={(e) => {
          e.target.style.borderColor = "#1D9E75";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e8e4df";
        }}
      />
    </div>
  );
}
