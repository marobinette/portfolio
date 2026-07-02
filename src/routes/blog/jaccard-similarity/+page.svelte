<script>
  import katex from 'katex';

  const r = (tex, display=false) =>
    katex.renderToString(tex, { displayMode: display, throwOnError: false });

  // ── Display equations ────────────────────────────────────────────────────
  const eqJaccard = r(String.raw`J = \frac{|\text{Dem} \cap \text{Rep}|}{|\text{Dem} \cup \text{Rep}|}
    = \frac{\text{words in both lists}}{\text{total distinct words across both lists}}`, true);
  const eqResult  = r(String.raw`J = \frac{2}{18} = 0.11`, true);

  // ── Inline math ─────────────────────────────────────────────────────────
  const i_J    = r(String.raw`J`);
  const i_k    = r(String.raw`k=10`);
  const i_J1   = r(String.raw`J = 1.0`);
  const i_J0   = r(String.raw`J = 0.0`);
  const i_J011 = r(String.raw`0.11`);
  const i_ladder = r(String.raw`\tfrac{0}{20},\ \tfrac{1}{19},\ \tfrac{2}{18},\ \tfrac{3}{17},\ \ldots,\ \tfrac{10}{10}`);
  const i_approx = r(String.raw`\approx 0,\ 0.05,\ 0.11,\ 0.18,\ \ldots,\ 1.0`);
</script>

<svelte:head>
  <title>Jaccard Similarity — Michael Robinette</title>
  <meta name="description" content="A simple worked example of Jaccard similarity: measuring how much two top-k nearest-neighbor word lists overlap." />
</svelte:head>

<div class="container">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <header class="post-header">
    <div class="meta-row">
      <time class="date">July 2026</time>
      <div class="tags">
        <span class="tag">NLP</span>
      </div>
    </div>
    <h1>Jaccard Similarity — A Simple Example</h1>
  </header>

  <hr />

  <!-- ── Setup ──────────────────────────────────────────────────────────── -->
  <section>
    <p>
      For a given term (say <em>fraud</em>) in a given year, you have two
      separately-trained Word2Vec models — one on Democrat emails, one on
      Republican emails. From each you pull the top-10 nearest-neighbor
      words to <em>fraud</em>. Jaccard asks: how much do those two neighbor
      lists overlap?
    </p>
    <p>
      Notice the similarity scores are thrown away — only the words matter
      ({@html r(String.raw`w`)} for {@html r(String.raw`w, s`)} in ...). It's
      purely set membership: is a word in both top-10 lists or not.
    </p>

    <div class="eq-block highlight">
      {@html eqJaccard}
    </div>
  </section>

  <hr />

  <!-- ── Simple example ─────────────────────────────────────────────────── -->
  <section>
    <h2>Simple example</h2>
    <p>
      Say for <em>fraud</em> in 2020, with {@html i_k}:
    </p>

    <table>
      <thead>
        <tr><th>Party</th><th>Top-10 neighbors of <em>fraud</em></th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Democrat</td>
          <td>voter, suppression, myth, baseless, claims, debunked, false, gop, lie, disinformation</td>
        </tr>
        <tr>
          <td>Republican</td>
          <td>voter, ballot, illegal, dead, mail, cheating, stolen, rigged, machines, claims</td>
        </tr>
      </tbody>
    </table>

    <p>Now compare the sets:</p>

    <ol class="recipe">
      <li>
        <span class="step-num">∩</span>
        <div>
          <strong>Intersection (in both)</strong>
          voter, claims → 2 words
        </div>
      </li>
      <li>
        <span class="step-num">∪</span>
        <div>
          <strong>Union (in either, counted once)</strong>
          the 10 Dem + 10 Rep minus the 2 shared = 18 words
        </div>
      </li>
    </ol>

    <div class="eq-block highlight">
      {@html eqResult}
    </div>
  </section>

  <hr />

  <!-- ── How to read it ─────────────────────────────────────────────────── -->
  <section>
    <h2>How to read it</h2>

    <ol class="recipe">
      <li>
        <span class="step-num">1.0</span>
        <div>
          <strong>{@html i_J1} → identical neighbor lists.</strong>
          Both parties surround the word with the same associations →
          convergence / shared meaning.
        </div>
      </li>
      <li>
        <span class="step-num">0.0</span>
        <div>
          <strong>{@html i_J0} → zero shared neighbors.</strong>
          The parties embed the word in completely different contexts →
          maximum divergence / polarization.
        </div>
      </li>
      <li>
        <span class="step-num">0.11</span>
        <div>
          <strong>The example's {@html i_J011}</strong>
          says Dem and Rep talk about "fraud" in largely different terms —
          Democrats frame it around debunking/suppression, Republicans around
          mechanisms of alleged cheating.
        </div>
      </li>
    </ol>

    <div class="callout">
      <strong>A discrete ladder</strong>
      Since both lists always have 10 words, the union ranges from 10
      (identical) to 20 (nothing shared), so with {@html i_k} the possible
      Jaccard values are a discrete ladder:
      {@html i_ladder} {@html i_approx}. That's why the low values on your
      plot cluster around 0–0.18 rather than varying continuously.
    </div>
  </section>

  <!-- ── Footer nav ───────────────────────────────────────────────────── -->
  <div class="post-footer">
    <a href="/blog" class="back-link">← All posts</a>
  </div>

