import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { Link, useLocation } from "wouter";
import StoreHeader from "@/components/StoreHeader";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";

const images = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
];

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [metal, setMetal] = useState("18k Gold");
  const [saved, setSaved] = useState(false);
  const product = { id: 1, name: "The Mira Signet", category: "Rings", metal, price: 485, image: images[0] };
  const add = () => { for (let index = 0; index < quantity; index += 1) addItem(product); };
  return <div className="min-h-screen bg-[#fbfaf7] text-[#181716]"><StoreHeader /><main className="container detail-page"><Link href="/" className="back-link"><ArrowLeft size={15} /> Back to collection</Link><div className="detail-layout"><section className="detail-gallery"><div className="detail-main-image"><img src={images[activeImage]} alt={product.name} /><span className="detail-image-count">0{activeImage + 1} / 03</span></div><div className="detail-thumbnails">{images.map((image, index) => <button key={image} className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)}><img src={image} alt={`${product.name} view ${index + 1}`} /></button>)}</div></section><section className="detail-copy"><div className="detail-kicker"><span>New arrival</span><span>Hand-finished</span></div><h1>{product.name}</h1><div className="detail-rating"><span>★★★★★</span><u>12 considered reviews</u></div><p className="detail-price">$485 <small>USD</small></p><p className="detail-lede">A softly sculpted signet with a grounding weight. Made to be worn daily, and to collect the beautiful marks of a life well lived.</p><div className="detail-options"><div className="option-heading"><span>Metal</span><strong>{metal}</strong></div><div className="metal-options">{["18k Gold", "Sterling Silver", "Mixed Metal"].map((item) => <button key={item} className={metal === item ? "selected" : ""} onClick={() => setMetal(item)}><span className={`metal-swatch ${item.toLowerCase().replace(" ", "-")}`} />{item}{metal === item && <Check size={14} />}</button>)}</div></div><div className="detail-purchase"><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="button-primary detail-add" onClick={add}>Add to bag <ArrowRight size={16} /></button><button className={`detail-save ${saved ? "saved" : ""}`} onClick={() => setSaved(!saved)} aria-label="Save to wishlist"><Heart size={19} fill={saved ? "currentColor" : "none"} /></button></div><div className="detail-promises"><div><Truck size={18} /><span><strong>Complimentary delivery</strong>Arrives in 2–4 business days</span></div><div><ShieldCheck size={18} /><span><strong>Lifetime care included</strong>Repair, resize, refresh</span></div></div><div className="detail-accordions"><details open><summary>Details <ChevronDown size={16} /></summary><p>Solid 18k recycled gold, ethically sourced diamond accents, hand-polished finish. 14mm face. Made in our Toronto atelier.</p></details><details><summary>Shipping &amp; returns <ChevronDown size={16} /></summary><p>Complimentary shipping over $150. Return or exchange within 30 days of delivery.</p></details><details><summary>Care guide <ChevronDown size={16} /></summary><p>Store in the provided pouch and remove before swimming, showering, or applying perfume.</p></details></div></section></div><section className="detail-story"><div><p className="eyebrow">Why it stays</p><h2>The piece you<br /><em>reach for first.</em></h2></div><p>There is a certain ease to a signet. The Mira is our take on an old-world silhouette — softened at every edge, scaled for today, and made to become unmistakably yours.</p></section></main><CartDrawer /></div>;
}
