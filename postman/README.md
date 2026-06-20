# Postman — Reading List API

Importable Postman collection + environments for the `/api/papers` endpoints.

## Files

- `reading-list.postman_collection.json` — the four requests (List, Create, Update, Delete)
- `reading-list.local.postman_environment.json` — points `baseUrl` at `http://localhost:5173`
- `reading-list.production.postman_environment.json` — points `baseUrl` at your Vercel URL

## Import

In Postman: **Import** → drag in this folder (or select the JSON files). That
loads the collection and both environments.

## Set up

1. Pick an environment (top-right dropdown): **Local** or **Production**.
2. In the environment, set:
   - `adminToken` — the `ADMIN_TOKEN` value from your `.env` (local) or Vercel (production)
   - `baseUrl` — already filled; for Production, replace `your-domain.vercel.app` with your real URL
   - `paperId` — set when you want to Update or Delete a specific paper
3. Run **List papers** first to see ids; copy one into `paperId` for Update/Delete.

## Notes

- **Auth:** List is public. Create/Update/Delete send `Authorization: Bearer {{adminToken}}`.
- **Create:** only `title` is required. The server sets `id`, `addedAt`, `readAt`.
- **Update:** partial — send only the fields you want to change.
- **Secrets:** `adminToken` is marked as a secret variable. Don't commit a real
  token into these files — fill it into the environment inside Postman instead.
