import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem, subtotal, shipping, total, itemCount } = useCart();
  if (!isDrawerOpen) return null;
  return <div className="cart-drawer-layer" role="dialog" aria-modal="true" aria-label="Shopping bag">
    <button className="cart-drawer-backdrop" aria-label="Close shopping bag" onClick={() => setDrawerOpen(false)} />
    <aside className="cart-drawer-panel">
      <div className="cart-drawer-header"><div><p className="eyebrow">Your selection</p><h2>Shopping bag <span>({itemCount})</span></h2></div><button className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close shopping bag"><X size={20} /></button></div>
      {items.length === 0 ? <div className="cart-empty"><ShoppingBag size={28} /><h3>Your bag is waiting.</h3><p>Take your time. The right piece is worth finding.</p><button className="button-primary" onClick={() => setDrawerOpen(false)}>Explore the collection <ArrowRight size={15} /></button></div> : <>
        <div className="cart-drawer-items">{items.map((item) => <div className="cart-line" key={item.id}><img src={item.image} alt={item.name} /><div className="cart-line-copy"><div className="flex items-start justify-between gap-2"><div><h3>{item.name}</h3><p>{item.metal}</p></div><button className="remove-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={14} /></button></div><div className="flex items-center justify-between gap-3"><div className="quantity-control"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={12} /></button></div><strong>{money(item.price * item.quantity)}</strong></div></div></div>)}</div>
        <div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><strong>{shipping === 0 ? "Complimentary" : money(shipping)}</strong></div><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div><Link href="/checkout" className="button-primary cart-checkout-button" onClick={() => setDrawerOpen(false)}>Continue to checkout <ArrowRight size={15} /></Link><Link href="/cart" className="view-cart-link" onClick={() => setDrawerOpen(false)}>View full bag</Link></div>
      </>}
    </aside>
  </div>;
}
