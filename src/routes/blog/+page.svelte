<script>
  // Replace these with real posts over time.
  // For a real blog, consider storing posts as markdown in src/lib/posts/
  // and using mdsvex (svelte markdown processor) to render them.
  const posts = [
    {
      slug: 'on-political-emotion',
      title: 'On Measuring Emotion in Political Text',
      date: 'February 2025',
      description:
        'What does it mean for a congressional email to be "angry"? Some thoughts on the limits and possibilities of lexicon-based vs. model-based emotion detection.',
      tags: ['NLP', 'Research'],
    },
    {
      slug: 'misinformation-compartmental',
      title: 'SIR Models and the Spread of Misinformation',
      date: 'January 2025',
      description:
        "Epidemiological compartmental models have a long history in mathematical biology. Here's what happens when you apply them to social contagion -- and where the analogy breaks down.",
      tags: ['Modeling', 'Networks'],
    },
    {
      slug: 'ai-course-catalogs',
      title: 'What Universities Think AI Is',
      date: 'December 2024',
      description:
        'Mining course catalog data across dozens of institutions revealed how differently universities define "AI" -- and how that definition has shifted over twenty years.',
      tags: ['Education', 'Research'],
    },
  ];

  /** @param {string} dateStr */
  function formatDate(dateStr) {
    return dateStr; // already formatted for now
  }
</script>

<svelte:head>
  <title>Michael Robinette - Writing</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Writing</h1>
    <p class="subtitle">
      Longer-form thoughts on research, computation, and whatever else I'm
      turning over. Updated irregularly.
    </p>
  </header>

  <div class="post-list">
    {#each posts as post}
      <article>
        <div class="post-meta">
          <time>{post.date}</time>
          <div class="tags">
            {#each post.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        </div>
        <!-- Link to /blog/[slug] once you add individual post pages -->
        <h2><a href="/blog/{post.slug}">{post.title}</a></h2>
        <p>{post.description}</p>
      </article>
    {/each}
  </div>

  <p class="note">
    Posts link to individual pages -- add those in
    <code>src/routes/blog/[slug]/+page.svelte</code> when you're ready,
    or use <a href="https://mdsvex.pngwn.io/" target="_blank" rel="noopener">mdsvex</a>
    for markdown-powered blog posts.
  </p>
</div>

<style>
  .page-header {
    margin-bottom: 3.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--rule);
  }

  .page-header h1 { margin-bottom: 0.75rem; }

  .subtitle {
    font-size: 1rem;
    color: var(--ink-muted);
    margin: 0;
  }

  .post-list {
    display: flex;
    flex-direction: column;
  }

  article {
    padding: 2rem 0;
    border-bottom: 1px solid var(--rule);
  }

  article:first-child { padding-top: 0; }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
    flex-wrap: wrap;
  }

  time {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink-muted);
  }

  .tags { display: flex; gap: 0.4rem; }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  h2 a {
    color: var(--ink);
    text-decoration: none;
    transition: color 0.15s;
  }

  h2 a:hover { color: var(--accent); }

  p {
    font-size: 0.95rem;
    color: var(--ink-muted);
    margin: 0;
    line-height: 1.7;
  }

  .note {
    margin-top: 3rem;
    font-size: 0.85rem;
    color: var(--ink-muted);
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 1rem 1.25rem;
  }
</style>
