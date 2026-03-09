<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  const r = (tex, display=false) =>
    katex.renderToString(tex, { displayMode: display, throwOnError: false });

  // ── Display equations ────────────────────────────────────────────────────
  const eqNorm = r(String.raw`\sum_n P_n(t) = 1`, true);
  const eqNormDt = r(String.raw`\sum_n \frac{dP_n}{dt} = 0`, true);
  const eqGeneral = r(String.raw`\frac{dP_n}{dt}
    = \sum_m R(m \to n)\,P_m
    \;-\; \sum_m R(n \to m)\,P_n`, true);
  const eqVoterRates = r(String.raw`R(n \to n-1) = n\cdot\frac{N-n}{N}, \qquad
    R(n \to n+1) = (N-n)\cdot\frac{n}{N}`, true);
  const eqVoterFull = r(String.raw`\frac{dP_n}{dt}
    = -\frac{n(N-n)}{N}P_n
    - \frac{(N-n)n}{N}P_n
    + \frac{(n+1)(N-n-1)}{N}P_{n+1}
    + \frac{(N-n+1)(n-1)}{N}P_{n-1}`, true);
  const eqSISRates = r(String.raw`R(n \to n+1) = \beta(N-n)n, \qquad
    R(n \to n-1) = n\alpha`, true);
  const eqSISFull = r(String.raw`\frac{dP_n}{dt}
    = -n\alpha\, P_n
    - \beta(N-n)n\, P_n
    + (n+1)\alpha\, P_{n+1}
    + \beta(N-n+1)(n-1)\,P_{n-1}`, true);
  const eqSISBC = r(String.raw`P_{-1} = P_{N+1} = 0`, true);
  const eqMeanField = r(String.raw`\frac{dI}{dt} = \beta(N - I)I - \alpha I`, true);

  // ── Inline math ────────────────────────────────────────────────────────
  const i_Pn = r(String.raw`P_n(t)`);
  const i_n = r(String.raw`n`);
  const i_N = r(String.raw`N`);
  const i_beta = r(String.raw`\beta`);
  const i_alpha = r(String.raw`\alpha`);
  const i_betaNN = r(String.raw`\beta(N-n)n`);
  const i_nN = r(String.raw`n/N`);
  const i_nN1 = r(String.raw`n/(N-1)`);
  const i_R0 = r(String.raw`\mathcal{R}_0 = \beta/\alpha`);
  const i_nplusone = r(String.raw`n+1 \to n`);
  const i_nminusone = r(String.raw`n-1 \to n`);
  const i_Pnplus = r(String.raw`P_{n+1}`);
  const i_Pnminus = r(String.raw`P_{n-1}`);
  const i_Pn1 = r(String.raw`P_{n+1}`);
  const i_nzero = r(String.raw`n=0`);
  const i_NmI = r(String.raw`N-n`);
  const eqLit01 = r(String.raw`t`);
  const eqLit02 = r(String.raw`P_{n-1}`);
  const eqLit03 = r(String.raw`P_n`);
  const eqLit04 = r(String.raw`P_{n+1}`);
  const eqLit05 = r(String.raw`n`);
  const eqLit06 = r(String.raw`n-1`);
</script>

<svelte:head>
  <title>Master Equations — Michael Robinette</title>
  <meta name="description" content="Constructing approximate master equations for the Voter Model and SIS epidemic dynamics." />
</svelte:head>

