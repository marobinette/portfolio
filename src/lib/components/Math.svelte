<script>
  import katex from 'katex';
  export let math;
  export let display = false;
</script>

{@html katex.renderToString(math, { displayMode: display, throwOnError: false })}