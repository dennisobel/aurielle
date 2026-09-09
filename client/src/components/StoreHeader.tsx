import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function StoreHeader({ minimal = false }: { minimal?: boolean }) {
  const [, navigate] = useLocation();
  const { itemCount, setDrawerOpen } = useCart();
  const [open, setOpen] = useState(false);
  return <>
    <div className="announcement-bar"><div className="container text-center">✦ Complimentary shipping on orders over $150 · Made slowly, kept forever</div></div>
    <header className="sticky top-0 z-40 border-b border-[#d8d0c2]/80 bg-[#fcfbf8]/95 backdrop-blur-xl"><div className="container store-header-inner">
      {!minimal && <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>}
      {!minimal && <nav className="header-nav hidden lg:flex"><Link href="/">Home</Link><Link href="/?category=Rings">Rings</Link><Link href="/?category=Earrings">Earrings</Link><Link href="/?category=Necklaces">Necklaces</Link></nav>}
      <Link href="/" className="brand-lockup" aria-label="Aurielle Jewels home"><span className="brand-mark">R<span>✦</span></span><span className="brand-name">Aurielle Jewels</span><span className="brand-subtitle">Fine jewelry atelier</span></Link>
      {!minimal ? <div className="header-actions"><button className="icon-button hidden sm:inline-flex" aria-label="Search" onClick={() => navigate("/#shop")}><Search size={18} /></button><button className="icon-button hidden sm:inline-flex" aria-label="Account"><UserRound size={18} /></button><ThemeToggle /><button className="bag-button" onClick={() => setDrawerOpen(true)} aria-label={`Open bag with ${itemCount} items`}><ShoppingBag size={19} />{itemCount > 0 && <span>{itemCount}</span>}</button></div> : <div className="header-actions"><ThemeToggle /><div className="header-secure">Secure checkout <ShoppingBag size={16} /></div></div>}
    </div></header>
    {open && <div className="fixed inset-0 z-50 bg-[#151515]/40 lg:hidden" onClick={() => setOpen(false)}><aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-[#d8d0c2] pb-5"><div className="brand-name text-lg">Aurielle Jewels</div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button></div><div className="flex flex-col gap-1 pt-7"><Link className="mobile-nav-link" href="/" onClick={() => setOpen(false)}>Home</Link><Link className="mobile-nav-link" href="/?category=Rings" onClick={() => setOpen(false)}>Rings</Link><Link className="mobile-nav-link" href="/?category=Earrings" onClick={() => setOpen(false)}>Earrings</Link><Link className="mobile-nav-link" href="/?category=Necklaces" onClick={() => setOpen(false)}>Necklaces</Link></div></aside></div>}
  </>;
}
