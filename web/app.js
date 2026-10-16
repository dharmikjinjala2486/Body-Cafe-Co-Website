/* Body Café Co. — storefront preview.
   View layer: templates + interaction. Data, cart, checkout, account and ops logic live further down. */
const requestedDesign = new URL(location.href).searchParams.get("design");
let activeDesign = "c";
try {
  activeDesign = requestedDesign === "d" || requestedDesign === "c" ? requestedDesign : sessionStorage.getItem("bcc-design") || "c";
  if (!["c", "d"].includes(activeDesign)) activeDesign = "c";
  sessionStorage.setItem("bcc-design", activeDesign);
} catch { activeDesign = requestedDesign === "d" ? "d" : "c"; }
document.body.dataset.design = activeDesign;
const $ = (s) => document.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const date = (n) => new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const icon = (name) =>
  ({
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6.5 18.5 12 13 17.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  })[name] || "";
function readCart() {
  try {
    const x = JSON.parse(localStorage.getItem("bcc-cart") || "[]");
    return Array.isArray(x)
      ? x.filter((i) => typeof i.id === "string" && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 10)
      : [];
  } catch {
    return [];
  }
}
const state = {
  catalog: [],
  bundles: [],
  flags: { ingredient_library: true },
  user: null,
  csrf: "",
  cart: readCart(),
  account: null,
  ops: null,
  filter: "all",
  otp: null,
  sessionReady: false,
};
const format = {
  "iron-bisglycinate": "Capsules",
  "l-theanine": "Capsules",
  "vitamin-d3-k2": "Softgels",
  "omega-3-fish-oil": "Softgels",
  "myo-d-chiro-inositol": "Capsules",
  "creatine-chews": "Chewable tablets",
  "psyllium-husk": "Capsules",
};
/* Cut-out bottle dimensions (height 1000). */
const bottleWidth = {
  "creatine-chews": 716,
  "iron-bisglycinate": 774,
  "l-theanine": 774,
  "myo-d-chiro-inositol": 716,
  "omega-3-fish-oil": 715,
  "psyllium-husk": 714,
  "vitamin-d3-k2": 667,
};
/* Short names for the large display type. */
const shortName = {
  "iron-bisglycinate": "Iron",
  "l-theanine": "Theanine",
  "vitamin-d3-k2": "D3 + K2",
  "omega-3-fish-oil": "Omega-3",
  "myo-d-chiro-inositol": "Inositol",
  "creatine-chews": "Creatine",
  "psyllium-husk": "Psyllium",
};
const product = (id) => state.catalog.find((p) => p.id === id);
const image = (p, cls = "", eager = false) =>
  p
    ? `<img class="bottle ${cls}" src="/web/media/${p.id}.webp" alt="${escape(p.name)} bottle" width="${bottleWidth[p.id] || 720}" height="1000" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`
    : "";
