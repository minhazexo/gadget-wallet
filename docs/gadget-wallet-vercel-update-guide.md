
# Gadget-Wallet Vercel Deployment Update Guide

This document contains **all required changes** to make the repository work correctly on **Vercel** with:

- Frontend deployed on Vercel
- Backend APIs working
- Products loading correctly
- Admin features working
- Neon PostgreSQL connected
- Supabase image storage connected

Repository: https://github.com/minhazexo/gadget-wallet

---

## Current Problem

The project works locally because a separate backend server runs on your machine. On Vercel, only the frontend is deployed, so API routes such as:

/api/products/new-arrivals

return **404 Not Found**.

---

# Required Project Structure

Change the project structure to:

```txt
gadget-wallet/
├── api/
│   ├── products/
│   │   ├── index.js
│   │   ├── new-arrivals.js
│   │   └── [id].js
│   ├── admin/
│   │   ├── login.js
│   │   └── products.js
│   └── _lib/
│       ├── db.js
│       └── supabase.js
├── client/
├── vercel.json
├── package.json
└── bun.lock
```

---

# Step 1: Install Dependencies

Run from project root:

```bash
bun add @neondatabase/serverless
bun add @supabase/supabase-js
bun add jsonwebtoken
```

---

# Step 2: Database Connection

Create `api/_lib/db.js`

```js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default sql;
```

---

# Step 3: Supabase Client

Create `api/_lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

# Step 4: Products API

Create `api/products/index.js`

```js
import sql from '../_lib/db.js';

export default async function handler(req, res) {
  try {
    const products = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
```

---

# Step 5: New Arrivals API

Create `api/products/new-arrivals.js`

```js
import sql from '../_lib/db.js';

export default async function handler(req, res) {
  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
      LIMIT 12
    `;
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
```

---

# Step 6: Product Details API

Create `api/products/[id].js`

```js
import sql from '../_lib/db.js';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const result = await sql`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `;

    if (!result.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}
```

---

# Step 7: Admin Login API

Create `api/admin/login.js`

```js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
```

---

# Step 8: Admin Product Create API

Create `api/admin/products.js`

```js
import jwt from 'jsonwebtoken';
import sql from '../_lib/db.js';

function verify(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try {
    verify(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { name, price, image_url, category } = req.body;

    try {
      const result = await sql`
        INSERT INTO products (name, price, image_url, category)
        VALUES (${name}, ${price}, ${image_url}, ${category})
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    } catch (err) {
      return res.status(500).json({ error: 'Insert failed' });
    }
  }

  res.status(405).end();
}
```

---

# Step 9: Frontend API Changes

Search the frontend for:

```txt
http://localhost:5000
http://127.0.0.1:5000
```

Replace all with:

```txt
/api
```

Example:

```js
fetch('/api/products/new-arrivals')
```

Never use localhost URLs in production.

---

# Step 10: Vercel Configuration

Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ]
}
```

---

# Step 11: Root package.json

Update root `package.json`

```json
{
  "scripts": {
    "build": "cd client && bun install && bun run build"
  }
}
```

---

# Step 12: Neon Database Table

Run this SQL in Neon:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# Step 13: Environment Variables in Vercel

Add these variables in **Vercel → Project → Settings → Environment Variables**

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
JWT_SECRET=super-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword
```

After adding, click **Redeploy**.

---

# Step 14: Vercel Dashboard Settings

Set:

- Framework Preset: **Other**
- Root Directory: **(empty)**
- Build Command: `bun run build`
- Output Directory: `client/dist`
- Install Command: `bun install`

---

# Step 15: Remove Old Backend From Production

The old `server/` folder is no longer needed for production deployment on Vercel.

Keep it only for local development if desired.

---

# Step 16: Supabase Upload Flow

Admin panel should:

1. Upload image to Supabase Storage.
2. Receive public URL.
3. Send URL to `/api/admin/products`.
4. Save URL in database.

This keeps product images correctly linked to products.

---

# Step 17: Test After Deployment

Open:

```txt
https://gadgetwallet.vercel.app/api/products
https://gadgetwallet.vercel.app/api/products/new-arrivals
https://gadgetwallet.vercel.app/api/products/1
```

Expected result: JSON responses.

---

# Final Checklist

- [ ] Created `/api` folder
- [ ] Added Neon connection
- [ ] Added Supabase client
- [ ] Added products APIs
- [ ] Added admin APIs
- [ ] Updated frontend API URLs
- [ ] Added `vercel.json`
- [ ] Updated root `package.json`
- [ ] Added Vercel environment variables
- [ ] Redeployed project
- [ ] Verified API endpoints
- [ ] Verified admin login
- [ ] Verified product creation
- [ ] Verified products display on homepage

After completing all steps, the project will run fully on Vercel with working backend APIs, product display, and admin functionality.
