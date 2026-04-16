export const API = {
  BASE_URL: import.meta.env.VITE_API_GATEWAY_URL || "",
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  FOOD_SERVICE: "/food",
  ORDER_SERVICE: "/orders",
  PAYMENT_SERVICE: "/payments",
  url(path) {
    return `${this.BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  },
};
