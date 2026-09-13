export type NuruEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

export type NuruPriceBand = {
  min_qty: number;
  max_qty: number | null;
  unit_price: number;
};

export type NuruStockLevel = "in_stock" | "low_stock" | "out_of_stock";

export type NuruProduct = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  barcode: string;
  manufacturer: string;
  unit_of_measure: string;
  pack_size: string;
  net_content: string;
  country_of_origin: string;
  price: number;
  currency: string;
  tax_rate: number;
  moq: number;
  weight_kg: number;
  volume_m3: number;
  attributes?: Record<string, string>;
  price_bands: NuruPriceBand[];
  in_stock: boolean;
  stock_level: NuruStockLevel;
};

export type NuruProductPage = {
  items: NuruProduct[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type NuruShop = {
  id: string;
  name: string;
  slug: string;
  shop_description: string;
  logo_url: string;
  country: string;
  currency: string;
};

export type NuruOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type NuruOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type NuruPaymentStatus = "unpaid" | "partial" | "paid";

export type NuruDeliverySlot = "morning" | "afternoon" | "evening";

export type NuruDeliveryWindow = {
  date: string;
  slot: NuruDeliverySlot;
  label: string;
  start_time: string;
  end_time: string;
};

export type NuruOrder = {
  id: string;
  order_number: string;
  status: NuruOrderStatus;
  payment_status: NuruPaymentStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  currency: string;
  items: NuruOrderItem[];
  delivery_latitude?: number;
  delivery_longitude?: number;
  preferred_delivery_windows?: NuruDeliveryWindow[];
  created_at: string;
};

export type NuruCustomerInput = {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
};

export type NuruOrderItemInput = { product_id: string; quantity: number };

// mpesa_paybill: manual till/paybill payment (no online charge). paystack: card/mobile
// money via Paystack's hosted page. pesapal: card/mobile money/bank via Pesapal's hosted
// page. mpesa_daraja: M-Pesa STK push. credit: invoiced, settled outside the storefront.
export type NuruOrderPaymentMethod =
  | "mpesa_paybill"
  | "paystack"
  | "pesapal"
  | "mpesa_daraja"
  | "credit";

export type NuruCreateOrderInput = {
  customer: NuruCustomerInput;
  items: NuruOrderItemInput[];
  shipping_address?: string;
  notes?: string;
  payment_method?: NuruOrderPaymentMethod;
  delivery_latitude?: number;
  delivery_longitude?: number;
  preferred_delivery_windows?: NuruDeliveryWindow[];
};

// The single online rail a shop has connected, from GET /payment-methods. Only the
// matching sub-object is present; `paybill` has no online endpoint — show manual
// instructions instead of a pay button when collection_method is "paybill" or the
// matching sub-object reports connected: false.
export type NuruCollectionMethod =
  | "paybill"
  | "paystack"
  | "pesapal"
  | "mpesa_daraja";

export type NuruPaymentMethods = {
  collection_method: NuruCollectionMethod;
  country: string;
  paystack?: { connected: boolean; public_key?: string };
  pesapal?: { connected: boolean };
  mpesa_daraja?: { connected: boolean };
  paybill?: { paybill_number: string; paybill_account_number: string };
};

export type NuruPaymentProvider = "pesapal" | "card" | "mpesa";

export type NuruPesapalPayment = {
  provider: "pesapal";
  reference: string;
  order_tracking_id: string;
  redirect_url: string;
};

export type NuruCardPayment = {
  provider: "card";
  reference: string;
  access_code: string;
  authorization_url: string;
  public_key: string;
};

export type NuruMpesaPayment = {
  provider: "mpesa";
  reference: string;
  checkout_request_id: string;
  display_text: string;
};

export type NuruPayment =
  | NuruPesapalPayment
  | NuruCardPayment
  | NuruMpesaPayment;

export type NuruPaymentStatusResult = { reference: string; status: string };

export const NURU_ERROR_MESSAGES: Record<string, string> = {
  invalid_api_key: "This shop's storefront connection is not set up correctly.",
  plan_upgrade_required:
    "This feature isn't available on the shop's current plan.",
  product_not_found: "One of those items is no longer available.",
  insufficient_stock: "Sorry — one of those items just went out of stock.",
  below_moq: "One of those items has a minimum order quantity that wasn't met.",
  credit_limit_exceeded: "This order exceeds the customer's credit limit.",
  company_not_provisioned:
    "This shop isn't fully set up to receive orders yet.",
  order_not_found: "We couldn't find that order.",
  already_paid: "This order has already been paid.",
  return_origin_not_allowed: "Payment could not be started from this address.",
  currency_not_supported:
    "That payment method isn't available for this shop's currency.",
  payment_failed:
    "The payment provider couldn't process this — please try again.",
  invalid_request: "Something about that request wasn't valid.",
};
