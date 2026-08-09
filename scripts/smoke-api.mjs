// Read-only smoke test for the new serverless API functions.
// Run: bun run --env-file=.env scripts/smoke-api.mjs
// Only executes SELECT queries against the configured Neon DB (write endpoints
// are exercised with invalid/unauthorized input so they fail fast without
// mutating data).
process.env.ADMIN_EMAIL = "admin@smoke.test";
process.env.ADMIN_PASSWORD = "smokepass123";

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(b) {
      this.body = b;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function req(method, query = {}, body, headers = {}) {
  return { method, query, body, headers };
}

const checks = [];
function check(name, cond, extra) {
  checks.push({ name, ok: !!cond, extra });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
}

const { default: health } = await import("../api/health.js");
const { default: userLogin } = await import("../api/auth/login.js");
const { default: adminLogin } = await import("../api/admin/login.js");
const { default: adminProducts } = await import("../api/admin/products.js");
const { default: adminOrders } = await import("../api/admin/orders.js");
const { default: adminDashboard } = await import("../api/admin/dashboard.js");
const { default: productsList } = await import("../api/products/index.js");
const { default: productsFeatured } = await import("../api/products/featured.js");
const { default: productsNewArrivals } = await import("../api/products/new-arrivals.js");
const { default: productsById } = await import("../api/products/by-id/[id].js");
const { default: productDetail } = await import("../api/products/[id].js");
const { default: categoriesList } = await import("../api/categories/index.js");
const { default: brandsList } = await import("../api/brands/index.js");
const { default: cartSession } = await import("../api/cart/[sessionId].js");
const { default: cartUser } = await import("../api/cart/user/[userId].js");
const { default: cartSummary } = await import("../api/cart/summary/[userId].js");
const { default: wishlistList } = await import("../api/wishlist/index.js");
const { default: addressList } = await import("../api/address/index.js");
const { default: orderList } = await import("../api/orders/index.js");
const { default: orderUser } = await import("../api/orders/user/[userId].js");
const { default: notificationsList } = await import("../api/notifications/index.js");
const { default: notificationsPrefs } = await import("../api/notifications/preferences.js");
const { default: paymentMethodsList } = await import("../api/payment-methods/index.js");
const { default: recentlyViewedList } = await import("../api/recently-viewed/index.js");
const { default: reviewsUser } = await import("../api/reviews/user.js");
const { default: profileGet } = await import("../api/profile/index.js");

// --- health ---
let res = makeRes();
await health(req("GET", {}), res);
check("health -> 200 + success", res.statusCode === 200 && res.body?.success === true, `status=${res.statusCode}`);

res = makeRes();
await health(req("POST"), res);
check("health POST -> 405", res.statusCode === 405, `status=${res.statusCode}`);

// --- users-table login (real DB, read-only) — seeded admin is
// admin@gadgetwallet.com / admin123. Verifies camelCase user shape.
res = makeRes();
await userLogin(req("POST", {}, { email: "admin@gadgetwallet.com", password: "admin123" }), res);
const loggedIn = res.statusCode === 200 && !!res.body?.data?.token;
const camelUser =
  res.body?.data?.user?.createdAt !== undefined && res.body?.data?.user?.isActive !== undefined;
check("auth/login seeded admin -> 200 + token", loggedIn, `status=${res.statusCode}`);
check("auth/login user shape is camelCase (createdAt/isActive)", camelUser);
const userToken = res.body?.data?.token;
const userId = res.body?.data?.user?.id;

res = makeRes();
await userLogin(req("POST", {}, { email: "admin@gadgetwallet.com", password: "wrong-password" }), res);
check("auth/login bad password -> 401", res.statusCode === 401, `status=${res.statusCode}`);

// --- admin/login (no DB) ---
res = makeRes();
await adminLogin(req("POST", {}, { email: "admin@smoke.test", password: "smokepass123" }), res);
check("admin/login valid creds -> 200 + token", res.statusCode === 200 && !!res.body?.data?.token, `status=${res.statusCode}`);
const adminToken = res.body?.data?.token;

res = makeRes();
await adminLogin(req("POST", {}, { email: "x", password: "y" }), res);
check("admin/login invalid creds -> 401", res.statusCode === 401, `status=${res.statusCode}`);

res = makeRes();
await adminLogin(req("GET"), res);
check("admin/login wrong method -> 405", res.statusCode === 405, `status=${res.statusCode}`);

// --- admin endpoints without token -> 401 ---
for (const [name, handler] of [
  ["admin/products", adminProducts],
  ["admin/orders", adminOrders],
  ["admin/dashboard", adminDashboard],
]) {
  res = makeRes();
  await handler(req("GET", {}), res);
  check(`${name} no token -> 401`, res.statusCode === 401, `status=${res.statusCode}`);
}

// --- admin/products WITH token (uses DB) ---
res = makeRes();
await adminProducts({ ...req("GET", {}), headers: { authorization: `Bearer ${adminToken}` } }, res);
check("admin/products with token -> 200", res.statusCode === 200, `status=${res.statusCode}, rows=${res.body?.data?.length}`);

// --- public product endpoints (real DB, read-only) ---
res = makeRes();
await productsList(req("GET", { page: "1", limit: "5" }), res);
check("products list -> 200 + rows", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}, total=${res.body?.total}`);
const firstProduct = res.body?.data?.[0];

res = makeRes();
await productsFeatured(req("GET", {}), res);
check("products/featured -> 200", res.statusCode === 200, `status=${res.statusCode}, rows=${res.body?.data?.length}`);

res = makeRes();
await productsNewArrivals(req("GET", {}), res);
check("products/new-arrivals -> 200", res.statusCode === 200, `status=${res.statusCode}, rows=${res.body?.data?.length}`);

if (firstProduct?.slug) {
  res = makeRes();
  await productDetail(req("GET", { id: firstProduct.slug }), res);
  check("products/[slug] detail -> 200 + images/specs keys", res.statusCode === 200 && Array.isArray(res.body?.data?.images) && Array.isArray(res.body?.data?.specs), `status=${res.statusCode}, name=${res.body?.data?.name}, images=${res.body?.data?.images?.length}`);

  res = makeRes();
  await productDetail(req("GET", { id: firstProduct.id }), res);
  check("products/[id] detail -> 200", res.statusCode === 200, `status=${res.statusCode}`);

  res = makeRes();
  await productsById(req("GET", { id: firstProduct.id }), res);
  check("products/by-id/:id -> 200 + images/specs", res.statusCode === 200 && Array.isArray(res.body?.data?.images), `status=${res.statusCode}`);

  // slug filter on the list endpoint
  res = makeRes();
  await productsList(req("GET", { search: firstProduct.name.split(" ")[0] }), res);
  check("products list search filter -> 200", res.statusCode === 200, `status=${res.statusCode}, total=${res.body?.total}`);
}

// --- categories + brands ---
res = makeRes();
await categoriesList(req("GET", {}), res);
check("categories list -> 200", res.statusCode === 200, `status=${res.statusCode}, rows=${res.body?.data?.length}`);

res = makeRes();
await brandsList(req("GET", {}), res);
check("brands list -> 200", res.statusCode === 200, `status=${res.statusCode}, rows=${res.body?.data?.length}`);

// --- authenticated user endpoints (read-only) ---
if (userToken && userId) {
  const authHeaders = { authorization: `Bearer ${userToken}` };

  res = makeRes();
  await cartUser(req("GET", { userId }), res);
  check("cart/user/:userId -> 200 + items array", res.statusCode === 200 && Array.isArray(res.body?.data?.items), `status=${res.statusCode}`);

  res = makeRes();
  await cartSession(req("GET", { sessionId: "smoke-test-session" }), res);
  check("cart/:sessionId -> 200 + items array", res.statusCode === 200 && Array.isArray(res.body?.data?.items), `status=${res.statusCode}`);

  res = makeRes();
  await cartSummary(req("GET", { userId }), res);
  check("cart/summary/:userId -> 200", res.statusCode === 200, `status=${res.statusCode}`);

  res = makeRes();
  await wishlistList(req("GET", {}, undefined, authHeaders), res);
  check("wishlist with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}, rows=${res.body?.data?.length}`);

  res = makeRes();
  await addressList(req("GET", {}, undefined, authHeaders), res);
  check("address list with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await orderList(req("GET", {}, undefined, authHeaders), res);
  check("orders list with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}, rows=${res.body?.data?.length}`);

  res = makeRes();
  await orderUser(req("GET", { userId }), res);
  check("orders/user/:userId -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await notificationsList(req("GET", {}, undefined, authHeaders), res);
  check("notifications with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await notificationsPrefs(req("GET", {}, undefined, authHeaders), res);
  check("notifications/preferences -> 200 + camelCase keys", res.statusCode === 200 && res.body?.data?.orderUpdates !== undefined, `status=${res.statusCode}`);

  res = makeRes();
  await paymentMethodsList(req("GET", {}, undefined, authHeaders), res);
  check("payment-methods with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await recentlyViewedList(req("GET", {}, undefined, authHeaders), res);
  check("recently-viewed with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await reviewsUser(req("GET", {}, undefined, authHeaders), res);
  check("reviews/user with token -> 200 + array", res.statusCode === 200 && Array.isArray(res.body?.data), `status=${res.statusCode}`);

  res = makeRes();
  await profileGet(req("GET", {}, undefined, authHeaders), res);
  check("profile with token -> user + defaultAddress + stats", res.statusCode === 200 && !!res.body?.data?.user && "defaultAddress" in res.body.data && !!res.body?.data?.stats, `status=${res.statusCode}`);

  // Unauthorized (no token) on an auth-gated endpoint -> 401
  res = makeRes();
  await wishlistList(req("GET", {}), res);
  check("wishlist no token -> 401", res.statusCode === 401, `status=${res.statusCode}`);
}

// --- method guards ---
res = makeRes();
await productsList(req("POST"), res);
check("products list POST -> 405", res.statusCode === 405, `status=${res.statusCode}`);

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
