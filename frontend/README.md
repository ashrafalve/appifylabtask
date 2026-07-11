# Buddy Script — Social Frontend App

A modern, responsive social network frontend built with **Next.js 15 (App Router)**, **TypeScript**, **Bootstrap 5**, and custom **Vanilla CSS** aesthetics. It connects to the Buddy Script NestJS API backend to provide posts, commenting, child replies, and real-time interactive likes.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Bootstrap 5 + Vanilla CSS (`globals.css` overrides)
- **State Management / Hooks**: Custom React hooks (`useComments`, `useReplies`)

---

## Getting Started

### 1. Install Dependencies

Ensure you have Node.js installed, then run:

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` folder:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

This ensures Next.js requests reach the NestJS backend at `http://localhost:3001/api`.

### 3. Run Development Server

To launch the frontend with hot-reload in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Key Features Implemented

- **Feed Timeline**: Displays public posts, allows filtering by public/private visibility.
- **Comment Section & Nesting**: Clean bubble interface with direct "Reply" capability and recursive replies. Fully responsive layout with zero overlap.
- **Global Theme Override**: Integrated light/night mode switcher matching the system body theme wrapper (`._dark_wrapper`).
- **Post Visibility Toggler**: Whitelists Visibility selection dynamically during post creation.
