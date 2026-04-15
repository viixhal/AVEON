
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  Minus,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  SunMedium,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { categories, ethToUsd, products } from "./products";
import "./App.css";

/* ── helpers ─────────────────────────────────────────────── */
function formatAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ethLabel(v) {
  return `${v.toFixed(3)} ETH`;
}

/* ── Ripple helper ────────────────────────────────────────── */
function useRipple(ref) {
  const trigger = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const rip = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 2;
      rip.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;border-radius:50%;
        background:rgba(255,255,255,0.18);transform:scale(0);pointer-events:none;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        animation:rippleAnim 0.55s linear forwards;
      `;
      el.appendChild(rip);
      setTimeout(() => rip.remove(), 600);
    },
    [ref],
  );
  return trigger;
}

/* ── PremiumButton ────────────────────────────────────────── */
function PremiumButton({ children, kind = "solid", className = "", ...props }) {
  const ref = useRef(null);
  const triggerRipple = useRipple(ref);
  return (
    <motion.button
      ref={ref}
      className={`premium-button ${kind} ${className}`.trim()}
      onMouseDown={triggerRipple}
      type="button"
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.965 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      style={{ position: "relative", overflow: "hidden" }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ── Sort Dropdown ────────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function clickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const options = [
    { id: "", label: "Recommended" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
  ];

  const activeLabel = options.find((o) => o.id === value)?.label || "Recommended";

  return (
    <div className="custom-dropdown" ref={ref}>
      <button
        className="sort-select"
        onClick={() => setOpen(!open)}
        type="button"
        aria-label="Sort products"
      >
        <span>{activeLabel}</span>
        <ChevronDown size={14} aria-hidden="true" style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="dropdown-menu glass-surface"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                className={`dropdown-item ${value === opt.id ? "active" : ""}`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Floating top dock ────────────────────────────────────── */
function FloatingDock({ cartCount, walletAddress, walletStatus }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="floating-dock glass-surface"
      initial={{ opacity: 0, y: -16 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
    >
      <span className={`status-dot ${walletAddress ? "connected" : ""}`} />
      <span>{walletAddress ? formatAddress(walletAddress) : walletStatus}</span>
      <span className="cart-badge">
        <ShoppingBag size={12} aria-hidden="true" />
        {cartCount}
      </span>
    </motion.div>
  );
}

/* ── Hero image auto-switcher ─────────────────────────────── */
function HeroImageCycle({ product }) {
  const imgs = product?.images?.length ? product.images : product ? [product.image] : [];
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIdx(0);
  }, [product?.id]);

  useEffect(() => {
    if (imgs.length < 2) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % imgs.length);
        setFading(false);
      }, 260);
    }, 3200);
    return () => clearInterval(id);
  }, [imgs.length, product?.id]);

  if (!product || imgs.length === 0) return null;

  return (
    <div className="product-img-wrap">
      <img
        src={imgs[idx]}
        alt={product.name}
        style={{
          transition: "opacity 0.28s ease, transform 0.28s ease",
          opacity: fading ? 0 : 1,
          transform: fading ? "scale(0.96)" : "scale(1)",
        }}
      />
    </div>
  );
}

/* ── Product Card ─────────────────────────────────────────── */
function ProductCard({ addToCart, index, liked, openDetails, product, selected, toggleFavorite }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={`product-card${selected ? " selected" : ""}`}
      exit={{ opacity: 0, scale: 0.94 }}
      initial={{ opacity: 0, y: 40 }}
      layout
      transition={{ delay: 0.06 + index * 0.05, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ y: -7, scale: 1.01 }}
    >
      <div className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="cat-label">{product.category}</span>
        <motion.button
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          className={`favorite-button${liked ? " liked" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          type="button"
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.12 }}
        >
          <Heart size={15} aria-hidden="true" />
        </motion.button>
      </div>

      <div className="product-body">
        <div className="prod-info">
          <strong>{product.name}</strong>
          {product.desc ? <span>{product.desc}</span> : null}
        </div>
        <div className="product-meta">
          <span className="star-row">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {product.rating}
          </span>
          <span className="price-tag">{ethLabel(product.price)}</span>
        </div>
        <div className="product-actions">
          <PremiumButton kind="ghost" onClick={openDetails}>View</PremiumButton>
          <PremiumButton onClick={() => addToCart(product)}>
            <Plus size={14} aria-hidden="true" />
            Add
          </PremiumButton>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Wallet panel ─────────────────────────────────────────── */
