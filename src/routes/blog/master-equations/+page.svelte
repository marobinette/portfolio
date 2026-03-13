<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  const r = (tex, display=false) =>
    katex.renderToString(tex, { displayMode: display, throwOnError: false });

  // ── Display equations ────────────────────────────────────────────────────
  const eqNorm       = r(String.raw`\sum_n P_n(t) = 1`, true);
  const eqNormDt     = r(String.raw`\sum_n \frac{dP_n}{dt} = 0`, true);
  const eqCurrent    = r(String.raw`\frac{d}{dt}P_n(t) = \sum_{m \neq n} J_{n \to m}(t) + J_{m \to n}(t)`, true);
  const eqGeneral    = r(String.raw`\frac{dP_n}{dt}
    = \sum_m R(m \to n)\,P_m
    \;-\; \sum_m R(n \to m)\,P_n`, true);

  const eqBDRates    = r(String.raw`J_{n \to n+1} = \mu, \qquad J_{n > 0 \to n-1} = n\nu`, true);
  const eqBDn0       = r(String.raw`\frac{d}{dt}P_0 = -\mu P_0 + \nu P_1`, true);
  const eqBDfull     = r(String.raw`\frac{d}{dt}P_n = -(\mu + n\nu)\,P_n + (n+1)\nu\,P_{n+1} + \mu\,P_{n-1} \qquad n > 0`, true);

  const eqVoterRates = r(String.raw`R(n \to n-1) = n\cdot\frac{N-n}{N}, \qquad
    R(n \to n+1) = (N-n)\cdot\frac{n}{N}`, true);
  const eqVoterFull  = r(String.raw`\frac{dP_n}{dt}
    = -\frac{n(N-n)}{N}P_n
    - \frac{(N-n)n}{N}P_n
    + \frac{(n+1)(N-n-1)}{N}P_{n+1}
    + \frac{(N-n+1)(n-1)}{N}P_{n-1}`, true);
  const eqSISRates   = r(String.raw`R(n \to n+1) = \beta(N-n)n, \qquad
    R(n \to n-1) = n\alpha`, true);
  const eqSISFull    = r(String.raw`\frac{dP_n}{dt}
    = -n\alpha\, P_n
    - \beta(N-n)n\, P_n
    + (n+1)\alpha\, P_{n+1}
    + \beta(N-n+1)(n-1)\,P_{n-1}`, true);
  const eqSISBC      = r(String.raw`P_{-1} = P_{N+1} = 0`, true);
  const eqMeanField  = r(String.raw`\frac{dI}{dt} = \beta(N - I)I - \alpha I`, true);

  // ── Inline math ─────────────────────────────────────────────────────────
  const i_Pn      = r(String.raw`P_n(t)`);
  const i_n       = r(String.raw`n`);
  const i_N       = r(String.raw`N`);
  const i_mu      = r(String.raw`\mu`);
  const i_nu      = r(String.raw`\nu`);
  const i_nnu     = r(String.raw`n\nu`);
  const i_beta    = r(String.raw`\beta`);
  const i_alpha   = r(String.raw`\alpha`);
  const i_R0      = r(String.raw`\mathcal{R}_0 = \beta/\alpha`);
  const i_nN      = r(String.raw`n/N`);
  const i_nN1     = r(String.raw`n/(N-1)`);
  const i_NmI     = r(String.raw`N-n`);
  const i_Pnplus  = r(String.raw`P_{n+1}`);
  const i_Pnminus = r(String.raw`P_{n-1}`);
  const i_Pn1     = r(String.raw`P_{n+1}`);
  const i_nplusone  = r(String.raw`n+1 \to n`);
  const i_nminusone = r(String.raw`n-1 \to n`);
  const i_nzero   = r(String.raw`n=0`);
  const eqLit01   = r(String.raw`t`);
  const eqLit02   = r(String.raw`P_{n-1}`);
  const eqLit03   = r(String.raw`P_n`);
  const eqLit04   = r(String.raw`P_{n+1}`);
  const eqLit05   = r(String.raw`n`);
  const eqLit06   = r(String.raw`n-1`);
  const i_P0      = r(String.raw`P_0`);
  const i_P1      = r(String.raw`P_1`);
  const i_Pnmin1  = r(String.raw`P_{-1}`);
</script>

<svelte:head>
  <title>Master Equations — Michael Robinette</title>
  <meta name="description" content="Constructing master equations from scratch: conservation, bookkeeping, birth-death process, Voter Model, and SIS epidemic dynamics." />
</svelte:head>

