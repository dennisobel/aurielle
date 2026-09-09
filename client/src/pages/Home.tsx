import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Gem,
  Heart,
  Instagram,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

const productImages = {
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  goldRing: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
  necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  pearl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  earrings: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
  hand: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85",
  editorial: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=85",
  flatlay: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
};

type Category = "All" | "Rings" | "Earrings" | "Necklaces" | "Bracelets";
type Metal = "18k Gold" | "Sterling Silver" | "Mixed Metal";

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  metal: Metal;
  price: number;
  image: string;
  tag?: string;
};

const products: Product[] = [
  { id: 1, name: "The Mira Signet", category: "Rings", metal: "18k Gold", price: 485, image: productImages.goldRing, tag: "New" },
  { id: 2, name: "Solitaire No. 04", category: "Rings", metal: "18k Gold", price: 680, image: productImages.ring },
  { id: 3, name: "Luna Pearl Drop", category: "Earrings", metal: "Mixed Metal", price: 295, image: productImages.pearl },
  { id: 4, name: "The Aurelia Chain", category: "Necklaces", metal: "18k Gold", price: 720, image: productImages.necklace, tag: "Bestseller" },
  { id: 5, name: "Petal Hoops", category: "Earrings", metal: "Sterling Silver", price: 240, image: productImages.earrings },
  { id: 6, name: "Fine Line Tennis", category: "Bracelets", metal: "18k Gold", price: 890, image: productImages.flatlay },
  { id: 7, name: "Dune Stacking Ring", category: "Rings", metal: "Sterling Silver", price: 190, image: productImages.ring, tag: "Everyday" },
  { id: 8, name: "Amour Pendant", category: "Necklaces", metal: "Mixed Metal", price: 360, image: productImages.editorial },
  { id: 9, name: "Arc Pearl Studs", category: "Earrings", metal: "18k Gold", price: 210, image: productImages.pearl },
  { id: 10, name: "Celeste Cuff", category: "Bracelets", metal: "Mixed Metal", price: 440, image: productImages.flatlay },
  { id: 11, name: "Olive Signet", category: "Rings", metal: "18k Gold", price: 535, image: productImages.goldRing },
  { id: 12, name: "Serein Pendant", category: "Necklaces", metal: "Sterling Silver", price: 320, image: productImages.necklace },
];

const categoryCards = [
  { name: "Rings", note: "For every chapter", image: productImages.ring, position: "center" },
  { name: "Earrings", note: "Quietly luminous", image: productImages.earrings, position: "center" },
  { name: "Necklaces", note: "Made to layer", image: productImages.necklace, position: "center" },
  { name: "Bracelets", note: "A little gold", image: productImages.flatlay, position: "center" },
];