/* Text colour that reads on a given cap colour. */
function onCap(hex) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.18 ? "#2d2926" : "#f8f7f3";
}
const capStyle = (p) => `--cap:${p.color};--on-cap:${onCap(p.color)}`;
async function api(path, data) {
  const res = await fetch("/api" + path, {
    method: data === undefined ? "GET" : "POST",
    headers: data === undefined ? {} : { "Content-Type": "application/json", "X-CSRF-Token": state.csrf },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const value = await res.json();
  if (!res.ok) throw new Error(value.error || "Please try again.");
  return value;
}
async function session() {
  const s = await api("/session");
  state.user = s.user;
  state.csrf = s.csrf;
  state.sessionReady = true;
}
function toast(text) {
  const t = $("#toast");
  t.textContent = text;
  t.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("visible"), 4500);
}
function saveCart() {
  localStorage.setItem("bcc-cart", JSON.stringify(state.cart));
}
function event(name) {
  let consent = false;
  try {
    consent = JSON.parse(localStorage.getItem("bcc-preferences") || "{}").analytics === true;
  } catch {}
  if (consent) api("/events", { name }).catch(() => {});
}
function total() {
  return state.cart.reduce((n, i) => n + (product(i.id)?.price || 0) * i.quantity, 0);
}
function count() {
  return state.cart.reduce((n, i) => n + i.quantity, 0);
}
function add(id, quantity = 1) {
  const p = product(id);
  if (!p || !p.published || p.stock < 1) return toast("This product is out of preview stock.");
  const existing = state.cart.find((i) => i.id === id);
  const qty = (existing?.quantity || 0) + quantity;
  if (qty > Math.min(10, p.stock)) return toast("That's more than the preview stock allows.");
  if (existing) existing.quantity = qty;
  else state.cart.push({ id, quantity });
  saveCart();
  event("cart_add");
  renderHeaderCount(true);
  toast(`Added ${p.name} to your bag.`);
}
function renderHeaderCount(bump = false) {
  document.querySelectorAll(".bag-link").forEach((a) => a.setAttribute("aria-label", `Bag, ${count()} items`));
  document.querySelectorAll("[data-cart-count]").forEach((x) => {
    x.textContent = count();
    x.toggleAttribute("data-empty", !count());
    if (bump && !reducedMotion()) {
      x.classList.remove("bump");
      void x.offsetWidth;
      x.classList.add("bump");
    }
  });
}
function badge(text, kind = "") {
  return `<span class="badge ${kind}">${escape(text.replaceAll("_", " "))}</span>`;
}
function link(label, url, cls = "button") {
  return `<a class="${cls}" href="${url}"><span>${label}</span>${cls.includes("button") ? icon("arrow") : ""}</a>`;
}
function heading(kicker, title, description = "") {
  return `<header class="page-heading">${kicker ? `<p class="kicker">${kicker}</p>` : ""}<h1 class="display">${title}</h1>${description ? `<p class="lede">${description}</p>` : ""}</header>`;
}
function empty(title, text, cta = "Shop all seven", href = "/shop") {
  return `<div class="empty"><div class="empty-caps" aria-hidden="true">${state.catalog
    .slice(0, 7)
    .map((p) => `<span style="--cap:${p.color}"></span>`)
    .join("")}</div><h2>${title}</h2><p>${text}</p>${link(cta, href)}</div>`;
}
function price(p) {
  return `<span class="price">${money(p.price)}</span><span class="sample-price">Sample price</span>`;
}
/* Cap seen from above: ribbed rim + flat top. */
function cap(p, cls = "") {
  return `<span class="cap ${cls}" style="--cap:${p.color}" aria-hidden="true"></span>`;
}
function card(p) {
  const unavailable = !p.stock || !p.published;
  return `<article class="tile" style="${capStyle(p)}"><a class="tile-media" href="/products/${p.id}" aria-label="${escape(p.name)}">${image(p)}</a><div class="tile-body"><h3><a href="/products/${p.id}">${escape(p.name)}</a></h3><p>${format[p.id]}</p><div class="tile-foot">${price(p)}<button class="tile-add" data-add="${p.id}" aria-label="Add ${escape(p.name)} to bag" ${unavailable ? "disabled" : ""}>${icon("plus")}<span>${unavailable ? "Unavailable" : "Add"}</span></button></div></div></article>`;
}
function grid(products = state.catalog) {
  return `<div class="tile-grid">${products.map(card).join("")}</div>`;
}
function shell(content) {
  const mobile = state.user?.mobile;
  const path = location.pathname;
  const nav = [
    ["/shop", "Shop"],
    ["/standards", "Standards"],
    ["/learn", "Learn"],
    ["/story", "Story"],
    ["/reports", "Lot reports"],
  ];
  const current = (href) => (path === href || path.startsWith(href + "/") ? ' aria-current="page"' : "");
  return `<div class="preview-bar"><p>Preview store. Prices are samples and no payment is taken.</p><nav class="design-switch" aria-label="Choose design concept"><a data-design-link href="/concepts/index.html?concept=a">A <span>Warm editorial</span></a><a data-design-link href="/concepts/index.html?concept=b">B <span>Expressive everyday</span></a><a data-design-link href="/?design=c"${activeDesign === "c" ? ' aria-current="page"' : ""}>C <span>Claude design</span></a><a data-design-link href="/?design=d"${activeDesign === "d" ? ' aria-current="page"' : ""}>D <span>Morning counter</span></a></nav><a href="/ops">Operations preview</a></div><header class="site-header"><a class="logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/logo.svg" alt="" width="465" height="451"></a><nav class="main-nav" aria-label="Main">${nav.map(([h, l]) => `<a href="${h}"${current(h)}>${l}</a>`).join("")}</nav><div class="header-tools"><button class="icon-button" data-action="search" aria-label="Search">${icon("search")}</button><a class="icon-button" href="/account" aria-label="Your account">${icon("user")}</a><a class="bag-link" href="/cart" aria-label="Bag, ${count()} items">${icon("bag")}<span data-cart-count ${count() ? "" : "data-empty"}>${count()}</span></a><button class="menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav"><span>Menu</span></button></div></header><nav id="mobile-nav" hidden aria-label="Mobile"><div class="mobile-nav-links">${[
    ["/shop", "Shop all seven"],
    ["/bundles", "The edits"],
    ["/standards", "Standards"],
    ["/learn", "Learn"],
    ["/story", "Story"],
    ["/reports", "Lot reports"],
  ]
    .map(([h, l]) => `<a href="${h}">${l}</a>`)
    .join(
      "",
    )}</div><div class="mobile-nav-foot"><a href="/account">Account${mobile ? " (…" + escape(mobile.slice(-4)) + ")" : ""}</a><a href="/help">Help</a><a href="/cart">Bag (<span data-cart-count>${count()}</span>)</a></div><div class="mobile-nav-caps" aria-hidden="true">${state.catalog.map((p) => cap(p)).join("")}</div></nav><main id="main" tabindex="-1">${content}</main><footer class="site-footer"><div class="footer-top"><div class="footer-pitch"><p>Seven everyday supplements. Explore ingredients, formats and a demonstration of the lot-report experience.</p>${link("Shop all seven", "/shop", "button light")}</div><div class="footer-cols"><div><h3>Shop</h3><a href="/shop">All products</a><a href="/bundles">The edits</a><a href="/reports">Lot reports</a><a href="/search">Search</a></div><div><h3>About</h3><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/story">Story</a></div><div><h3>Help</h3><a href="/help">Help centre</a><a href="/contact">Contact</a><a href="/account">Track an order</a><a href="/settings">Preferences</a></div><div><h3>Policies</h3>${["shipping", "returns", "cancellation", "privacy", "terms"].map((x) => `<a href="/policies/${x}">${x[0].toUpperCase() + x.slice(1)}</a>`).join("")}</div></div></div><div class="footer-caps" aria-hidden="true">${state.catalog.map((p) => cap(p)).join("")}</div><p class="footer-word" aria-hidden="true">Body Cafe Co</p><div class="footer-bottom"><span>© ${new Date().getFullYear()} Body Café Co.</span><span>Draft copy, preview commerce</span><a href="/ops">Operations preview</a></div></footer>`;
}

/* ---------- Home ---------- */
function home() {
  const list = state.catalog.filter((p) => p.published);
  if (activeDesign === "d" && window.BCCDirectionD) {
    return window.BCCDirectionD({list, image, cap, capStyle, escape, money, format, shortName, link, menuBoard, homeLot});
  }
  const first = product("vitamin-d3-k2") || list[0];
  if (!first) return notFound();
  return `<section class="counter" data-counter style="${capStyle(first)}" aria-labelledby="counter-title"><div class="counter-ghost" aria-hidden="true"><span data-counter-ghost>${escape(shortName[first.id] || first.name)}</span></div><div class="counter-copy"><h1 id="counter-title" class="display">Seven everyday essentials. Pick a cap.</h1><p class="counter-lede">Seven supplements. A closer look at ingredients, formats and the details behind your choice. Explore the collection while final labels and evidence are prepared.</p><div class="counter-actions">${link("Shop all seven", "/shop", "button on-cap")}${link("Explore our standards", "/standards", "text-link")}</div></div><div class="counter-stage"><div class="counter-bottles">${list
    .map(
      (p) =>
        `<a class="counter-bottle ${p.id === first.id ? "is-active" : ""}" data-counter-bottle="${p.id}" href="/products/${p.id}" tabindex="${p.id === first.id ? 0 : -1}" aria-hidden="${p.id === first.id ? "false" : "true"}">${image(p, "", p.id === first.id)}</a>`,
    )
    .join(
      "",
    )}</div><div class="counter-card" aria-live="polite"><p class="counter-name" data-counter-name>${escape(first.name)}</p><p class="counter-sub" data-counter-sub>${escape(first.subtitle)}</p><p class="counter-meta"><span data-counter-format>${format[first.id]}</span><span data-counter-price>${money(first.price)}</span></p><a class="text-link" data-counter-link href="/products/${first.id}">View product</a></div></div><div class="counter-rail" role="group" aria-label="Choose a product">${list
    .map(
      (p) =>
        `<button class="counter-cap" data-counter-pick="${p.id}" data-color="${p.color}" aria-pressed="${p.id === first.id}" aria-label="${escape(p.name)}">${cap(p)}<span class="cap-label">${escape(shortName[p.id] || p.name)}</span></button>`,
    )
    .join("")}</div></section>${window.BCCHome.strip()}${menuBoard(list)}${window.BCCHome.evidence()}${window.BCCHome.voices()}${homeLot()}${window.BCCHome.story()}${window.BCCHome.learn()}${window.BCCHome.care()}`;
}
function menuBoard(list) {
  return `<section class="section menu" aria-labelledby="menu-title"><div class="section-head"><h2 id="menu-title" class="display">Today's menu</h2><p>The full collection on one board. Open a line for the details, or add it straight to your bag.</p></div><ul class="menu-board">${list
    .map(
      (p) =>
        `<li class="menu-row" style="${capStyle(p)}" data-peek="${p.id}"><a href="/products/${p.id}" class="menu-link">${cap(p, "menu-cap")}<span class="hc-menu-name"><span class="menu-name">${escape(p.name)}</span><span class="menu-summary">${escape(p.subtitle)}</span></span><span class="menu-format">${format[p.id]}</span><span class="menu-leader" aria-hidden="true"></span><span class="menu-price">${money(p.price)}</span></a><button class="menu-add" data-add="${p.id}" aria-label="Add ${escape(p.name)} to bag" ${!p.stock || !p.published ? "disabled" : ""}>${icon("plus")}</button></li>`,
    )
    .join(
      "",
    )}</ul><p class="menu-note">All prices are samples. Pack sizes, serving quantities, directions and approved product purposes are awaiting final labels. Final prices, GST and delivery are confirmed before launch.</p><div class="menu-peek" aria-hidden="true">${list.map((p) => `<img src="/web/media/${p.id}.webp" alt="" data-peek-img="${p.id}" width="${bottleWidth[p.id]}" height="1000" loading="lazy">`).join("")}</div></section>`;
}
function homeLot() {
  return `<section id="home-report" class="lot-band" aria-labelledby="lot-title"><div class="lot-inner"><div class="lot-copy"><h2 id="lot-title" class="display">Turn the bottle over.</h2><p>Understand the evidence before you choose. Already have a bottle? Its lot number connects a pack to the corresponding batch record.</p>${window.BCCHome.example()}</div><form id="home-lot" class="lot-form"><label for="home-lot-product">Product</label><select id="home-lot-product" name="product">${state.catalog.map((p, i) => `<option value="${p.id}" data-sample="DEMO-${String(i + 1).padStart(2, "0")}-01">${escape(p.name)}</option>`).join("")}</select><label for="home-lot-number">Lot number</label><div class="lot-input"><input id="home-lot-number" name="lot" placeholder="DEMO-01-01" maxlength="60" required autocomplete="off"><button class="button on-dark" type="submit">Look up</button></div><p class="micro">Demonstration only. Try <button type="button" class="link-button" data-fill-lot>the sample lot</button> for the product you picked. No real laboratory document is connected.</p></form></div></section>`;
}
const faqs = [
  [
    "Where do I find my lot report?",
    "Pick your product on the lot reports page and enter the lot number printed on the pack. The preview has sample records so you can try it.",
  ],
  [
    "Can I buy without an account?",
    "Yes. Checkout works as a guest. Sign in later with your mobile number and matching guest orders move into your account.",
  ],
  ["Are these the final prices?", "No. Every price in the preview is a sample. Final prices, shipping rules and offers are still being approved."],
  [
    "How do returns work?",
    "Final return eligibility, timing and remedies are still being approved. See the working returns policy; this preview does not promise a return window.",
  ],
  [
    "Who do I contact about a product issue?",
    "Open a support case and choose Product safety. It's flagged as a priority and you get a case ID to follow.",
  ],
];
function faqList() {
  return faqs.map(([q, a]) => `<details><summary><span>${q}</span>${icon("plus")}</summary><p>${a}</p></details>`).join("");
}

/* ---------- Shop ---------- */
function shop() {
  const q = new URL(location.href).searchParams;
  const selected = q.get("format") || "all";
  const category = q.get("category") || "all";
  const list = state.catalog.filter(
    (p) => p.published && (selected === "all" || format[p.id] === selected) && (category === "all" || p.category === category),
  );
  return `<section class="section shop">${heading("", "Shop all seven", "Capsules, softgels and chews. Every product page has the ingredient, the format and a link to its lot reports.")}<div class="shop-tools"><nav class="filter-tabs" aria-label="Filter by format">${["all", "Capsules", "Softgels", "Chewable tablets"].map((f) => `<a ${f === selected ? 'aria-current="page"' : ""} href="/shop${f === "all" ? "" : "?format=" + encodeURIComponent(f)}">${f === "all" ? "All" : f}</a>`).join("")}</nav><span class="count">${list.length} product${list.length === 1 ? "" : "s"}</span></div>${list.length ? grid(list) : empty("Nothing in that format yet.", "Try another format or see the full range.", "Show all products", "/shop")}<p class="note-line">Sample prices. Full quantities, claims and rear-label information are reviewed before launch.</p></section>`;
}

/* ---------- Product ---------- */
function detail(p) {
  if (!p) return notFound();
  event("product_view");
  const unavailable = !p.stock || !p.published;
  return `<section class="pdp" style="${capStyle(p)}"><div class="pdp-stage"><span class="pdp-ghost" aria-hidden="true">${escape(shortName[p.id] || p.name)}</span>${image(p, "pdp-bottle", true)}<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/shop">Shop</a><span aria-hidden="true">/</span><span>${escape(p.name)}</span></nav></div><div class="pdp-info"><p class="pdp-format">${format[p.id]} · ${escape(p.category)}</p><h1 class="display pdp-title">${escape(p.name)}</h1><p class="pdp-sub">${escape(p.subtitle)}</p><div class="pdp-price">${price(p)}</div><p class="pdp-desc">Read what's inside, how the format works, and the record for your lot, before you decide.</p><div class="buy-row"><div class="qty-select"><label for="product-quantity">Qty</label><select id="product-quantity">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></div><button class="button cap-button" data-action="add-product" data-id="${p.id}" ${unavailable ? "disabled" : ""}><span>${unavailable ? "Unavailable" : "Add to bag"}</span>${icon("plus")}</button></div><p class="micro">Preview order only. No payment or dispatch.</p><dl class="fact-lines"><div><dt>Format</dt><dd>${format[p.id]}</dd></div><div><dt>Purchase</dt><dd>One-time</dd></div><div><dt>Serving and pack</dt><dd>Awaiting approved label</dd></div></dl><form id="pincode-form" class="pincode-form"><label for="pincode">Check delivery to your pincode</label><div><input id="pincode" name="pincode" inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" required><button type="submit">Check</button></div><p id="pincode-result" class="micro" role="status"></p></form><a class="lot-callout" href="/reports?product=${p.id}"><span>Have this bottle already?</span><strong>Find your lot report</strong>${icon("arrow")}</a><div class="accordion"><details open><summary><span>What's inside</span>${icon("plus")}</summary><p>${escape(p.ingredients)}.</p><p>Full ingredients, amounts per serving, allergens and nutrition facts will come from the approved rear label.</p></details><details><summary><span>How to use</span>${icon("plus")}</summary><p>Directions and storage are waiting on approved label data. The preview doesn't suggest a dose.</p></details><details><summary><span>Before you choose</span>${icon("plus")}</summary><p>Cautions and warnings will be added from reviewed material. Nothing here is a diagnosis or personal health advice.</p></details><details><summary><span>Testing and evidence</span>${icon("plus")}</summary><p>A report describes the sample tested from a specific lot. It doesn't prove an individual pack is authentic.</p><a class="text-link" href="/reports?product=${p.id}">Look up a lot</a></details><details><summary><span>Delivery and returns</span>${icon("plus")}</summary><p>See the working shipping and returns policies. Fees and eligibility aren't final yet.</p><a class="text-link" href="/policies/returns">Returns policy</a></details></div></div></section><section class="section reviews-section"><h2 class="display">Reviews</h2><p>Reviews appear only after a verified delivery and moderation. We won't fill this space with made-up ones.</p><a href="/account" class="text-link">Leave a review for a delivered order</a></section><section class="section related"><div class="section-head"><h2 class="display">Also on the menu</h2></div>${grid(state.catalog.filter((x) => x.published && x.id !== p.id).slice(0, 3))}</section>`;
}

/* ---------- Bundles ---------- */
function bundleGrid() {
  return `<div class="edit-grid">${state.bundles
    .map((b) => {
      const items = b.items.map(product).filter(Boolean);
      return `<article class="edit-card" style="--cap-a:${items[0]?.color};--cap-b:${items[1]?.color}"><a class="edit-media" href="/bundles/${b.id}" aria-label="${escape(b.name)}">${items.map((p) => image(p)).join("")}</a><div class="edit-body"><h3>${escape(b.name)}</h3><p>${items.map((p) => escape(p.name)).join(" and ")}</p><p class="edit-price"><strong>${money(items.reduce((n, p) => n + p.price, 0))}</strong> sample total, no discount</p>${link("See this edit", "/bundles/" + b.id, "text-link")}</div></article>`;
    })
    .join("")}</div>`;
}
function bundles(id) {
  const b = state.bundles.find((b) => b.id === id);
  if (id && !b) return notFound();
  if (!b)
    return `<section class="section">${heading("", "The edits", "Example pairings for browsing. Final bundles and any savings need approval, and none of these is a recommendation to take products together.")}${bundleGrid()}</section>`;
  const items = b.items.map(product).filter(Boolean);
  return `<section class="section">${heading("The edits", escape(b.name), escape(b.description))}<div class="bundle-detail"><div class="edit-media large" style="--cap-a:${items[0]?.color};--cap-b:${items[1]?.color}">${items.map((p) => image(p)).join("")}</div><div class="bundle-lines"><h2>In this edit</h2>${items.map((p) => `<div class="bundle-line"><a href="/products/${p.id}">${cap(p)}${p.name}</a><span>${money(p.price)}</span></div>`).join("")}<div class="bundle-line total"><strong>Sample total</strong><strong>${money(items.reduce((n, p) => n + p.price, 0))}</strong></div><p class="micro">No discount applied. Stock is checked for each product. This isn't a recommendation to take these together.</p><button class="button full" data-bundle="${b.id}"><span>Add both to bag</span>${icon("plus")}</button></div></div></section>`;
}

/* ---------- Editorial ---------- */
function standards() {
  const steps = [
    ["The product", "An approved product record fixes the formula, directions, claims and label."],
    ["The lot", "The lot record connects a manufacturing batch to that product and its evidence."],
    ["The public report", "A readable summary and the approved source files show what was tested."],
    ["What it can't tell you", "A lot report isn't a diagnosis, a promise of results, or proof that a single pack is authentic."],
  ];
  return `<section class="section">${heading("Standards", "The detail behind the bottle", "Clarity starts with being specific: what we know, what we show, and what a report can and can't tell you.")}<div class="standards-hero"><div class="standards-art">${["omega-3-fish-oil", "iron-bisglycinate", "l-theanine"]
    .map(product)
    .filter(Boolean)
    .map((p) => image(p))
    .join(
      "",
    )}</div><p class="big-quote">Ingredients and reports deserve more than a small badge. Each product links to its approved label and to the evidence for its manufacturing lot.</p></div><ol class="step-list four">${steps.map(([t, d]) => `<li><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol><div class="note-panel"><strong>Where things stand</strong><p>The preview uses illustrative lot records. No laboratory reports, certifications or clinical claims have been supplied or asserted.</p></div>${link("Try a lot lookup", "/reports")}</section>`;
}
const learning = [
  ["reading-a-label", "Read a label with confidence", "Ingredient names, serving sizes and the other details on your pack."],
  ["understanding-reports", "What a lot report shows", "The difference between a product, a manufacturing lot and a tested sample."],
  ["ingredient-forms", "Why ingredient forms matter", "Why the full ingredient name matters when you compare products."],
];
function learn(slug) {
  const item = learning.find((x) => x[0] === slug);
  const p = product(slug);
  if (slug && !item && !p) return notFound();
  if (item)
    return `<article class="section article">${heading("Guide", item[1], item[2])}${slug === "reading-a-label" ? `<h2>Start with the serving</h2><p>The amount per serving and the number of units in that serving are different pieces of information. Read them together before comparing products.</p><h2>Read the full ingredient list</h2><p>The headline ingredient doesn't describe the whole formula. Look for the complete list, allergens, directions, warnings, storage and manufacturer details.</p><h2>Keep the lot number</h2><p>Your pack's lot number links it to manufacturing records. It's different from a barcode, SKU or order number.</p>` : slug === "understanding-reports" ? `<h2>A product is not a lot</h2><p>One product can have many manufacturing lots. A report should name the sample and lot it describes.</p><h2>Look at what was tested</h2><p>Read the test, result, units, method and any stated limits together. A result shouldn't be called a pass without a reviewed specification to compare it to.</p><h2>Know what it can't prove</h2><p>A lab result doesn't promise a health outcome or verify every pack. Our summaries and files are reviewed before publishing.</p>` : `<h2>The full name matters</h2><p>An ingredient's form is part of its identity. Keep the form next to the quantity and serving, rather than reducing it to a short marketing name.</p><h2>Compare like with like</h2><p>For formulas with several ingredients, compare each declared component. Final product pages will use the approved quantities and wording from their labels.</p>`}<p>${link("All guides", "/learn", "text-link")}</p></article>`;
  if (p)
    return `<section class="section article ingredient" style="${capStyle(p)}">${heading("Ingredient notes", escape(p.name), escape(p.subtitle))}<div class="ingredient-inline"><div class="ingredient-art">${image(p)}</div><div><h2>What's in view</h2><p>${escape(p.ingredients)}.</p><p>Amounts, sources, approved uses and references are waiting on the reviewed product record. This page doesn't turn an ingredient name into a health claim.</p>${link("View the product", "/products/" + p.id)}</div></div><p>${link("All guides", "/learn", "text-link")}</p></section>`;
  return `<section class="section">${heading("Learn", "Read the label, then the lot", "Short guides on labels, ingredient forms and what a lot report can show.")}<div class="learning-grid">${learning.map((a) => `<a class="learning-card" href="/learn/${a[0]}"><h2>${a[1]}</h2><p>${a[2]}</p><span class="text-link">Read the guide</span></a>`).join("")}</div><div class="section-head below"><h2 class="display">Ingredients</h2><p>Notes for each product. Specific amounts arrive with approved specifications.</p></div><ul class="ingredient-list">${state.catalog.map((p) => `<li><a href="/learn/${p.id}">${cap(p)}<strong>${p.name}</strong><span>${escape(p.ingredients)}</span></a></li>`).join("")}</ul></section>`;
}
function story() {
  return `<section class="section story-page">${heading("Story", "Curiosity is a good place to start", "Body Café Co. is built around one idea: the details should be easy to find.")}<div class="story-shelf" aria-hidden="true">${state.catalog.map((p) => image(p)).join("")}</div><div class="story-text"><h2>Make room for understanding</h2><p>A product name is a starting point. The ingredients, the label and the lot record should help you take the next step with confidence.</p><p>The founder's story, team and original photography will be added in their own words. This draft doesn't invent a history, credentials or endorsements.</p>${link("Read our standards", "/standards", "text-link")}</div></section>`;
}

/* ---------- Lot reports ---------- */
function reports() {
  const params = new URL(location.href).searchParams;
  const pid = product(params.get("product")) ? params.get("product") : "vitamin-d3-k2";
  const index = Math.max(
    0,
    state.catalog.findIndex((p) => p.id === pid),
  );
  const current = product(pid);
  return `<section class="section report-page" style="${current ? capStyle(current) : ""}">${heading("Lot reports", "Your lot, your record", "Choose your product, then enter the lot number printed on the pack.")}<div class="report-layout"><div><div class="report-product-picker" role="group" aria-label="Choose your product">${state.catalog.map((p) => `<button style="${capStyle(p)}" class="${p.id === pid ? "selected" : ""}" data-report-product="${p.id}" aria-pressed="${p.id === pid}">${image(p)}<span>${p.name}</span></button>`).join("")}</div><details class="lot-guide"><summary><span>Where's my lot number?</span>${icon("plus")}</summary><p>A location guide will be added from the final rear label. Your lot number is different from your order number or barcode.</p></details></div><form id="report-form" class="form-panel"><label for="report-product">Product</label><select id="report-product" name="product">${state.catalog.map((p) => `<option value="${p.id}" ${p.id === pid ? "selected" : ""}>${p.name}</option>`).join("")}</select><label for="lot">Lot number</label><input id="lot" name="lot" value="${escape(params.get("lot") || "")}" placeholder="e.g. DEMO-${String(index + 1).padStart(2, "0")}-01" maxlength="60" required autocomplete="off"><p class="micro">For a sample match, try <strong id="sample-lot">DEMO-${String(index + 1).padStart(2, "0")}-01</strong>.</p><button class="button full" type="submit"><span>Look up lot</span>${icon("arrow")}</button><details class="sample-states"><summary><span>Try other sample results</span>${icon("plus")}</summary><div class="sample-buttons">${[
    ["UNKNOWN", "Not found"],
    ["DEMO-UNPUBLISHED", "Unpublished"],
    ["DEMO-WITHDRAWN", "Withdrawn"],
    ["DEMO-OUTAGE", "Service down"],
  ]
    .map(([s, l]) => `<button type="button" data-sample-lot="${s}">${l}</button>`)
    .join(
      "",
    )}</div></details><p class="micro">Preview records only. A lot report doesn't authenticate an individual pack.</p><div id="report-result" role="status" aria-live="polite"></div></form></div></section>`;
}

