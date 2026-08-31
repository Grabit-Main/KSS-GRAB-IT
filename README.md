# GrabIt - Delivery Agent Portal (Branch: Thabeethal)

GrabIt Delivery Agent Portal is a mobile-first delivery management application for riders. Dedicated branch: `Thabeethal`.

## Run locally

1. `python` is not available in this workspace, so the requested virtual environment was created with `python3 -m venv env`. Activate it with `source env/bin/activate`.
2. Secrets are stored in the gitignored root `.env`. Copy `.env.example` if starting fresh and set a strong `JWT_SECRET`; do not expose it or `CLOUDINARY_URL`.
3. Apply [the Supabase migration](backend/supabase/001_grabit_schema.sql) in the Supabase SQL editor. Add production Row Level Security policies and use a server-side Supabase service role key in production.
4. Start the API: `cd backend && ../env/bin/uvicorn app.main:app --reload`.
5. In another terminal: `cd frontend && npm install && npm run dev`.

The frontend calls only `VITE_API_URL` (default `http://localhost:8000/api`), not database/cloud credentials.

## Design and controls

- One phone/OTP entry route. Existing profiles receive an OTP; unregistered numbers receive the customer-only registration form. An authenticated visitor is redirected away from `/login` to their portal.
- Admins add, view, edit, and remove seller/delivery profiles through `/api/admin/users`. This app is passwordless by design; account access is controlled by OTP rather than a password.
- PostGIS `nearby_stores` uses `ST_DWithin(..., 5000)` and order placement calls it server-side, so orders cannot be placed from stores beyond 5 km.
- APIs are grouped under `/api/auth`, `/products`, `/categories`, `/cart`, `/orders`, `/payments`, `/stores`, `/delivery`, and `/users`.
