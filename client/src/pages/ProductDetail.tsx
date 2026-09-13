import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link, useParams } from "wouter";
import type { NuruProduct } from "@shared/nuru";
import StoreHeader from "@/components/StoreHeader";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/money";
import * as nuruApi from "@/lib/nuru";
import { ApiError } from "@/lib/nuru";
import { productImage } from "@/lib/placeholder";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [product, setProduct] = useState<NuruProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    nuruApi
      .getProduct(id)
      .then(data => {
        if (!cancelled) {
          setProduct(data);
          setQuantity(Math.max(1, data.moq || 1));
        }
      })
      .catch(err => {
        if (!cancelled)
          setError(
            err instanceof ApiError
              ? err.message
              : "Couldn't load this product."
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader />
        <main className="container detail-page">
          <div className="empty-state">
            <Loader2 size={22} className="animate-spin" />
            <h3>Loading…</h3>
          </div>
        </main>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
        <StoreHeader />
        <main className="container detail-page">
          <Link href="/" className="back-link">
            <ArrowLeft size={15} /> Back to collection
          </Link>
          <div className="empty-state">
            <AlertTriangle size={22} />
            <h3>Couldn't load this product.</h3>
            <p>{error || "It may no longer be available."}</p>
          </div>
        </main>
      </div>
    );

  const add = () => {
    for (let index = 0; index < quantity; index += 1)
      addItem({
        id: product.id,
        name: product.name,
        category: product.category,
        manufacturer: product.manufacturer,
        price: product.price,
        currency: product.currency,
        image: productImage(product.image_url),
      });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#151515]">
      <StoreHeader />
      <main className="container detail-page">
        <Link href="/" className="back-link">
          <ArrowLeft size={15} /> Back to collection
        </Link>
        <div className="detail-layout">
          <section className="detail-gallery">
            <div className="detail-main-image">
              <img src={productImage(product.image_url)} alt={product.name} />
            </div>
          </section>
          <section className="detail-copy">
            <div className="detail-kicker">
              <span>{product.category}</span>
              {product.manufacturer && <span>{product.manufacturer}</span>}
            </div>
            <h1>{product.name}</h1>
            <p className="detail-price">
              {formatMoney(product.price, product.currency)}
            </p>
            {!product.in_stock ? (
              <p className="detail-lede" style={{ color: "#b3452f" }}>
                Currently out of stock.
              </p>
            ) : (
              product.stock_level === "low_stock" && (
                <p className="detail-lede" style={{ color: "#b3452f" }}>
                  Low stock — order soon.
                </p>
              )
            )}
            <p className="detail-lede">
              {product.description ||
                "No description available for this item yet."}
            </p>
            {product.sku && <p className="detail-lede">SKU: {product.sku}</p>}
            {product.moq > 1 && (
              <p className="detail-lede">
                Minimum order quantity: {product.moq}
              </p>
            )}
            {product.price_bands?.length > 0 && (
              <div className="detail-options">
                <div className="option-heading">
                  <span>Volume pricing</span>
                </div>
                <div className="summary-rows">
                  {product.price_bands.map(band => (
                    <div key={band.min_qty}>
                      <span>
                        {band.min_qty}
                        {band.max_qty ? `–${band.max_qty}` : "+"} units
                      </span>
                      <strong>
                        {formatMoney(band.unit_price, product.currency)} each
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-purchase">
              <div className="quantity-control">
                <button
                  onClick={() =>
                    setQuantity(Math.max(product.moq || 1, quantity - 1))
                  }
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                className="button-primary detail-add"
                onClick={add}
                disabled={!product.in_stock}
              >
                {product.in_stock ? "Add to bag" : "Out of stock"}{" "}
                <ArrowRight size={16} />
              </button>
              <button
                className={`detail-save ${saved ? "saved" : ""}`}
                onClick={() => setSaved(!saved)}
                aria-label="Save to wishlist"
              >
                <Heart size={19} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="detail-promises">
              <div>
                <Truck size={18} />
                <span>
                  <strong>Reliable delivery</strong>Tracked from order to door
                </span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>
                  <strong>Secure checkout</strong>Every order is protected
                </span>
              </div>
            </div>
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <div className="detail-accordions">
                  <details open>
                    <summary>
                      Details <ChevronDown size={16} />
                    </summary>
                    <p>
                      {Object.entries(product.attributes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ")}
                    </p>
                  </details>
                </div>
              )}
          </section>
        </div>
      </main>
      <CartDrawer />
    </div>
  );
}
