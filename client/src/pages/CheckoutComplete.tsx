import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import type { NuruOrder } from "@shared/nuru";
import StoreHeader from "@/components/StoreHeader";
import { formatMoney } from "@/lib/money";
import * as nuruApi from "@/lib/nuru";
import { ApiError } from "@/lib/nuru";

const MAX_ATTEMPTS = 24;
const POLL_INTERVAL_MS = 2500;

export default function CheckoutComplete() {
  const searchParams = new URLSearchParams(useSearch());
  const orderId = searchParams.get("order") ?? "";
  const paybillNumber = searchParams.get("paybill_number");
  const paybillAccount = searchParams.get("paybill_account_number");
  const paymentError = searchParams.get("payment_error");
  const [order, setOrder] = useState<NuruOrder | null>(null);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  const check = useCallback(async () => {
    if (!orderId) {
      setError("We couldn't find your order reference.");
      return;
    }
    try {
      const data = await nuruApi.getOrder(orderId);
      setOrder(data);
      if (data.payment_status === "unpaid") {
        attempts.current += 1;
        if (attempts.current >= MAX_ATTEMPTS) {
          setTimedOut(true);
        } else {
          window.setTimeout(check, POLL_INTERVAL_MS);
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't check your order status."
      );
    }
  }, [orderId]);

  useEffect(() => {
    setTimedOut(false);
    attempts.current = 0;
    check();
  }, [check]);

  const retryCheck = () => {
    setTimedOut(false);
    attempts.current = 0;
    check();
  };

  if (error)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader minimal />
        <main className="checkout-success">
          <AlertTriangle size={27} />
          <h1>
            We couldn't confirm
            <br />
            <em>your order.</em>
          </h1>
          <p>{error}</p>
          <Link href="/" className="button-primary">
            Return to the collection <ArrowRight size={15} />
          </Link>
        </main>
      </div>
    );

  if (order && order.payment_status !== "unpaid")
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader minimal />
        <main className="checkout-success">
          <div className="success-mark">
            <Check size={27} />
          </div>
          <p className="eyebrow">Thank you for choosing us</p>
          <h1>
            Your order is
            <br />
            <em>confirmed.</em>
          </h1>
          <p>
            Order {order.order_number} is confirmed —{" "}
            {formatMoney(order.total_amount, order.currency)} paid. We'll send a
            note to your inbox with the details.
          </p>
          <Link href="/" className="button-primary">
            Return to the collection <ArrowRight size={15} />
          </Link>
        </main>
      </div>
    );

  if (paybillNumber && paybillAccount && order)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader minimal />
        <main className="checkout-success">
          <p className="eyebrow">One more step</p>
          <h1>
            Complete your payment
            <br />
            <em>via M-Pesa Paybill.</em>
          </h1>
          <p>
            Order {order.order_number} —{" "}
            {formatMoney(order.total_amount, order.currency)} due.
          </p>
          <div
            className="summary-rows"
            style={{ maxWidth: 340, margin: "0 auto", textAlign: "left" }}
          >
            <div>
              <span>Paybill number</span>
              <strong>{paybillNumber}</strong>
            </div>
            <div>
              <span>Account number</span>
              <strong>{paybillAccount}</strong>
            </div>
          </div>
          <p>
            This page checks automatically for a minute — once you've paid, tap
            below to confirm.
          </p>
          <button className="button-primary" onClick={retryCheck}>
            Check payment status <ArrowRight size={15} />
          </button>
        </main>
      </div>
    );

  if (paymentError && order)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader minimal />
        <main className="checkout-success">
          <AlertTriangle size={27} />
          <p className="eyebrow">Order placed</p>
          <h1>
            We couldn't start
            <br />
            <em>your payment.</em>
          </h1>
          <p>
            Order {order.order_number} (
            {formatMoney(order.total_amount, order.currency)}) is saved, but
            payment couldn't be started: {paymentError}
          </p>
          <p>
            Please contact the shop to arrange payment, quoting your order
            number. This page will update automatically if it's confirmed
            another way.
          </p>
          <Link href="/" className="button-primary">
            Return to the collection <ArrowRight size={15} />
          </Link>
        </main>
      </div>
    );

  if (timedOut)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader minimal />
        <main className="checkout-success">
          <Loader2 size={27} />
          <p className="eyebrow">Still confirming</p>
          <h1>
            We're still waiting
            <br />
            <em>on your payment.</em>
          </h1>
          <p>
            {order
              ? `Order ${order.order_number} is placed but not yet confirmed as paid.`
              : "Your order is placed."}{" "}
            This can take a minute — check again, or look out for a confirmation
            email.
          </p>
          <button className="button-primary" onClick={retryCheck}>
            Check again <ArrowRight size={15} />
          </button>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
      <StoreHeader minimal />
      <main className="checkout-success">
        <Loader2 size={27} className="animate-spin" />
        <p className="eyebrow">One moment</p>
        <h1>
          Confirming your
          <br />
          <em>payment.</em>
        </h1>
        <p>Please don't close this page.</p>
      </main>
    </div>
  );
}