/* ---------- Interaction layer ---------- */
const counter = {
  root: null,
  timer: 0,
  paused: false,
  current: "",
  pick(id, byUser = false) {
    const root = this.root;
    const p = product(id);
    if (!root || !p || id === this.current) return;
    this.current = id;
    if (byUser) this.stop();
    root.style.setProperty("--cap", p.color);
    root.style.setProperty("--on-cap", onCap(p.color));
    $$("[data-counter-pick]", root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.counterPick === id)));
    $$("[data-counter-bottle]", root).forEach((b) => {
      const on = b.dataset.counterBottle === id;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-hidden", String(!on));
      b.tabIndex = on ? 0 : -1;
      if (on) b.querySelector("img")?.removeAttribute("loading");
    });
    const ghost = root.querySelector("[data-counter-ghost]");
    if (ghost) {
      ghost.classList.remove("swap");
      void ghost.offsetWidth;
      ghost.textContent = shortName[id] || p.name;
      ghost.classList.add("swap");
    }
    root.querySelector("[data-counter-name]").textContent = p.name;
    root.querySelector("[data-counter-sub]").textContent = p.subtitle;
    root.querySelector("[data-counter-format]").textContent = format[id];
    root.querySelector("[data-counter-price]").textContent = money(p.price);
    root.querySelector("[data-counter-link]").setAttribute("href", "/products/" + id);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", p.color);
  },
  next() {
    const ids = $$("[data-counter-pick]", this.root).map((b) => b.dataset.counterPick);
    this.pick(ids[(ids.indexOf(this.current) + 1) % ids.length]);
  },
  start() {
    clearInterval(this.timer);
    if (reducedMotion() || this.paused) return;
    this.timer = setInterval(() => {
      if (!document.hidden && this.root?.isConnected) this.next();
      else if (!this.root?.isConnected) clearInterval(this.timer);
    }, 3800);
  },
  stop() {
    this.paused = true;
    clearInterval(this.timer);
  },
  mount(root) {
    clearInterval(this.timer);
    this.root = root;
    if (!root) return;
    this.current = root.querySelector('[aria-pressed="true"]')?.dataset.counterPick || "";
    root.addEventListener("pointerenter", () => clearInterval(this.timer));
    root.addEventListener("pointerleave", () => this.start());
    root.addEventListener("focusin", () => clearInterval(this.timer));
    const rail = root.querySelector(".counter-rail");
    rail?.addEventListener("pointerover", (e) => {
      const b = e.target.closest("[data-counter-pick]");
      if (b && e.pointerType === "mouse" && !root.hasAttribute("data-counter-manual")) this.pick(b.dataset.counterPick);
    });
    // Arrow keys move through the caps.
    rail?.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const btns = $$("[data-counter-pick]", rail);
      const i = btns.indexOf(document.activeElement);
      const n = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
      n.focus();
      this.pick(n.dataset.counterPick, true);
      e.preventDefault();
    });
    tilt(root.querySelector(".counter-stage"), root);
    this.paused = true;
  },
};

