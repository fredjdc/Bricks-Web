const slot = "<!-- site:analytics -->";
const measurementId = "G-0NE96SRV4V";
const bootstrap = `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", "${measurementId}");
</script>`;

export function renderAnalytics(source) {
  const first = source.indexOf(slot);
  if (first === -1) return source;
  if (source.indexOf(slot, first + slot.length) !== -1) {
    throw new Error("Expected a single site:analytics slot");
  }
  return source.replace(slot, bootstrap);
}
