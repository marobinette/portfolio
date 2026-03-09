<script>
  const interests = [
    'Natural language processing',
    'Network analysis',
    'Computational social science',
    'Epidemiological modeling',
  ];
</script>

<svelte:head>
  <title>Michael Robinette - About</title>
</svelte:head>

<div class="container">
  <section class="bio">
    <div class="eyebrow">
      <span class="tag">Graduate Researcher</span>
      <span class="tag">University of Vermont</span>
    </div>

    <h1>Michael Robinette</h1>

    <p class="lead">
      I'm a graduate student at the University of Vermont working at the
      intersection of computational methods and social systems. My research
      draws on natural language processing, network analysis, and mathematical
      modeling to understand how information moves through complex human systems.
    </p>

    <p>
      Currently, I'm analyzing patterns in congressional communications using
      transformer-based models and tracking the evolution of AI education across
      university curricula. I'm also exploring dynamical models of misinformation
      spread, drawing on epidemiological frameworks like SIR and SIS systems.
    </p>
    <hr />

    <div class="interests">
      <h3>Research interests</h3>
      <ul>
        {#each interests as interest}
          <li>{interest}</li>
        {/each}
      </ul>
    </div>
  </section>

  <aside class="now">
    <h3>Now</h3>
    <ul class="now-list">
      <li>
        <span class="dot"></span>
        Emotion analysis in congressional email communications
      </li>
      <li>
        <span class="dot"></span>
        Semantic similarity for AI course identification across university catalogs
      </li>
      <li>
        <span class="dot"></span>
        Mathematical modeling of misinformation dynamics
      </li>
    </ul>

    <div class="affiliation">
      <a href="https://vermontcomplexsystems.org" target="_blank" rel="noopener">
        <img src="/vcsi-logo.png" alt="Vermont Complex Systems Institute" />
        <span>Vermont Complex Systems Institute</span>
      </a>
    </div>
  </aside>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 5rem;
    align-items: start;
  }

  .eyebrow {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  h1 {
    font-size: 2.75rem;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .lead {
    font-size: 1.1rem;
    line-height: 1.8;
    font-weight: 400;
    color: var(--ink);
    margin-bottom: 1.2em;
  }

  .interests h3 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    margin-bottom: 0.75rem;
  }

  .interests ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .interests li {
    font-size: 0.88rem;
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 3px;
    padding: 0.25em 0.75em;
  }

  /* Aside */
  aside {
    position: sticky;
    top: calc(var(--nav-h) + 2rem);
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 1.5rem;
  }

  aside h3 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    margin-bottom: 1rem;
  }

  .now-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .now-list li {
    display: flex;
    gap: 0.6rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--ink);
    align-items: flex-start;
  }

  .dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    margin-top: 0.5rem;
  }

  .affiliation {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--rule);
  }

  .affiliation a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    opacity: 0.75;
    transition: opacity 0.2s;
  }

  .affiliation a:hover { opacity: .8; }

  .affiliation img {
    width: 200px;
    height: 200px;
    object-fit: contain;
  }

  .affiliation span {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-muted);
    text-align: center;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 760px) {
    .container {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    aside {
      position: static;
    }

    h1 { font-size: 2rem; }
  }
</style>