/* Bottle leans toward the pointer. */
function tilt(target, area) {
  if (!target || reducedMotion() || !matchMedia("(pointer: fine)").matches) return;
  let raf = 0,
    tx = 0,
    ty = 0,
    x = 0,
    y = 0;
  const loop = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    target.style.setProperty("--tx", x.toFixed(3));
    target.style.setProperty("--ty", y.toFixed(3));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
  };
  area.addEventListener("pointermove", (e) => {
    const r = area.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  area.addEventListener("pointerleave", () => {
    tx = ty = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  });
}

/* Menu board: the bottle follows the cursor over the price list. */
function menuPeek(section) {
  if (!section || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const peek = section.querySelector(".menu-peek");
  const board = section.querySelector(".menu-board");
  let raf = 0,
    tx = 0,
    ty = 0,
    x = 0,
    y = 0,
    lastX = 0,
    vel = 0;
  const motion = !reducedMotion();
  const loop = () => {
    x += (tx - x) * (motion ? 0.16 : 1);
    y += (ty - y) * (motion ? 0.16 : 1);
    vel += ((x - lastX) * 0.6 - vel) * 0.2;
    lastX = x;
    peek.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.max(-12, Math.min(12, vel)).toFixed(2)}deg)`;
    raf = requestAnimationFrame(loop);
  };
  board.addEventListener("pointermove", (e) => {
    const r = section.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    const row = e.target.closest("[data-peek]");
    if (row) {
      $$("[data-peek-img]", peek).forEach((img) => img.classList.toggle("is-on", img.dataset.peekImg === row.dataset.peek));
      peek.style.setProperty("--cap", product(row.dataset.peek)?.color);
    }
  });
  board.addEventListener("pointerenter", (e) => {
    const r = section.getBoundingClientRect();
    x = tx = e.clientX - r.left;
    y = ty = e.clientY - r.top;
    peek.classList.add("is-visible");
    if (!raf) raf = requestAnimationFrame(loop);
  });
  board.addEventListener("pointerleave", () => {
    peek.classList.remove("is-visible");
    cancelAnimationFrame(raf);
    raf = 0;
  });
}

/* Header picks up a shadow once the page scrolls. */
let scrollBound = false;
function headerState() {
  if (scrollBound) return;
  scrollBound = true;
  const update = () => document.body.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", update, { passive: true });
  update();
}

function openMenu() {
  const nav = $("#mobile-nav");
  const b = $("[data-action=menu]");
  if (!nav) return;
  nav.hidden = false;
  document.body.classList.add("menu-open");
  b?.setAttribute("aria-expanded", "true");
  b && (b.querySelector("span").textContent = "Close");
}
function closeMenu() {
  const nav = $("#mobile-nav");
  const b = $("[data-action=menu]");
  if (!nav || nav.hidden) return;
  nav.hidden = true;
  document.body.classList.remove("menu-open");
  b?.setAttribute("aria-expanded", "false");
  b && (b.querySelector("span").textContent = "Menu");
}

/* Run after every render. */
function enhance() {
  counter.paused = false;
  counter.mount($("[data-counter]"));
  menuPeek($(".menu"));
  headerState();
  document.body.classList.remove("menu-open");
  if (!$("[data-counter]")) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#e4e9ef");
  if (!booted && !reducedMotion()) {
    document.documentElement.classList.add("intro");
    setTimeout(() => document.documentElement.classList.remove("intro"), 2200);
  }
}
function cart() {
  return `<section class="section-wrap">${heading("", "Your bag")}${
    state.cart.length
      ? `<div class="cart-layout"><div>${state.cart
          .map((i) => {
            const p = product(i.id);
            if (!p) return "";
            return `<article class="cart-line"><a href="/products/${p.id}">${image(p)}</a><div><h2><a href="/products/${p.id}">${p.name}</a></h2><p>${format[p.id]} · sample price ${money(p.price)}</p><div class="quantity-control"><button data-quantity="${p.id}" data-change="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${i.quantity}</span><button data-quantity="${p.id}" data-change="1" aria-label="Increase ${p.name} quantity">＋</button></div><button class="remove" data-remove="${p.id}">Remove</button></div><strong>${money(p.price * i.quantity)}</strong></article>`;
          })
          .join(
            "",
          )}<a class="text-link" href="/shop">Keep shopping</a></div><aside class="order-summary"><p class="kicker">Order summary</p><div><span>Sample subtotal</span><strong>${money(total())}</strong></div><div><span>Delivery</span><span>Calculated at checkout</span></div><p>One-time purchases. Final prices, tax and shipping rules await approval.</p>${link("Continue to preview checkout", "/checkout", "button full")}<span class="micro">No money will be collected.</span></aside></div>`
      : empty("Your bag is empty", "Pick a cap and add something to it.")
  }</section>`;
}
function addressFields(prefix = "", v = {}) {
  return `<div class="field-grid">${[
    ["name", "Full name", "text"],
    ["mobile", "Mobile number", "tel"],
    ["email", "Email (optional)", "email"],
    ["pincode", "Pincode", "text"],
    ["address", "Address", "text"],
    ["city", "City", "text"],
    ["state", "State", "text"],
  ]
    .filter(([k]) => prefix !== "saved-" || !["mobile", "email"].includes(k))
    .map(
      ([k, l, t]) =>
        `<div class="field ${k === "address" ? "span-two" : ""}"><label for="${prefix + k}">${l}</label><input id="${prefix + k}" name="${k}" type="${t}" value="${escape(v[k] || "")}" ${k === "email" ? "" : "required"} ${k === "mobile" ? 'inputmode="tel" pattern="[6-9][0-9]{9}" maxlength="10"' : k === "pincode" ? 'inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6"' : 'maxlength="200"'}></div>`,
    )
    .join("")}</div>`;
}
function checkout() {
  if (!state.cart.length)
    return `<section class="section-wrap">${empty("Your bag is empty", "Add a product before checking out.")}</section>`;
  event("checkout_start");
  return `<section class="section-wrap">${heading("", "Checkout", "Check out as a guest. Use sample details: no payment is taken and no messages are sent.")}<div class="checkout-layout"><form id="checkout-form" class="checkout-form"><div class="form-section"><p class="kicker">1. Delivery</p>${addressFields("", { mobile: state.user?.mobile || "" })}<details><summary><span>Need a GST invoice?</span>${icon("plus")}</summary><label for="gstin">GSTIN (optional)</label><input id="gstin" name="gstin" maxlength="15"><label for="legal-name">Legal name</label><input id="legal-name" name="legal_name" maxlength="200"></details></div><div class="form-section"><p class="kicker">2. Payment</p><label class="payment-choice"><input type="radio" checked name="method" value="prepaid"><span><strong>Prepaid · preview payment</strong><small>UPI, cards, wallets and net banking are planned with Razorpay.</small></span></label><div class="disabled-option"><span>Cash on delivery</span>${badge("Policy pending")}<p>The ₹150 collection method and courier COD charge need confirmation before activation.</p></div></div><div class="form-section"><p class="kicker">3. Confirm</p><label class="check"><input type="checkbox" name="adult" required><span>I confirm the purchaser is 18 or older.</span></label><label class="check"><input type="checkbox" name="email_consent"><span>I’d like optional email updates. (Optional)</span></label><label class="check"><input type="checkbox" name="whatsapp_consent"><span>I’d like optional WhatsApp updates. (Optional)</span></label><p class="micro">Marketing choices are separate and unchecked. See <a href="/policies/privacy">privacy</a> and the <a href="/policies/terms">working terms</a>.</p><div class="form-error" role="alert"></div><button class="button full" type="submit">Create preview order</button><p class="micro">A 15-minute preview stock reservation starts when this order is created.</p></div></form><aside class="order-summary checkout-summary"><p class="kicker">In your bag (${count()})</p>${state.cart
    .map((i) => {
      const p = product(i.id);
      return `<div class="summary-product">${image(p)}<span>${p.name}<small>Qty ${i.quantity}</small></span><strong>${money(p.price * i.quantity)}</strong></div>`;
    })
    .join(
      "",
    )}<label for="discount-code">Sample discount code</label><div class="discount-input"><input id="discount-code" form="checkout-form" name="discount" placeholder="Try PREVIEW10"><button type="button" data-action="discount">Apply</button></div><div><span>Subtotal</span><strong>${money(total())}</strong></div><div><span>Discount</span><strong id="checkout-discount">—</strong></div><div><span>Sample delivery</span><strong id="checkout-shipping">${total() >= 1499 ? "Free" : money(75)}</strong></div><div class="summary-total"><span>Sample total</span><strong id="checkout-total">${money(total() + (total() >= 1499 ? 0 : 75))}</strong></div><p class="micro">Sample pricing only; no final GST calculation is asserted.</p></aside></div></section>`;
}

