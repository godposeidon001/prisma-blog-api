# Prisma Blog API

TypeScript + Express backend for a blog API using Prisma (PostgreSQL) and Better Auth.

## Stack

- Node.js
- TypeScript
- Express 5
- Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`)
- Better Auth
- Nodemailer

## Features

- Better Auth integration at `/api/auth/*`
- Email/password auth with email verification required
- Google social provider support
- Post creation (authenticated users only)
- Post listing with:
  - search
  - tags filter
  - featured filter
  - author filter
  - status filter
  - pagination
  - sorting
- Get post by ID with automatic `views` increment
- Comment module with create/read/update/delete
- Comment ownership checks for update/delete
- Comments by author endpoint

## Project Structure

```txt
src/
  app.ts
  server.ts
  helpers/
    PaginationSorting.ts
  lib/
    prisma.ts
    auth.ts
  middleware/
    auth.middleware.ts
  modules/
    post/
      post.router.ts
      post.controller.ts
      post.service.ts
    comment/
      comment.router.ts
      comment.controller.ts
      comment.service.ts
  scripts/
    seedAdmin.ts
    seedPosts.ts
prisma/
  schema.prisma
  migrations/
generated/prisma/
```

## Environment Variables

Create `.env` in project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=3000
APP_URL=http://localhost:3000

APP_USER=your_smtp_email
APP_PASS=your_smtp_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

ADMIN_NAME=Admin Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword
```

Notes:
- `APP_URL` is used for CORS and verification links.
- `APP_USER`/`APP_PASS` are used to send verification email.
- `ADMIN_*` vars are required by the admin seed script.

## Install & Run

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Server runs on `PORT` (default `3000`).

## Scripts

- `npm run dev` -> start server with `tsx watch`
- `npm run seed:admin` -> creates an admin user via auth API
- `npm run seed:posts` -> inserts 30 posts
- `npm test` -> placeholder

## API

### Health

- `GET /` -> `"Hello, World!"`

### Auth

- Base path: `/api/auth/*`
- Routed through Better Auth node handler.

### Posts

Base path: `/posts`

#### `GET /posts`

Returns:

```json
{
  "posts": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

Each post includes `_count.comments`.

Query params:
- `search=...` -> title/content contains (case-insensitive)
- `tags=next,web` or repeated `tags=next&tags=web` -> any tag match (`hasSome`)
- `isFeatured=true|false`
- `authorId=<user-id>`
- `status=DRAFT|PUBLISHED|ARCHIVED` (case-insensitive input)
- `page=<positive integer>` default `1`
- `limit=<1..100>` default `10`
- `sortBy=createdAt|updatedAt|title|views` default `createdAt`
- `sortOrder=asc|desc` default `desc`

Validation:
- Invalid `isFeatured`, `status`, `page`, `limit`, `sortBy`, or `sortOrder` returns `400`.

Example:

```http
GET /posts?search=prisma&tags=api,backend&isFeatured=true&authorId=user_123&status=PUBLISHED&page=2&limit=5&sortBy=views&sortOrder=desc
```

#### `GET /posts/:id`

- Returns post by ID.
- Increments `views` by `1` each successful fetch.
- Includes top-level comments (`parentId = null`) with nested replies.
- Comment/reply order is chronological (`createdAt asc`).
- Returns `400` for invalid ID.
- Returns `404` if post does not exist.

#### `POST /posts`

- Protected route (`isAuthUserPayload(UserRole.USER)`).
- Requires authenticated and email-verified user.
- `authorId` is taken from `req.user.id` in service.

Example body:

```json
{
  "title": "My post",
  "content": "Post content",
  "thumbnail": "https://example.com/img.jpg",
  "isFeatured": false,
  "status": "PUBLISHED",
  "tags": ["node", "prisma"],
  "views": 0
}
```

### Comments

Base path: `/comments`

#### `POST /comments`

- Protected route (`USER` or `ADMIN`).
- Creates a comment or reply.
- Body:

```json
{
  "content": "Nice post!",
  "postId": "post_uuid",
  "parentId": "optional_parent_comment_id"
}
```

Validation/error behavior:
- `401` Unauthorized
- `404` Post not found
- `404` Parent comment not found
- `400` Parent comment does not belong to this post

#### `GET /comments/:id`

- Returns one comment by ID.
- Includes:
  - `post.id`, `post.title`, `post.views`
  - `replies` (ordered by `createdAt asc`)
- Returns `400` for invalid ID.
- Returns `404` if comment not found.

#### `GET /comments/author/:authorId`

- Returns all comments for a given author.
- Each comment includes `post.id` and `post.title`.
- Ordered by `createdAt desc`.
- Returns `400` for invalid author ID.

#### `PATCH /comments/:id`

- Protected route (`USER` or `ADMIN`).
- Updates comment content.
- Body:

```json
{
  "content": "Updated comment text"
}
```

Validation/error behavior:
- `400` Invalid comment ID
- `400` Content is required
- `401` Unauthorized
- `403` Forbidden (not owner)
- `404` Comment not found

#### `DELETE /comments/:id`

- Protected route (`USER` or `ADMIN`).
- Only comment owner can delete.

Validation/error behavior:
- `400` Invalid comment ID
- `401` Unauthorized
- `403` Forbidden (not owner)
- `404` Comment not found

## Seed Scripts

### `seed:admin`

Creates admin user by calling:
- `POST http://localhost:3000/api/auth/sign-up/email`

Important:
- Server should be running before this script.
- Requires `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### `seed:posts`

- Creates 30 posts.
- Uses existing user IDs as authors when available.
- If no users exist, falls back to placeholder author IDs.

## Database

Schema is in `prisma/schema.prisma`.

Main models used now:
- `Post`
- `User`
- `Session`
- `Account`
- `Verification`
- `Comment`
