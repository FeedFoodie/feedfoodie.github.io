// In js/turnstile-loader.js

// This function is automatically called by the Turnstile widget
// after a successful verification.
function turnstileCallback(token) {
  // Find the elements on the page by their IDs
  const contentToShow = document.getElementById('content');
  const loadingMessage = document.getElementById('loading-message');

  if (contentToShow && loadingMessage) {
    // Hide the "Loading..." message
    loadingMessage.style.display = 'none';
    
    // Show the protected content by changing its display style
    contentToShow.style.display = 'block';
  }
}