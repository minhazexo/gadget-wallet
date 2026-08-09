import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { showToast } from "../store/useToastStore";

/**
 * Guards purchase actions (add to cart / buy now / checkout).
 *
 * Browsing the store is fully public — this only kicks in when a visitor tries
 * to buy something. Returns `true` when signed in, otherwise redirects to the
 * login page (remembering where they were so they can continue after signing
 * in) and returns `false`.
 *
 * @param to Optional explicit destination to resume after login (e.g. the
 *           checkout URL for "Buy Now"). Defaults to the current page.
 */
export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  return (to?: string) => {
    // Read the store directly at call time so the check is never stale.
    if (useAuthStore.getState().user) return true;

    const from = to ?? location.pathname + location.search;
    showToast("Please sign in to continue", "info");
    navigate("/login", { state: { from } });
    return false;
  };
}
