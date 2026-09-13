import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LocateFixed,
  LockKeyhole,
  MapPin,
  X,
} from "lucide-react";
import { Link } from "wouter";
import type {
  NuruDeliverySlot,
  NuruDeliveryWindow,
  NuruPaymentMethods,
} from "@shared/nuru";
import StoreHeader from "@/components/StoreHeader";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/money";
import * as nuruApi from "@/lib/nuru";
import { ApiError } from "@/lib/nuru";
import {
  SLOT_OPTIONS,
  buildDeliveryWindow,
  formatWindowChip,
  tomorrowISODate,
  windowKey,
} from "@/lib/deliveryWindows";

function paymentCopy(methods: NuruPaymentMethods | null) {
  if (!methods)
    return "You'll be redirected to a secure payment page to finish paying.";
  switch (methods.collection_method) {
    case "mpesa_daraja":
      return methods.mpesa_daraja?.connected
        ? "You'll get an M-Pesa prompt on your phone to complete payment."
        : "We'll show you M-Pesa Paybill details after you place your order.";
    case "paystack":
      return methods.paystack?.connected
        ? "You'll be redirected to a secure page to pay by card or mobile money."
        : "We'll show you M-Pesa Paybill details after you place your order.";
    case "pesapal":
      return methods.pesapal?.connected
        ? "You'll be redirected to a secure page to pay by card, mobile money, or bank."
        : "We'll show you M-Pesa Paybill details after you place your order.";
    default:
      return "We'll show you M-Pesa Paybill details after you place your order.";
  }
}

