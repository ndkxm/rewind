# Deployment Configuration

This directory will contain deployment configuration when the application is ready for staging/production.

## Planned Deployment

Deployment strategy is an **open decision** — not yet determined.

### Considerations

- Backend: Containerized deployment (Docker)
- Database: Managed PostgreSQL
- Storage: Supabase Storage (managed)
- CI/CD: GitHub Actions → deployment target

### Prerequisites Before Deployment

1. Authentication strategy decided and implemented
2. Database schema finalized
3. Security review completed
4. Android App Bundle built and signed
5. Google Play Console account set up

See `docs/implementation/ROADMAP.md` for release readiness milestones.
