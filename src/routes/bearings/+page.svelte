<script>
  import katex from 'katex';
  import { bearings } from '$lib/bearings.js';

  const r = (tex) => katex.renderToString(tex, { displayMode: true, throwOnError: false });

  const entries = [...bearings].sort((a, b) => a.term.localeCompare(b.term));

  const allTags = [...new Set(entries.flatMap((e) => e.tags))].sort((a, b) =>
    a.localeCompare(b)
  );

  let query = '';
  let activeTag = '';

  // Search across the term, its aliases, the definitions and the tags, so
  // looking up a half-remembered phrase still lands on the right entry.
  const haystack = (e) =>
    [e.term, e.aka ?? '', e.short, e.spoken, ...(e.body ?? []), ...e.tags]
      .join(' ')
      .toLowerCase();

  $: q = query.trim().toLowerCase();
  $: visible = entries.filter(
    (e) => (!activeTag || e.tags.includes(activeTag)) && (!q || haystack(e).includes(q))
  );

  /** Jump to a related term by searching for it. */
  function lookUp(term) {
    query = term;
    activeTag = '';
  }

  function reset() {
    query = '';
    activeTag = '';
  }
</script>

<svelte:head>
  <title>Michael Robinette — Bearings</title>
  <meta
    name="description"
    content="Definitions and short writings — an attempt to get my bearings in science and be able to talk about it out loud."
  />
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Bearings</h1>
    <p class="subtitle">
      These words are like stars in the night sky. Eventually, I hope to lookup and know exactly where I am, how I got there, and how to get home.
    </p>
  </header>

  <div class="controls">
    <input
      type="search"
      bind:value={query}
      placeholder="Search terms, definitions, tags…"
      aria-label="Search entries"
    />
    <div class="tag-filter" role="group" aria-label="Filter by tag">
      {#each allTags as t}
        <button
          type="button"
          class="tag-btn"
          class:active={activeTag === t}
          on:click={() => (activeTag = activeTag === t ? '' : t)}
          aria-pressed={activeTag === t}
        >
          {t}
        </button>
      {/each}
    </div>
    <p class="count">
      {visible.length} of {entries.length}
      {#if q || activeTag}
        <button type="button" class="link-btn" on:click={reset}>clear</button>
      {/if}
    </p>
  </div>

  <div class="entries">
    {#each visible as e (e.term)}
      <article id={e.term.toLowerCase().replace(/\s+/g, '-')}>
        <div class="entry-head">
          <h2>{e.term}</h2>
          <div class="tags">
            {#each e.tags as t}<span class="tag">{t}</span>{/each}
          </div>
        </div>

        {#if e.aka}
          <p class="aka">also: {e.aka}</p>
        {/if}

        <p class="short">{e.short}</p>

        {#if e.math}
          <div class="eq">{@html r(e.math)}</div>
        {/if}

        <p class="spoken">
          <span class="spoken-label">Out loud</span>
          {e.spoken}
        </p>

        {#if e.body?.length}
          <details>
            <summary>More</summary>
            <div class="body">
              {#each e.body as para}<p>{para}</p>{/each}
            </div>
          </details>
        {/if}

        {#if e.related?.length || e.source}
          <p class="footnote">
            {#if e.related?.length}
              <span class="footnote-label">See also</span>
              {#each e.related as rel, i}
                <button type="button" class="link-btn" on:click={() => lookUp(rel)}>{rel}</button
                >{#if i < e.related.length - 1}<span class="sep">·</span>{/if}
              {/each}
            {/if}
            {#if e.source}
              <a class="source" href={e.source.url}>{e.source.label} →</a>
            {/if}
          </p>
        {/if}
      </article>
    {/each}
  </div>

  {#if !visible.length}
    <p class="empty">Nothing matches that yet.</p>
  {/if}
</div>

<style>
  .page-header {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--rule);
  }
  .page-header h1 { margin-bottom: 0.75rem; }
  .subtitle { font-size: 1rem; color: var(--ink-muted); margin: 0; }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-bottom: 3rem;
  }

  input[type='search'] {
    font-family: var(--font-body);
    font-size: 0.95rem;
    padding: 0.5em 0.75em;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--bg);
    color: var(--ink);
    width: 100%;
  }
  input[type='search']:focus { outline: none; border-color: var(--accent); }

  .tag-filter { display: flex; flex-wrap: wrap; gap: 0.4rem; }

  .tag-btn {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 3px;
    padding: 0.2em 0.6em;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tag-btn:hover { color: var(--accent); border-color: var(--accent); }
  .tag-btn.active {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
  }

  .count {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--ink-muted);
    margin: 0;
  }

  .link-btn {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .link-btn:hover { color: var(--accent-lt); }

  .entries { display: flex; flex-direction: column; }

  article {
    padding: 2rem 0;
    border-bottom: 1px solid var(--rule);
    scroll-margin-top: calc(var(--nav-h) + 1rem);
  }
  article:first-child { padding-top: 0; }

  .entry-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.2rem;
  }
  .entry-head h2 { font-size: 1.25rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }

  .aka {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--ink-muted);
    margin-bottom: 0.6rem;
  }

  .short { font-size: 1rem; margin-bottom: 0.9rem; }

  .eq {
    overflow-x: auto;
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.9rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .spoken {
    font-size: 0.95rem;
    color: var(--ink);
    border-left: 2px solid var(--accent);
    padding-left: 0.9rem;
    margin-bottom: 0.9rem;
    line-height: 1.7;
  }
  .spoken-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    margin-bottom: 0.15rem;
  }

  details { margin-bottom: 0.9rem; }
  summary {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ink-muted);
    cursor: pointer;
  }
  summary:hover { color: var(--accent); }
  .body { margin-top: 0.75rem; }
  .body p {
    font-size: 0.93rem;
    color: var(--ink-muted);
    line-height: 1.75;
    margin-bottom: 0.9em;
  }
  .body p:last-child { margin-bottom: 0; }

  .footnote {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--ink-muted);
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }
  .footnote-label {
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .footnote .link-btn, .footnote .source { font-size: 0.72rem; }
  .sep { color: var(--rule); }
  .source { margin-left: auto; }

  .empty { color: var(--ink-muted); font-style: italic; }

  @media (max-width: 560px) {
    .entry-head { flex-direction: column; gap: 0.35rem; }
    .source { margin-left: 0; }
  }
</style>