</div>

<style>
  .container {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .post-header { margin-bottom: 2.5rem; }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  .date {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink-muted);
  }

  .tags { display: flex; gap: 0.4rem; }

  h1 {
    font-size: 2.4rem;
    letter-spacing: -0.02em;
    margin-bottom: 1.25rem;
    line-height: 1.15;
  }

  section { margin: 2.5rem 0; }

  h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    letter-spacing: -0.01em;
  }

  p {
    margin-bottom: 1.2em;
    line-height: 1.8;
    font-size: 0.97rem;
  }
  p:last-child { margin-bottom: 0; }

  /* Equation blocks */
  .eq-block {
    margin: 1.6rem 0;
    padding: 1.25rem 1.5rem;
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 4px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .eq-block.highlight {
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 5%, var(--bg-alt));
  }

  /* Recipe / question lists */
  .recipe {
    list-style: none;
    padding: 0;
    margin: 1.25rem 0;
    border: 1px solid var(--rule);
    border-radius: 4px;
    overflow: hidden;
  }

  .recipe li {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--rule);
    font-size: 0.93rem;
    line-height: 1.7;
  }

  .recipe li:last-child { border-bottom: none; }

  .step-num {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--accent);
    flex-shrink: 0;
    padding-top: 0.25rem;
    letter-spacing: 0.05em;
  }

  .recipe strong {
    display: block;
    margin-bottom: 0.2rem;
    font-family: var(--font-display);
    font-size: 0.95rem;
  }

  /* Callout */
  .callout {
    margin: 1.4rem 0 0;
    padding: 1rem 1.25rem;
    background: var(--bg-alt);
    border-left: 3px solid var(--accent);
    border-radius: 0 4px 4px 0;
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--ink);
  }

  .callout strong {
    display: block;
    margin-bottom: 0.3rem;
    font-family: var(--font-display);
  }

  /* Comparison table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.88rem;
  }

  th, td {
    text-align: left;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--rule);
    line-height: 1.5;
  }

  th {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ink-muted);
    background: var(--bg-alt);
    font-weight: 500;
  }

  td:first-child {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--ink-muted);
    white-space: nowrap;
  }

  tr:nth-child(even) td { background: var(--bg-alt); }

  /* Footer */
  .post-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--rule);
  }

  .back-link {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--ink-muted);
    text-decoration: none;
    letter-spacing: 0.04em;
    transition: color 0.15s;
  }

  .back-link:hover { color: var(--accent); }

  @media (max-width: 560px) {
    h1 { font-size: 1.85rem; }
    .eq-block { padding: 1rem; }
    table { font-size: 0.82rem; }
    td:first-child { white-space: normal; }
  }
</style>