function loginPanel() {
  return `<div class="account-welcome"><div><h2>Sign in to see your orders</h2><p>Use your mobile number to track orders, save addresses and pick up guest orders from this session.</p></div><form id="otp-form" class="form-panel"><p class="kicker">Sign in with your mobile</p><label for="login-mobile">Mobile number</label><input id="login-mobile" name="mobile" inputmode="tel" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit Indian number" required><button class="button full" type="submit">Get preview code</button><p class="micro">A local code will appear here. No SMS is sent. Real OTP and email fallback require provider setup.</p><div id="otp-result" role="status"></div><div class="form-error" role="alert"></div></form></div>`;
}
function accountNav(tab = "orders") {
  return `<nav class="account-tabs" aria-label="Account sections">${[
    ["orders", "Orders", "/account"],
    ["addresses", "Addresses", "/account/addresses"],
    ["cases", "Support cases", "/account/cases"],
    ["preferences", "Preferences", "/settings"],
  ]
    .map(([id, l, u]) => `<a class="${id === tab ? "active" : ""}" href="${u}">${l}</a>`)
    .join("")}<button data-action="logout">Sign out</button></nav>`;
}
function orderCard(o) {
  return `<article class="order-card"><div class="order-card-top"><div><span class="kicker">${o.id}</span><p>${date(o.created)}</p></div>${badge(o.state)}</div><div class="order-thumbnails">${o.items.map((i) => image(product(i.id))).join("")}</div><div class="order-card-bottom"><span>${o.items.reduce((n, i) => n + i.quantity, 0)} items · ${money(o.total)} sample</span>${link("View order", "/orders/" + o.id, "text-link")}</div></article>`;
}
function account(tab) {
  const a = state.account;
  const guest = state.user.id.startsWith("guest-");
  return `<section class="section-wrap">${heading("", "Your account", guest ? "Sign in to claim matching guest orders, or review orders from this preview session." : `Signed in with mobile ending ${escape(state.user.mobile.slice(-4))}.`)}${guest ? loginPanel() : ""}${accountNav(tab)}${tab === "addresses" ? `<div class="account-columns"><div><h2>Saved addresses</h2>${a.addresses.length ? a.addresses.map((v) => `<article class="address-card"><strong>${escape(v.name)}</strong><p>${escape(v.address)}<br>${escape(v.city)}, ${escape(v.state)} ${escape(v.pincode)}</p></article>`).join("") : "<p>No saved addresses yet.</p>"}</div><form id="address-form" class="form-panel"><p class="kicker">Add an address</p>${addressFields("saved-")}<div class="form-error" role="alert"></div><button class="button full">Save address</button></form></div>` : tab === "cases" ? `<div class="section-heading"><h2>Support cases</h2>${link("Open a support case", "/contact", "text-link")}</div>${a.cases.length ? `<div class="case-grid">${a.cases.map(caseCard).join("")}</div>` : empty("No open cases", "Support cases and their updates will show up here.", "Contact support", "/contact")}` : a.orders.length ? `<div class="orders-grid">${a.orders.map(orderCard).join("")}</div>` : empty("No orders yet", "Orders you place in this session will show up here.")}</section>`;
}
function caseCard(c) {
  return `<article class="case-card"><div>${badge(c.kind, c.kind === "safety" ? "warning" : "")}${badge(c.state)}</div><h3>${c.id}</h3><p>${escape(c.message)}</p><small>${escape(c.owner)} · ${escape(c.sla)}</small>${c.order_id ? `<a class="text-link" href="/orders/${c.order_id}">${c.order_id}</a>` : ""}</article>`;
}
function payment(o) {
  if (!o) return notFound();
  const expired = o.state === "expired" || o.expires < Date.now() / 1000;
  return `<section class="section-wrap payment-page">${heading("Payment", o.state === "paid" ? "Payment received" : "Complete your payment", `${o.id} · No real payment is processed.`)}<div class="payment-layout"><div class="form-panel"><p class="kicker">Payment simulator</p><h2>${money(o.total)}</h2><p class="micro">Sample order total</p>${o.state === "paid" ? `${badge("Preview payment captured")}<p>No money moved. Your preview order is ready to explore.</p>${link("View order", "/orders/" + o.id)}` : o.state !== "pending" ? `${badge(o.state)}<p>This order no longer has an active payment step.</p>${link("View order", "/orders/" + o.id)}` : expired ? `<p>This reservation has expired. Start a new checkout to check availability again.</p>${link("Return to bag", "/cart")}` : `<p>Try a success or failure to see the order journey. Inventory is reserved for 15 minutes.</p><p class="reservation-time" data-expires="${o.expires}"></p><button class="button full" data-pay="success" data-id="${o.id}">Simulate successful payment</button><button class="button outline full" data-pay="failure" data-id="${o.id}">Simulate failed payment</button><p id="payment-result" role="status"></p>`}</div><div class="order-summary"><p class="kicker">Order record</p>${o.items.map((i) => `<div><span>${escape(i.name)} × ${i.quantity}</span><strong>${money(i.unit_price * i.quantity)}</strong></div>`).join("")}<div><span>Sample discount</span><span>−${money(o.discount)}</span></div><div><span>Sample shipping</span><span>${money(o.shipping)}</span></div><div class="summary-total"><span>Total</span><strong>${money(o.total)}</strong></div><p>Final Razorpay integration needs server credentials, signature verification, webhook reconciliation and settlement testing.</p></div></div></section>`;
}
function orderDetail(o) {
  if (!o)
    return `<section class="section-wrap">${empty("Order not found.", "Sign in to the customer session that owns this order.", "Your account", "/account")}</section>`;
  const customer = state.user.role === "customer";
  const canCancel = customer && ["pending", "paid"].includes(o.state);
  return `<section class="section-wrap">${heading("Order", o.id, `Created ${date(o.created)} · Preview transaction only.`)}<div class="order-detail-layout"><div><div class="tracking-card"><div class="section-heading"><h2>${o.state === "delivered" ? "At your door." : o.state === "shipped" ? "On its way." : o.state === "paid" ? "We have your order." : "Your order status."}</h2>${badge(o.state)}</div><div class="timeline">${[
    "pending",
    "paid",
    "shipped",
    "delivered",
  ]
    .map((s, i) => {
      const occurred = o.history.find((h) => h.state === s);
      return `<div class="${occurred ? "done" : ""}"><span>${occurred ? "✓" : i + 1}</span><strong>${s === "pending" ? "Order created" : s === "paid" ? "Preview paid" : s === "shipped" ? "Shipped" : "Delivered"}</strong><small>${occurred ? date(occurred.at) : "Not yet"}</small></div>`;
    })
    .join(
      "",
    )}</div>${o.provider ? `<p>${escape(o.provider)} · ${escape(o.tracking)} <small>Simulated tracking; no shipment booked.</small></p>` : ""}${o.refund !== "none" ? `<p>Refund: ${badge(o.refund)}</p>` : ""}</div><div class="order-items">${o.items.map((i) => `<div>${image(product(i.id))}<span><strong>${i.name}</strong><small>Quantity ${i.quantity}</small></span><strong>${money(i.quantity * i.unit_price)}</strong></div>`).join("")}</div><div class="order-actions">${o.state === "pending" ? link("Continue preview payment", "/payment/" + o.id) : ""}${canCancel ? `<button class="button outline" data-cancel="${o.id}">Cancel preview order</button>` : ""}<button class="button outline" data-reorder="${o.id}">Reorder items</button>${link("Get help with this order", "/contact?order=" + o.id, "text-link")}</div>${customer && o.state === "delivered" ? `<form id="review-form" class="form-panel"><p class="kicker">Verified delivery</p><h2>Review your order</h2><input type="hidden" name="order_id" value="${o.id}"><label for="review-product">Product</label><select id="review-product" name="product">${o.items.map((i) => `<option value="${i.id}">${i.name}</option>`).join("")}</select><label for="rating">Rating</label><select id="rating" name="rating">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n} stars</option>`).join("")}</select><label for="review-text">Your review</label><textarea id="review-text" name="text" minlength="10" maxlength="1000" required></textarea><div class="form-error" role="alert"></div><button class="button">Submit for preview moderation</button></form>` : ""}</div><aside class="order-summary"><p class="kicker">Order summary</p><div><span>Sample subtotal</span><span>${money(o.subtotal)}</span></div><div><span>Sample discount</span><span>−${money(o.discount)}</span></div><div><span>Sample delivery</span><span>${money(o.shipping)}</span></div><div class="summary-total"><strong>Total</strong><strong>${money(o.total)}</strong></div><h3>Delivery address</h3><p>${escape(o.contact.name)}<br>${escape(o.contact.address)}<br>${escape(o.contact.city)}, ${escape(o.contact.state)}<br>${escape(o.contact.pincode)}</p><p class="micro">Policy snapshot: ${o.policy_version}</p></aside></div></section>`;
}

function help() {
  return `<section class="section-wrap">${heading("", "Help", "Find a quick answer, or open a case and we'll keep the whole conversation in one place.")}<div class="help-links">${[
    ["Orders & delivery", "Follow your preview order.", "/account"],
    ["Returns & replacements", "Understand the working policy.", "/policies/returns"],
    ["Product & lot reports", "Explore the details for your pack.", "/reports"],
    ["Something else?", "Open a support case.", "/contact"],
  ]
    .map(([t, d, u]) => `<a href="${u}"><h2>${t}</h2><p>${d}</p></a>`)
    .join("")}</div><div class="faq-section">${faqList()}</div></section>`;
}
function contact() {
  const oid = new URL(location.href).searchParams.get("order") || "";
  return `<section class="section-wrap">${heading("", "Contact us", "Every case gets an ID and stays in your account. The preview sends no external messages.")}<div class="contact-layout"><div><h2>Talk to a person</h2><p>WhatsApp, email, web and phone are planned support channels. Confirmed contact details and service hours will appear before launch.</p><div class="contact-channel"><strong>WhatsApp</strong><span>Business number pending</span></div><div class="contact-channel"><strong>Email</strong><span>Support address pending</span></div><div class="contact-channel"><strong>Phone</strong><span>Initial service planned</span></div><div class="note-panel"><strong>Product issue?</strong><p>Choose Product safety for a dedicated priority case. In this preview the case is local; no safety outreach or recall is initiated automatically.</p></div></div><form id="case-form" class="form-panel"><p class="kicker">Open a case</p><label for="case-kind">What can we help with?</label><select id="case-kind" name="kind"><option value="general">General question</option><option value="delivery">Delivery</option><option value="return">Unopened return</option><option value="replacement">Replacement / product issue</option><option value="safety">Product safety</option></select><label for="case-order">Order ID (optional)</label><input id="case-order" name="order_id" value="${escape(oid)}" maxlength="40"><label for="case-message">Tell us a little more</label><textarea id="case-message" name="message" minlength="10" maxlength="3000" required placeholder="Describe the issue and the relevant product or lot."></textarea><p class="micro">Do not include medical records or payment credentials in the preview.</p><div class="form-error" role="alert"></div><button class="button full">Create preview case</button><div id="case-result" role="status"></div></form></div></section>`;
}
const policies = {
  shipping: [
    "Shipping & delivery",
    "One active D2C warehouse is planned, with Vayuvega and Shipneer as the named providers.",
    "The preview uses an illustrative ₹75 delivery charge, waived on a sample subtotal after discount of ₹1,499 or more. This is not the approved shipping policy.",
    "Pincode estimates are illustrative. Production serviceability and delivery dates require courier configuration.",
  ],
  returns: [
    "Returns & refunds",
    "The working direction includes seven-day returns for unopened items and issue-based review for opened products.",
    "The start of that window, shipping responsibility, replacement rules and the proposed longer issue-reporting exception await confirmation.",
    "Use support to open a return or replacement case. Preview refunds are accounting demonstrations and do not move money.",
  ],
  cancellation: [
    "Cancellation",
    "The working direction allows cancellation before shipment initiation.",
    "The local preview permits cancellation while an order is pending or paid. Once marked shipped, a support case is required.",
    "Paid cancellation restores preview inventory and marks a refund pending. An Admin initiates the refund approval and a different Admin must approve it.",
  ],
  privacy: [
    "Privacy & your choices",
    "This local preview stores session, order, address and support data in a local SQLite database. No marketing provider receives this data.",
    "Email and WhatsApp marketing choices are separate and unchecked by default. The production retention schedule, contact details and final privacy notice need approval.",
    "Use sample data while reviewing. Local demo sign-in is not production authentication.",
  ],
  terms: [
    "Terms of the preview",
    "This website is a local functional preview, not a live offer for sale. All prices, stock, reports and transactions are illustrative.",
    "No real payments are accepted, shipments booked, laboratory reports issued or external messages sent.",
    "Final terms of sale, business disclosures, taxes, product information and integration acceptance are required before launch.",
  ],
};
function policy(kind) {
  const p = policies[kind];
  if (!p) return notFound();
  return `<section class="section-wrap article">${heading("Policy draft", p[0], "Working draft. These aren't the final terms for a live store.")}<div class="policy-copy">${p
    .slice(1)
    .map((x, i) => `<section><span class="kicker">${i + 1}</span><p>${x}</p></section>`)
    .join("")}</div>${link("Need a little help?", "/contact", "text-link")}</section>`;
}
function settings() {
  return `<section class="section-wrap article">${heading("", "Preferences", "Choose which optional messages you get. In the preview these are stored in this browser only.")}<form id="preferences-form" class="form-panel"><label class="check"><input type="checkbox" name="email"><span>Optional email updates</span></label><label class="check"><input type="checkbox" name="whatsapp"><span>Optional WhatsApp updates</span></label><label class="check"><input type="checkbox" name="analytics"><span>Optional marketing analytics exports (inactive in preview)</span></label><p class="micro">Necessary session and order records support the local application. No external analytics or messaging connection is active.</p><button class="button">Save my choices</button></form></section>`;
}
function searchPage() {
  const q = new URL(location.href).searchParams.get("q") || "";
  const match = state.catalog.filter((p) => (p.name + " " + p.ingredients + " " + format[p.id]).toLowerCase().includes(q.toLowerCase()));
  const report = /report|lot|test|proof/i.test(q);
  return `<section class="section-wrap">${heading("", "Search")}<form id="page-search" class="inline-search"><label class="sr-only" for="page-query">Search products</label><input id="page-query" name="q" value="${escape(q)}" placeholder="Product or ingredient name"><button class="button">Search</button></form><p>${match.length} product match${match.length === 1 ? "" : "es"} ${q ? "for “" + escape(q) + "”" : ""}</p>${report ? `<div class="note-panel">${link("Find your lot report", "/reports", "text-link")}</div>` : ""}${match.length ? grid(match) : empty("No matches", "Try “creatine”, “iron”, “softgels” or “lot report”.", "Shop all seven", "/shop")}</section>`;
}

const opsTabs = [
  ["overview", "Overview"],
  ["orders", "Orders"],
  ["inventory", "Inventory & batches"],
  ["products", "Products & prices"],
  ["cases", "Support & safety"],
  ["approvals", "Approvals"],
  ["audit", "Audit history"],
  ["analytics", "Analytics"],
  ["channels", "Channels & integrations"],
  ["flags", "Feature flags"],
];
function opsLogin() {
  return `<section class="section-wrap">${heading("Operations preview", "Run the store", "Try the back-office workflows with demo identities. Microsoft SSO and MFA aren't connected.")}<div class="demo-identities">${[
    ["admin-a", "Admin A", "Initiate changes, quarantine lots and manage orders."],
    ["admin-b", "Admin B", "A different person for approval demonstrations."],
    ["viewer", "Viewer", "Read-only, enforced on server endpoints."],
  ]
    .map(
      ([id, t, d]) =>
        `<article><span class="kicker">Preview identity</span><h2>${t}</h2><p>${d}</p><button class="button" data-demo-login="${id}">Enter as ${t}</button></article>`,
    )
    .join(
      "",
    )}</div><div class="note-panel">This is a localhost-only demonstration. Real organisational identity, account provisioning and production approval ownership remain required.</div></section>`;
}
function table(headers, rows) {
  return `<div class="table-scroll"><table><thead><tr>${headers.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No records yet.</td></tr>`}</tbody></table></div>`;
}
function ops(tab = "overview") {
  if (!["admin", "viewer"].includes(state.user.role)) return opsLogin();
  const o = state.ops;
  const viewer = state.user.role === "viewer";
  let content = "";
  const orders = o.orders;
  const delivered = orders.filter((x) => x.state === "delivered");
  const captured = o.payments.filter((x) => x.status === "captured").reduce((n, x) => n + x.amount, 0);
  if (tab === "overview")
    content = `<div class="metric-grid">${[
      ["Orders", orders.length],
      ["Captured sample value", money(captured)],
      ["Delivered", delivered.length],
      ["Open cases", o.cases.filter((x) => x.state !== "resolved").length],
    ]
      .map(([l, v]) => `<article><span>${l}</span><strong>${v}</strong></article>`)
      .join(
        "",
      )}</div><div class="ops-section"><h2>Needs attention</h2><div class="attention-grid"><a href="/ops/approvals"><strong>${o.approvals.filter((x) => x.state === "pending").length}</strong><span>Changes awaiting approval ↗</span></a><a href="/ops/inventory"><strong>${o.batches.filter((x) => x.state === "quarantined").length}</strong><span>Quarantined lots ↗</span></a><a href="/ops/cases"><strong>${o.cases.filter((x) => x.kind === "safety" && x.state !== "resolved").length}</strong><span>Active safety cases ↗</span></a></div></div><div class="note-panel"><strong>Preview ledger, durable local records.</strong><p>External payment, courier, identity and Amazon connections are inactive. A successful preview action does not move money or dispatch a product.</p></div>`;
  else if (tab === "orders")
    content = table(
      ["Order", "State", "Sample total", "Provider", "Action"],
      orders.map((x) => [
        x.id,
        badge(x.state),
        money(x.total),
        escape(x.provider || "Not assigned"),
        `${link("View", "/orders/" + x.id, "small-link")}${["paid", "shipped"].includes(x.state) ? `<button class="small-button" data-ship="${x.id}" ${viewer ? "disabled" : ""}>${x.state === "paid" ? "Simulate shipment" : "Mark delivered"}</button>` : ""}${x.refund === "approval_pending" ? `<button class="small-button" data-refund="${x.id}" ${viewer ? "disabled" : ""}>Request refund approval</button>` : ""}`,
      ]),
    );
  else if (tab === "inventory")
    content = `<p>FEFO selects the earliest-expiring released lot. Reservations decrement available stock atomically. Quarantine immediately prevents new allocation and shipping.</p>${table(
      ["Lot / product", "Expiry", "Available", "Evidence / state", "Actions"],
      o.batches.map((b) => [
        `${b.id}<small>${product(b.product)?.name || b.product}</small>`,
        date(b.expiry),
        b.available,
        `${badge(b.proof ? "Sample proof present" : "Proof missing")}${badge(b.state)}`,
        `<button class="small-button" data-quarantine="${b.id}" ${viewer || b.state === "quarantined" ? "disabled" : ""}>Quarantine</button><button class="small-button" data-stock="${b.id}" ${viewer ? "disabled" : ""}>Request stock addition</button>${b.state === "quarantined" ? `<button class="small-button" data-release="${b.id}" ${viewer ? "disabled" : ""}>Request release</button>` : ""}`,
      ]),
    )}`;
  else if (tab === "products")
    content = `<p>All listed prices are illustrative. Price and publication changes require a different Admin’s approval.</p>${table(
      ["Product", "Sample price", "Publication", "Content readiness", "Actions"],
      state.catalog.map((p) => [
        p.name,
        money(p.price),
        badge(p.published ? "Published preview" : "Hidden"),
        badge("Approved rear label pending"),
        `<button class="small-button" data-price="${p.id}" ${viewer ? "disabled" : ""}>Request price change</button><button class="small-button" data-publication="${p.id}" ${viewer ? "disabled" : ""}>${p.published ? "Request unpublish" : "Request publish"}</button>`,
      ]),
    )}`;
  else if (tab === "cases")
    content = `<p>Case IDs, ownership and state changes stay in the ledger. A safety case must be assessed; quarantine can be initiated immediately by an Admin.</p>${table(
      ["Case", "Type / state", "Message", "Order / SLA", "Actions"],
      o.cases.map((c) => [
        c.id,
        `${badge(c.kind, c.kind === "safety" ? "warning" : "")}${badge(c.state)}`,
        escape(c.message),
        `${escape(c.order_id || "No order")}<small>${escape(c.sla)}</small>`,
        `${["investigating", "escalated", "resolved"].map((s) => `<button class="small-button" data-case-state="${s}" data-id="${c.id}" ${viewer ? "disabled" : ""}>${s}</button>`).join("")}`,
      ]),
    )}`;
  else if (tab === "approvals")
    content = `<p>No self-approval. Switch to the other preview Admin to approve a request. Real production identities must enforce the same separation.</p><div class="identity-tools">${["admin-a", "admin-b", "viewer"].map((id) => `<button class="small-button" data-demo-login="${id}">${id}</button>`).join("")}</div>${table(
      ["Request", "Change", "Creator", "State", "Decision"],
      o.approvals.map((a) => [
        a.id,
        `${a.kind}: ${escape(a.target)}<small>${escape(JSON.stringify(a.payload))}</small>`,
        a.creator,
        badge(a.state),
        a.state === "pending"
          ? `<button class="small-button" data-approval="${a.id}" data-decision="approve" ${viewer || a.creator === state.user.id ? "disabled" : ""}>Approve</button><button class="small-button" data-approval="${a.id}" data-decision="reject" ${viewer || a.creator === state.user.id ? "disabled" : ""}>Reject</button>`
          : escape(a.approver || "—"),
      ]),
    )}`;
  else if (tab === "audit")
    content = `<p>Append-only application audit trail. Database access and production tamper resistance require deployment controls.</p>${table(
      ["Time", "Actor", "Action", "Record"],
      o.audit.slice(0, 200).map((a) => [date(a.created), a.actor, a.action, a.target]),
    )}`;
  else if (tab === "analytics")
    content = `<div class="metric-grid">${[
      ["Preview delivered value", money(delivered.reduce((n, x) => n + x.total, 0))],
      ["Sample delivery rate", orders.length ? Math.round((delivered.length / orders.length) * 100) + "%" : "—"],
      ["Cases", o.cases.length],
      ["Verified review submissions", o.reviews.length],
    ]
      .map(([l, v]) => `<article><span>${l}</span><strong>${v}</strong></article>`)
      .join(
        "",
      )}</div><div class="note-panel"><strong>Delivered contribution: awaiting finance inputs.</strong><p>COGS, taxes, payment fees, billed shipping, returns and other attributable costs are not approved. Revenue is not presented as contribution.</p></div><h2>First-party events</h2>${table(
      ["Event", "Count"],
      o.events.map((e) => [e.name, e.count]),
    )}<p class="micro">No external analytics exports are active. Event records do not contain contact data or support narratives.</p>`;
  else if (tab === "channels")
    content = `<div class="integration-grid">${[
      ["Razorpay", "Not connected", "Server signatures, webhooks and settlement reconciliation required."],
      ["Mobile OTP / email", "Preview codes only", "Provider credentials, rate limits and email fallback required."],
      ["Microsoft SSO + MFA", "Not connected", "Organisational tenant and real users required."],
      ["Vayuvega", "Preview assignment only", "Contract, serviceability, booking and reconciliation integration required."],
      ["Shipneer", "Preview assignment only", "Contract, serviceability, booking and reconciliation integration required."],
      ["Amazon FBA", "Agency boundary pending", "FBA-only scope; Amazon stock and bulk replenishment stay distinct from D2C."],
      ["WhatsApp / email support", "Not connected", "Business contacts, sender configuration and consented communication required."],
      ["Unit authenticity", "Scope unresolved", "Lot lookup is separate from a concealed unit code."],
    ]
      .map(([t, s, d]) => `<article><h2>${t}</h2>${badge(s)}<p>${d}</p></article>`)
      .join(
        "",
      )}</div><div class="note-panel"><strong>Release readiness</strong><p>Keep independent D2C and Amazon acceptance checklists; the later direction requests a coordinated public launch. No channel is marked ready from this preview.</p></div>`;
  else if (tab === "flags")
    content = `<p>These provisional flags demonstrate governed configuration. Turning a flag on does not create an external integration or approve missing content.</p>${table(
      ["Flag", "Current state", "Action"],
      Object.entries(o.flags).map(([k, v]) => [
        k,
        badge(v ? "On" : "Off"),
        `<button class="small-button" data-flag="${k}" data-value="${!v}" ${viewer ? "disabled" : ""}>Request ${v ? "disable" : "enable"}</button>`,
      ]),
    )}`;
  else return notFound();
  return `<div class="ops-layout"><aside class="ops-sidebar"><p class="kicker">Body Café Co. operations</p><h2>Operations</h2><p>${escape(state.user.name)} ${badge(state.user.role)}</p><nav aria-label="Operations sections">${opsTabs.map(([id, l]) => `<a class="${id === tab ? "active" : ""}" href="/ops${id === "overview" ? "" : "/" + id}">${l}</a>`).join("")}</nav><button class="small-button" data-action="logout">Leave operations</button></aside><section class="ops-content"><div class="ops-heading"><div><p class="kicker">${viewer ? "Read-only" : "Admin"} view</p><h1>${opsTabs.find((x) => x[0] === tab)[1]}</h1></div><button class="small-button" data-action="refresh">Refresh</button></div>${content}</section></div>`;
}
function notFound() {
  return `<section class="section-wrap">${empty("Page not found", "That link doesn't lead anywhere. Head back to the shop.", "Shop all seven", "/shop")}</section>`;
}