const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedMetals, setSelectedMetals] = useState<Metal[]>([]);
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [bagCount, setBagCount] = useState(0);
  const [toast, setToast] = useState("");
  const { addItem: addToSharedBag, itemCount: sharedBagCount, setDrawerOpen } = useCart();
  const perPage = 8;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesMetal = selectedMetals.length === 0 || selectedMetals.includes(product.metal);
      const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesMetal && matchesSearch;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "newest") return b.id - a.id;
      return a.id - b.id;
    });
  }, [activeCategory, search, selectedMetals, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const visibleProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  const chooseCategory = (category: Category) => {
    setActiveCategory(category);
    setPage(1);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMetal = (metal: Metal) => {
    setPage(1);
    setSelectedMetals((current) => current.includes(metal) ? current.filter((item) => item !== metal) : [...current, metal]);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(favorites.includes(id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  const addToBag = (name: string) => {
    setBagCount((count) => count + 1);
    const matched = products.find((product) => product.name === name);
    if (matched) addToSharedBag(matched);
    notify(`${name} added to your bag`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#181716]">
      <div className="announcement-bar">
        <div className="container flex items-center justify-center gap-2 text-center">
          <Sparkles size={12} strokeWidth={1.6} />
          <span>Complimentary shipping on orders over $150</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Made slowly, kept forever</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#dedbd4]/80 bg-[#fbfaf7]/95 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-4 lg:h-[82px]">
          <button className="icon-button lg:hidden" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={21} /></button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {(["Rings", "Earrings", "Necklaces", "Bracelets"] as Category[]).map((item) => (
              <button key={item} className="nav-link" onClick={() => chooseCategory(item)}>{item}</button>
            ))}
          </nav>
          <a href="#top" className="brand-lockup" aria-label="Aurielle Jewels home">
            <span className="brand-mark">R<span>✦</span></span>
            <span className="brand-name">Aurielle Jewels</span>
            <span className="brand-subtitle">Fine jewelry atelier</span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <label className="search-shell hidden md:flex" aria-label="Search jewelry">
              <Search size={15} strokeWidth={1.7} />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search pieces" />
            </label>
            <button className="icon-button md:hidden" aria-label="Search" onClick={() => document.getElementById("mobile-search")?.focus()}><Search size={19} /></button>
            <button className="icon-button hidden sm:inline-flex" aria-label="Account" onClick={() => notify("Account sign-in is coming soon")}><UserRound size={19} /></button>
            <button className="bag-button" aria-label={`Shopping bag, ${sharedBagCount || bagCount} items`} onClick={() => setDrawerOpen(true)}>
              <ShoppingBag size={19} />
              {(sharedBagCount || bagCount) > 0 && <span>{sharedBagCount || bagCount}</span>}
            </button>
          </div>
        </div>
        <div className="container pb-3 md:hidden">
          <label className="search-shell flex w-full" aria-label="Search jewelry">
            <Search size={15} strokeWidth={1.7} />
            <input id="mobile-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search the collection" />
          </label>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 bg-[#181716]/40 lg:hidden" onClick={() => setMobileMenu(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#dedbd4] pb-5">
              <div className="brand-name text-lg">Aurielle Jewels</div>
              <button className="icon-button" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={21} /></button>
            </div>
            <div className="flex flex-col gap-1 pt-7">
              {(["All", "Rings", "Earrings", "Necklaces", "Bracelets"] as Category[]).map((item) => (
                <button key={item} className="mobile-nav-link" onClick={() => { setMobileMenu(false); chooseCategory(item); }}>{item}<ArrowUpRight size={16} /></button>
              ))}
            </div>
            <div className="mt-auto space-y-4 border-t border-[#dedbd4] pt-6 text-sm text-[#6b6861]">
              <button className="flex items-center gap-3" onClick={() => notify("Account sign-in is coming soon")}><UserRound size={17} /> My account</button>
              <button className="flex items-center gap-3" onClick={() => notify("Concierge chat is coming soon")}><CircleHelp size={17} /> Ask our concierge</button>
            </div>
          </aside>
        </div>
      )}

      <main id="top">
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-line" /> The everyday heirloom</p>
              <h1>Jewelry with<br /><em>a personal touch.</em></h1>
              <p className="hero-description">Quietly distinctive pieces, designed to mark the moments that become yours.</p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="button-primary" onClick={() => chooseCategory("All")}>Shop the collection <ArrowUpRight size={16} /></button>
                <a href="#story" className="text-link">Our point of view <ArrowRight size={15} /></a>
              </div>
              <div className="hero-proof"><ShieldCheck size={17} /><span>Ethically sourced stones · Crafted in small batches</span></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap"><img src={productImages.hand} alt="Gold rings styled on a hand" /></div>
              <div className="hero-note"><span>01</span><span>Personal pieces<br />for every day</span></div>
              <div className="hero-stamp"><span>R&amp;A</span><small>Since 2014</small></div>
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-20 lg:py-24" aria-labelledby="categories-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Find your signature</p><h2 id="categories-heading">Start with a feeling.</h2></div>
            <p className="section-intro">From the subtle to the statement-making, discover pieces made to live in.</p>
          </div>
          <div className="category-grid mt-9 sm:mt-12">
            {categoryCards.map((card) => (
              <button key={card.name} className="category-card" onClick={() => chooseCategory(card.name as Category)}>
                <img src={card.image} alt={`${card.name} jewelry`} style={{ objectPosition: card.position }} />
                <div className="category-overlay" />
                <div className="category-copy"><span>{card.note}</span><strong>{card.name}</strong><u>Explore</u></div>
              </button>
            ))}
          </div>
        </section>

        <section className="editorial-band" id="story">
          <div className="container editorial-grid">
            <div className="editorial-image"><img src={productImages.editorial} alt="A close editorial detail of layered gold jewelry" /></div>
            <div className="editorial-copy">
              <p className="eyebrow">The Aurielle Jewels way</p>
              <h2>Designed for<br /><em>your chapters.</em></h2>
              <p>We believe the best jewelry becomes part of your story. Each piece is considered, made to be worn often, and designed to gather a little meaning with time.</p>
              <button className="button-quiet" onClick={() => notify("Our story is coming soon")}>Read our story <ArrowRight size={16} /></button>
              <div className="editorial-signature">R<span>✦</span><small>Thoughtful by design</small></div>
            </div>
          </div>
        </section>

        <section className="container shop-section" id="shop" aria-labelledby="shop-heading">
          <div className="shop-header">
            <div><p className="eyebrow">The collection</p><h2 id="shop-heading">Pieces to keep close.</h2></div>
            <p className="shop-count">{filteredProducts.length} pieces</p>
          </div>
          <div className="shop-toolbar">
            <button className="filter-trigger lg:hidden" onClick={() => setFiltersOpen((open) => !open)}><span>Filters{selectedMetals.length ? ` (${selectedMetals.length})` : ""}</span><ChevronDown size={16} className={filtersOpen ? "rotate-180" : ""} /></button>
            <div className="category-tabs" role="tablist" aria-label="Filter by category">
              {(["All", "Rings", "Earrings", "Necklaces", "Bracelets"] as Category[]).map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => { setActiveCategory(category); setPage(1); }}>{category}</button>)}
            </div>
            <label className="sort-select">Sort by
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                <option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
              </select><ChevronDown size={14} />
            </label>
          </div>
          <div className={`shop-layout ${filtersOpen ? "filters-visible" : ""}`}>
            <aside className="filter-panel">
              <div className="filter-heading"><span>Filter by</span><button onClick={() => { setSelectedMetals([]); setActiveCategory("All"); setSearch(""); setPage(1); }}>Clear all</button></div>
              <div className="filter-group"><p>Category</p>{(["All", "Rings", "Earrings", "Necklaces", "Bracelets"] as Category[]).map((category) => <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => { setActiveCategory(category); setPage(1); }}>{category}<span>{category === "All" ? products.length : products.filter((product) => product.category === category).length}</span></button>)}</div>
              <div className="filter-group"><p>Material</p>{(["18k Gold", "Sterling Silver", "Mixed Metal"] as Metal[]).map((metal) => <label key={metal} className="checkbox-row"><input type="checkbox" checked={selectedMetals.includes(metal)} onChange={() => toggleMetal(metal)} /><span className="fake-checkbox" />{metal}</label>)}</div>
              <div className="filter-note"><Gem size={17} /><span>All stones are conflict-free and responsibly sourced.</span></div>
            </aside>
            <div className="product-area">
              {visibleProducts.length > 0 ? <div className="product-grid">
                {visibleProducts.map((product, index) => <article key={product.id} className="product-card" style={{ animationDelay: `${index * 35}ms` }}>
                  <Link href="/product/the-mira-signet" className="product-image-wrap"><img src={product.image} alt={product.name} /><div className="product-badges">{product.tag && <span>{product.tag}</span>}</div><button className={`favorite-button ${favorites.includes(product.id) ? "is-favorite" : ""}`} aria-label={`Save ${product.name}`} onClick={(event) => { event.preventDefault(); toggleFavorite(product.id); }}><Heart size={17} fill={favorites.includes(product.id) ? "currentColor" : "none"} /></button><span className="quick-add" role="button" tabIndex={0} onClick={(event) => { event.preventDefault(); addToBag(product.name); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addToBag(product.name); } }}>Add to bag <ArrowUpRight size={14} /></span></Link>
                  <div className="product-info"><div><h3>{product.name}</h3><p>{product.category} · {product.metal}</p></div><strong>{formatPrice(product.price)}</strong></div>
                </article>)}
              </div> : <div className="empty-state"><Sparkles size={22} /><h3>Nothing quite matches.</h3><p>Try a different search or clear your filters to browse the full collection.</p><button className="button-quiet" onClick={() => { setSelectedMetals([]); setActiveCategory("All"); setSearch(""); }}>Clear filters <ArrowRight size={15} /></button></div>}
              <div className="pagination"><span>Showing {filteredProducts.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filteredProducts.length)} of {filteredProducts.length}</span><div className="pagination-buttons">{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? "current" : ""} onClick={() => { setPage(number); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{String(number).padStart(2, "0")}</button>)}</div></div>
            </div>
          </div>
        </section>

        <section className="service-strip">
          <div className="container service-grid">
            <div><Truck size={21} /><div><strong>Free shipping</strong><span>On orders over $150</span></div></div>
            <div><ShieldCheck size={21} /><div><strong>Lifetime care</strong><span>Here for the long haul</span></div></div>
            <div><Gem size={21} /><div><strong>Made responsibly</strong><span>Thoughtful from source to hand</span></div></div>
            <div><CircleHelp size={21} /><div><strong>Personal help</strong><span>Ask our jewelry concierge</span></div></div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="container newsletter-grid">
            <div><p className="eyebrow">A little something lovely</p><h2>Notes from the atelier.</h2></div>
            <div><p>Join our list for early access to new pieces, styling notes, and stories worth keeping.</p><form onSubmit={(event) => { event.preventDefault(); notify("Welcome to the atelier"); }}><input type="email" placeholder="Your email address" aria-label="Your email address" required /><button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button></form><small>By subscribing, you agree to our privacy policy.</small></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top"><div className="footer-brand"><div className="brand-name">Aurielle Jewels</div><p>Personal jewelry for the moments in between.</p><button className="footer-location" onClick={() => notify("Our Toronto atelier is opening soon")}><MapPin size={15} /> Toronto · Copenhagen · Online</button></div><div className="footer-links"><div><p>Explore</p><a href="#shop">Shop all</a><a href="#shop">New arrivals</a><a href="#story">Our story</a></div><div><p>Care</p><button onClick={() => notify("Care guide is coming soon")}>Jewelry care</button><button onClick={() => notify("Shipping details are coming soon")}>Shipping &amp; returns</button><button onClick={() => notify("Contact form is coming soon")}>Contact</button></div><div><p>Follow</p><a href="#top"><Instagram size={16} /> Instagram</a><button onClick={() => notify("Pinterest is coming soon")}>Pinterest</button></div></div></div>
        <div className="container footer-bottom"><span>© 2026 Aurielle Jewels</span><span>Made with intention</span><span>Privacy · Terms</span></div>
      </footer>

      {toast && <div className="toast" role="status"><Sparkles size={15} /> {toast}</div>}
    </div>
  );
}
