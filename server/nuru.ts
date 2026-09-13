import type {
  NuruCreateOrderInput,
  NuruEnvelope,
  NuruOrder,
  NuruPayment,
  NuruPaymentMethods,
  NuruPaymentStatusResult,
  NuruPriceBand,
  NuruProduct,
  NuruProductPage,
  NuruShop,
} from "@shared/nuru";

export class NuruError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function nuruConfig() {
  const base = process.env.NURU_API_BASE;
  const key = process.env.NURU_SECRET_KEY;
  if (!base || !key) {
    throw new NuruError(
      "not_configured",
      "NURU_API_BASE and NURU_SECRET_KEY must be set",
      500
    );
  }
  return { base: base.replace(/\/+$/, ""), key };
}

async function nuru<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { base, key } = nuruConfig();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as Partial<NuruEnvelope<T>>;
  if (!res.ok || body.success === false) {
    throw new NuruError(
      body.error ?? "unknown",
      body.message ?? res.statusText,
      res.status
    );
  }
  return body.data as T;
}

function query(params: Record<string, string | number | boolean | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const suffix = qs.toString();
  return suffix ? `?${suffix}` : "";
}

export const getShop = () => nuru<NuruShop>("/shop");

export type ListProductsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
};

export const listProducts = (params: ListProductsParams = {}) =>
  nuru<NuruProductPage>(`/products${query(params)}`);

export const getProduct = (id: string) =>
  nuru<NuruProduct>(`/products/${encodeURIComponent(id)}`);

export const listCategories = () => nuru<string[]>("/categories");

// The shop's connected rail changes rarely (only when its staff reconnect or switch
// providers), so cache it briefly rather than calling Nuru before every checkout.
const PAYMENT_METHODS_TTL_MS = 5 * 60 * 1000;
let paymentMethodsCache: {
  data: NuruPaymentMethods;
  expiresAt: number;
} | null = null;

export async function getPaymentMethods(): Promise<NuruPaymentMethods> {
  if (paymentMethodsCache && paymentMethodsCache.expiresAt > Date.now()) {
    return paymentMethodsCache.data;
  }
  const data = await nuru<NuruPaymentMethods>("/payment-methods");
  paymentMethodsCache = {
    data,
    expiresAt: Date.now() + PAYMENT_METHODS_TTL_MS,
  };
  return data;
}

export const createOrder = (
  body: NuruCreateOrderInput,
  idempotencyKey: string
) =>
  nuru<NuruOrder>("/orders", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });

export const getOrder = (id: string) =>
  nuru<NuruOrder>(`/orders/${encodeURIComponent(id)}`);

export type PayInput = {
  return_origin?: string;
  return_path?: string;
  email?: string;
  phone?: string;
};

export const payWithPesapal = (orderId: string, body: PayInput) =>
  nuru<NuruPayment>(`/orders/${encodeURIComponent(orderId)}/pay/pesapal`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const payWithCard = (orderId: string, body: PayInput) =>
  nuru<NuruPayment>(`/orders/${encodeURIComponent(orderId)}/pay/card`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const payWithMpesa = (
  orderId: string,
  body: Pick<PayInput, "email" | "phone">
) =>
  nuru<NuruPayment>(`/orders/${encodeURIComponent(orderId)}/pay/mpesa`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyPayment = (reference: string, provider: string) =>
  nuru<NuruPaymentStatusResult>(
    `/payments/${encodeURIComponent(reference)}?provider=${encodeURIComponent(provider)}`
  );

export type { NuruPriceBand };
