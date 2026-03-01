<script>
  import '../app.css';
  import { page } from '$app/stores';

  const nav = [
    { href: '/',          label: 'About' },
    { href: '/research',  label: 'Research' },
    { href: '/blog',      label: 'Writing' },
  ];
</script>

<svelte:head>
  <title>Mikey</title>
</svelte:head>

<header>
  <nav class="container">
    <a href="/" class="wordmark">M.</a>
    <ul>
      {#each nav as { href, label }}
        <li>
          <a {href} class:active={$page.url.pathname === href}>{label}</a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<main class="page-enter">
  <slot />
</main>

<footer>
  <div class="container">
    <span>Mikey · UVM · {new Date().getFullYear()}</span>
    <span class="links">
      <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:you@uvm.edu">Email</a>
    </span>
  </div>
</footer>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    height: var(--nav-h);
    display: flex;
    align-items: center;
  }

  nav {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wordmark {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  ul {
    list-style: none;
    display: flex;
    gap: 2rem;
  }

  ul a {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--ink-muted);
    text-decoration: none;
    letter-spacing: 0.01em;
    transition: color 0.15s;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
  }

  ul a:hover,
  ul a.active {
    color: var(--ink);
    border-color: var(--accent);
  }

  main {
    min-height: calc(100vh - var(--nav-h) - 80px);
    padding: 4rem 0 5rem;
  }

  footer {
    border-top: 1px solid var(--rule);
    padding: 1.5rem 0;
  }

  footer .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.82rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
  }

  footer .links {
    display: flex;
    gap: 1.25rem;
  }

  footer a {
    color: var(--ink-muted);
    font-size: 0.82rem;
    text-decoration: none;
  }

  footer a:hover { color: var(--accent); }
</style>
