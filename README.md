# Kikoba

Kikoba is a short-term savings platform built around demonstrated saving behavior rather than raw wealth. This repository contains the V1 scoring foundation.

## Architecture

`events -> allocation -> contribution status -> features -> score + confidence -> profile`

### Score

```
K = 1000 * (
  .25 consistency + .15 goalCompletion + .10 streak + .10 amountReliability +
  .10 timing + .10 recovery + .10 momentum + .05 commitmentLoad + .05 participationReliability
)
```

Every component is normalized to 0..1. The score is clamped to 0..1000.

### Confidence

Confidence is separate from the score so a user cannot gain a highly trusted score after a single deposit.

## Deposit allocation rules

1. Explicit deposits remain in the chosen goal.
2. Eligible commitments are limited to overdue/current commitments and up to 30 days ahead.
3. Recovery-eligible commitments are allocated first.
4. Then the oldest due date wins.
5. User priority breaks equal-due-date ties.
6. Partial contributions are allowed.
7. Excess remains unallocated and does not create unlimited future consistency credit.

## API preview endpoints

- `GET /health`
- `POST /v1/score/preview`
- `POST /v1/deposits/allocate-preview`

These preview endpoints are intentionally pure and deterministic. The next integration layer will persist deposits, allocations, contribution status transitions, score history, and daily jobs through Prisma/PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to PostgreSQL.
3. Run `npm install`.
4. Run `npm run prisma:generate`.
5. Run `npm run dev`.
6. Run `npm test`.

## V1 profile labels

- Consistent Builder
- Rapid Improver
- Stable Planner
- Recovery Specialist
- Emerging Saver
- Building Consistency
- Consider simplifying your commitments

The user-facing labels are deliberately supportive. Internal classification can remain more technical.
