
# Detailed Prompt for eCommerce User Profile Page

Create a **fully functional User Profile Page** for my modern eCommerce website. The design should be **professional, responsive, modern, and suitable for an electronics eCommerce store**.

## Main Requirement

When a user is logged in and clicks the **profile icon in the navbar** (the SVG icon currently using `xmlns="http://www.w3.org/2000/svg"`), the user must be redirected to the **Profile Page** instead of the login page.

---

## Profile Page Features

Design a complete eCommerce customer dashboard with the following sections:

### 1. User Information

Display:

- Profile picture/avatar
- Full name
- Email address
- Phone number
- Date joined
- Account status
- Default shipping address

Add an **Edit Profile** button that allows updating personal information.

---

### 2. Order Management

Create an **Order History** section showing:

- Order ID
- Product thumbnails
- Product names
- Order date
- Payment status
- Delivery status
- Total amount

Add buttons:

- View Details
- Track Order
- Download Invoice
- Cancel Order (if not shipped)
- Return Request (if delivered)

---

### 3. Shopping Cart Integration

The profile page must connect with the existing cart system.

Show:

- Total cart items
- Cart subtotal
- Recently added items

Add buttons:

- Go to Cart
- Checkout

Ensure **Add to Cart** works from product pages and updates this section dynamically.

---

### 4. Buy Now Feature

Implement a **Buy Now** flow:

- Clicking Buy Now should create a temporary checkout session.
- The selected product should bypass the cart and go directly to checkout.
- After successful payment, the order must appear in Order History.

---

### 5. Wishlist

Add a **Wishlist** section where users can:

- Save products
- Remove products
- Move products to cart

---

### 6. Saved Addresses

Allow users to manage multiple addresses:

- Add address
- Edit address
- Delete address
- Set default address

---

### 7. Payment Methods

Create a payment methods section:

- Saved cards (masked numbers)
- Mobile banking options
- Add new payment method
- Remove payment method

---

### 8. Account Security

Include:

- Change password
- Confirm current password
- Password strength indicator
- Two-factor authentication toggle
- Logout from all devices

---

### 9. Notifications

Add notification preferences:

- Order updates
- Promotional emails
- SMS notifications
- Push notifications

---

### 10. Reviews & Ratings

Allow users to:

- View submitted reviews
- Edit reviews
- Delete reviews
- Rate purchased products

---

### 11. Recently Viewed Products

Show a horizontal slider of recently viewed products with quick actions:

- Add to Cart
- Buy Now
- Add to Wishlist

---

### 12. Support Center

Include:

- Contact support
- Live chat button
- FAQ link
- Return policy link

---

## Navigation Behavior

Update the navbar logic:

- If user is **logged in**, clicking the profile icon should navigate to `/profile`.
- If user is **not logged in**, clicking the icon should navigate to `/login`.

Example behavior:

```jsx
onClick={() => navigate(user ? "/profile" : "/login")}
```

---

## Technical Requirements

### Frontend

Use:

- React
- React Router
- Context API or Redux for auth/cart state
- SCSS or CSS Modules

### Backend APIs

Create REST APIs for:

- `/api/profile`
- `/api/orders`
- `/api/cart`
- `/api/wishlist`
- `/api/address`
- `/api/payment-methods`
- `/api/reviews`

Use JWT authentication middleware for all protected routes.

### Database (Neon/PostgreSQL)

Create tables for:

- users
- orders
- order_items
- cart_items
- wishlist_items
- addresses
- payment_methods
- reviews
- notifications

Include proper foreign keys and indexes.

---

## UI/UX Requirements

- Mobile-first responsive design
- Sticky sidebar on desktop
- Card-based layout
- Smooth hover animations
- Loading skeletons
- Empty-state illustrations
- Toast notifications for actions
- Dark mode support

---

## Security Requirements

- Protect all profile routes with authentication.
- Prevent unauthorized access.
- Validate all forms on frontend and backend.
- Hash passwords securely.
- Sanitize user inputs.

---

## Deliverables

Generate:

1. Complete React component structure
2. Routing configuration
3. Context/store integration
4. SCSS files with unique class names
5. Express backend routes
6. Controller functions
7. SQL schema for Neon/PostgreSQL
8. API integration examples
9. Responsive layout code
10. Sample dummy data for testing

The final result should behave like a **real production-level electronics eCommerce user account dashboard** similar to Amazon, Daraz, or Flipkart, where all profile, cart, wishlist, order, and checkout features work together seamlessly.
