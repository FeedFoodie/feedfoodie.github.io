function navbarDropdown(id, event) {
  // Desktop: do nothing – hover handles it
  if (window.innerWidth >= 601) {
    return;
  }

  // Stop the click from bubbling up to any other listener
  if (event) {
    event.stopPropagation();
  }

  // Mobile: toggle ONLY the clicked dropdown
  var dropdown = document.getElementById(id);
  dropdown.classList.toggle("show");
}