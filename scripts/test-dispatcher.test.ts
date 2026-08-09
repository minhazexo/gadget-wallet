import { test, expect } from "bun:test";
import { matchRoute, parsePath } from "../api/[[...route]].js";
import { routes } from "../api-handlers/_routes.js";

function find(route) {
  return matchRoute(routes, route.split("/").filter(Boolean));
}

// Fully-static paths must match AND capture zero params (not be shadowed by
// a :param sibling like [":id"] or [":sessionId"]).
const staticPaths = [
  "health",
  "products",
  "products/featured",
  "products/new-arrivals",
  "auth/login",
  "auth/logout-all",
  "cart/add",
  "cart/update",
  "cart/remove",
  "cart/merge",
  "wishlist/move-to-cart",
  "reviews/user",
  "notifications/preferences",
  "notifications/read-all",
  "recently-viewed",
  "admin/login",
  "admin/products",
];
for (const p of staticPaths) {
  test(`static match: ${p}`, () => {
    const m = find(p);
    expect(m).not.toBeNull();
    expect(Object.keys(m.params).length).toBe(0);
  });
}

// :param routes capture at least one value.
const paramPaths = [
  "products/abc-123",
  "products/iPhone%2015",
  "categories/phones",
  "brands/samsung",
  "cart/sess-1",
  "orders/ord-1",
  "reviews/rev-1",
  "payment-methods/pm-1",
  "address/addr-1",
  "orders/user/u-1",
  "cart/user/u-1",
  "cart/summary/u-1",
  "address/a-1/default",
  "payment-methods/pm-1/default",
];
for (const p of paramPaths) {
  test(`param capture: ${p}`, () => {
    const m = find(p);
    expect(m).not.toBeNull();
    expect(Object.values(m.params).length).toBeGreaterThan(0);
  });
}

test("param URL-decoding (Vercel contract: req.query.id was decoded)", () => {
  const m = find("products/iPhone%2015");
  expect(Object.values(m.params)[0]).toBe("iPhone 15");
});

test("cart static actions are not shadowed by :sessionId", () => {
  expect(find("cart/add").params).toEqual({});
  expect(find("cart/update").params).toEqual({});
  expect(find("cart/remove").params).toEqual({});
  expect(find("cart/merge").params).toEqual({});
  expect(find("cart/sess-1").params.sessionId).toBe("sess-1");
});

test("reviews/user is not shadowed by :id", () => {
  expect(find("reviews/user").params).toEqual({});
  expect(find("reviews/rev-1").params.id).toBe("rev-1");
});

test("orders/user/:userId is not shadowed by :id", () => {
  expect(find("orders/user/u-1").params.userId).toBe("u-1");
  expect(find("orders/ord-1").params.id).toBe("ord-1");
});

test("admin reorder captures :id but not :imageId", () => {
  const m = find("admin/products/p-1/images/reorder");
  expect(m.params.id).toBe("p-1");
  expect(m.params.imageId).toBeUndefined();
  const m2 = find("admin/products/p-1/images/img-1");
  expect(m2.params.id).toBe("p-1");
  expect(m2.params.imageId).toBe("img-1");
});

test("parsePath: query decode, + as space, repeated keys", () => {
  const parsed = parsePath("/api/products?search=iphone+sale&page=2&tag=a&tag=b");
  expect(parsed.segments).toEqual(["products"]);
  expect(parsed.query.search).toBe("iphone sale");
  expect(parsed.query.page).toBe("2");
  expect(parsed.query.tag).toEqual(["a", "b"]);
});

test("unknown routes → null", () => {
  expect(find("nonexistent/thing")).toBeNull();
  expect(find("products/x/y/z")).toBeNull();
});
