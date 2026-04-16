import { useState } from "react";
import { API } from "../constants/api";
import AuthLayout from "../components/auth/AuthLayout";
import InputField from "../components/common/InputField";

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

export default function RegisterPage({ onRegister, onBack }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      setError("Vui long nhap day du thong tin!");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mat khau xac nhan khong khop!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(API.url(API.AUTH_REGISTER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Dang ky that bai. Vui long thu lai.");
        return;
      }

      const accessToken = data.access_token || data.data?.access_token || "";
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : {};

      const apiUser = data.user || data.data?.user || data.data || {};
      onRegister({
        id: apiUser.id ?? apiUser.userId ?? tokenPayload.sub,
        name: apiUser.name || apiUser.username || form.username,
        email: apiUser.email || form.email,
        role: apiUser.role || "USER",
      });
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("Het thoi gian ket noi den server dang ky (timeout 10s).");
      } else {
        setError("Khong the ket noi den server dang ky. Kiem tra mang hoac CORS backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tao tai khoan moi" subtitle="Dang ky de bat dau dat mon noi bo">
      <InputField label="Ten dang nhap" value={form.username} placeholder="khanh" onChange={(v) => setForm((p) => ({ ...p, username: v }))} />
      <InputField label="Email" type="email" value={form.email} placeholder="minh@gmail.com" onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
      <InputField label="Mat khau" type="password" value={form.password} placeholder="Toi thieu 6 ky tu" onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
      <InputField label="Xac nhan mat khau" type="password" value={form.confirm} placeholder="Nhap lai mat khau" onChange={(v) => setForm((p) => ({ ...p, confirm: v }))} />
      {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{error}</div>}
      <button className="btn-primary" onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
        {loading ? "Dang dang ky..." : "Dang ky tai khoan ->"}
      </button>
      <div style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
        Da co tai khoan? <span onClick={onBack} style={{ color: "#1D9E75", fontWeight: 700, cursor: "pointer" }}>Dang nhap</span>
      </div>
    </AuthLayout>
  );
}
