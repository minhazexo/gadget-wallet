/**
 * Admin barrel — App.tsx lazy-loads this single module (one chunk) so
 * storefront visitors never download any admin code. Navigating between
 * admin pages afterwards is instant because the chunk is already loaded.
 */
export { default as AdminLayout } from "./AdminLayout";
export { default as Dashboard } from "./Dashboard";
export { default as AdminProducts } from "./AdminProducts";
export { default as AdminProductForm } from "./AdminProductForm";
export { default as AdminProductDetail } from "./AdminProductDetail";
export { default as AdminOrders } from "./AdminOrders";
export { default as AdminCategories } from "./AdminCategories";
export { default as AdminBrands } from "./AdminBrands";
