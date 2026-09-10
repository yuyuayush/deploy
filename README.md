# Professional Node.js Backend Starter

A clean, production-grade Node.js backend boilerplate built with **TypeScript**, **Express**, **Zod**, **Pino**, **Helmet**, **Vitest**, and **Docker**.

## 🌟 Key Features

- **TypeScript Strict Mode**: Fully typed request parameters, responses, and domain models.
- **Layered Architecture**: Clean separation of concerns (Routes ➔ Controllers ➔ Services ➔ Schemas ➔ Middlewares).
- **Environment Schema Validation**: Type-safe runtime validation of `.env` variables via `Zod`. Fail-fast on startup.
- **Security Hardened**: Pre-configured with `Helmet` security headers, `CORS`, and `express-rate-limit`.
- **Structured Logging**: High-performance JSON logging using `Pino` with pretty-printing in development.
- **Centralized Error Handling**: Custom `ApiError` class, Zod error auto-formatting, 404 handler, and standard error JSON responses.
- **Standardized API Response**: Consistent response envelope `{ success, message, data, errors }`.
- **Graceful Shutdown**: Intercepts `SIGINT` / `SIGTERM` signals and unhandled exceptions to close connections cleanly.
- **Automated Testing**: Integration tests powered by `Vitest` and `Supertest`.
- **Docker Ready**: Optimized multi-stage Docker build for small runtime image size and non-root security execution.

---

## 📁 Directory Structure

```
.
├── src/
│   ├── app.ts                  # Express application setup & middleware configuration
│   ├── server.ts               # HTTP server entrypoint & graceful shutdown handlers
│   ├── config/
│   │   └── env.ts              # Zod environment variable validation
│   ├── constants/
│   │   └── http-status.ts      # Standard HTTP status code constants
│   ├── middlewares/
│   │   ├── error.middleware.ts # Centralized error handler & 404 handler
│   │   ├── logger.middleware.ts# HTTP request logger via pino-http
│   │   ├── rate-limiter.ts     # Express rate limit middleware
│   │   └── validate.middleware.ts # Zod request validation middleware
│   ├── modules/
│   │   ├── health/             # Health check domain module
│   │   │   ├── health.controller.ts
│   │   │   └── health.router.ts
│   │   └── users/              # Example domain module (Users CRUD)
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.router.ts
│   │       ├── user.schema.ts
│   │       └── user.types.ts
│   └── utils/
│       ├── api-error.ts        # Custom operational error class
│       ├── api-response.ts     # Standardized JSON response helper
│       └── logger.ts           # Pino logger configuration
├── tests/                      # Vitest unit & integration tests
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x (Tested on v22.x)
- npm >= 9.x

### Installation

1. Clone the repository and navigate into the folder:
   ```bash
   cd deploy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   ```bash
   cp .env.example .env
   ```

---

## 📜 NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reloading using `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build from `dist/server.js` |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint check |
| `npm run format` | Format code using Prettier |

---

## 📡 API Endpoints Summary

### Health Check

- **GET** `/health` or `/api/v1/health`
  - Returns server status, uptime, and environment.

### Users Module (Example CRUD)

- **GET** `/api/v1/users` - Retrieve all users.
- **GET** `/api/v1/users/:id` - Retrieve user by UUID (validated).
- **POST** `/api/v1/users` - Create new user (validated body).
  - Payload: `{ "name": "John Doe", "email": "john@example.com", "role": "user" }`
- **PATCH** `/api/v1/users/:id` - Update user details.
- **DELETE** `/api/v1/users/:id` - Delete user.

---

## 🐳 Docker Support

Build and run using Docker:

```bash
# Build Docker image
docker build -t node-backend-professional .

# Run Docker container
docker run -p 3000:3000 node-backend-professional
```

---

## 🛡️ License

ISC
