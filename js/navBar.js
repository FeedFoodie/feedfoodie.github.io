function navbarDropdown(id) {
  // Desktop: do nothing – hover handles it
  if (window.innerWidth >= 601) {
    return;
  }
  // Mobile: toggle only the clicked dropdown, leave others as they are
  var dropdown = document.getElementById(id);
  dropdown.classList.toggle("show");
}