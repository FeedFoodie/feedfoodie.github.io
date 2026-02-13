
// Single source of truth for mobile dropdowns
document.addEventListener('DOMContentLoaded', function() {
  // Desktop hover already works via CSS – do nothing on desktop
  if (window.innerWidth >= 601) return;

  const trigger = document.querySelector('.trigger');
  if (!trigger) return;

  // Use event delegation on the menu container
  trigger.addEventListener('click', function(event) {
    const button = event.target.closest('.dropbtn');
    if (!button) return; // not a dropdown button

    // Stop the click from reaching any other listener
    event.stopPropagation();
    event.stopImmediatePropagation(); // kills ALL other handlers on this event

    // Prevent any default action (just in case)
    event.preventDefault();

    // Find the dropdown-content via the button's next sibling (ul)
    const dropdown = button.nextElementSibling;
    if (dropdown && dropdown.classList.contains('dropdown-content')) {
      dropdown.classList.toggle('show');
    }
  }, true); // Use capturing phase to fire before anything else
});