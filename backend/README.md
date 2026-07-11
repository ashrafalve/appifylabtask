# AppifyLab — Social Backend API

A production-grade, scalable backend for a social platform, built with **NestJS**,
**PostgreSQL** and **Prisma**. It implements authentication, user profiles,
posts, comments, replies and a multi-entity like system, designed to scale to
millions of users and posts.

> The frontend lives in a separate repository and is **not** part of this build.
> This document covers the backend only.

---

## Tech Stack

| Concern            | Choice                                            |
| ------------------ | ------------------------------------------------- |
| Framework          | NestJS (Express platform)                         |
| Language           | TypeScript                                        |
| Database           | PostgreSQL                                        |
| ORM                | Prisma                                            |
| Auth               | JWT (Passport), bcrypt password hashing           |
| Validation         | class-validator + class-transformer              |
| File uploads       | Multer (local disk storage)                       |
| Security           | Helmet, CORS, Compression, global validation      |
| Docs               | Swagger (OpenAPI)                                 |
| Config             | `@nestjs/config` + Joi env validation             |

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma            # PostgreSQL schema, indexes, enums
│   └── seed.ts                  # Optional demo data
├── src/
│   ├── main.ts                  # Bootstrap: helmet, cors, compression, pipes, swagger
│   ├── app.module.ts            # Root module composition
│   ├── config/                  # ConfigModule + Joi env validation
│   ├── common/                  # Decorators, global filter, interceptor, DTOs, utils
│   │   ├── decorators/          # @CurrentUser, @AuthRequired
│   │   ├── filters/             # GlobalExceptionFilter (consistent error envelope)
│   │   ├── interceptors/        # TransformInterceptor (success envelope)
│   │   ├── dto/                 # PaginationDto + helpers
│   │   ├── interfaces/         # ApiResponse envelope types
│   │   └── utils/               # sanitizeUser()
│   ├── prisma/                  # PrismaService (global DB client)
│   ├── uploads/                 # Multer config, ImageUploadInterceptor, UploadsService
│   ├── auth/                    # Register / Login / JWT / Passport strategy + guard
│   ├── users/                   # GET /users/me
│   ├── posts/                   # Post CRUD, feed, visibility, image upload, post likes
│   ├── comments/                # Comment CRUD + likes
│   ├── replies/                 # Reply CRUD + likes
│   └── likes/                   # Centralized like service (post/comment/reply)
├── uploads/                     # Runtime upload storage (git-ignored)
├── .env.example                 # Environment template
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` (a PostgreSQL connection string). The
application **never** hardcodes credentials — everything is read from the
environment via `ConfigModule`.

### 3. Apply the database schema

```bash
npx prisma db push        # create/update tables without a migration
# or, to track migrations:
npx prisma migrate dev --name init
npx prisma generate       # (re)generate the Prisma client
```

### 4. (Optional) Seed demo data

```bash
npm run prisma:seed
```

### 5. Run

```bash
npm run start:dev         # watch mode
npm run build && npm run start:prod
```

The API is available at `http://localhost:3001/api`. Interactive API docs
(Swagger) are at `http://localhost:3001/api/docs`.

---

## Authentication

- **Register** `POST /api/auth/register` → creates the user (bcrypt hash,
  cost factor 12) and returns a token pair.
- **Login** `POST /api/auth/login` → validates credentials, returns tokens.
- **JWT** is a bearer token (`Authorization: Bearer <token>`). The payload is
  `{ sub: userId, email }`.
- **Logout** is stateless — the client discards the token (no server-side
  session store required). The JWT strategy re-validates the user on every
  request and rejects tokens for deleted users.
- **Protected routes** use `@UseGuards(JwtAuthGuard)`.

---

## API Reference

All responses follow a consistent envelope:

```jsonc
// Success
{ "success": true, "statusCode": 200, "message": "Success", "data": ..., "timestamp": "...", "path": "..." }
// Error
{ "success": false, "statusCode": 400, "message": "...", "data": null, "timestamp": "...", "path": "..." }
```

### Auth & Users

| Method | Path                | Auth | Description                |
| ------ | ------------------- | ---- | -------------------------- |
| POST   | `/api/auth/register`| –    | Register a new user        |
| POST   | `/api/auth/login`   | –    | Login                      |
| GET    | `/api/users/me`     | ✅   | Current authenticated user |

### Posts

| Method | Path                     | Auth | Description                       |
| ------ | ------------------------ | ---- | --------------------------------- |
| POST   | `/api/posts`             | ✅   | Create post (multipart, optional `image`) |
| GET    | `/api/posts`             | ✅   | Paginated feed (respects visibility) |
| GET    | `/api/posts/:id`         | ✅   | Single post                       |
| PATCH  | `/api/posts/:id`         | ✅   | Update own post (multipart)       |
| DELETE | `/api/posts/:id`         | ✅   | Delete own post                   |
| POST   | `/api/posts/:id/like`    | ✅   | Like (idempotent)                 |
| DELETE | `/api/posts/:id/like`    | ✅   | Unlike                            |

### Comments

