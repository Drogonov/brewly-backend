# Docker Workflow

This document covers Docker Compose workflows and common Docker commands for Brewly Backend.

## 🚧 Prerequisites

* **Docker** & **Docker Compose** v2+
* Environment files:

  * `config/development.env`
  * `config/production.env`

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

### Docker Compose (Prod)

Build and run production containers in detached mode:

```bash
docker compose -f docker-compose-prod.yaml \
  --env-file ./config/production.env \
  up --build -d
```

Or via npm script:

```bash
npm run docker:compose-prod
```

* Host port `APP_PORT` (default: 8080) maps to the NestJS server port in the container (`SERVER_PORT`).
* Grafana UI is available on port 3000 by default.

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

* `.github/workflows/deploy.yml` automates production deployment:

  1. Checkout code
  2. SSH into VPS
  3. Run `docker compose -f docker-compose-prod.yaml --env-file $ENV_FILE_PATH up --build -d`

* `.github/workflows/publish-swagger.yml` generates and pushes `swagger.json` to the `brewly-swagger` repo on each `master` push.
* `docker compose -f docker-compose-prod.yaml --env-file ./config/production.env up --build -d`

---

## 📚 References

* [Docker Compose documentation](https://docs.docker.com/compose/)
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)