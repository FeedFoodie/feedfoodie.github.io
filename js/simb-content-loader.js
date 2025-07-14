document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('content-container');
  const sourceFile = document.body.dataset.source;

  const footnoteOptions = {
    description: '<hr><h3>Footnotes:</h3>'
  };

  marked.use(markedFootnote(footnoteOptions));

  if (contentContainer && sourceFile) {
    const filePath = `/SIMB/chapters/${sourceFile}`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
      })
      .then(markdown => {
        const updatedMarkdown = markdown
          .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep">')
          .replace(/@\[/g, '<span class="night-mode-quotes">')
          .replace(/\]@/g, '</span>');

        let htmlContent = marked.parse(updatedMarkdown);

        htmlContent = htmlContent.replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">');

        contentContainer.innerHTML = htmlContent;
      })
      .catch(error => {
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
      });
  }
});