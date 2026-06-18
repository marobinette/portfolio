import { json, error } from '@sveltejs/kit';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import { ddb, READING_LIST_TABLE } from '$lib/server/dynamo';
import { requireAdmin } from '$lib/server/auth';

const STATUSES = ['to-read', 'reading', 'read'];

// Fields a client is allowed to set. Everything else (id, addedAt) is
// server-controlled and ignored if present in the request body.
function sanitize(body) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    authors: typeof body.authors === 'string' ? body.authors.trim() : '',
    url: typeof body.url === 'string' ? body.url.trim() : '',
    venue: typeof body.venue === 'string' ? body.venue.trim() : '',
    year: body.year ? String(body.year).trim() : '',
    abstract: typeof body.abstract === 'string' ? body.abstract.trim() : '',
    status: STATUSES.includes(body.status) ? body.status : 'to-read',
    tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    notes: typeof body.notes === 'string' ? body.notes.trim() : '',
    rating: Number.isInteger(body.rating) ? body.rating : null,
  };
}

// GET /api/papers — public. Returns the full list, newest first.
// The dataset is tiny (a personal reading list), so a Scan is appropriate.
export async function GET() {
  const out = await ddb.send(new ScanCommand({ TableName: READING_LIST_TABLE }));
  const items = (out.Items ?? []).sort((a, b) => (a.id < b.id ? 1 : -1));
  return json(items);
}

// POST /api/papers — token-protected. Creates a paper.
export async function POST({ request }) {
  requireAdmin(request);

  const body = await request.json().catch(() => null);
  if (!body) throw error(400, 'Invalid JSON body.');

  const fields = sanitize(body);
  if (!fields.title) throw error(400, 'A title is required.');

  const item = {
    // ULIDs are time-sortable, so sorting by id descending = newest first.
    id: ulid(),
    addedAt: new Date().toISOString(),
    readAt: fields.status === 'read' ? new Date().toISOString() : null,
    ...fields,
  };

  await ddb.send(new PutCommand({ TableName: READING_LIST_TABLE, Item: item }));
  return json(item, { status: 201 });
}
