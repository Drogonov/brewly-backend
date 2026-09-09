# Brewly Backend

> NestJS API for coffee cupping management, integrated with a mobile client and mock server.

---

[![Build Status](https://github.com/Drogonov/brewly-backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/Drogonov/brewly-backend/actions)
[![Coverage Status](https://img.shields.io/codecov/c/github/Drogonov/brewly-backend)](https://codecov.io/gh/Drogonov/brewly-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🔗 Project Ecosystem

This project is one part of the **Brewly** ecosystem:

- **📦 brewly-backend** — RESTful API built with NestJS, Postgres, Swagger, and monitoring tools (you are here)
- **📱 [brewly-ios](https://github.com/Drogonov/brewly-ios)** — Swift mobile app for cupping workflow and user management for guys who hate paper with coffee stains
- **🧪 [brewly-swagger](https://github.com/Drogonov/brewly-swagger)** — Auto-updated Swagger JSON repository for mocks/testing and **mockoon.json** generation

---

## ⚙️ Features

- Authentication with JWT (access + refresh tokens)
- Localization (i18n) support (EN + RU)
- Prisma ORM with modular services
- Custom DTOs, validation pipes, and decorators
- Logging and monitoring stack: Loki, Promtail, Grafana
- Docker-based prod/dev environments
- Auto Swagger publish via GitHub Actions

---

## 📐 Architecture Overview

```
                  +-------------------+
                  |   brewly-ios      |
                  +--------+----------+
                           |
                  HTTP API |
                           v
                  +--------+----------+
                  |   brewly-backend  |
                  |  (NestJS + Prisma)|
                  +--------+----------+
                           |
                  DB Query |
                           v
                  +--------+----------+
                  |    PostgreSQL     |
                  +-------------------+

Side Channels:
brewly-backend
      |
      |-- Logs --> Promtail --> Loki --> Grafana (UI)
      |
      |-- DB Management --> PG Admin (UI)
      |
      |-- GitHub Action --> brewly-swagger (Swagger JSON repo)
```

---

---

## 🚀 Prerequisites

- **Node.js** v16+
- **Docker** & **Docker Compose** v2+
- **Git**
- (Optional) **PostgreSQL** if running locally outside Docker

## 🔑 Environment Variables

check out the example file to check all project variables
```
config/example.env
```

## 🔨 Getting Started

1. Clone the repo:
   ```bash
   git clone git@github.com:Drogonov/brewly-backend.git
   cd brewly-backend
   ```
2. Copy & edit environment variables:
   ```bash
   cp config/example.env config/development.env
   nano config/development.env
   ```
3. Install dependencies (for local development):
   ```bash
   npm install
   ```
4. Start with Docker:
   ```bash
   npm run docker:compose-dev
   ```
5. Or start locally (requires a running Postgres instance):
   ```bash
   npm run start:dev
   ```

> For Docker-specific build & push instructions, see [README.Docker.md](README.Docker.md).

---

## 🧪 Local Development

### Prisma Migrations: Dev to Prod Workflow

During development, you push your changes directly to a local or Docker DB using `db push`, but **always** generate a migration with `migrate dev` once the schema is stable. These migrations are committed and then deployed via `migrate deploy` in production.

> This keeps your dev flow fast, but makes your production predictable and safe.

### Environment Files Summary

| File                | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `config/development.env`   | Used when running app and DB via Docker            |
| `config/prisma-studio.env` | Used for Prisma scripts to a **local DB** only |
| `config/production.env`    | Used for production deployment                     |

> ⚠️ Important: When working locally outside Docker, make sure to set `DB_HOST=localhost` in `prisma-studio.env` to avoid connection issues.

### Summary Table

| Use Case                    | Command                             | Env File            | Notes                                          |
| --------------------------- | ----------------------------------- | ------------------- | ---------------------------------------------- |
| Dev with Docker             | `npm run docker:compose-dev`        | `development.env`   | App + DB inside Docker                         |
| Dev local (app only)        | `npm run start:dev`                 | `development.env`   | DB must be running separately (Docker/local)   |
| Generate Prisma (Docker DB) | `npm run prisma:generate-dev`       | `development.env`   | Run this after editing schema                  |
| Generate Prisma (Local DB)  | `npm run prisma:generate-dev-local` | `prisma-studio.env` | Use when DB is local, not Docker               |
| Push DB schema (Docker)     | `npm run prisma:db-push-dev`        | `development.env`   | Pushes schema to Docker-based DB               |
| Push DB schema (Local)      | `npm run prisma:db-push-dev-local`  | `prisma-studio.env` | Sync schema to local Postgres                  |
| Create Migration            | `npm run prisma:migrate-dev`        | `development.env`   | Creates migration files from current schema    |
| Open Prisma Studio (Local)  | `npm run prisma:studio-dev`         | `prisma-studio.env` | Browses local/docker DB schema                 |

> 💡 **Note**: Before launching anything in Docker, make sure the `app` service is not commented out in `docker-compose-dev.yaml`.

### Dev Setup Scenarios

#### 1. Local VSCode + Local Prisma

```
npm run prisma:generate-dev-local
npm run prisma:db-push-dev-local
npm run prisma:migrate-dev  # optional, generates actual migration files
npm run start:dev
```

#### 2. Local VSCode + Docker Prisma

```
npm run docker:compose-dev  # make sure DB is up in Docker
npm run prisma:migrate-dev
npm run start:dev
```

#### 3. All in Docker

```
npm run docker:compose-dev  # includes app and DB
```

> Check docker-compose-dev.yaml for `app` service — it may be commented out.

---

## 🧪 Testing & Quality

- **Unit tests:** `npm test`
- **E2E tests:** `npm run test:e2e`
- **Coverage report:** `npm run test:cov`
- **Lint & format:** `npm run lint` / `npm run format`

---

## 📜 API Documentation

Swagger UI is available once the server is running at:

```
http://localhost:${SERVER_PORT}/api
```

## 🚀 Production Deployment

Production deployment is owned by the sibling `brewly-infrastructure` repository. It contains
host provisioning, Compose, database snapshot/cutover, Prisma migration execution, nginx, TLS,
and monitoring. `Dockerfile-prod` remains here because it is the backend image contract.

See `../brewly-infrastructure/README.md` for operational commands.

## 📊 Monitoring

Grafana, Loki, Promtail, datasource provisioning, retention, and their persistent volumes are
managed by `brewly-infrastructure`.

---

## 🧼 Swagger and Mock Generation

On every `master` push:

- `publish-swagger.yml` generates Swagger JSON
- JSON is committed to [brewly-swagger](https://github.com/Drogonov/brewly-swagger)

Use it with tools like Mockoon.

---

## 📝 Contributing

Contributions, issues, and feature requests are welcome! Please open a GitHub issue or submit a pull request.

---

## 📄 License

[brewly-backend](https://github.com/Drogonov/brewly-backend) is created by [Anton Vlezko](https://github.com/Drogonov) and released under a [MIT License](LICENSE).
