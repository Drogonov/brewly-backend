# Docker Workflow

This document covers Docker Compose workflows and common Docker commands for Brewly Backend.

## 🚧 Prerequisites

* **Docker** & **Docker Compose** v2+
* Development environment file: `config/development.env`

---

## 🛠️ Development Workflow

### Docker Compose (Dev)

Start your application and a local Postgres instance:

```bash
# From project root
docker compose -f docker-compose-dev.yaml \
  --env-file ./config/development.env \
  up --build
```

Or using the npm script:

```bash
npm run docker:compose-dev
```

* The API will be available on host port defined by `APP_PORT` (default: 8080).
* Prisma Studio (if needed) will be on the port defined by `PRISMA_PORT` (default: 4466).
* pgAdmin UI will be on the port defined by `SERVER_PGADMIN_PORT` (default: 5050).

---

## 🚀 Production Workflow

Production Compose, PostgreSQL, migrations, nginx, TLS, Grafana, Loki, Promtail, and pgAdmin are
owned by the sibling `brewly-infrastructure` repository. This repository only retains
`Dockerfile-prod`, the application image contract used by that deployment.

See `../brewly-infrastructure/README.md` for snapshot and cutover commands.

### Build & Push Custom Image

1. **Build image** (for specific architecture if needed):

   ```bash
   # For amd64 on M1 Macs
   docker build --platform linux/amd64 \
     -f Dockerfile-prod \
     -t <your-registry>/brewly-backend:latest .
   ```

2. **Push to registry**:

   ```bash
   docker push <your-registry>/brewly-backend:latest
   ```

---

## ⚙️ GitHub Actions

`.github/workflows/publish-swagger.yml` generates and publishes `swagger.json`. Production
deployment automation belongs in `brewly-infrastructure`.

---

## 📚 References

* [Docker Compose documentation](https://docs.docker.com/compose/)
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
