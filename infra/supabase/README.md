# Supabase Configuration

This directory will contain Supabase-related configuration when object storage is integrated.

## Planned Usage

- **Supabase Storage** — Store uploaded images with private bucket access
- Backend manages all storage access via service role key
- Mobile never accesses Supabase directly

## Setup

1. Create a Supabase project
2. Create a private storage bucket (e.g., `rewind-media`)
3. Configure environment variables in `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`

## Security

- Service role key is a **secret** — never expose in mobile app or commit to Git
- Storage bucket must be **private** — access only through backend API
- See `docs/architecture/SYSTEM_ARCHITECTURE.md` for data flow details
