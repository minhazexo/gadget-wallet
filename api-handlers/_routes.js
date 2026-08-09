/**
 * Route table for the catch-all api/[...route].js dispatcher.
 *
 * Each entry maps a path pattern (array of segments, ":x" = dynamic) to the
 * handler module in this directory. ORDER MATTERS: literal segments must come
 * before their :param siblings (e.g. ["products","featured"] before
 * ["products",":id"]), otherwise "featured" would be captured as :id.
 */
import health from "./health.js";

import productsList from "./products/index.js";
import productsFeatured from "./products/featured.js";
import productsNewArrivals from "./products/new-arrivals.js";
import productsById from "./products/by-id/[id].js";
import productDetail from "./products/[id].js";

import categoriesList from "./categories/index.js";
import categoryDetail from "./categories/[slug].js";

import brandsList from "./brands/index.js";
import brandDetail from "./brands/[slug].js";

import authRegister from "./auth/register.js";
import authLogin from "./auth/login.js";
import authMe from "./auth/me.js";
import authLogoutAll from "./auth/logout-all.js";

import profileIndex from "./profile/index.js";
import profileAvatar from "./profile/avatar.js";
import profilePassword from "./profile/password.js";
import profileTwoFactor from "./profile/two-factor.js";

import adminLogin from "./admin/login.js";
import adminDashboard from "./admin/dashboard.js";
import adminOrders from "./admin/orders.js";
import adminProducts from "./admin/products.js";
import adminProductDetail from "./admin/products/[id].js";
import adminProductImages from "./admin/products/[id]/images.js";
import adminImagesReorder from "./admin/products/[id]/images/reorder.js";
import adminImageDetail from "./admin/products/[id]/images/[imageId].js";

import cartAdd from "./cart/add.js";
import cartUpdate from "./cart/update.js";
import cartRemove from "./cart/remove.js";
import cartMerge from "./cart/merge.js";
import cartSession from "./cart/[sessionId].js";
import cartUser from "./cart/user/[userId].js";
import cartSummary from "./cart/summary/[userId].js";

import wishlistList from "./wishlist/index.js";
import wishlistAdd from "./wishlist/add.js";
import wishlistRemove from "./wishlist/remove.js";
import wishlistMoveToCart from "./wishlist/move-to-cart.js";

import ordersIndex from "./orders/index.js";
import orderDetail from "./orders/[id].js";
import orderCancel from "./orders/[id]/cancel.js";
import orderReturn from "./orders/[id]/return.js";
import orderUser from "./orders/user/[userId].js";

import reviewsIndex from "./reviews/index.js";
import reviewsUser from "./reviews/user.js";
import reviewDetail from "./reviews/[id].js";

import addressIndex from "./address/index.js";
import addressDetail from "./address/[id].js";
import addressDefault from "./address/[id]/default.js";

import paymentMethodsIndex from "./payment-methods/index.js";
import paymentMethodDetail from "./payment-methods/[id].js";
import paymentMethodDefault from "./payment-methods/[id]/default.js";

import notificationsIndex from "./notifications/index.js";
import notificationsPreferences from "./notifications/preferences.js";
import notificationsReadAll from "./notifications/read-all.js";

import recentlyViewedIndex from "./recently-viewed/index.js";

export const routes = [
  // health
  { pattern: ["health"], handler: health },

  // products — literal routes BEFORE :id
  { pattern: ["products"], handler: productsList },
  { pattern: ["products", "featured"], handler: productsFeatured },
  { pattern: ["products", "new-arrivals"], handler: productsNewArrivals },
  { pattern: ["products", "by-id", ":id"], handler: productsById },
  { pattern: ["products", ":id"], handler: productDetail },

  // categories / brands
  { pattern: ["categories"], handler: categoriesList },
  { pattern: ["categories", ":slug"], handler: categoryDetail },
  { pattern: ["brands"], handler: brandsList },
  { pattern: ["brands", ":slug"], handler: brandDetail },

  // auth
  { pattern: ["auth", "register"], handler: authRegister },
  { pattern: ["auth", "login"], handler: authLogin },
  { pattern: ["auth", "me"], handler: authMe },
  { pattern: ["auth", "logout-all"], handler: authLogoutAll },

  // profile
  { pattern: ["profile"], handler: profileIndex },
  { pattern: ["profile", "avatar"], handler: profileAvatar },
  { pattern: ["profile", "password"], handler: profilePassword },
  { pattern: ["profile", "two-factor"], handler: profileTwoFactor },

  // admin — reorder/imageId AFTER the fixed sub-paths
  { pattern: ["admin", "login"], handler: adminLogin },
  { pattern: ["admin", "dashboard"], handler: adminDashboard },
  { pattern: ["admin", "orders"], handler: adminOrders },
  { pattern: ["admin", "products"], handler: adminProducts },
  { pattern: ["admin", "products", ":id"], handler: adminProductDetail },
  { pattern: ["admin", "products", ":id", "images"], handler: adminProductImages },
  { pattern: ["admin", "products", ":id", "images", "reorder"], handler: adminImagesReorder },
  { pattern: ["admin", "products", ":id", "images", ":imageId"], handler: adminImageDetail },

  // cart — user/summary BEFORE :sessionId
  { pattern: ["cart", "add"], handler: cartAdd },
  { pattern: ["cart", "update"], handler: cartUpdate },
  { pattern: ["cart", "remove"], handler: cartRemove },
  { pattern: ["cart", "merge"], handler: cartMerge },
  { pattern: ["cart", "user", ":userId"], handler: cartUser },
  { pattern: ["cart", "summary", ":userId"], handler: cartSummary },
  { pattern: ["cart", ":sessionId"], handler: cartSession },

  // wishlist
  { pattern: ["wishlist"], handler: wishlistList },
  { pattern: ["wishlist", "add"], handler: wishlistAdd },
  { pattern: ["wishlist", "remove"], handler: wishlistRemove },
  { pattern: ["wishlist", "move-to-cart"], handler: wishlistMoveToCart },

  // orders — user BEFORE :id
  { pattern: ["orders"], handler: ordersIndex },
  { pattern: ["orders", "user", ":userId"], handler: orderUser },
  { pattern: ["orders", ":id", "cancel"], handler: orderCancel },
  { pattern: ["orders", ":id", "return"], handler: orderReturn },
  { pattern: ["orders", ":id"], handler: orderDetail },

  // reviews — user BEFORE :id
  { pattern: ["reviews"], handler: reviewsIndex },
  { pattern: ["reviews", "user"], handler: reviewsUser },
  { pattern: ["reviews", ":id"], handler: reviewDetail },

  // address — default BEFORE :id
  { pattern: ["address"], handler: addressIndex },
  { pattern: ["address", ":id", "default"], handler: addressDefault },
  { pattern: ["address", ":id"], handler: addressDetail },

  // payment-methods — default BEFORE :id
  { pattern: ["payment-methods"], handler: paymentMethodsIndex },
  { pattern: ["payment-methods", ":id", "default"], handler: paymentMethodDefault },
  { pattern: ["payment-methods", ":id"], handler: paymentMethodDetail },

  // notifications
  { pattern: ["notifications"], handler: notificationsIndex },
  { pattern: ["notifications", "preferences"], handler: notificationsPreferences },
  { pattern: ["notifications", "read-all"], handler: notificationsReadAll },

  // recently-viewed
  { pattern: ["recently-viewed"], handler: recentlyViewedIndex },
];
