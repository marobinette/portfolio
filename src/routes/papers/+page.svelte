<script>
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';

  export let data;
  $: papers = data.papers ?? [];

  // ── Status display config ────────────────────────────────────────────────
  const SECTIONS = [
    { key: 'reading', label: 'Reading' },
    { key: 'to-read', label: 'To read' },
    { key: 'read', label: 'Read' },
  ];
  const STATUS_LABEL = { 'to-read': 'To read', reading: 'Reading', read: 'Read' };

  // ── Author filter ────────────────────────────────────────────────────────
  // Authors are stored as a free-text string ("Jane Doe, John Smith, …").
  // Split each into individual names so a paper matches whatever position the
  // author appears in (first, second, third…).
  const splitAuthors = (s) =>
    (s ?? '')
      .split(/[,;]|\band\b/i)
      .map((a) => a.trim())
      .filter(Boolean);

  let authorFilter = '';

  $: authorOptions = [...new Set(papers.flatMap((p) => splitAuthors(p.authors)))].sort(
    (a, b) => a.localeCompare(b)
  );

  $: visiblePapers = authorFilter
    ? papers.filter((p) => splitAuthors(p.authors).includes(authorFilter))
    : papers;

  $: grouped = SECTIONS.map((s) => ({
    ...s,
    items: visiblePapers.filter((p) => p.status === s.key),
  }));

  // ── Admin token (held client-side, sent as Bearer on writes) ─────────────
  let token = '';
  let showTokenInput = false;
  $: isAdmin = token.length > 0;

  onMount(() => {
    token = localStorage.getItem('reading_list_token') ?? '';
  });

  function saveToken() {
    localStorage.setItem('reading_list_token', token);
    showTokenInput = false;
  }
  function clearToken() {
    token = '';
    localStorage.removeItem('reading_list_token');
  }

  // ── Add / edit form ──────────────────────────────────────────────────────
  const blank = () => ({
    title: '', authors: '', url: '', venue: '', year: '', abstract: '',
    status: 'to-read', tags: '', notes: '', rating: '',
  });
  let form = blank();
  let editingId = null;
  let showForm = false;
  let busy = false;
  let errorMsg = '';

  function startAdd() {
    form = blank();
    editingId = null;
    showForm = true;
    errorMsg = '';
  }
  function startEdit(p) {
    form = {
      title: p.title ?? '', authors: p.authors ?? '', url: p.url ?? '',
      venue: p.venue ?? '', year: p.year ?? '', abstract: p.abstract ?? '',
      status: p.status ?? 'to-read',
      tags: (p.tags ?? []).join(', '), notes: p.notes ?? '',
      rating: p.rating ?? '',
    };
    editingId = p.id;
    showForm = true;
    errorMsg = '';
  }
  function cancelForm() {
    showForm = false;
    editingId = null;
    errorMsg = '';
  }

  function payload() {
    return {
      title: form.title,
      authors: form.authors,
      url: form.url,
      venue: form.venue,
      year: form.year,
      abstract: form.abstract,
      status: form.status,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: form.notes,
      rating: form.rating === '' ? null : Number(form.rating),
    };
  }

  async function api(path, method, body) {
    const res = await fetch(path, {
      method,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `${res.status} ${res.statusText}`);
    }
    return res.status === 204 ? null : res.json();
  }

  async function submit() {
    if (!form.title.trim()) {
      errorMsg = 'A title is required.';
      return;
    }
    busy = true;
    errorMsg = '';
    try {
      if (editingId) {
        await api(`/api/papers/${editingId}`, 'PUT', payload());
      } else {
        await api('/api/papers', 'POST', payload());
      }
      await invalidateAll();
      showForm = false;
      editingId = null;
    } catch (e) {
      errorMsg = e.message;
    } finally {
      busy = false;
    }
  }

  async function setStatus(p, status) {
    busy = true;
    try {
      await api(`/api/papers/${p.id}`, 'PUT', { status });
      await invalidateAll();
    } catch (e) {
      errorMsg = e.message;
    } finally {
      busy = false;
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    busy = true;
    try {
      await api(`/api/papers/${p.id}`, 'DELETE');
      await invalidateAll();
    } catch (e) {
      errorMsg = e.message;
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>Michael Robinette — Reading list</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Reading list</h1>
    <p class="subtitle">Papers I'm reading, mean to read, or have finished.</p>
  </header>

  {#if errorMsg}
    <p class="error">{errorMsg}</p>
  {/if}

  {#if showForm}
    <form class="paper-form" on:submit|preventDefault={submit}>
      <h2>{editingId ? 'Edit paper' : 'Add paper'}</h2>
      <label>Title<input bind:value={form.title} required /></label>
      <div class="row">
        <label>Authors<input bind:value={form.authors} /></label>
        <label>Year<input bind:value={form.year} /></label>
      </div>
      <label>URL<input bind:value={form.url} type="url" placeholder="https://…" /></label>
      <label>Abstract<textarea bind:value={form.abstract} rows="4"></textarea></label>
      <div class="row">
        <label>Venue<input bind:value={form.venue} /></label>
        <label>
          Status
          <select bind:value={form.status}>
            <option value="to-read">To read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>
        </label>
        <label>Rating<input bind:value={form.rating} type="number" min="1" max="5" /></label>
      </div>
      <label>Tags (comma-separated)<input bind:value={form.tags} placeholder="NLP, networks" /></label>
      <label>Notes<textarea bind:value={form.notes} rows="3"></textarea></label>
      <div class="form-actions">
        <button class="btn primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add paper'}
        </button>
        <button class="btn ghost" type="button" on:click={cancelForm}>Cancel</button>
      </div>
    </form>
  {/if}

  {#if authorOptions.length}
    <div class="filter-bar">
      <label class="filter-label" for="author-filter">Filter by author</label>
      <select id="author-filter" bind:value={authorFilter}>
        <option value="">All authors</option>
        {#each authorOptions as a}
          <option value={a}>{a}</option>
        {/each}
      </select>
      {#if authorFilter}
        <button class="btn ghost" type="button" on:click={() => (authorFilter = '')}>Clear</button>
        <span class="filter-count">{visiblePapers.length} paper{visiblePapers.length === 1 ? '' : 's'}</span>
      {/if}
    </div>
  {/if}

  {#each grouped as section}
    {#if section.items.length}
      <section class="status-group">
        <h2>{section.label} <span class="count">{section.items.length}</span></h2>
        {#each section.items as p (p.id)}
          <article class="paper">
            <div class="paper-main">
              <h3>{p.title}</h3>
              {#if p.url}
                <p class="paper-link">
                  <a href={p.url} target="_blank" rel="noopener">{p.url}</a>
                </p>
              {/if}
              {#if p.abstract}
                <details class="abstract">
                  <summary>Abstract</summary>
                  <p>{p.abstract}</p>
                </details>
              {/if}
              {#if p.authors || p.venue || p.year}
                <p class="byline">
                  {[p.authors, p.venue, p.year].filter(Boolean).join(' · ')}
                </p>
              {/if}
              {#if p.tags?.length}
                <div class="tags">
                  {#each p.tags as t}<span class="tag">{t}</span>{/each}
                </div>
              {/if}
              {#if p.notes}<p class="notes">{p.notes}</p>{/if}
              {#if p.rating}<p class="rating">{'★'.repeat(p.rating)}{'☆'.repeat(5 - p.rating)}</p>{/if}
            </div>

            {#if isAdmin}
              <div class="paper-actions">
                <select
                  value={p.status}
                  on:change={(e) => setStatus(p, e.currentTarget.value)}
                  disabled={busy}
                  title="Change status"
                >
                  <option value="to-read">To read</option>
                  <option value="reading">Reading</option>
                  <option value="read">Read</option>
                </select>
                <button class="icon-btn" on:click={() => startEdit(p)} title="Edit">Edit</button>
                <button class="icon-btn danger" on:click={() => remove(p)} title="Delete">Delete</button>
              </div>
            {/if}
          </article>
        {/each}
      </section>
    {/if}
  {/each}

  {#if !papers.length}
    <p class="empty">No papers yet.{isAdmin ? ' Add your first one above.' : ''}</p>
  {:else if !visiblePapers.length}
    <p class="empty">No papers by {authorFilter}.</p>
  {/if}
</div>

<style>
  .page-header {
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--rule);
  }
  .page-header h1 { margin-bottom: 0.75rem; }
  .subtitle { font-size: 1rem; color: var(--ink-muted); margin: 0 0 1.25rem; }

  .admin-bar { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }

  .btn {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    padding: 0.4em 0.9em;
    border-radius: 3px;
    border: 1px solid var(--rule);
    background: var(--bg-alt);
    color: var(--ink);
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .btn.primary:hover { background: var(--accent-lt); border-color: var(--accent-lt); }
  .btn.ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn:disabled { opacity: 0.5; cursor: default; }

  .token-input, .paper-form input, .paper-form select, .paper-form textarea {
    font-family: var(--font-body);
    font-size: 0.9rem;
    padding: 0.45em 0.65em;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--bg);
    color: var(--ink);
    width: 100%;
  }
  .token-input { width: auto; }
  .paper-form input:focus, .paper-form select:focus, .paper-form textarea:focus,
  .token-input:focus { outline: none; border-color: var(--accent); }

  .error {
    background: #fbeaea;
    border: 1px solid #e0b4b4;
    color: #8a2a2a;
    padding: 0.6rem 0.9rem;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }

  .paper-form {
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .paper-form h2 { font-size: 1.15rem; margin-bottom: 0.25rem; }
  .paper-form label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ink-muted);
  }
  .paper-form .row { display: flex; gap: 0.85rem; }
  .paper-form .row label { flex: 1; }
  .form-actions { display: flex; gap: 0.6rem; margin-top: 0.5rem; }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
  }
  .filter-label {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ink-muted);
  }
  .filter-bar select {
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.35em 0.6em;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--bg);
    color: var(--ink);
    max-width: 18rem;
  }
  .filter-bar select:focus { outline: none; border-color: var(--accent); }
  .filter-count {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--ink-muted);
  }

  .status-group { margin-bottom: 2.75rem; }
  .status-group h2 {
    font-size: 0.78rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .count {
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0 0.5em;
    font-size: 0.7rem;
  }

  .paper {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem 0;
    border-bottom: 1px solid var(--rule);
  }
  .paper-main { flex: 1; min-width: 0; }
  .paper h3 { font-size: 1.05rem; margin-bottom: 0.3rem; }
  .paper-link {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    word-break: break-all;
  }
  .paper-link a { color: var(--accent); }
  .byline { font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 0.5rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem; }
  .abstract { margin-bottom: 0.5rem; }
  .abstract summary {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ink-muted);
    cursor: pointer;
  }
  .abstract summary:hover { color: var(--accent); }
  .abstract p {
    font-size: 0.88rem;
    color: var(--ink);
    line-height: 1.65;
    margin: 0.5rem 0 0;
  }
  .notes { font-size: 0.9rem; color: var(--ink); margin-bottom: 0.4rem; line-height: 1.6; }
  .rating { font-size: 0.95rem; color: var(--accent); margin: 0; letter-spacing: 0.1em; }

  .paper-actions {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .paper-actions select {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    padding: 0.25em 0.4em;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--bg);
    color: var(--ink);
  }
  .icon-btn {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    background: none;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0.1em 0.2em;
  }
  .icon-btn:hover { color: var(--accent); }
  .icon-btn.danger:hover { color: #8a2a2a; }

  .empty { color: var(--ink-muted); font-style: italic; }

  @media (max-width: 560px) {
    .paper { flex-direction: column; gap: 0.75rem; }
    .paper-actions { flex-direction: row; align-items: center; }
    .paper-form .row { flex-direction: column; }
  }
</style>
