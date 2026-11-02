const GUIDE_TOPICS = new Set(["all", "plan", "capture", "edit", "deliver"]);

function normalizeGuideText(value = "") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function matchesGuide({ query = "", topic = "all", searchText = "", topics = "" }) {
  const normalizedQuery = normalizeGuideText(query);
  const normalizedSearchText = normalizeGuideText(searchText);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const topicList = topics.split(/\s+/).filter(Boolean);
  const matchesTopic = topic === "all" || topicList.includes(topic);
  const matchesQuery = queryTokens.every((token) => normalizedSearchText.includes(token));

  return matchesTopic && matchesQuery;
}

function initializeGuideCatalog() {
  const controls = document.querySelector(".guide-controls");
  const searchForm = document.querySelector(".guide-search");
  const searchInput = document.querySelector("#guide-search-input");
  const clearButton = document.querySelector(".guide-clear");
  const filterButtons = [...document.querySelectorAll("[data-topic]")];
  const cards = [...document.querySelectorAll("[data-guide]")];
  const resultCount = document.querySelector(".guide-result-count");
  const emptyState = document.querySelector(".guide-empty");
  const emptyTitle = document.querySelector(".guide-empty-title");
  const resetButton = document.querySelector(".guide-reset");

  if (!controls || !searchForm || !searchInput || !clearButton || !resultCount || !emptyState || !emptyTitle || !resetButton || cards.length === 0) {
    return;
  }

  let selectedTopic = "all";

  function readStateFromURL() {
    const parameters = new URLSearchParams(window.location.search);
    const requestedTopic = parameters.get("topic") ?? "all";
    selectedTopic = GUIDE_TOPICS.has(requestedTopic) ? requestedTopic : "all";
    searchInput.value = parameters.get("q") ?? "";
  }

  function writeStateToURL() {
    const url = new URL(window.location.href);
    const query = searchInput.value.trim();

    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");

    if (selectedTopic === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", selectedTopic);

    window.history.replaceState(null, "", url);
  }

  function updateCatalog({ updateURL = true } = {}) {
    const query = searchInput.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const visible = matchesGuide({
        query,
        topic: selectedTopic,
        searchText: `${card.textContent} ${card.dataset.search ?? ""}`,
        topics: card.dataset.topics
      });

      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.topic === selectedTopic));
    });

    clearButton.hidden = normalizeGuideText(query) === "";
    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "guide" : "guides"}`;
    emptyState.hidden = visibleCount !== 0;
    emptyTitle.textContent = normalizeGuideText(query)
      ? `No guides match “${query.trim()}”.`
      : "No guides match this stage.";

    if (updateURL) writeStateToURL();
  }

  searchForm.addEventListener("submit", (event) => event.preventDefault());
  searchInput.addEventListener("input", () => updateCatalog());
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    updateCatalog();
    searchInput.focus();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedTopic = button.dataset.topic;
      updateCatalog();
    });
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    selectedTopic = "all";
    updateCatalog();
  });

  window.addEventListener("popstate", () => {
    readStateFromURL();
    updateCatalog({ updateURL: false });
  });

  readStateFromURL();
  controls.hidden = false;
  updateCatalog({ updateURL: false });
}

if (typeof document !== "undefined") {
  initializeGuideCatalog();
}

globalThis.GuideCatalog = { GUIDE_TOPICS, matchesGuide, normalizeGuideText };
