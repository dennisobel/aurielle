import type {
  NuruCreateOrderInput,
  NuruOrder,
  NuruPayment,
  NuruPaymentMethods,
  NuruPaymentStatusResult,
  NuruProduct,
  NuruProductPage,
  NuruShop,
} from "@shared/nuru";

export class ApiError extends Error {
  code: string;
  status: number;
  data: unknown;

  constructor(code: string, message: string, status: number, data?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.error ?? "unknown",
      body.message ?? res.statusText,
      res.status,
      body.data
    );
  }
  return body.data as T;
}

export const getShop = () => api<NuruShop>("/shop");

let paymentMethodsPromise: Promise<NuruPaymentMethods> | null = null;
export const getPaymentMethods = () => {
  if (!paymentMethodsPromise)
    paymentMethodsPromise = api<NuruPaymentMethods>("/payment-methods");
  return paymentMethodsPromise;
};

export type ListProductsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
};

export const listProducts = (params: ListProductsParams = {}) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const suffix = qs.toString();
  return api<NuruProductPage>(`/products${suffix ? `?${suffix}` : ""}`);
};

export const getProduct = (id: string) =>
  api<NuruProduct>(`/products/${encodeURIComponent(id)}`);

let categoriesPromise: Promise<string[]> | null = null;
export const listCategories = () => {
  if (!categoriesPromise) categoriesPromise = api<string[]>("/categories");
  return categoriesPromise;
};

export type CheckoutInput = NuruCreateOrderInput & { idempotency_key: string };

export type CheckoutResult = {
  order: NuruOrder;
  payment: NuruPayment | null;
  manual?: { paybill_number: string; paybill_account_number: string } | null;
};

export const checkout = (input: CheckoutInput) =>
  api<CheckoutResult>("/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getOrder = (id: string) =>
  api<NuruOrder>(`/orders/${encodeURIComponent(id)}`);

export const retryPayment = (
  orderId: string,
  body: { email?: string; phone?: string }
) =>
  api<{
    payment: NuruPayment | null;
    manual?: { paybill_number: string; paybill_account_number: string } | null;
  }>(`/orders/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyPayment = (reference: string, provider: string) =>
  api<NuruPaymentStatusResult>(
    `/payments/${encodeURIComponent(reference)}?provider=${encodeURIComponent(provider)}`
  );
