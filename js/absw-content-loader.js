document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');
  const sourceFile = document.body.dataset.source;

  // Define the custom options for the footnote header
  const footnoteOptions = {
    description: '<hr><h3>Footnotes</h3>'
  };

  // Pass the options object to the extension
  marked.use(markedFootnote(footnoteOptions));

  if (contentContainer && sourceFile) {
    const filePath = `/ABSW/chapters/${sourceFile}`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
      })
      .then(markdown => {
        const updatedMarkdown = markdown.replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep">');
        const htmlContent = marked.parse(updatedMarkdown);
        contentContainer.innerHTML = htmlContent;
      })
      .catch(error => {
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
      });
  }
});