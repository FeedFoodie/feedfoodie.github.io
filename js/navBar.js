(function() {
  function init() {
    // Only run on mobile
    if (window.innerWidth >= 601) return;

    let lastClickTime = 0;
    const COOLDOWN_MS = 200; // 0.2 seconds, guards against a click firing twice for one tap
    const SETTLE_MS = 400; // grace window after any layout shift before dropdown links respond to a tap

    // Use event delegation on the trigger container
    const trigger = document.querySelector('.trigger');
    if (!trigger) return;

    function guardAgainstShift() {
      // Opening or closing a dropdown changes the menu's height, which moves
      // every button/link below it. Briefly ignore taps on every dropdown's
      // links so a slow/long tap aimed at pre-shift content can't land on a
      // link that only just moved into that same spot.
      const dropdowns = document.querySelectorAll('.dropdown-content');
      dropdowns.forEach(function(el) { el.style.pointerEvents = 'none'; });
      window.setTimeout(function() {
        dropdowns.forEach(function(el) { el.style.pointerEvents = ''; });
      }, SETTLE_MS);
    }

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

      const dropdown = button.nextElementSibling;
      if (!dropdown || !dropdown.classList.contains('dropdown-content')) return;

      // Visibility is set via inline style rather than a CSS class, so it can
      // never be shadowed by a later, equal-specificity stylesheet rule (the
      // mobile-only ".dropdown-content{display:none}" override silently wins
      // ties by source order, which is what made the old .show-class toggle a
      // no-op here). This toggle only ever touches the dropdown that was
      // clicked — nothing here closes any OTHER dropdown, so opening Novels no
      // longer collapses Notifications; it just opens independently below it.
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';

      guardAgainstShift();
    }, true); // capturing phase
  }

  // This script is loaded from <head>, before the <nav>/.trigger markup
  // (included in <body>) exists in the DOM. Querying for it immediately
  // always returned null, so the click listener below was never actually
  // attached — every dropdown interaction was silently falling through to
  // the raw CSS :hover rule alone. Wait for the DOM to actually exist first.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
