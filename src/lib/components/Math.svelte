<script>
  import { onMount } from 'svelte';
  import katex from 'katex';

  export let math;
  export let display = false;

  let container;

  onMount(() => {
    katex.render(math, container, { displayMode: display, throwOnError: false });
  });
</script>

{#if display}
  <div bind:this={container} class="math-display"></div>
{:else}
  <span bind:this={container} class="math-inline"></span>
{/if}

<style>
  .math-display {
    overflow-x: auto;
    margin: 0.25rem 0;
  }
  .math-inline {
    display: inline;
  }
</style>