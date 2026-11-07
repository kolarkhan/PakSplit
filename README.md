# PAK SPLIT

Pakistan-first group expense manager built as a monorepo with a TypeScript Node/Express API and a premium React Native mobile client.

## Workspace structure

```text
.
|-- mobile/
|   |-- App.tsx
|   |-- src/
|   |   |-- components/
|   |   |-- navigation/
|   |   |-- screens/
|   |   |-- services/
|   |   |-- store/
|   |   `-- theme/
|-- server/
|   |-- Dockerfile
|   `-- src/
|       |-- config/
|       |-- controllers/
|       |-- middleware/
|       |-- models/
|       |-- repositories/
|       |-- routes/
|       |-- services/
|       |-- tests/
|       `-- validators/
|-- docs/api/PakSplit.postman_collection.json
|-- docker-compose.yml
`-- .env.example
```

## Product highlights

- PKR-first expense splitting with equal, exact, percentage, and share-based calculations.
- Debt simplification for cleaner settlement recommendations.
- Manual settlement fields that fit Pakistani payment behavior: transaction reference, account title, phone number, and bank details.
- Future-ready provider abstraction for EasyPaisa, JazzCash, Raast, bank transfer, and cash.
- Offline queue scaffolding, sync badge UX, and AsyncStorage-backed token storage.
- English and Urdu translation structure with dark mode-ready design tokens.

## Backend architecture

- Express + TypeScript + Mongoose.
- Controller-service-repository layering.
- JWT auth with refresh tokens.
- Helmet, rate limiting, mongo sanitize, HPP, upload validation, centralized errors.
- Activity logs, notifications, reports, payment provider abstraction, and seed data placeholders.

## Mobile architecture

- Expo-managed React Native + TypeScript.
- Redux Toolkit + RTK Query.
- React Navigation with auth flow and app tabs.
- Reusable premium UI primitives: cards, buttons, stats, chips, empty states, offline banner, sync badge.
- Screen coverage for auth, groups, expenses, balances, settlements, reports, profile, and settings.

## Getting started

1. Copy `.env.example` to `.env` and fill real values.
2. Install dependencies with `npm install` at the repo root.
3. Start MongoDB with `docker compose up -d mongo`.
4. Run the backend with `npm run dev:server`.
5. Run the mobile app with `npm run dev:mobile`.

## Key API routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/groups`
- `POST /api/v1/expenses`
- `GET /api/v1/balances/group/:groupId/simplified`
- `POST /api/v1/settlements`
- `GET /api/v1/reports/monthly`

## Testing

- Backend unit and integration examples live in `server/src/tests`.
- Mobile component test example lives in `mobile/src/components/common/__tests__`.

## Notes

- Payment webhooks and FCM are intentionally scaffolded with production-friendly interfaces and TODO integration points.
- The mobile app currently uses Expo for faster startup while keeping the code React Native-first.
- For real production rollout, add CI dependency installation caching, secrets management, image assets, E2E tests, and live payment verification.
