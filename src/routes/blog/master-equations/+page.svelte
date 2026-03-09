<script>
  import Math from '$lib/components/Math.svelte';
  
  const eq1 = String.raw`P_n(t) \in (0,1) \quad \forall n \in \mathcal{N}`;
  const eq2 = String.raw`\sum_{n \in \mathcal{N}} P_n(t) = 1 \quad \Longrightarrow \quad \sum_{n \in \mathcal{N}} \frac{d}{dt}P_n(t) = 0`;
</script>

<Math math={eq1} display />
<Math math={eq2} display />