<div class="container">

  <!-- ── Header ────────────────────────────────────────────────────────────── -->
  <header class="post-header">
    <div class="meta-row">
      <time class="date">March 2026</time>
      <div class="tags">
        <span class="tag">Modeling</span>
        <span class="tag">Math</span>
        <span class="tag">Stochastic Processes</span>
      </div>
    </div>
    <h1>Master Equations</h1>
    <p class="lead">
    Master equations will allow us to move beyond mean-field approach, which track the average behavior of a system. Instead, we will track the system's actual distribution over time.
    </p>
  </header>

  <hr />

  <!-- ── 1. What is P_n(t) ─────────────────────────────────────────────────── -->
  <section>
    <h2>1. What is {@html i_Pn}?</h2>
    <p>
      Let the system have {@html i_N} agents, each in one of two
      states. Define {@html i_Pn} as the probability that exactly
      {@html i_n} agents occupy the "active" state at time
      {@html eqLit01}. This is a full probability distribution — one
      number per possible value of {@html i_n} — rather than a
      single average.
    </p>
    <p>
      The distribution must satisfy normalization at all times:
    </p>
    <div class="eq-block">
      {@html eqNorm}
    </div>
    <p>
      Differentiating gives a consistency requirement that any valid
      master equation satisfies automatically:
    </p>
    <div class="eq-block">
      {@html eqNormDt}
    </div>
  </section>

  <hr />

  <!-- ── 2. Construction recipe ────────────────────────────────────────────── -->
  <section>
    <h2>2. The construction recipe</h2>
    <p>
      For birth-death chains — where {@html i_n} only changes by
      ±1 per event — writing down the master equation is mechanical.
    </p>

    <ol class="recipe">
      <li>
        <span class="step-num">01</span>
        <div>
          <strong>Draw the state chain.</strong>
          Boxes for {@html eqLit02}, {@html eqLit03},
          {@html eqLit04} connected by arrows in both directions.
        </div>
      </li>
      <li>
        <span class="step-num">02</span>
        <div>
          <strong>Label each arrow with a rate.</strong>
          Rate = (number of eligible initiators) ×
          (probability the event completes). The exact form differs
          between models depending on the interaction structure.
        </div>
      </li>
      <li>
        <span class="step-num">03</span>
        <div>
          <strong>Write the equation.</strong>
          Subtract outgoing arrows (loss, multiplied by
          {@html eqLit03}), add incoming arrows (gain, multiplied
          by the neighboring {@html i_Pnplus} or
          {@html i_Pnminus}).
        </div>
      </li>
      <li>
        <span class="step-num">04</span>
        <div>
          <strong>Relabel gain terms.</strong>
          The rate flowing into {@html eqLit03} from
          {@html i_Pn1} is the outgoing rate from
          {@html i_Pn1}, evaluated at {@html i_nplusone}.
          Similarly for {@html i_nminusone}.
        </div>
      </li>
    </ol>

    <p>In general notation:</p>
    <div class="eq-block highlight">
      {@html eqGeneral}
    </div>
  </section>

  <hr />

  <!-- ── 3. Voter model ────────────────────────────────────────────────────── -->
  <section>
    <h2>3. The Voter Model</h2>
    <p>
      {@html i_N} agents each hold one of two opinions: For (F) or
      Against (A). At each step, a randomly chosen agent copies a randomly
      chosen neighbor. Let {@html i_n} = number of F-agents.
    </p>
    <p>
      To move from {@html eqLit05} to {@html eqLit06}, an F-agent
      must be chosen and must select an A-neighbor. The rates are:
    </p>
    <div class="eq-block">
      {@html eqVoterRates}
    </div>
    <p>
      Both rates are symmetric in {@html i_n} and
      {@html i_NmI} — the dynamics treat F and A identically.
      The full AME:
    </p>
    <div class="eq-block highlight">
      {@html eqVoterFull}
    </div>

    <div class="callout">
      <strong>Why divide by {@html i_N}?</strong>
      The division converts a neighbor <em>count</em> into a
      <em>probability</em>. Out of all {@html i_N} possible
      neighbors, a fraction {@html i_nN} are A-type. This is
      the <em>approximate</em> in AME — the exact version uses
      {@html i_nN1} (excluding self), valid for large
      {@html i_N}.
    </div>
  </section>

  <hr />

  <!-- ── 4. SIS model ──────────────────────────────────────────────────────── -->
  <section>
    <h2>4. SIS Epidemic Dynamics</h2>
    <p>
      {@html i_N} agents are either Susceptible (S) or Infectious
      (I). Infection spreads at per-contact rate {@html i_beta};
      infected agents recover at rate {@html i_alpha}. Let
      {@html i_n} = number of infectious agents.
    </p>
    <p>
      The key structural difference from the Voter Model:
      {@html i_beta} already encodes the per-contact rate, so we
      count <em>all S–I pairs</em> directly (mass-action) rather than
      sampling one neighbor. There is no division by {@html i_N}.
      The rates are:
    </p>
    <div class="eq-block">
      {@html eqSISRates}
    </div>
    <p>
      The full AME, with boundary conditions:
      {@html eqSISBC}
    </p>
    <div class="eq-block highlight">
      {@html eqSISFull}
    </div>

    <div class="callout">
      <strong>Remember...</strong>
      {@html i_alpha} only ever appears in arrows that
increase {@html i_n} (more infections) and 
      {@html i_beta} only ever appears in arrows that
decrease {@html i_n} (more recoveries).



      Track which process moves the count in which direction and the
      relabeling follows mechanically.
    </div>
  </section>

  <!-- ── Footer nav ────────────────────────────────────────────────────────── -->
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

  .lead {
    font-size: 1.08rem;
    line-height: 1.85;
    font-weight: 400;
    color: var(--ink);
    margin-bottom: 0;
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

  /* Recipe list */
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