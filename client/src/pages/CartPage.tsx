import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import StoreHeader from "@/components/StoreHeader";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    currency,
    itemCount,
    setDrawerOpen,
  } = useCart();
  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
      <StoreHeader />
      <main className="container cart-page">
        <div className="cart-page-heading">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1>
              Shopping bag <span>({itemCount})</span>
            </h1>
          </div>
          <Link href="/" className="back-link">
            Continue shopping <ArrowRight size={15} />
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="cart-page-empty">
            <ShoppingBag size={30} />
            <h2>Your bag is waiting.</h2>
            <p>Find the piece that feels like it was made for you.</p>
            <Link href="/" className="button-primary">
              Explore the collection <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="cart-page-layout">
            <section>
              <div className="cart-page-list">
                {items.map(item => (
                  <article className="cart-page-line" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-page-line-copy">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="eyebrow">{item.category}</p>
                          <h2>{item.name}</h2>
                          <p>{item.manufacturer}</p>
                        </div>
                        <button
                          className="remove-button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <strong>
                          {formatMoney(
                            item.price * item.quantity,
                            item.currency
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="cart-reassurance">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Careful packaging</strong>Every order is packed with
                    care.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Reliable delivery</strong>Tracked from order to
                    door.
                  </p>
                </div>
              </div>
            </section>
            <aside className="order-summary">
              <p className="eyebrow">Summary</p>
              <h2>Your order</h2>
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
              <Link
                href="/checkout"
                className="button-primary cart-checkout-button"
              >
                Continue to checkout <ArrowRight size={15} />
              </Link>
              <p className="secure-note">
                Taxes calculated at checkout · Secure payments
              </p>
            </aside>
          </div>
        )}
        {items.length > 0 && (
          <button
            className="mobile-drawer-trigger"
            onClick={() => setDrawerOpen(true)}
          >
            Open bag drawer
          </button>
        )}
      </main>
      <CartDrawer />
    </div>
  );
}
