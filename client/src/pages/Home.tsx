import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Gem,
  Heart,
  Instagram,
  Loader2,
  MapPin,
  Menu,
  Bookmark,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Link, useSearch } from "wouter";
import type { NuruProduct } from "@shared/nuru";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/money";
import * as nuruApi from "@/lib/nuru";
import { ApiError } from "@/lib/nuru";
import { productImage } from "@/lib/placeholder";
import ThemeToggle from "@/components/ThemeToggle";

const decorativeImages = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
];

const heroImage =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85";
const editorialImage =
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=85";

const PER_PAGE = 12;
type Sort = "featured" | "price-low" | "price-high";

export default function Home() {
  const searchParams = new URLSearchParams(useSearch());
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") ?? "All"
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NuruProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    availability: true,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const {
    addItem: addToSharedBag,
    itemCount: bagCount,
    setDrawerOpen,
  } = useCart();

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    nuruApi
      .listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    nuruApi
      .listProducts({
        page,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        category: activeCategory !== "All" ? activeCategory : undefined,
        in_stock: inStockOnly || undefined,
      })
      .then(data => {
        if (cancelled) return;
        setItems(data.items);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      })
      .catch(err => {
        if (cancelled) return;
        setItems([]);
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load the collection right now."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedSearch, inStockOnly, page]);

  const visibleProducts = useMemo(() => {
    if (sort === "featured") return items;
    return [...items].sort((a, b) =>
      sort === "price-low" ? a.price - b.price : b.price - a.price
    );
  }, [items, sort]);

  const categoryCards = useMemo(
    () =>
      categories.slice(0, 4).map((name, index) => ({
        name,
        image: decorativeImages[index % decorativeImages.length],
      })),
    [categories]
  );
  const navCategories = categories.slice(0, 5);
  const filteredFilterCategories = categories.filter(category =>
    category.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    setPage(1);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
    notify(
      favorites.includes(id) ? "Removed from wishlist" : "Saved to wishlist"
    );
  };

  const clearFilters = () => {
    setActiveCategory("All");
    setInStockOnly(false);
    setSearch("");
    setFilterSearch("");
    setPage(1);
  };

  const addToBag = (product: NuruProduct) => {
    addToSharedBag({
      id: product.id,
      name: product.name,
      category: product.category,
      manufacturer: product.manufacturer,
      price: product.price,
      currency: product.currency,
      image: productImage(product.image_url),
    });
    notify(`${product.name} added to your bag`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfbf8] text-[#151515]">
      <div className="announcement-bar">
        <div className="container flex items-center justify-center gap-2 text-center">
          <Sparkles size={12} strokeWidth={1.6} />
          <span>Reliable delivery, every order</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Secure checkout</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#d8d0c2]/80 bg-[#fcfbf8]/95 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-4 lg:h-[82px]">
          <button
            className="icon-button lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={21} />
          </button>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary navigation"
          >
            {navCategories.map(item => (
              <button
                key={item}
                className="nav-link"
                onClick={() => chooseCategory(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <a
            href="#top"
            className="brand-lockup"
            aria-label="Aurielle Jewels home"
          >
            <span className="brand-mark">
              R<span>✦</span>
            </span>
            <span className="brand-name">Aurielle Jewels</span>
            <span className="brand-subtitle">Fine jewelry atelier</span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <label
              className="search-shell hidden md:flex"
              aria-label="Search products"
            >
              <Search size={15} strokeWidth={1.7} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search the collection"
              />
            </label>
            <button
              className="icon-button md:hidden"
              aria-label="Search"
              onClick={() => document.getElementById("mobile-search")?.focus()}
            >
              <Search size={19} />
            </button>
            <button
              className="icon-button hidden sm:inline-flex"
              aria-label="Account"
              onClick={() => notify("Account sign-in is coming soon")}
            >
              <UserRound size={19} />
            </button>
            <ThemeToggle />
            <button
              className="bag-button"
              aria-label={`Shopping bag, ${bagCount} items`}
              onClick={() => setDrawerOpen(true)}
            >
              <ShoppingBag size={19} />
              {bagCount > 0 && <span>{bagCount}</span>}
            </button>
          </div>
        </div>
        <div className="container pb-3 md:hidden">
          <label
            className="search-shell flex w-full"
            aria-label="Search products"
          >
            <Search size={15} strokeWidth={1.7} />
            <input
              id="mobile-search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search the collection"
            />
          </label>
        </div>
      </header>

      {mobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-[#151515]/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <aside
            className="mobile-drawer"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#d8d0c2] pb-5">
              <div className="brand-name text-lg">Aurielle Jewels</div>
              <button
                className="icon-button"
                onClick={() => setMobileMenu(false)}
                aria-label="Close menu"
              >
                <X size={21} />
              </button>
            </div>
            <div className="flex flex-col gap-1 pt-7">
              {["All", ...navCategories].map(item => (
                <button
                  key={item}
                  className="mobile-nav-link"
                  onClick={() => {
                    setMobileMenu(false);
                    chooseCategory(item);
                  }}
                >
                  {item}
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <div className="mt-auto space-y-4 border-t border-[#d8d0c2] pt-6 text-sm text-[#6b6861]">
              <button
                className="flex items-center gap-3"
                onClick={() => notify("Account sign-in is coming soon")}
              >
                <UserRound size={17} /> My account
              </button>
              <button
                className="flex items-center gap-3"
                onClick={() => notify("Concierge chat is coming soon")}
              >
                <CircleHelp size={17} /> Ask our concierge
              </button>
            </div>
          </aside>
        </div>
      )}

      <main id="top">
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" /> The everyday heirloom
              </p>
              <h1>
                Jewelry with
                <br />
                <em>a personal touch.</em>
              </h1>
              <p className="hero-description">
                Quietly distinctive pieces, designed to mark the moments that
                become yours.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="button-primary"
                  onClick={() => chooseCategory("All")}
                >
                  Shop the collection <ArrowUpRight size={16} />
                </button>
                <a href="#story" className="text-link">
                  Our point of view <ArrowRight size={15} />
                </a>
              </div>
              <div className="hero-proof">
                <ShieldCheck size={17} />
                <span>Sourced responsibly · Delivered reliably</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <img src={heroImage} alt="A close detail of layered jewelry" />
              </div>
              <div className="hero-note">
                <span>01</span>
                <span>
                  Personal pieces
                  <br />
                  for every day
                </span>
              </div>
              <div className="hero-stamp">
                <span>R&amp;A</span>
                <small>Since 2014</small>
              </div>
            </div>
          </div>
        </section>

        <section
          className="container py-16 sm:py-20 lg:py-24"
          aria-labelledby="categories-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Find your signature</p>
              <h2 id="categories-heading">Start with a feeling.</h2>
            </div>
            <p className="section-intro">
              From the subtle to the statement-making, discover pieces made to
              live in.
            </p>
          </div>
          <div className="category-grid mt-9 sm:mt-12">
            {categoryCards.map(card => (
              <button
                key={card.name}
                className="category-card"
                onClick={() => chooseCategory(card.name)}
              >
                <img src={card.image} alt="" />
                <div className="category-overlay" />
                <div className="category-copy">
                  <span>Explore the range</span>
                  <strong>{card.name}</strong>
                  <u>Explore</u>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="editorial-band" id="story">
          <div className="container editorial-grid">
            <div className="editorial-image">
              <img
                src={editorialImage}
                alt="A close editorial detail of the collection"
              />
            </div>
            <div className="editorial-copy">
              <p className="eyebrow">The Aurielle Jewels way</p>
              <h2>
                Designed for
                <br />
                <em>your chapters.</em>
              </h2>
              <p>
                We believe the best pieces become part of your story. Each one
                is considered, made to be used often, and designed to gather a
                little meaning with time.
              </p>
              <button
                className="button-quiet"
                onClick={() => notify("Our story is coming soon")}
              >
                Read our story <ArrowRight size={16} />
              </button>
              <div className="editorial-signature">
                R<span>✦</span>
                <small>Thoughtful by design</small>
              </div>
            </div>
          </div>
        </section>

        <section
          className="container shop-section"
          id="shop"
          aria-labelledby="shop-heading"
        >
          <div className="shop-header">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="shop-heading">Pieces to keep close.</h2>
            </div>
            <p className="shop-count">{total} pieces</p>
          </div>
          <div className="shop-toolbar">
            <button
              className="filter-trigger lg:hidden"
              onClick={() => setFiltersOpen(open => !open)}
            >
              <span>Filters{inStockOnly ? " (1)" : ""}</span>
              <ChevronDown
                size={16}
                className={filtersOpen ? "rotate-180" : ""}
              />
            </button>
            <div
              className="category-tabs"
              role="tablist"
              aria-label="Filter by category"
            >
              {["All", ...categories.slice(0, 6)].map(category => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => {
                    setActiveCategory(category);
                    setPage(1);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="sort-select">
              Sort by
              <select
                value={sort}
                onChange={event => setSort(event.target.value as Sort)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <div
            className={`shop-layout ${filtersOpen ? "filters-visible" : ""}`}
          >
            <aside className="filter-panel">
              <div className="filter-workspace-head">
                <div>
                  <span className="filter-eyebrow">
                    <SlidersHorizontal size={13} /> Refine selection
                  </span>
                  <h3>Filters</h3>
                </div>
                <div className="filter-head-actions">
                  <button onClick={clearFilters}>Clear all</button>
                  <button
                    onClick={() => notify("Filters saved to your preferences")}
                  >
                    <Bookmark size={13} /> Save
                  </button>
                </div>
              </div>
              <label className="filter-search">
                <Search size={14} />
                <input
                  value={filterSearch}
                  onChange={event => setFilterSearch(event.target.value)}
                  placeholder="Search filters"
                  aria-label="Search filters"
                />
              </label>
              {(activeCategory !== "All" || inStockOnly) && (
                <div className="active-filter-chips">
                  <span className="active-chip-label">Active</span>
                  {activeCategory !== "All" && (
                    <button onClick={() => setActiveCategory("All")}>
                      {activeCategory}
                      <X size={11} />
                    </button>
                  )}
                  {inStockOnly && (
                    <button onClick={() => setInStockOnly(false)}>
                      In stock only
                      <X size={11} />
                    </button>
                  )}
                </div>
              )}
              <div className="filter-accordion">
                <button
                  className="filter-accordion-trigger"
                  onClick={() =>
                    setExpandedFilters(current => ({
                      ...current,
                      category: !current.category,
                    }))
                  }
                >
                  <span>
                    <SlidersHorizontal size={15} /> Category{" "}
                    <em>{activeCategory !== "All" ? "1 selected" : ""}</em>
                  </span>
                  <ChevronDown
                    size={15}
                    className={expandedFilters.category ? "rotate-180" : ""}
                  />
                </button>
                {expandedFilters.category && (
                  <div className="filter-accordion-content">
                    {["All", ...filteredFilterCategories].map(category => (
                      <button
                        key={category}
                        className={
                          activeCategory === category ? "selected" : ""
                        }
                        onClick={() => {
                          setActiveCategory(category);
                          setPage(1);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="filter-accordion">
                <button
                  className="filter-accordion-trigger"
                  onClick={() =>
                    setExpandedFilters(current => ({
                      ...current,
                      availability: !current.availability,
                    }))
                  }
                >
                  <span>
                    <Gem size={15} /> Availability{" "}
                    <em>{inStockOnly ? "1 selected" : ""}</em>
                  </span>
                  <ChevronDown
                    size={15}
                    className={expandedFilters.availability ? "rotate-180" : ""}
                  />
                </button>
                {expandedFilters.availability && (
                  <div className="filter-accordion-content">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={event => {
                          setInStockOnly(event.target.checked);
                          setPage(1);
                        }}
                      />
                      <span className="fake-checkbox" />
                      In stock only
                    </label>
                  </div>
                )}
              </div>
              <div className="filter-note">
                <Gem size={17} />
                <span>Sourced and stocked with care.</span>
              </div>
            </aside>
            <div className="product-area">
              {loadError ? (
                <div className="empty-state">
                  <AlertTriangle size={22} />
                  <h3>Couldn't load the collection.</h3>
                  <p>{loadError}</p>
                </div>
              ) : loading ? (
                <div className="empty-state">
                  <Loader2 size={22} className="animate-spin" />
                  <h3>Loading pieces…</h3>
                </div>
              ) : visibleProducts.length > 0 ? (
                <div className="product-grid">
                  {visibleProducts.map((product, index) => (
                    <article
                      key={product.id}
                      className="product-card"
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <Link
                        href={`/product/${product.id}`}
                        className="product-image-wrap"
                      >
                        <img
                          src={productImage(product.image_url)}
                          alt={product.name}
                        />
                        <div className="product-badges">
                          {!product.in_stock && <span>Out of stock</span>}
                          {product.stock_level === "low_stock" &&
                            product.in_stock && <span>Low stock</span>}
                        </div>
                        <button
                          className={`favorite-button ${favorites.includes(product.id) ? "is-favorite" : ""}`}
                          aria-label={`Save ${product.name}`}
                          onClick={event => {
                            event.preventDefault();
                            toggleFavorite(product.id);
                          }}
                        >
                          <Heart
                            size={17}
                            fill={
                              favorites.includes(product.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                        {product.in_stock && (
                          <span
                            className="quick-add"
                            role="button"
                            tabIndex={0}
                            onClick={event => {
                              event.preventDefault();
                              addToBag(product);
                            }}
                            onKeyDown={event => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addToBag(product);
                              }
                            }}
                          >
                            Add to bag <ArrowUpRight size={14} />
                          </span>
                        )}
                      </Link>
                      <div className="product-info">
                        <div>
                          <h3>{product.name}</h3>
                          <p>
                            {product.category}
                            {product.manufacturer
                              ? ` · ${product.manufacturer}`
                              : ""}
                          </p>
                        </div>
                        <strong>
                          {formatMoney(product.price, product.currency)}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Sparkles size={22} />
                  <h3>Nothing quite matches.</h3>
                  <p>
                    Try a different search or clear your filters to browse the
                    full collection.
                  </p>
                  <button className="button-quiet" onClick={clearFilters}>
                    Clear filters <ArrowRight size={15} />
                  </button>
                </div>
              )}
              {!loading && !loadError && totalPages > 1 && (
                <div className="pagination">
                  <span>
                    Page {page} of {totalPages} · {total} pieces
                  </span>
                  <div className="pagination-buttons">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map(number => (
                      <button
                        key={number}
                        className={page === number ? "current" : ""}
                        onClick={() => {
                          setPage(number);
                          document.getElementById("shop")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        {String(number).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="service-strip">
          <div className="container service-grid">
            <div>
              <Truck size={21} />
              <div>
                <strong>Reliable delivery</strong>
                <span>Tracked from order to door</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={21} />
              <div>
                <strong>Secure payments</strong>
                <span>Every order is protected</span>
              </div>
            </div>
            <div>
              <Gem size={21} />
              <div>
                <strong>Made responsibly</strong>
                <span>Thoughtful from source to hand</span>
              </div>
            </div>
            <div>
              <CircleHelp size={21} />
              <div>
                <strong>Personal help</strong>
                <span>Ask our concierge</span>
              </div>
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="container newsletter-grid">
            <div>
              <p className="eyebrow">A little something lovely</p>
              <h2>Notes from the atelier.</h2>
            </div>
            <div>
              <p>
                Join our list for early access to new pieces, styling notes, and
                stories worth keeping.
              </p>
              <form
                onSubmit={event => {
                  event.preventDefault();
                  notify("Welcome to the atelier");
                }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Your email address"
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight size={18} />
                </button>
              </form>
              <small>By subscribing, you agree to our privacy policy.</small>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <div className="brand-name">Aurielle Jewels</div>
            <p>Personal pieces for the moments in between.</p>
            <button
              className="footer-location"
              onClick={() => notify("Our atelier is opening soon")}
            >
              <MapPin size={15} /> Toronto · Copenhagen · Online
            </button>
          </div>
          <div className="footer-links">
            <div>
              <p>Explore</p>
              <a href="#shop">Shop all</a>
              <a href="#shop">New arrivals</a>
              <a href="#story">Our story</a>
            </div>
            <div>
              <p>Care</p>
              <button onClick={() => notify("Care guide is coming soon")}>
                Product care
              </button>
              <button
                onClick={() => notify("Shipping details are coming soon")}
              >
                Shipping &amp; returns
              </button>
              <button onClick={() => notify("Contact form is coming soon")}>
                Contact
              </button>
            </div>
            <div>
              <p>Follow</p>
              <a href="#top">
                <Instagram size={16} /> Instagram
              </a>
              <button onClick={() => notify("Pinterest is coming soon")}>
                Pinterest
              </button>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Aurielle Jewels</span>
          <span>Made with intention</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>

      {toast && (
        <div className="toast" role="status">
          <Sparkles size={15} /> {toast}
        </div>
      )}
      <CartDrawer />
    </div>
  );
}
