(function() {
  // Only run on mobile
  if (window.innerWidth >= 601) return;

  let lastClickTime = 0;
  const COOLDOWN_MS = 200; // 0.2 seconds

  // Use event delegation on the trigger container
  const trigger = document.querySelector('.trigger');
  if (!trigger) return;

  trigger.addEventListener('click', function(event) {
    const button = event.target.closest('.dropbtn');
    if (!button) return;

    // Cooldown check
    const now = Date.now();
    if (now - lastClickTime < COOLDOWN_MS) {
      event.stopPropagation();
      event.preventDefault();
      return; // Ignore this click
    }
    lastClickTime = now;

    // Stop other handlers
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();

    // Toggle the dropdown
    const dropdown = button.nextElementSibling;
    if (dropdown && dropdown.classList.contains('dropdown-content')) {
      dropdown.classList.toggle('show');
    }
  }, true); // capturing phase
})();