export default function CheckoutPage() {
  const { items, subtotal, currency, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethods, setPaymentMethods] =
    useState<NuruPaymentMethods | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "done" | "denied"
  >("idle");
  const [selectedWindows, setSelectedWindows] = useState<NuruDeliveryWindow[]>(
    []
  );
  const [pickerDate, setPickerDate] = useState(tomorrowISODate());
  const [pickerSlot, setPickerSlot] = useState<NuruDeliverySlot>("morning");
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const needsPhone =
    paymentMethods?.collection_method === "mpesa_daraja" &&
    paymentMethods.mpesa_daraja?.connected;

  useEffect(() => {
    nuruApi
      .getPaymentMethods()
      .then(setPaymentMethods)
      .catch(() => setPaymentMethods(null));
  }, []);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("done");
      },
      () => setLocationStatus("denied")
    );
  };

  const addWindow = () => {
    if (!pickerDate) return;
    const window = buildDeliveryWindow(pickerDate, pickerSlot);
    const key = windowKey(window.date, window.slot);
    setSelectedWindows(current =>
      current.some(w => windowKey(w.date, w.slot) === key)
        ? current
        : [...current, window]
    );
  };

  const removeWindow = (key: string) => {
    setSelectedWindows(current =>
      current.filter(w => windowKey(w.date, w.slot) !== key)
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const shippingAddress = [address, city].filter(Boolean).join(", ");

    try {
      const { order, payment, manual } = await nuruApi.checkout({
        customer: {
          email,
          name: `${firstName} ${lastName}`.trim(),
          phone,
          address: shippingAddress,
        },
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        notes: notes || undefined,
        idempotency_key: idempotencyKey,
        delivery_latitude: coords?.lat,
        delivery_longitude: coords?.lng,
        preferred_delivery_windows:
          selectedWindows.length > 0 ? selectedWindows : undefined,
      });
      clearCart();
      if (manual !== undefined) {
        const params = new URLSearchParams({ order: order.id });
        if (manual) {
          params.set("paybill_number", manual.paybill_number);
          params.set("paybill_account_number", manual.paybill_account_number);
        } else {
          params.set(
            "payment_error",
            "This shop hasn't finished setting up a payment method yet."
          );
        }
        window.location.href = `/checkout/complete?${params}`;
      } else if (payment?.provider === "pesapal") {
        window.location.href = payment.redirect_url;
      } else if (payment?.provider === "card") {
        window.location.href = payment.authorization_url;
      } else {
        // M-Pesa STK push: no redirect, the completion page polls the order.
        window.location.href = `/checkout/complete?order=${order.id}`;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const orderId = (err.data as { order?: { id: string } } | undefined)
          ?.order?.id;
        if (orderId) {
          clearCart();
          const params = new URLSearchParams({
            order: orderId,
            payment_error: err.message,
          });
          window.location.href = `/checkout/complete?${params}`;
          return;
        }
        setError(err.message);
      } else {
        setError("Something went wrong placing your order. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
      <StoreHeader minimal />
      <main className="container checkout-page">
        {items.length === 0 ? (
          <div className="checkout-empty">
            <h1>Your bag is empty.</h1>
            <Link href="/" className="button-primary">
              Return to collection <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <section className="checkout-form">
              <Link href="/cart" className="back-link">
                <ArrowLeft size={15} /> Back to bag
              </Link>
              <div className="checkout-title">
                <p className="eyebrow">Almost yours</p>
                <h1>Complete your order.</h1>
                <p>We keep checkout simple, secure, and considered.</p>
              </div>
              <form onSubmit={submit}>
                <div className="checkout-section">
                  <div className="checkout-section-heading">
                    <span>01</span>
                    <div>
                      <h2>Contact</h2>
                      <p>We'll use this to send your order updates.</p>
                    </div>
                  </div>
                  <label>
                    Email address
                    <input
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                  <label>
                    Phone number{needsPhone ? " (required for M-Pesa)" : ""}
                    <input
                      type="tel"
                      value={phone}
                      onChange={event => setPhone(event.target.value)}
                      placeholder="e.g. 255712345678"
                      required={needsPhone}
                    />
                  </label>
                </div>
                <div className="checkout-section">
                  <div className="checkout-section-heading">
                    <span>02</span>
                    <div>
                      <h2>Delivery</h2>
                      <p>Where should we send your order?</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <label>
                      First name
                      <input
                        required
                        value={firstName}
                        onChange={event => setFirstName(event.target.value)}
                        placeholder="First name"
                      />
                    </label>
                    <label>
                      Last name
                      <input
                        required
                        value={lastName}
                        onChange={event => setLastName(event.target.value)}
                        placeholder="Last name"
                      />
                    </label>
                  </div>
                  <label>
                    Address
                    <input
                      required
                      value={address}
                      onChange={event => setAddress(event.target.value)}
                      placeholder="Street address"
                    />
                  </label>
                  <label>
                    City
                    <input
                      required
                      value={city}
                      onChange={event => setCity(event.target.value)}
                      placeholder="City"
                    />
                  </label>
                  <label>
                    Notes for your order (optional)
                    <input
                      value={notes}
                      onChange={event => setNotes(event.target.value)}
                      placeholder="Delivery instructions"
                    />
                  </label>
                  <div className="delivery-note">
                    <MapPin size={16} />
                    <span>
                      <strong>Tracked delivery</strong>We'll share updates as
                      your order moves.
                    </span>
                  </div>
                  <div className="checkout-location">
                    <button
                      type="button"
                      className="button-quiet"
                      onClick={locate}
                    >
                      <LocateFixed size={15} />{" "}
                      {locationStatus === "locating"
                        ? "Locating…"
                        : "Share my exact location"}
                    </button>
                    {locationStatus === "done" && (
                      <span className="location-status">
                        Location captured — helps us route your delivery.
                      </span>
                    )}
                    {locationStatus === "denied" && (
                      <span className="location-status">
                        Couldn't get your location — your address above will be
                        used instead.
                      </span>
                    )}
                  </div>
                  <div className="delivery-windows">
                    <p className="option-heading">
                      <span>Preferred delivery time (optional)</span>
                    </p>
                    <div className="delivery-window-picker">
                      <label>
                        Date
                        <input
                          type="date"
                          min={tomorrowISODate()}
                          value={pickerDate}
                          onChange={event => setPickerDate(event.target.value)}
                        />
                      </label>
                      <label>
                        Time window
                        <select
                          value={pickerSlot}
                          onChange={event =>
                            setPickerSlot(
                              event.target.value as NuruDeliverySlot
                            )
                          }
                        >
                          {SLOT_OPTIONS.map(option => (
                            <option key={option.slot} value={option.slot}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="button-quiet"
                        onClick={addWindow}
                      >
                        Add option
                      </button>
                    </div>
                    {selectedWindows.length > 0 && (
                      <div className="active-filter-chips">
                        <span className="active-chip-label">Selected</span>
                        {selectedWindows.map(window => (
                          <button
                            type="button"
                            key={windowKey(window.date, window.slot)}
                            onClick={() =>
                              removeWindow(windowKey(window.date, window.slot))
                            }
                          >
                            {formatWindowChip(window)} <X size={11} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="checkout-section">
                  <div className="checkout-section-heading">
                    <span>03</span>
                    <div>
                      <h2>Payment</h2>
                      <p>{paymentCopy(paymentMethods)}</p>
                    </div>
                  </div>
                  {error && (
                    <p style={{ color: "#b3452f", fontSize: 13 }}>{error}</p>
                  )}
                </div>
                <button
                  className="button-primary checkout-submit"
                  type="submit"
                  disabled={submitting}
                >
                  <LockKeyhole size={15} />{" "}
                  {submitting
                    ? "Placing order…"
                    : `Place order · ${formatMoney(subtotal, currency)}`}{" "}
                  <ArrowRight size={15} />
                </button>
              </form>
            </section>
            <aside className="checkout-summary">
              <p className="eyebrow">In your bag</p>
              <h2>Order summary</h2>
              <div className="checkout-items">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="checkout-item-image">
                      <img src={item.image} alt={item.name} />
                      <span>{item.quantity}</span>
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.manufacturer || item.category}</p>
                    </div>
                    <b>
                      {formatMoney(item.price * item.quantity, item.currency)}
                    </b>
                  </div>
                ))}
              </div>
              <div className="summary-rows">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatMoney(subtotal, currency)}</strong>
                </div>
                <div>
                  <span>Tax</span>
                  <strong>Calculated at checkout</strong>
                </div>
              </div>
              <p className="checkout-trust">
                ✦ Your payment details are encrypted and protected.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
