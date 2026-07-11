# Buddy Script — Full Stack Social Platform

A full-stack, production-ready social platform featuring a robust **NestJS + Prisma (PostgreSQL)** backend and a responsive **Next.js (TypeScript + Tailwind/Bootstrap)** frontend application.

---

## Quick Start — How to Run

Follow these steps to run the entire project locally.

### 1. Database Setup (Prisma & PostgreSQL)
Ensure you have a PostgreSQL database running. 

In `backend/.env`, set your connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/buddy_script?schema=public"
JWT_SECRET="super-secret-key"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### 2. Run the Backend API
Open a terminal in the root directory:

```bash
cd backend
npm install

# Push database schema & generate Prisma Client
npx prisma db push

# (Optional) Seed demo users & posts
npm run prisma:seed

# Start the NestJS developmental server
npm run start:dev
```
The NestJS API will run at **`http://localhost:3001/api`**. 
Interactive API documentation (Swagger) is available at **`http://localhost:3001/api/docs`**.

---

### 3. Run the Frontend App
Open a second terminal window in the root directory:

```bash
cd frontend
npm install

# Start the Next.js development server
npm run dev
```
The frontend UI will run at **`http://localhost:3000`**.

---

## Default Credentials (Demo Account)
If seeded, or to login to the default user:
- **Email:** `alve@gmail.com`
- **Password:** `password123`

---

## Project Structure
- [/backend](file:///d:/appifylabtask/backend) — NestJS REST API, Prisma schema, authorization hooks, comments, and replies handlers.
- [/frontend](file:///d:/appifylabtask/frontend) — Next.js 15 App, custom comment bubbles, post visibility filters, and dark mode theme.
