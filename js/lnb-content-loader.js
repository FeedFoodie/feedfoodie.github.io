// Wait for the page's HTML to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');

  // Check if the placeholder container exists on the page
  if (contentContainer) {
    // Find the markdown source file name from the front matter
    const sourceFile = document.body.dataset.source;

    if (sourceFile) {
      // Construct the path to the markdown file
      const filePath = `/LNB/chapters/${sourceFile}`;

      // Fetch the markdown file
      fetch(filePath)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text(); // Get the file content as text
        })
        .then(markdown => {
          // Convert markdown to HTML using the 'marked' library
          const htmlContent = marked.parse(markdown);
          // Inject the final HTML into the container
          contentContainer.innerHTML = htmlContent;
        })
        .catch(error => {
          console.error('Error fetching or parsing markdown:', error);
          contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
        });
    }
  }
});