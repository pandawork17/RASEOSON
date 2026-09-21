const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "baseason_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (isJson && data?.detail) || `요청에 실패했습니다. (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const api = {
  // categories & products
  getCategories: () => request("/api/categories"),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    return request(`/api/products${query ? `?${query}` : ""}`);
  },
  getProduct: (productId) => request(`/api/products/${productId}`),

  // auth
  checkLoginId: (loginId) =>
    request(`/api/auth/check-id?login_id=${encodeURIComponent(loginId)}`),
  checkEmail: (email) =>
    request(`/api/auth/check-email?email=${encodeURIComponent(email)}`),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  getMe: () => request("/api/auth/me", { auth: true }),
  updateMe: (payload) => request("/api/auth/me", { method: "PATCH", body: payload, auth: true }),
  changePassword: (payload) =>
    request("/api/auth/change-password", { method: "POST", body: payload, auth: true }),
  deleteUser: (loginId) => request(`/api/auth/users/${loginId}`, { method: "DELETE" }),


  // addresses
  getAddresses: () => request("/api/addresses", { auth: true }),
  createAddress: (payload) => request("/api/addresses", { method: "POST", body: payload, auth: true }),
  updateAddress: (addressId, payload) =>
    request(`/api/addresses/${addressId}`, { method: "PUT", body: payload, auth: true }),
  setDefaultAddress: (addressId) =>
    request(`/api/addresses/${addressId}/default`, { method: "PATCH", auth: true }),
  deleteAddress: (addressId) => request(`/api/addresses/${addressId}`, { method: "DELETE", auth: true }),

  // orders
  createOrder: (payload) => request("/api/orders", { method: "POST", body: payload, auth: true }),
  getOrders: () => request("/api/orders", { auth: true }),
  getOrder: (orderId) => request(`/api/orders/${orderId}`, { auth: true }),

  // refunds
  getRefundRequests: () => request("/api/refund-requests", { auth: true }),
  createRefundRequest: (payload) =>
    request("/api/refund-requests", { method: "POST", body: payload, auth: true }),

  // notices
  getNotices: () => request("/api/notices"),
  getNotice: (noticeId) => request(`/api/notices/${noticeId}`),

  // inquiries (Q&A)
  getInquiries: (params) => {
    const qs = params?.my_only ? "?my_only=true" : "";
    return request(`/api/inquiries${qs}`, { auth: true });
  },
  getMyInquiries: () => request("/api/inquiries?my_only=true", { auth: true }),
  getInquiry: (inquiryId) => request(`/api/inquiries/${inquiryId}`, { auth: true }),
  createInquiry: (payload) => request("/api/inquiries", { method: "POST", body: payload, auth: true }),
  updateInquiry: (inquiryId, payload) =>
    request(`/api/inquiries/${inquiryId}`, { method: "PUT", body: payload, auth: true }),
  deleteInquiry: (inquiryId) =>
    request(`/api/inquiries/${inquiryId}`, { method: "DELETE", auth: true }),
};


export function getNickname(user) {
  if (!user) return "회원";
  if (user.email && user.email.includes("@")) {
    const prefix = user.email.split("@")[0];
    return prefix.slice(0, 5);
  }
  return (user.user_name || user.login_id || "회원").slice(0, 5);
}

export { ApiError };
