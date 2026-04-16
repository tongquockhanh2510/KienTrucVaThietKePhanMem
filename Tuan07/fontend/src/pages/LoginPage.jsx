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

export default function LoginPage({ onLogin, onRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Vui long nhap day du thong tin!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(API.url(API.AUTH_LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Dang nhap that bai. Vui long thu lai.");
        return;
      }

      const accessToken = data.access_token || data.data?.access_token || "";
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : {};

      const apiUser = data.user || data.data?.user || data.data || {};
      onLogin({
        id: apiUser.id ?? apiUser.userId ?? tokenPayload.sub,
        name: apiUser.name || apiUser.username || form.username,
        email: apiUser.email || "",
        role: apiUser.role || "USER",
      });
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("Het thoi gian ket noi den server dang nhap (timeout 10s).");
      } else {
        setError("Khong the ket noi den server dang nhap. Kiem tra mang hoac CORS backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Chao mung tro lai!" subtitle="Dang nhap de dat mon an cho hom nay">
      <InputField label="Ten dang nhap" value={form.username} placeholder="khanh" onChange={(v) => setForm((p) => ({ ...p, username: v }))} />
      <InputField label="Mat khau" type="password" value={form.password} placeholder="••••••••" onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
      {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{error}</div>}
      <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
        {loading ? "Dang dang nhap..." : "Dang nhap ->"}
      </button>
      <div style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
        Chua co tai khoan? <span onClick={onRegister} style={{ color: "#1D9E75", fontWeight: 700, cursor: "pointer" }}>Dang ky ngay</span>
      </div>
    </AuthLayout>
  );
}
