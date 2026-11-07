# Rewind — Local Development Infrastructure

This directory contains Docker Compose configuration for local development.

## Services (Planned)

- **PostgreSQL** — Primary database
- **pgAdmin** (optional) — Database management UI

## Usage

```bash
# Start local services (when docker-compose.yml is created)
docker compose up -d

# Stop local services
docker compose down
```

## Notes

- The backend application Dockerfile is at `apps/backend/Dockerfile`
- Database migrations are managed by Flyway at `apps/backend/src/main/resources/db/migration/`
- Copy `.env.example` to `.env` and configure database credentials before starting
