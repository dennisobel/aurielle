import { randomUUID } from "crypto";
import { Router, type Request, type Response } from "express";
import type {
  NuruCustomerInput,
  NuruDeliveryWindow,
  NuruOrderPaymentMethod,
  NuruPayment,
  NuruPaymentMethods,
} from "@shared/nuru";
import * as nuru from "./nuru";

export const apiRouter = Router();

function fail(res: Response, err: unknown) {
  if (err instanceof nuru.NuruError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message, error: err.code });
  }
  console.error(err);
  return res
    .status(500)
    .json({
      success: false,
      message: "Unexpected server error",
      error: "internal_error",
    });
}

// The shop has exactly one connected online rail (or none, in which case payment is
// manual via paybill). This is always derived from Nuru's own /payment-methods, never
// from client input, so a stale or spoofed client value can't route a charge to the
// wrong provider.
function paymentMethodFor(methods: NuruPaymentMethods): NuruOrderPaymentMethod {
  if (methods.collection_method === "pesapal" && methods.pesapal?.connected)
    return "pesapal";
  if (methods.collection_method === "paystack" && methods.paystack?.connected)
    return "paystack";
  if (
    methods.collection_method === "mpesa_daraja" &&
    methods.mpesa_daraja?.connected
  )
    return "mpesa_daraja";
  return "mpesa_paybill";
}

type PaymentDispatch =
  | {
      kind: "online";
      run: (
        contact: { email?: string; phone?: string },
        returnPath: string
      ) => Promise<NuruPayment>;
    }
  | {
      kind: "manual";
      info: { paybill_number: string; paybill_account_number: string } | null;
    };

function dispatchFor(
  orderId: string,
  methods: NuruPaymentMethods
): PaymentDispatch {
  if (methods.collection_method === "pesapal" && methods.pesapal?.connected) {
    return {
      kind: "online",
      run: (contact, returnPath) =>
        nuru.payWithPesapal(orderId, {
          return_origin: process.env.NURU_RETURN_ORIGIN,
          return_path: returnPath,
          ...contact,
        }),
    };
  }
  if (methods.collection_method === "paystack" && methods.paystack?.connected) {
    return {
      kind: "online",
      run: (contact, returnPath) =>
        nuru.payWithCard(orderId, {
          return_origin: process.env.NURU_RETURN_ORIGIN,
          return_path: returnPath,
          ...contact,
        }),
    };
  }
  if (
    methods.collection_method === "mpesa_daraja" &&
    methods.mpesa_daraja?.connected
  ) {
    return {
      kind: "online",
      run: contact => nuru.payWithMpesa(orderId, contact),
    };
  }
  return { kind: "manual", info: methods.paybill ?? null };
}

apiRouter.get("/shop", async (_req, res) => {
  try {
    res.json({ success: true, data: await nuru.getShop() });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/payment-methods", async (_req, res) => {
  try {
    res.json({ success: true, data: await nuru.getPaymentMethods() });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/products", async (req: Request, res: Response) => {
  try {
    const { page, per_page, search, category, min_price, max_price, in_stock } =
      req.query;
    const data = await nuru.listProducts({
      page: page ? Number(page) : undefined,
      per_page: per_page ? Number(per_page) : undefined,
      search: typeof search === "string" ? search : undefined,
      category: typeof category === "string" ? category : undefined,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      in_stock: in_stock === "true" ? true : undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/products/:id", async (req, res) => {
  try {
    res.json({ success: true, data: await nuru.getProduct(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/categories", async (_req, res) => {
  try {
    res.json({ success: true, data: await nuru.listCategories() });
  } catch (err) {
    fail(res, err);
  }
});

function isDeliveryWindows(value: unknown): value is NuruDeliveryWindow[] {
  return (
    Array.isArray(value) &&
    value.every(
      w =>
        w &&
        typeof w.date === "string" &&
        typeof w.slot === "string" &&
        typeof w.label === "string" &&
        typeof w.start_time === "string" &&
        typeof w.end_time === "string"
    )
  );
}

apiRouter.post("/checkout", async (req: Request, res: Response) => {
  const {
    customer,
    items,
    shipping_address,
    notes,
    idempotency_key,
    delivery_latitude,
    delivery_longitude,
    preferred_delivery_windows,
  } = req.body ?? {};

  const email =
    typeof customer?.email === "string" ? customer.email.trim() : "";
  if (!email || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({
        success: false,
        message: "customer.email and items are required",
        error: "invalid_request",
      });
  }

  const customerInput: NuruCustomerInput = {
    email,
    name: typeof customer?.name === "string" ? customer.name : undefined,
    phone: typeof customer?.phone === "string" ? customer.phone : undefined,
    address:
      typeof customer?.address === "string" ? customer.address : undefined,
  };

  let methods;
  try {
    methods = await nuru.getPaymentMethods();
  } catch (err) {
    return fail(res, err);
  }

  let order;
  try {
    order = await nuru.createOrder(
      {
        customer: customerInput,
        items: items.map((item: { product_id: string; quantity: number }) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address:
          typeof shipping_address === "string" ? shipping_address : undefined,
        notes: typeof notes === "string" ? notes : undefined,
        payment_method: paymentMethodFor(methods),
        delivery_latitude:
          typeof delivery_latitude === "number" ? delivery_latitude : undefined,
        delivery_longitude:
          typeof delivery_longitude === "number"
            ? delivery_longitude
            : undefined,
        preferred_delivery_windows: isDeliveryWindows(
          preferred_delivery_windows
        )
          ? preferred_delivery_windows
          : undefined,
      },
      typeof idempotency_key === "string" && idempotency_key
        ? idempotency_key
        : randomUUID()
    );
  } catch (err) {
    return fail(res, err);
  }

  const dispatch = dispatchFor(order.id, methods);
  if (dispatch.kind === "manual") {
    return res
      .status(201)
      .json({
        success: true,
        data: { order, payment: null, manual: dispatch.info },
      });
  }

  try {
    const payment = await dispatch.run(
      { email: customerInput.email, phone: customerInput.phone },
      `/checkout/complete?order=${order.id}`
    );
    res.status(201).json({ success: true, data: { order, payment } });
  } catch (err) {
    const status = err instanceof nuru.NuruError ? err.status : 502;
    const message =
      err instanceof nuru.NuruError ? err.message : "Could not start payment";
    const code = err instanceof nuru.NuruError ? err.code : "payment_failed";
    res
      .status(status)
      .json({ success: false, message, error: code, data: { order } });
  }
});

apiRouter.post("/orders/:id/pay", async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body ?? {};
    const methods = await nuru.getPaymentMethods();
    const dispatch = dispatchFor(req.params.id, methods);
    if (dispatch.kind === "manual") {
      return res.json({
        success: true,
        data: { payment: null, manual: dispatch.info },
      });
    }
    const payment = await dispatch.run(
      { email, phone },
      `/checkout/complete?order=${req.params.id}`
    );
    res.json({ success: true, data: { payment } });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/orders/:id", async (req, res) => {
  try {
    res.json({ success: true, data: await nuru.getOrder(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
});

apiRouter.get("/payments/:reference", async (req: Request, res: Response) => {
  try {
    const provider =
      typeof req.query.provider === "string" ? req.query.provider : "pesapal";
    res.json({
      success: true,
      data: await nuru.verifyPayment(req.params.reference, provider),
    });
  } catch (err) {
    fail(res, err);
  }
});
