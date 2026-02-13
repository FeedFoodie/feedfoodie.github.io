// Mobile dropdowns toggle on mousedown
document.addEventListener('DOMContentLoaded', function() {
  // Desktop: do nothing (hover works via CSS)
  if (window.innerWidth >= 601) return;

  const trigger = document.querySelector('.trigger');
  if (!trigger) return;

  // Use mousedown, not click, to avoid moving‑target problem
  trigger.addEventListener('mousedown', function(event) {
    const button = event.target.closest('.dropbtn');
    if (!button) return;

    // Stop all other handlers and prevent click from firing
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault(); // crucial – suppresses the subsequent click event

    // Toggle the dropdown
    const dropdown = button.nextElementSibling;
    if (dropdown && dropdown.classList.contains('dropdown-content')) {
      dropdown.classList.toggle('show');
    }
  }, true); // capturing phase – fires before anything else
});