# Kikoba

Kikoba is a behavioral savings application built around demonstrated saving habits rather than raw wealth.

## Current MVP

The application now includes a runnable web dashboard and API for:

- account creation
- savings goal creation
- weekly/monthly contribution schedules
- deposits and auto-allocation
- contribution progress
- Kikoba Score and confidence
- saver profiles
- goal dashboard
- friendships
- conversations and messages
- chamas and membership

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The current MVP uses an in-memory application store so the complete user flow can run immediately. The Prisma/PostgreSQL schema remains the production persistence target and should be connected before deployment.

## Core scoring architecture

`events -> allocation -> contribution status -> features -> score + confidence -> profile`

The score is calculated from consistency, goal completion, streaks, amount reliability, timing, recovery, momentum, commitment load, and participation reliability.

## Main API

- `POST /v1/auth/register`
- `GET /v1/users/:userId/dashboard`
- `POST /v1/goals`
- `GET /v1/users/:userId/goals`
- `POST /v1/deposits`
- `GET /v1/users/:userId/score`
- `POST /v1/friends`
- `GET /v1/users/:userId/friends`
- `POST /v1/conversations`
- `POST /v1/conversations/:id/messages`
- `GET /v1/conversations/:id/messages`
- `POST /v1/chamas`
- `POST /v1/chamas/:id/members`
- `GET /v1/chamas/:id`

## Production work remaining

Before handling real money or sensitive financial data, replace the in-memory store with Prisma/PostgreSQL transactions, add real authentication and authorization, connect a licensed payment provider, add idempotency/reversal handling, background jobs, rate limiting, monitoring, encryption, backups, and security review.
