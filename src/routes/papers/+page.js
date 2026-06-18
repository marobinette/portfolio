// Public read: fetch the reading list from our own API. Runs on the server for
// the initial render and on the client for navigations.
export async function load({ fetch }) {
  const res = await fetch('/api/papers');
  const papers = res.ok ? await res.json() : [];
  return { papers };
}