function WalletPanel({ connectMetaMask, error, status, walletAddress }) {
  return (
    <motion.section
      animate={{ opacity: 1, x: 0 }}
      className="glass-surface panel"
      initial={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="panel-heading">
        <div>
          <h2>
            <Wallet size={18} aria-hidden="true" />
            Wallet
          </h2>
          <p>MetaMask status and checkout readiness</p>
        </div>
        <span className={`wallet-status${walletAddress ? " connected" : ""}`}>{status}</span>
      </div>
      {error ? <p className="wallet-error">{error}</p> : null}
      <span className="muted-label">Connected address</span>
      <strong className="wallet-address">{walletAddress || "No wallet connected"}</strong>
      <PremiumButton onClick={connectMetaMask}>
        <Wallet size={15} aria-hidden="true" />
        {walletAddress ? "Reconnect wallet" : "Connect now"}
      </PremiumButton>
    </motion.section>
  );
}

/* ── Cart Panel ───────────────────────────────────────────── */
function CartPanel({ cart, cartCount, changeQty, checkout, totalEth }) {
  return (
    <motion.section
      animate={{ opacity: 1, x: 0 }}
      className="glass-surface panel"
      initial={{ opacity: 0, x: 24 }}
      transition={{ delay: 0.07, type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="panel-heading">
        <h2>
          <ShoppingBag size={18} aria-hidden="true" />
          Cart
        </h2>
        <span className="count-pill">{cartCount} items</span>
      </div>

      <div className="cart-list">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="empty-cart"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="empty"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
            >
              <p style={{ margin: 0 }}>Your cart is empty — browse products below.</p>
              <PremiumButton kind="ghost" onClick={() => document.querySelector(".catalog")?.scrollIntoView({ behavior: "smooth" })}>Explore Store</PremiumButton>
            </motion.div>
          ) : (
            cart.map((item) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="cart-item"
                exit={{ opacity: 0, x: -16 }}
                initial={{ opacity: 0, y: 10 }}
                key={item.id}
                layout
              >
                <div className="cart-item-img-wrap">
                  <img src={item.image} alt="" />
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{ethLabel(item.price)} each</span>
                </div>
                <div className="qty-control">
                  <button onClick={() => changeQty(item.id, -1)} type="button" aria-label="Decrease">
                    <Minus size={13} aria-hidden="true" />
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} type="button" aria-label="Increase">
                    <Plus size={13} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="checkout-box">
        <div>
          <span>Subtotal</span>
          <strong>{ethLabel(totalEth)}</strong>
        </div>
        <div>
          <span>USD estimate</span>
          <strong>${Math.round(totalEth * ethToUsd).toLocaleString()}</strong>
        </div>
        <PremiumButton kind="accent" className="pulse-glow" onClick={checkout}>
          <Check size={15} aria-hidden="true" />
          Checkout with wallet
        </PremiumButton>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent)' }}>
          <ShieldCheck size={14} aria-hidden="true" />
          Secured via Web3
        </div>
      </div>
    </motion.section>
  );
}

/* ── Product Modal ────────────────────────────────────────── */
function ProductModal({ addToCart, close, liked, product, toggleFavorite }) {
  const images = product.images?.length ? product.images : [product.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const [switching, setSwitching] = useState(false);

  function switchTo(i) {
    if (i === activeIdx) return;
    setSwitching(true);
    setTimeout(() => {
      setActiveIdx(i);
      setSwitching(false);
    }, 200);
  }

  function prev() {
    switchTo((activeIdx - 1 + images.length) % images.length);
  }

  function next() {
    switchTo((activeIdx + 1) % images.length);
  }

  // keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="modal-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={close}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="modal glass-surface"
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        {/* close */}
        <motion.button
          aria-label="Close product details"
          className="modal-close"
          onClick={close}
          type="button"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={18} aria-hidden="true" />
        </motion.button>

        {/* gallery column */}
        <div className="modal-gallery-col">
          {/* main image */}
          <div className="modal-main-img" style={{ position: "relative" }}>
            <img
              src={images[activeIdx]}
              alt={`${product.name} photo ${activeIdx + 1}`}
              className={switching ? "switching" : ""}
            />
            {/* nav arrows */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={prev}
                  type="button"
                  aria-label="Previous image"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: "absolute", left: "0.6rem", top: "50%",
                    transform: "translateY(-50%)",
                    display: "grid", placeItems: "center",
                    width: "2rem", height: "2rem", borderRadius: "50%",
                    background: "rgba(0,0,0,0.42)", color: "#fff",
                    backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  onClick={next}
                  type="button"
                  aria-label="Next image"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: "absolute", right: "0.6rem", top: "50%",
                    transform: "translateY(-50%)",
                    display: "grid", placeItems: "center",
                    width: "2rem", height: "2rem", borderRadius: "50%",
                    background: "rgba(0,0,0,0.42)", color: "#fff",
                    backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <ChevronRight size={16} />
                </motion.button>
              </>
            )}
          </div>

          {/* thumbnails */}
          {images.length > 1 && (
            <div className="modal-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`modal-thumb${i === activeIdx ? " active" : ""}`}
                  onClick={() => switchTo(i)}
                  type="button"
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* copy column */}
        <div className="modal-copy">
          <span className="badge">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="rating-line">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill="currentColor" aria-hidden="true" />
            ))}
            <span>{product.rating} premium rating</span>
          </p>
          {product.desc ? (
            <p>
              {product.desc} Designed with a floating glass aesthetic, soft
              reflections, and a wallet-ready checkout flow.
            </p>
          ) : null}

          <div className="spec-list">
            <div>
              <span>Price</span>
              <strong style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {ethLabel(product.price)}
              </strong>
            </div>
            <div>
              <span>USD estimate</span>
              <strong>${Math.round(product.price * ethToUsd).toLocaleString()}</strong>
            </div>
            <div>
              <span>Wallet checkout</span>
              <strong style={{ color: "#22d47e" }}>Ready</strong>
            </div>
          </div>

          <div className="button-row">
            <PremiumButton
              onClick={() => { addToCart(product); close(); }}
              kind="accent"
            >
              Add to cart
              <ArrowRight size={15} aria-hidden="true" />
            </PremiumButton>
            <PremiumButton kind="ghost" onClick={toggleFavorite}>
              <Heart
                className={liked ? "filled-heart" : ""}
                size={15}
                aria-hidden="true"
              />
              {liked ? "Saved" : "Save item"}
            </PremiumButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Checkout Blocked Modal ───────────────────────────────── */
function CheckoutBlockedModal({ close, totalEth }) {
  const [notified, setNotified] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: 4 + Math.random() * 6,
      dur: 3 + Math.random() * 4,
    }))
  );

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") close(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="modal-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={close}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="modal glass-surface checkout-blocked-modal"
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        initial={{ opacity: 0, scale: 0.88, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* floating particles */}
        <div className="cbm-particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="cbm-particle"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>

        {/* close */}
        <motion.button
          aria-label="Close"
          className="modal-close"
          onClick={close}
          type="button"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={18} aria-hidden="true" />
        </motion.button>

        {/* flag + icon */}
        <div className="cbm-icon-row">
          <motion.div
            className="cbm-flag"
            animate={{ rotate: [0, -4, 4, -3, 3, 0] }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span role="img" aria-label="India flag">🇮🇳</span>
          </motion.div>
          <motion.div
            className="cbm-globe"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <Globe size={18} aria-hidden="true" />
          </motion.div>
        </div>

        {/* heading */}
        <motion.div
          className="cbm-copy"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="cbm-eyebrow">
            <Zap size={11} aria-hidden="true" />
            Service Interruption
          </span>
          <h2 className="cbm-title">We'll Be Right Back.</h2>
          <p className="cbm-lead">
            India has temporarily suspended all cryptocurrency transactions
            and blockchain network activity.
          </p>
          <p className="cbm-body">
            AVEON is fully operational and ready to serve you — the moment
            India restores crypto freedom, this store will be live and your
            cart will be waiting. Your order of{" "}
            <strong style={{
              background: "linear-gradient(135deg,var(--accent),var(--accent-2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {ethLabel(totalEth)}
            </strong>{" "}
            has been saved.
          </p>
        </motion.div>

        {/* divider */}
        <div className="cbm-divider" aria-hidden="true" />

        {/* notify CTA */}
        <motion.div
          className="cbm-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <AnimatePresence mode="wait">
            {notified ? (
              <motion.div
                key="confirmed"
                className="cbm-notify-confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check size={15} aria-hidden="true" />
                You're on the list — we'll notify you the moment we go live!
              </motion.div>
            ) : (
              <motion.div key="cta" exit={{ opacity: 0 }}>
                <PremiumButton
                  kind="accent"
                  onClick={() => setNotified(true)}
                  style={{ width: "100%" }}
                >
                  <Bell size={15} aria-hidden="true" />
                  Notify Me When We're Back
                  <ArrowRight size={14} aria-hidden="true" />
                </PremiumButton>
              </motion.div>
            )}
          </AnimatePresence>
          <PremiumButton kind="ghost" onClick={close} style={{ width: "100%" }}>
            Got it — Keep Browsing
          </PremiumButton>
        </motion.div>

        {/* footer note */}
        <p className="cbm-footnote">
          Thank you for your patience and support. 🙏 We truly appreciate it.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main App
══════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState("Not connected");
  const [walletError, setWalletError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(products[0] ?? null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [toast, setToast] = useState("");
  const [showCheckoutBlocked, setShowCheckoutBlocked] = useState(false);
  const [sortBy, setSortBy] = useState("");

  /* persist theme */
  useEffect(() => {
    const saved = localStorage.getItem("aveon-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("aveon-theme", theme);
  }, [theme]);

  /* MetaMask watcher */
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) {
      setWalletStatus("MetaMask unavailable");
      setWalletError("Open in a browser with MetaMask installed.");
      return;
    }
    const handler = (accounts) => {
      if (accounts?.length) {
        setWalletAddress(accounts[0]);
        setWalletStatus("Connected");
        setWalletError("");
      } else {
        setWalletAddress("");
        setWalletStatus("Disconnected");
      }
    };
    eth.request({ method: "eth_accounts" }).then(handler).catch(() => {
      setWalletStatus("Wallet check failed");
      setWalletError("Could not read wallet accounts.");
    });
    eth.on?.("accountsChanged", handler);
    return () => eth.removeListener?.("accountsChanged", handler);
  }, []);

  /* toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products.filter((p) => {
      const cat = activeCategory === "All" || p.category === activeCategory;
      const text = !q || [p.name, p.category, p.desc].join(" ").toLowerCase().includes(q);
      return cat && text;
    });
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [activeCategory, query, sortBy]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const totalEth = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const selectedVisible = filteredProducts.some((p) => p.id === selected?.id);
  const featuredProduct = selectedVisible ? selected : filteredProducts[0] ?? null;

  /* MetaMask connect */
  async function connectMetaMask() {
    if (!window.ethereum) {
      alert("MetaMask is not available in this browser.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts?.length) {
        setWalletAddress(accounts[0]);
        setWalletStatus("Connected");
        setWalletError("");
      }
    } catch (err) {
      if (err?.code === 4001) {
        setWalletStatus("Connection rejected");
        setWalletError("You rejected the MetaMask connection request.");
      } else {
        setWalletStatus("Connection failed");
        setWalletError(err?.message || "Unknown MetaMask error.");
      }
    }
  }

  function addToCart(product) {
    setCart((c) => {
      const ex = c.find((i) => i.id === product.id);
      if (ex) return c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...product, qty: 1 }];
    });
    setToast(`${product.name} added to cart ✓`);
  }

  function changeQty(id, delta) {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0),
    );
  }

  function toggleFavorite(id) {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  function checkout() {
    if (!cart.length) { setToast("Your cart is empty — add some products first."); return; }
    setShowCheckoutBlocked(true);
  }

  return (
    <div className={`app ${theme}`}>
      {/* animated bg orbs */}
      <div className="glass-background" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* top dock */}
      <FloatingDock cartCount={cartCount} walletAddress={walletAddress} walletStatus={walletStatus} />

      <div className="shell">
        {/* ── Header ── */}
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className="store-header glass-surface"
          initial={{ opacity: 0, y: -22 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <div className="brand">
            <motion.div className="brand-icon" whileHover={{ rotate: 6, scale: 1.08 }}>
              <Sparkles size={22} aria-hidden="true" />
            </motion.div>
            <div>
              <strong>AVEON</strong>
              <span>Blockchain e-commerce</span>
            </div>
          </div>

          <div className="header-actions">
            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search products</span>
              <input
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                type="search"
                value={query}
              />
            </label>

            <PremiumButton
              kind="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunMedium size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
              {theme === "dark" ? "Light" : "Dark"}
            </PremiumButton>

            <PremiumButton onClick={connectMetaMask}>
              <Wallet size={15} aria-hidden="true" />
              {walletAddress ? formatAddress(walletAddress) : "Connect MetaMask"}
            </PremiumButton>
          </div>
        </motion.header>

        <main className="store-layout">
          <div className="main-column">
            {/* ── Hero feature ── */}
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="feature glass-surface"
              initial={{ opacity: 0, y: 28 }}
              transition={{ delay: 0.06, type: "spring", stiffness: 240, damping: 22 }}
            >
              {/* copy */}
              <div className="feature-copy">
                <span className="eyebrow">
                  <Zap size={11} aria-hidden="true" />
                  Blockchain e-commerce
                </span>
                <h1>Shop in AVEON</h1>
                <p>
                  Premium product browsing, animated panels, dark &amp; light
                  modes, and wallet-ready checkout — all in one place.
                </p>
                <div className="button-row">
                  <PremiumButton
                    kind="accent"
                    disabled={!featuredProduct}
                    onClick={() => featuredProduct && addToCart(featuredProduct)}
                  >
                    Buy featured item
                    <ArrowRight size={15} aria-hidden="true" />
                  </PremiumButton>
                  <PremiumButton kind="ghost" onClick={connectMetaMask}>
                    <Wallet size={15} aria-hidden="true" />
                    Connect wallet
                  </PremiumButton>
                </div>
              </div>

              {/* hero product */}
              {featuredProduct ? (
                <motion.button
                  className="feature-product"
                  onClick={() => setDetailProduct(featuredProduct)}
                  type="button"
                  whileHover={{ scale: 1.018 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* auto-cycling image */}
                  <HeroImageCycle product={featuredProduct} />

                  <div className="product-footer">
                    <div className="product-desc">
                      <strong>{featuredProduct.name}</strong>
                      {featuredProduct.desc ? <span>{featuredProduct.desc}</span> : null}
                    </div>
                    <div className="product-price">
                      <strong style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {ethLabel(featuredProduct.price)}
                      </strong>
                      <span>~${Math.round(featuredProduct.price * ethToUsd).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.button>
              ) : (
                <div className="empty-feature">
                  <strong>No products yet.</strong>
                  <span>Send the next items when you are ready.</span>
                </div>
              )}
            </motion.section>

            {/* ── Catalog ── */}
            <section className="catalog">
              <div className="section-heading">
                <div>
                  <h2>Featured products</h2>
                  <p>Filter the shelf and tap any item for details.</p>
                </div>
                <span className="count-pill">
                  <SlidersHorizontal size={15} aria-hidden="true" />
                  {filteredProducts.length} items
                </span>
              </div>

              <div className="category-row">
                {categories.map((cat) => (
                  <button
                    className={activeCategory === cat ? "active" : ""}
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>

              <motion.div className="product-grid" layout>
                <AnimatePresence>
                  {filteredProducts.map((p, i) => (
                    <ProductCard
                      addToCart={addToCart}
                      index={i}
                      key={p.id}
                      liked={favorites.includes(p.id)}
                      openDetails={() => { setSelected(p); setDetailProduct(p); }}
                      product={p}
                      selected={selected?.id === p.id}
                      toggleFavorite={() => toggleFavorite(p.id)}
                    />
                  ))}
                </AnimatePresence>
                {filteredProducts.length === 0 ? (
                  <p className="empty-catalog">No products found.</p>
                ) : null}
              </motion.div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="side-column">
            <WalletPanel
              connectMetaMask={connectMetaMask}
              error={walletError}
              status={walletStatus}
              walletAddress={walletAddress}
            />
            <CartPanel
              cart={cart}
              cartCount={cartCount}
              changeQty={changeQty}
              checkout={checkout}
              totalEth={totalEth}
            />
          </aside>
        </main>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="toast"
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            key="toast"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* product modal */}
      <AnimatePresence>
        {detailProduct ? (
          <ProductModal
            addToCart={addToCart}
            close={() => setDetailProduct(null)}
            liked={favorites.includes(detailProduct.id)}
            product={detailProduct}
            toggleFavorite={() => toggleFavorite(detailProduct.id)}
          />
        ) : null}
      </AnimatePresence>

      {/* checkout blocked modal */}
      <AnimatePresence>
        {showCheckoutBlocked ? (
          <CheckoutBlockedModal
            close={() => setShowCheckoutBlocked(false)}
            totalEth={totalEth}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