| Method | Path                       | Auth | Description          |
| ------ | -------------------------- | ---- | -------------------- |
| POST   | `/api/comments`            | ✅   | Create (`body.postId`) |
| GET    | `/api/comments?postId=...` | ✅   | List for a post      |
| GET    | `/api/comments/:id`        | ✅   | Single comment       |
| PATCH  | `/api/comments/:id`        | ✅   | Update own comment   |
| DELETE | `/api/comments/:id`        | ✅   | Delete own comment   |
| POST   | `/api/comments/:id/like`   | ✅   | Like                 |
| DELETE | `/api/comments/:id/like`   | ✅   | Unlike               |

### Replies

| Method | Path                       | Auth | Description             |
| ------ | -------------------------- | ---- | ----------------------- |
| POST   | `/api/replies`             | ✅   | Create (`body.commentId`) |
| GET    | `/api/replies?commentId=`  | ✅   | List for a comment      |
| GET    | `/api/replies/:id`         | ✅   | Single reply            |
| PATCH  | `/api/replies/:id`         | ✅   | Update own reply        |
| DELETE | `/api/replies/:id`         | ✅   | Delete own reply        |
| POST   | `/api/replies/:id/like`    | ✅   | Like                    |
| DELETE | `/api/replies/:id/like`    | ✅   | Unlike                  |

### Pagination

List endpoints accept `?page=1&limit=10` (limit capped at 100). The response
`data` is `{ items, meta: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }`.

---

## Data Model

- **User** — `id, firstName, lastName, email (unique), passwordHash, createdAt, updatedAt`
- **Post** — `id, authorId, content, image?, visibility (PUBLIC|PRIVATE), createdAt, updatedAt`
- **Comment** — `id, postId, authorId, content, createdAt`
- **Reply** — `id, commentId, authorId, content, createdAt`
- **PostLike / CommentLike / ReplyLike** — `(entityId, userId)` with a unique
  constraint that makes duplicate likes impossible.

---

## Visibility Rules

- **PUBLIC** posts are visible to everyone.
- **PRIVATE** posts are visible **only to their author**. Other users receive a
  `404` (not `403`) when listing or fetching them, so existence is not leaked.
- Comment/reply reads enforce the **parent post's** visibility.

---

## Likes (design decision)

Like state lives in **three dedicated tables** (`post_likes`, `comment_likes`,
`reply_likes`), each with a `(entityId, userId)` unique constraint. This:
- prevents duplicate likes at the database level, and
- makes "like" an **idempotent upsert** (`POST .../like` can be called repeatedly
  without error) while `DELETE .../like` removes it.

To avoid **N+1 queries** on feeds, the per-item "liked by me" flag is computed
with a single `where { userId, entityId: { in: [...] } }` query instead of one
lookup per item.

---

## Validation & Error Handling

- Every request body/query is validated with `class-validator` DTOs. Unknown
  fields are stripped (`whitelist`) and rejected (`forbidNonWhitelisted`).
- A **global exception filter** normalizes every error (validation, 401, 404,
  500) into the same envelope as successful responses. Server-side stack traces
  are logged but never returned to the client.
- User responses are **always sanitized** (`passwordHash` removed) via a central
  `sanitizeUser` helper.

---

## Security

- **Helmet** for secure HTTP headers.
- **CORS** configured through `CORS_ORIGIN` (comma-separated, or `*` for dev).
- **Compression** (gzip) on responses.
- **bcrypt** password hashing (cost 12).
- **JWT** guards on every protected route.
- Uploads are restricted by MIME allowlist and a size cap, and stored with
  random UUID filenames (no user-controlled paths → no traversal).

---

## Performance & Scale (millions of rows)

- Indexes on the hot paths:
  - `posts(authorId, createdAt)`, `posts(visibility, createdAt)`
  - `comments(postId, createdAt)`, `comments(authorId)`
  - `replies(commentId, createdAt)`, `replies(authorId)`
  - unique `(entityId, userId)` on each like table, plus `entityId`/`userId` indexes
- Feeds use `ORDER BY createdAt DESC` + `skip/take` over indexed columns and run
  the `count` + `findMany` in a single `$transaction`.
- The "liked by me" set is fetched in one query per page.
- Uploads are sharded by `YYYY/MM` on disk to keep directories small.
- The architecture is horizontally scalable: the app is stateless (JWT), so
  multiple instances can sit behind a load balancer. For very high volume,
  consider read replicas, cursor-based pagination, and moving uploads to object
  storage (S3/GCS) — the `UploadsService` boundary makes that a localized change.

---

## Scripts

| Script                  | Purpose                          |
| ----------------------- | -------------------------------- |
| `npm run start:dev`     | Run with watch                   |
| `npm run build`         | Compile to `dist/`               |
| `npm run start:prod`    | Run compiled `dist/main.js`      |
| `npm run prisma:generate` | Generate Prisma client         |
| `npm run prisma:migrate`  | Create/apply migrations        |
| `npm run prisma:studio`   | Open Prisma Studio              |
| `npm run prisma:seed`     | Seed demo users/posts           |
| `npm run typecheck`       | `tsc --noEmit`                  |
| `npm run lint`           | ESLint                          |
