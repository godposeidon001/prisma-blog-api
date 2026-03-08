# Prisma Blog API

A TypeScript + Express backend for a blog platform using Prisma (PostgreSQL) and Better Auth.

## Features

- Email/password authentication with email verification
- Google social login support
- Role-aware auth middleware (`user`, `admin`)
- Post creation for authenticated users
- Post listing with combined filtering:
  - `search` (title/content, case-insensitive)
  - `tags` (any match)
  - `isFeatured` (`true` or `false`)
  - `authorId`
  - `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`)

## Tech Stack

- Node.js
- TypeScript
- Express 5
- Prisma 7 + PostgreSQL adapter (`@prisma/adapter-pg`)
- Better Auth
- Nodemailer

## Project Structure

```txt
src/
  app.ts                         # Express app and route registration
  server.ts                      # App bootstrap and DB connection
  lib/
    prisma.ts                    # Prisma client setup
    auth.ts                      # Better Auth configuration
  middleware/
    auth.middleware.ts           # Session/role middleware and req.user
  modules/
    post/
      post.router.ts             # /posts routes
      post.controller.ts         # request parsing/validation
      post.service.ts            # Prisma query logic
  email/
    verificationEmail.ts         # email template
prisma/
  schema.prisma                  # DB schema
  migrations/                    # Prisma migrations
generated/prisma/                # Generated Prisma client output
```

## Prerequisites

- Node.js 18+
- PostgreSQL database

## Environment Variables

Create a `.env` file in project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=3000
APP_URL=http://localhost:3000
APP_USER=your_smtp_email
APP_PASS=your_smtp_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Notes:
- `APP_URL` is used for CORS and email verification link generation.
- SMTP values are used by Nodemailer for verification emails.

## Installation & Run

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Server default: `http://localhost:3000`

## API

### Health

- `GET /`
  - Response: `"Hello, World!"`

### Auth

- Base path: `/api/auth/*`
- All auth endpoints are handled by Better Auth via `toNodeHandler(auth)`.
- Examples include sign-up, sign-in, session, email verification, and social login callbacks.

### Posts

Base path: `/posts`

#### Create Post

- `POST /posts`
- Protected: requires authenticated + email-verified user (`UserRole.USER`)
- Body (example):

```json
{
  "title": "My first post",
  "content": "Post content",
  "thumbnail": "https://example.com/image.jpg",
  "isFeatured": false,
  "status": "PUBLISHED",
  "tags": ["next", "web"],
  "views": 0
}
```

Behavior:
- `authorId` is injected from `req.user.id` in service.
- Returns `401` when unauthorized.

#### Get Posts (with filters)

- `GET /posts`
- Query params:
  - `search=keyword`
  - `tags=next,web,php` or repeated `tags=next&tags=web`
  - `isFeatured=true|false` (strict)
  - `authorId=<userId>`
  - `status=DRAFT|PUBLISHED|ARCHIVED` (case-insensitive input accepted)

Examples:

```http
GET /posts
GET /posts?search=prisma
GET /posts?tags=next,web
GET /posts?isFeatured=true
GET /posts?authorId=user_123
GET /posts?status=published
GET /posts?search=api&tags=next,web&isFeatured=false&authorId=user_123&status=ARCHIVED
```

Validation behavior:
- Invalid `isFeatured` (e.g. `tru`) -> `400`
- Invalid `status` (e.g. `publishd`) -> `400`

## Filtering Logic

Filters are combined with `AND` in Prisma:

- `search`: matches `title` OR `content` using `contains` (case-insensitive)
- `tags`: uses `hasSome` (returns posts containing any provided tag)
- `isFeatured`: exact boolean match
- `authorId`: exact match
- `status`: enum match

## Available Scripts

- `npm run dev` - run server in watch mode using `tsx`
- `npm test` - placeholder script

## Database

Schema is defined in `prisma/schema.prisma`.

Main blog model:
- `Post` with `status`, `isFeatured`, `tags`, and `authorId`

Auth-related models are also present:
- `User`, `Session`, `Account`, `Verification`

## Current Notes

- CORS is configured with `origin: APP_URL` and `credentials: true`.
- Prisma client output is configured to `generated/prisma`.
- TypeScript is strict (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).

