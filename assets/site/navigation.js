for (const menu of document.querySelectorAll("[data-site-menu]")) {
  menu.addEventListener("click", event => {
    if (event.target.closest("a")) menu.open = false;
  });
  menu.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !menu.open) return;
    menu.open = false;
    menu.querySelector("summary").focus();
  });
}
