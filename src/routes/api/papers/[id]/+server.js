import { json, error } from '@sveltejs/kit';
import { GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, READING_LIST_TABLE } from '$lib/server/dynamo';
import { requireAdmin } from '$lib/server/auth';

const STATUSES = ['to-read', 'reading', 'read'];

// Only these fields can be changed via an update; id/addedAt are immutable.
const EDITABLE = ['title', 'authors', 'url', 'venue', 'year', 'abstract', 'status', 'tags', 'notes', 'rating'];

// PUT /api/papers/:id — token-protected. Merges the provided fields into the
// existing item (read-modify-write; fine for a tiny single-user dataset).
export async function PUT({ params, request }) {
  requireAdmin(request);

  const body = await request.json().catch(() => null);
  if (!body) throw error(400, 'Invalid JSON body.');

  const existing = await ddb.send(
    new GetCommand({ TableName: READING_LIST_TABLE, Key: { id: params.id } })
  );
  if (!existing.Item) throw error(404, 'Paper not found.');

  const updated = { ...existing.Item };
  for (const key of EDITABLE) {
    if (key in body) updated[key] = body[key];
  }
  if (!STATUSES.includes(updated.status)) updated.status = 'to-read';

  // Stamp readAt the first time a paper transitions into "read".
  if (updated.status === 'read' && !existing.Item.readAt) {
    updated.readAt = new Date().toISOString();
  }
  if (updated.status !== 'read') updated.readAt = null;

  await ddb.send(new PutCommand({ TableName: READING_LIST_TABLE, Item: updated }));
  return json(updated);
}

// DELETE /api/papers/:id — token-protected.
export async function DELETE({ params, request }) {
  requireAdmin(request);
  await ddb.send(
    new DeleteCommand({ TableName: READING_LIST_TABLE, Key: { id: params.id } })
  );
  return new Response(null, { status: 204 });
}