let renderVersion = 0;
let booted = false;
let transitionColor = "#2d2926";
let renderedRoute = "";
async function render(scroll = true) {
  const version = ++renderVersion;
  const path = location.pathname;
  try {
    let content;
    if (path.startsWith("/account") || path.startsWith("/orders/") || path.startsWith("/payment/")) state.account = await api("/account");
    if (path.startsWith("/ops") && ["admin", "viewer"].includes(state.user.role)) state.ops = await api("/admin");
    if (version !== renderVersion) return;
    if (path === "/") content = home();
    else if (path === "/shop") content = shop();
    else if (path.startsWith("/products/")) content = detail(product(path.split("/")[2]));
    else if (path.startsWith("/bundles")) content = bundles(path.split("/")[2]);
    else if (path === "/standards") content = standards();
    else if (path.startsWith("/learn"))
      content = state.flags.ingredient_library
        ? learn(path.split("/")[2])
        : `<section class="section-wrap">${empty("Learn is offline", "The ingredient library isn't published right now.", "Shop all seven", "/shop")}</section>`;
    else if (path === "/story") content = story();
    else if (path === "/reports") content = reports();
    else if (path === "/cart") content = cart();
    else if (path === "/checkout") content = checkout();
    else if (path.startsWith("/account")) content = account(path.split("/")[2] || "orders");
    else if (path.startsWith("/orders/")) content = orderDetail(state.account.orders.find((o) => o.id === path.split("/")[2]));
    else if (path.startsWith("/payment/")) content = payment(state.account.orders.find((o) => o.id === path.split("/")[2]));
    else if (path === "/help") content = help();
    else if (path === "/contact") content = contact();
    else if (path.startsWith("/policies/")) content = policy(path.split("/")[2]);
    else if (path === "/settings") content = settings();
    else if (path === "/search") content = searchPage();
    else if (path.startsWith("/ops")) content = ops(path.split("/")[2] || "overview");
    else content = notFound();
    const paint = () => {
      renderedRoute = location.pathname + location.search;
      $("#app").innerHTML = shell(content);
      document.body.dataset.route = path === "/" ? "home" : path.split("/")[1];
      enhance();
    };
    if (scroll && document.startViewTransition && !reducedMotion() && booted) {
      document.documentElement.style.setProperty("--wipe", transitionColor);
      await document.startViewTransition(paint).updateCallbackDone;
    } else paint();
    booted = true;
    document.title =
      (path === "/"
        ? "Seven everyday essentials"
        : path
            .split("/")
            .filter(Boolean)
            .map((x) => x.replaceAll("-", " "))
            .join(" · ")) + " — Body Café Co.";
    if (scroll) {
      window.scrollTo({ top: 0, behavior: "instant" });
      $("#main").focus({ preventScroll: true });
    }
    if (path === "/reports" && new URL(location.href).searchParams.get("lot")) $("#report-form")?.requestSubmit();
    if (path === "/settings") {
      let pref = {};
      try {
        pref = JSON.parse(localStorage.getItem("bcc-preferences") || "{}");
      } catch {}
      for (const k of ["email", "whatsapp", "analytics"]) $(`#preferences-form [name=${k}]`).checked = !!pref[k];
    }
  } catch (e) {
    $("#app").innerHTML = shell(
      `<section class="section-wrap">${empty("Something went wrong", escape(e.message), "Shop all seven", "/shop")}</section>`,
    );
  }
}
function navigate(href, color) {
  transitionColor = color || "#2d2926";
  closeMenu();
  history.pushState({}, "", href);
  render();
}
async function refreshCatalog() {
  const c = await api("/catalog");
  state.catalog = c.products;
  state.bundles = c.bundles;
  state.flags = c.flags;
}
function formError(form, error) {
  const box = form.querySelector(".form-error");
  if (box) box.textContent = error.message;
  else toast(error.message);
}
async function opsAction(action, data) {
  await api("/admin/" + action, data);
  await refreshCatalog();
  await render(false);
  toast("Preview record updated.");
}
document.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  const anchor = e.target.closest("a");
  if (
    anchor &&
    !anchor.hasAttribute("data-design-link") &&
    anchor.origin === location.origin &&
    !anchor.getAttribute("href").startsWith("#") &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey
  ) {
    e.preventDefault();
    if ($("#search-dialog").open) $("#search-dialog").close();
    const tint = anchor.closest("[style*='--cap']");
    const pid = anchor.pathname.startsWith("/products/") ? product(anchor.pathname.split("/")[2]) : null;
    navigate(anchor.href, pid?.color || (tint ? getComputedStyle(tint).getPropertyValue("--cap").trim() : ""));
    return;
  }
  if (!button) return;
  try {
    if (button.dataset.counterPick) counter.pick(button.dataset.counterPick, true);
    else if (button.dataset.add) add(button.dataset.add);
    else if (button.hasAttribute("data-fill-lot")) {
      const sel = $("#home-lot-product");
      $("#home-lot-number").value = sel.selectedOptions[0].dataset.sample;
      $("#home-lot-number").focus();
    }
    else if (button.dataset.bundle) {
      const bundle = state.bundles.find((b) => b.id === button.dataset.bundle);
      if (
        bundle.items.some((id) => {
          const p = product(id);
          return (
            !p.published ||
            p.stock < (state.cart.find((i) => i.id === id)?.quantity || 0) + 1 ||
            (state.cart.find((i) => i.id === id)?.quantity || 0) >= 10
          );
        })
      )
        return toast("One of these products is unavailable.");
      bundle.items.forEach((id) => add(id));
    } else if (button.dataset.quantity) {
      const item = state.cart.find((i) => i.id === button.dataset.quantity);
      item.quantity += Number(button.dataset.change);
      if (item.quantity > 10) {
        item.quantity = 10;
        return toast("Maximum preview quantity is 10.");
      }
      state.cart = state.cart.filter((i) => i.quantity > 0);
      saveCart();
      render(false);
    } else if (button.dataset.remove) {
      state.cart = state.cart.filter((i) => i.id !== button.dataset.remove);
      saveCart();
      render(false);
    } else if (button.dataset.reportProduct) {
      const pid = button.dataset.reportProduct;
      $("#report-product").value = pid;
      document.querySelectorAll("[data-report-product]").forEach((b) => {
        const selected = b.dataset.reportProduct === pid;
        b.classList.toggle("selected", selected);
        b.setAttribute("aria-pressed", String(selected));
      });
      $("#report-result").replaceChildren();
      const picked = product(pid);
      if (picked) $(".report-page")?.setAttribute("style", capStyle(picked));
      $("#sample-lot").textContent = "DEMO-" + String(state.catalog.findIndex((p) => p.id === pid) + 1).padStart(2, "0") + "-01";
    } else if (button.dataset.sampleLot) {
      $("#lot").value = button.dataset.sampleLot;
      $("#report-form").requestSubmit();
    } else if (button.dataset.demoLogin) {
      await api("/demo/login", { identity: button.dataset.demoLogin });
      await session();
      navigate(location.pathname.startsWith("/ops") ? location.pathname : "/ops");
      toast("Local preview identity active.");
    } else if (button.dataset.pay) {
      button.disabled = true;
      const r = await api("/orders/" + button.dataset.id + "/pay", { outcome: button.dataset.pay });
      if (r.state === "paid") {
        state.cart = [];
        saveCart();
        await refreshCatalog();
        navigate("/orders/" + button.dataset.id);
        toast("Preview payment succeeded. No money moved.");
      } else {
        $("#payment-result").textContent = r.message;
        button.disabled = false;
      }
    } else if (button.dataset.cancel) {
      await api("/orders/" + button.dataset.cancel + "/cancel", {});
      await refreshCatalog();
      await render(false);
      toast("Preview order cancelled. Paid refunds await approval.");
    } else if (button.dataset.reorder) {
      const o = state.account.orders.find((o) => o.id === button.dataset.reorder);
      o.items.forEach((i) => add(i.id, i.quantity));
      navigate("/cart");
    } else if (button.dataset.ship) await opsAction("ship", { id: button.dataset.ship });
    else if (button.dataset.quarantine) {
      const reason = prompt("Reason for quarantining this preview lot:");
      if (reason) await opsAction("quarantine", { batch: button.dataset.quarantine, reason });
    } else if (button.dataset.stock) {
      const raw = prompt("Preview units to add (requires another Admin’s approval):", "10");
      if (raw !== null && raw.trim() && Number.isInteger(Number(raw)))
        await opsAction("request", { kind: "stock", target: button.dataset.stock, value: Number(raw), reason: "Preview stock addition" });
    } else if (button.dataset.price) {
      const raw = prompt("New sample price in whole rupees (requires another Admin):", String(product(button.dataset.price).price));
      if (raw !== null && raw.trim() && Number.isInteger(Number(raw)))
        await opsAction("request", { kind: "price", target: button.dataset.price, value: Number(raw), reason: "Preview price change" });
    } else if (button.dataset.publication)
      await opsAction("request", {
        kind: "publication",
        target: button.dataset.publication,
        value: !product(button.dataset.publication).published,
      });
    else if (button.dataset.release) await opsAction("request", { kind: "release", target: button.dataset.release, value: true });
    else if (button.dataset.refund) await opsAction("request", { kind: "refund", target: button.dataset.refund });
    else if (button.dataset.approval) await opsAction("approve", { id: button.dataset.approval, decision: button.dataset.decision });
    else if (button.dataset.caseState) await opsAction("case", { id: button.dataset.id, state: button.dataset.caseState });
    else if (button.dataset.flag)
      await opsAction("request", { kind: "flags", target: button.dataset.flag, value: button.dataset.value === "true" });
    else if (button.dataset.action === "menu") {
      if ($("#mobile-nav").hidden) openMenu();
      else closeMenu();
    } else if (button.dataset.action === "search") $("#search-dialog").showModal();
    else if (button.dataset.action === "close-search") $("#search-dialog").close();
    else if (button.dataset.action === "logout") {
      await api("/logout", {});
      await session();
      navigate("/account");
    } else if (button.dataset.action === "refresh") {
      await refreshCatalog();
      await render(false);
    } else if (button.dataset.action === "add-product") add(button.dataset.id, Number($("#product-quantity").value));
    else if (button.dataset.action === "discount") {
      const code = $("#discount-code").value.trim().toUpperCase();
      if (code && code !== "PREVIEW10") return toast("Use PREVIEW10 for a sample discount.");
      const d = code ? Math.round(total() * 0.1) : 0,
        shipping = total() - d >= 1499 ? 0 : 75;
      $("#checkout-discount").textContent = "−" + money(d);
      $("#checkout-shipping").textContent = shipping ? money(shipping) : "Free";
      $("#checkout-total").textContent = money(total() - d + shipping);
    }
  } catch (error) {
    toast(error.message);
    button.disabled = false;
  }
});
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  e.preventDefault();
  const button = form.querySelector("button[type=submit],button:not([type])");
  if (button) button.disabled = true;
  const data = Object.fromEntries(new FormData(form));
  const error = form.querySelector(".form-error");
  if (error) error.textContent = "";
  try {
    if (["search-form", "page-search"].includes(form.id)) {
      if ($("#search-dialog").open) $("#search-dialog").close();
      navigate("/search?q=" + encodeURIComponent(data.q || ""));
    } else if (form.id === "home-lot") {
      navigate("/reports?product=" + encodeURIComponent(data.product) + "&lot=" + encodeURIComponent(data.lot), "#2d2926");
    } else if (form.id === "pincode-form")
      $("#pincode-result").textContent = "Sample estimate: 3 to 7 business days. Live dates need courier setup.";
    else if (form.id === "checkout-form") {
      const o = await api("/orders", {
        ...data,
        contact: Object.fromEntries(["name", "mobile", "email", "pincode", "address", "city", "state"].map((k) => [k, data[k] || ""])),
        items: state.cart,
        adult: form.elements.adult.checked,
        email_consent: form.elements.email_consent.checked,
        whatsapp_consent: form.elements.whatsapp_consent.checked,
      });
      navigate("/payment/" + o.id);
    } else if (form.id === "report-form") {
      const result = $("#report-result");
      result.innerHTML = '<p class="micro">Looking up the record…</p>';
      event("report_lookup");
      try {
        const r = await api("/reports?product=" + encodeURIComponent(data.product) + "&lot=" + encodeURIComponent(data.lot));
        const t = {
          sample_match: ["Lot found", "This sample lot belongs to the product you chose. No lab report is attached in the preview."],
          not_found: [
            "No matching lot",
            "Check the number and product, then try again. You can contact support if it still doesn’t match.",
          ],
          unpublished: ["Report not published yet", "This record isn't ready to view. That doesn't mean a test passed or failed."],
          withdrawn: [
            "This lot has been withdrawn",
            "In the live experience, reviewed safety instructions and a direct support route would appear here.",
          ],
        }[r.state];
        result.innerHTML = `<div class="report-result ${r.state === "withdrawn" ? "warning" : r.state === "sample_match" ? "match" : ""}"><p class="kicker">Sample record ${escape(r.lot)}</p><h2>${t[0]}</h2><p>${t[1]}</p><p class="micro">Report version: preview only. Source document: not supplied. Individual unit authenticity: not verified.</p><a class="text-link" href="/contact">Ask about this lot</a></div>`;
      } catch (error) {
        result.innerHTML = `<div class="report-result warning"><h2>Lookup unavailable</h2><p>${escape(error.message)}</p><button type="submit" class="small-button">Try again</button></div>`;
      }
    } else if (form.id === "otp-form") {
      state.otp = { mobile: data.mobile, ...(await api("/auth/otp", data)) };
      $("#otp-result").innerHTML =
        `<div class="preview-code"><strong>Local preview code: ${state.otp.preview_code}</strong><p>No SMS was sent. Expires in five minutes.</p><label for="verify-code">Enter preview code</label><input id="verify-code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}"><button type="button" class="button full" id="verify-button">Verify local code</button></div>`;
      $("#verify-button").onclick = async () => {
        try {
          await api("/auth/verify", { mobile: state.otp.mobile, code: $("#verify-code").value });
          await session();
          await render(false);
          toast("Preview mobile verified. Matching guest orders claimed.");
        } catch (err) {
          toast(err.message);
        }
      };
    } else if (form.id === "case-form") {
      const c = await api("/cases", data);
      $("#case-result").innerHTML =
        `<div class="report-result"><p class="kicker">Case created</p><h2>${c.id}</h2><p>Your case is saved locally. ${c.kind === "safety" ? "It is marked for priority safety review." : ""}</p><a class="text-link" href="/account/cases">Follow your case</a></div>`;
      form.reset();
    } else if (form.id === "address-form") {
      await api("/addresses", data);
      await render(false);
      toast("Preview address saved.");
    } else if (form.id === "review-form") {
      await api("/reviews", { ...data, rating: Number(data.rating) });
      toast("Review submitted for preview moderation.");
      form.reset();
    } else if (form.id === "preferences-form") {
      const pref = Object.fromEntries(["email", "whatsapp", "analytics"].map((k) => [k, form.elements[k].checked]));
      localStorage.setItem("bcc-preferences", JSON.stringify(pref));
      event("consent_updated");
      toast("Your browser preview choices are saved.");
    }
  } catch (err) {
    formError(form, err);
  } finally {
    if (button) button.disabled = false;
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "report-product") {
    document.querySelector(`[data-report-product="${e.target.value}"]`)?.click();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#mobile-nav") && !$("#mobile-nav").hidden) {
    closeMenu();
    $("[data-action=menu]")?.focus();
  }
});
window.addEventListener("popstate", () => {
  if (location.pathname + location.search !== renderedRoute) render();
});
setInterval(() => {
  document.querySelectorAll("[data-expires]").forEach((x) => {
    const seconds = Math.max(0, Number(x.dataset.expires) - Math.floor(Date.now() / 1000));
    x.textContent = seconds
      ? `Reservation: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} remaining`
      : "Reservation expired. Start a new checkout.";
  });
}, 1000);
try {
  await session();
  await refreshCatalog();
  state.cart = state.cart.filter((i) => product(i.id));
  saveCart();
  await render(false);
} catch (e) {
  $("#app").innerHTML =
    `<div class="boot"><p class="boot-title">The store didn't load</p><p>${escape(e.message)}</p><p>Start the local Python preview server, then reload.</p></div>`;
}
