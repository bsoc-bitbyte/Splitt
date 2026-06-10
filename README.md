# 🛺 Splitt

Auto ride-sharing for IIIT Jabalpur students. Split auto fares with batchmates going the same way.

## ⚙️ How it works

Two students both heading to the railway station at 10am shouldn't each pay ₹80 for a separate auto. Splitt connects them.

1. **Post a ride** — Add info if have spare seats.
2. **Post an intent** — request for a ride.
3. **Match** — Splitt finds the intended rides automatically.
4. **Confirm** — both users approve the match.
5. **Connect** — WhatsApp numbers are revealed after confirmation.

Only `@iiitdmj.ac.in` Google accounts can sign in.

## 🛠️ Tech Stack

|               |                                                                                      |
| ------------- | ------------------------------------------------------------------------------------ |
| **Frontend**  | **React 18**, **Vite**, **TailwindCSS**, **TanStack Query**, **React Router v6**     |
| **Backend**   | **Node.js 20**, **Express**, **Prisma**, **PostgreSQL**                              |
| **Real-time** | **Server-Sent Events (SSE)**                                                         |
| **Auth**      | **Google Identity Services** _(ID token flow — no client secret needed)_             |
| **Infra**     | **Docker** (local), **Render** (backend), **Vercel** (frontend), **Neon** (database) |

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js 20+**
- **Docker Desktop**

### Setup

Run the following commands in order:

```bash
# Install all workspace dependencies
npm install

# Start Postgres
docker compose up -d

# Copy env files and fill in values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run migrations and seed dev users
npm --workspace backend run prisma:migrate
npm --workspace backend run db:seed

# Start backend (:3000) and frontend (:5173)
npm run dev:backend
npm run dev:frontend

```

### Launch the App

Once both the backend and frontend servers are running, open:

- **http://localhost:5173**

Then click **Dev Login** to access the application.

## 🤝 Contributing

- Before opening any PR make sure to read **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)**.

## 📚 Docs

- Refer **[docs/SETUP.md](docs/SETUP.md)** — for Local setup, Google OAuth config, all dev commands
- Refer **[docs/DATA_SHAPES.md](docs/DATA_SHAPES.md)** — for Every API endpoint with request and response examples
- Refer **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — for Branch naming, commit format, PR process
