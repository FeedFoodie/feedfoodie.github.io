document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');
  const sourceFile = document.body.dataset.source;

  if (contentContainer && sourceFile) {
    // Construct the full path to the markdown file
    const filePath = `/ABSW/chapters/${sourceFile}`;

    // Fetch the markdown file from the server
    fetch(filePath)
      .then(response => {
        // Check if the network response is successful
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        // Return the content of the file as plain text
        return response.text();
      })
      .then(markdown => {
        // Use a regular expression with the 'g' flag to replace all occurrences of {sep}
        const updatedMarkdown = markdown.replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep">');

        // Use the 'marked' library to parse the modified markdown into HTML
        const htmlContent = marked.parse(updatedMarkdown);
        
        // Set the inner HTML of the container to the newly created HTML
        contentContainer.innerHTML = htmlContent;
      })
      .catch(error => {
        // Log any errors to the console and display an error message on the page
        console.error('Error fetching or parsing markdown:', error);
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
      });
  } else {
    // Add more specific error messages if elements are not found
    if (!contentContainer) {
        console.error("Error: The element with ID 'content-container' was not found in the document.");
    }
    if (!sourceFile) {
        console.error("Error: The 'data-source' attribute was not found on the <body> tag.");
    }
  }
});
