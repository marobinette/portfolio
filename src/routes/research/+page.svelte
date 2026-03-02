<script>
  const projects = [
    {
      title: 'Emotion Analysis in Congressional Communications',
      year: '2024-present',
      tags: ['NLP', 'BERT', 'Politics'],
      description:
        'Analyzing emotional framing and rhetorical strategies in thousands of congressional email communications using transformer-based models and custom political lexicons. Collaborating with João Franco, Jeremy Elliott, and Atticus Tarleton.',
      status: 'active',
    },
    {
      title: 'AI Course Identification Across University Curricula',
      year: '2024-present',
      tags: ['Semantic Similarity', 'TF-IDF', 'Education'],
      description:
        'Mining course catalog data from multiple institutions to track the historical evolution of AI education. Uses semantic similarity and PostgreSQL pipelines to identify and classify AI-adjacent courses across decades.',
      status: 'active',
    },
    {
      title: 'Mathematical Modeling of Misinformation Dynamics',
      year: '2024',
      tags: ['SIR/SIS Models', 'Network Theory', 'Cellular Automata'],
      description:
        'Adapting epidemiological compartmental models to simulate how misinformation spreads through social networks. Explores parameter sensitivity, network topology, and intervention thresholds.',
      status: 'active',
    },
    {
      title: 'Campaign Finance Expenditure Visualization',
      year: '2024',
      tags: ['Data Viz', 'Python', 'Politics'],
      description:
        'Interactive visualizations of FEC campaign finance data to surface patterns in political spending across election cycles.',
      status: 'complete',
    },
  ];
</script>

<svelte:head>
  <title>Michael Robinette - Research</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Research</h1>
    <p class="subtitle">
      My work sits at the intersection of computational methods and social systems --
      using text, networks, and dynamical models to study how humans communicate and
      how information propagates.
    </p>
  </header>

  <div class="projects">
    {#each projects as project}
      <article class="project" class:active={project.status === 'active'}>
        <div class="project-meta">
          <span class="year">{project.year}</span>
          {#if project.status === 'active'}
            <span class="status">Ongoing</span>
          {/if}
        </div>
        <h2>{project.title}</h2>
        <div class="tags">
          {#each project.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
        <p>{project.description}</p>
      </article>
    {/each}
  </div>
</div>

<style>
  .page-header {
    margin-bottom: 3.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--rule);
  }

  .page-header h1 {
    margin-bottom: 0.75rem;
  }

  .subtitle {
    font-size: 1rem;
    color: var(--ink-muted);
    max-width: 540px;
    margin: 0;
  }

  .projects {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  article {
    padding: 2rem 0;
    border-bottom: 1px solid var(--rule);
    transition: background 0.2s;
  }

  article:first-child { padding-top: 0; }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .year {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink-muted);
  }

  .status {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 3px;
    padding: 0.15em 0.5em;
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 0.95rem;
    color: var(--ink-muted);
    line-height: 1.7;
    margin: 0;
  }
</style>
