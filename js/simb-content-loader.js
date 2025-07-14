document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');
  const sourceFile = document.body.dataset.source;

  // --- ADD THESE TWO DEBUGGING LINES ---
  console.log("Content container found:", contentContainer);
  console.log("Source file found:", sourceFile);
  // ------------------------------------

  if (contentContainer) {
    if (sourceFile) {
      // Construct the path to the markdown file
      const filePath = `/SIMB/chapters/${sourceFile}`;

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