<div class="container">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <header class="post-header">
    <div class="meta-row">
      <time class="date">March 2026</time>
      <div class="tags">
        <span class="tag">Modeling</span>
        <span class="tag">Math</span>
        <span class="tag">Stochastic Processes</span>
      </div>
    </div>
    <h1>An Introduction to Master Equations</h1>
  </header>

    <p class="attribution">
    This post references material from 
    <a href="https://cosmo-notes.github.io/tame/" target="_blank" rel="noopener">TAME course materials</a> 
    by Laurent Hébert-Dufresne and Guillaume St-Onge.
    </p>
  <hr />

  <!-- ── 1. What is P_n(t) ──────────────────────────────────────────────── -->
  <section>
    <h2>1. What is {@html i_Pn}?</h2>
    <p>
      Consider a system whose condition can be summarized by a single
      integer {@html i_n} — the count of particles, infected agents,
      voters holding a given opinion, and so on. Define
      {@html i_Pn} as the probability that the system is in state
      {@html i_n} at time {@html eqLit01}.
    </p>
    <p>
      A useful mental image: imagine running infinitely many identical
      but independent copies of the system in parallel. At any moment,
      {@html i_Pn} is simply the fraction of those copies that find
      themselves in state {@html i_n}. We are not following a single
      trajectory — we are following the entire distribution of
      trajectories.
    </p>

    <div class="callout">
      <strong>Master equations vs. compartmental models</strong>
      Compartmental models (SIR, SIS, etc.) split the
      <em>parts</em> of a system into boxes. Master equations split a
      multiverse of <em>whole systems</em> into boxes. Compartmental
      models lose information about correlations between parts;
      master equations track the exact state of the system and so
      lose nothing — at the cost of requiring many more equations.
    </div>

    <p>
      To model any system with master equations, three questions
      must be answered before writing a single equation:
    </p>

    <ol class="recipe">
      <li>
        <span class="step-num">Q1</span>
        <div><strong>What are the available states?</strong>
          Define the full set of values {@html i_n} can take.</div>
      </li>
      <li>
        <span class="step-num">Q2</span>
        <div><strong>What transitions are possible?</strong>
          Which pairs of states are connected by an event?</div>
      </li>
      <li>
        <span class="step-num">Q3</span>
        <div><strong>At what rates do they occur?</strong>
          Assign a transition rate to every arrow.</div>
      </li>
    </ol>
  </section>

  <hr />

  <!-- ── 2. Conservation ────────────────────────────────────────────────── -->
  <section>
    <h2>2. Conservation of probability</h2>
    <p>
      The distribution {@html i_Pn} must satisfy normalization at
      every instant:
    </p>
    <div class="eq-block">
      {@html eqNorm}
    </div>
    <p>
      Because this holds for <em>all</em> time, the sum is a
      constant. The derivative of a constant is zero, so
      differentiating both sides gives:
    </p>
    <div class="eq-block">
      {@html eqNormDt}
    </div>
    <p>
      This is a powerful consistency check. In a master equation,
      every probability current {@html r(String.raw`J_{n \to m}`)}
      appears exactly twice across the full system — once as a loss
      from state {@html i_n}, and once as a gain to state
      {@html i_n}. The two contributions cancel in the sum, so the
      constraint is satisfied automatically by any correctly written
      master equation.
    </p>

    <div class="callout">
      <strong>Practical use</strong>
      If you sum all your master equations and the result is not
      zero, you have a missing transition somewhere — probability
      is leaking out of (or flooding into) your state space. This
      sum-to-zero check is the first thing to run when debugging a
      new model.
    </div>
  </section>

  <hr />

  <!-- ── 3. Bookkeeping ────────────────────────────────────────────────── -->
  <section>
    <h2>3. The bookkeeping principle</h2>
    <p>
      The master equation for state {@html i_n} is built entirely
      from probability currents in and out of that state:
    </p>
    <div class="eq-block highlight">
      {@html eqCurrent}
    </div>
    <p>
      In practice this reduces to a simple rule that applies to
      every state in every model:
    </p>

    <ol class="recipe">
      <li>
        <span class="step-num">01</span>
        <div>
          <strong>Leaving {@html eqLit03} in any direction → loss.</strong>
          Subtract the transition rate multiplied by
          {@html eqLit03}.
        </div>
      </li>
      <li>
        <span class="step-num">02</span>
        <div>
          <strong>Entering {@html eqLit03} from any direction → gain.</strong>
          Add the transition rate (evaluated at the originating
          state) multiplied by the neighboring
          {@html i_Pnplus} or {@html i_Pnminus}.
        </div>
      </li>
      <li>
        <span class="step-num">03</span>
        <div>
          <strong>Respect boundaries.</strong>
          If a neighboring state does not exist (e.g.,
          {@html i_Pnmin1} when {@html i_nzero}), that term
          simply drops out. The boundary is enforced by the
          physics, not by adding extra rules.
        </div>
      </li>
    </ol>

    <p>In general notation:</p>
    <div class="eq-block highlight">
      {@html eqGeneral}
    </div>
  </section>

  <hr />

  <!-- ── 4. Birth-death process ─────────────────────────────────────────── -->
  <section>
    <h2>4. Worked example: Birth-death process</h2>
    <p>
      Particles are created at a constant rate {@html i_mu} from a
      reservoir and each existing particle disappears independently
      at rate {@html i_nu}. This is the simplest non-trivial system
      that exhibits both boundaries and state-dependent rates, making
      it an ideal first example.
    </p>

    <p><strong>Answering the three questions:</strong></p>
    <table>
      <thead>
        <tr><th>Question</th><th>Answer</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>States</td>
          <td>{@html r(String.raw`n \in \{0, 1, 2, \ldots\}`)}</td>
        </tr>
        <tr>
          <td>Transitions</td>
          <td>
            {@html r(String.raw`n \to n+1`)} (birth),&nbsp;
            {@html r(String.raw`n \to n-1`)} (death, only if {@html r(String.raw`n > 0`)})
          </td>
        </tr>
        <tr>
          <td>Rates</td>
          <td>
            Birth: {@html i_mu} (constant, from reservoir).
            Death: {@html i_nnu} (each of the {@html i_n} particles
            dies at rate {@html i_nu}).
          </td>
        </tr>
      </tbody>
    </table>

    <p>
      The death rate {@html i_nnu} deserves a moment's attention.
      Each particle dies independently, so with {@html i_n} particles
      present there are {@html i_n} independent chances for a death
      event. The total rate is {@html i_nu} summed {@html i_n} times.
      Birth, by contrast, comes from an external reservoir rather than
      from the particles themselves, so its rate is a flat
      {@html i_mu} regardless of {@html i_n}.
    </p>

    <div class="eq-block">
      {@html eqBDRates}
    </div>

    <p>
      Applying the bookkeeping principle to each state gives two
      cases. When {@html i_nzero} the state below does not exist
      — there are no particles to kill — so the
      {@html r(String.raw`\mu P_{n-1}`)} gain term has nothing to
      attach to and drops out entirely:
    </p>
    <div class="eq-block">
      {@html eqBDn0}
    </div>
    <p>
      Read term by term: {@html r(String.raw`-\mu P_0`)} is the
      loss from a birth event pushing the system up to state 1;
      {@html r(String.raw`+\nu P_1`)} is the gain from the system
      being at state 1 and its single particle dying. The
      {@html i_P1} term is a gain to state 0 — it originates
      elsewhere and arrives here. For all {@html r(String.raw`n > 0`)}:
    </p>
    <div class="eq-block highlight">
      {@html eqBDfull}
    </div>

    <div class="callout">
      <strong>The boundary enforces itself.</strong>
      Notice the death rate {@html i_nnu} naturally becomes zero
      at {@html i_nzero}, so no special case would even be
      needed for that term. The separate {@html i_nzero} equation
      is only necessary because the
      {@html r(String.raw`\mu P_{n-1}`)} gain term references a
      state that does not exist, not because the death terms
      misbehave.
    </div>
  </section>

  <hr />

  <!-- ── 5. Voter model ────────────────────────────────────────────────── -->
  <section>
    <h2>5. Example: The Voter Model</h2>
    <p>
      {@html i_N} agents each hold one of two opinions: For (F) or
      Against (A). At each step, a randomly chosen agent copies a
      randomly chosen neighbor. Let {@html i_n} = number of F-agents.
    </p>
    <p>
      To move from {@html eqLit05} to {@html eqLit06}, an F-agent
      must be chosen <em>and</em> select an A-neighbor. The rates are:
    </p>
    <div class="eq-block">
      {@html eqVoterRates}
    </div>
    <p>
      Both rates are symmetric in {@html i_n} and {@html i_NmI} —
      the dynamics treat F and A identically. The full master equation:
    </p>
    <div class="eq-block highlight">
      {@html eqVoterFull}
    </div>

    <div class="callout">
      <strong>Why divide by {@html i_N}?</strong>
      The division converts a neighbor <em>count</em> into a
      <em>probability</em>. Out of all {@html i_N} possible
      neighbors, a fraction {@html i_nN} are A-type. This is the
      <em>approximate</em> in AME — the exact version uses
      {@html i_nN1} (excluding self), valid for large {@html i_N}.
    </div>
  </section>

  <hr />

  <!-- ── 6. SIS model ──────────────────────────────────────────────────── -->
  <section>
    <h2>6. Example: SIS Epidemic Dynamics</h2>
    <p>
      {@html i_N} agents are either Susceptible (S) or Infectious (I).
      Infection spreads at per-contact rate {@html i_beta}; infected
      agents recover at rate {@html i_alpha}. Let {@html i_n} =
      number of infectious agents. The system is bounded:
      {@html i_nzero} is a valid absorbing state (extinction) and
      {@html i_n} cannot exceed {@html i_N}.
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
      Applying the bookkeeping principle with boundary conditions
      {@html eqSISBC}:
    </p>
    <div class="eq-block highlight">
      {@html eqSISFull}
    </div>

    <div class="callout">
      <strong>Keep the directions straight.</strong>
      Infection (rate {@html i_beta}) increases {@html i_n} —
      it appears in transitions that move the system
      <em>up</em>. Recovery (rate {@html i_alpha}) decreases
      {@html i_n} — it appears in transitions that move the
      system <em>down</em>. Track which process moves the count
      in which direction and the relabeling follows mechanically.
    </div>

    <p>
      The mean-field limit recovers the familiar ODE by replacing
      the full distribution with its average:
    </p>
    <div class="eq-block">
      {@html eqMeanField}
    </div>
    <p>
      The threshold {@html i_R0} separates extinction from endemic
      persistence — a result the master equation approach can derive
      more rigorously by examining the absorbing boundary at
      {@html r(String.raw`n = 0`)}.
    </p>
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
