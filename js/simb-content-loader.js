document.addEventListener('DOMContentLoaded', async () => {
    const htmlViewer = 'Zm9vZGllbW9uc3RlcjAwN3MtYnVubmllcy1waWthLWFuZC1jb3R0b24tYXJlLXZlcnktaHVuZ3J5';

    const contentContainer = document.getElementById('content-container');
    const sourceFile = document.body.dataset.source;

    if (!contentContainer || !sourceFile) {
        console.error("Content container or source file not specified.");
        return;
    }

    // Configure marked.js with the footnote extension
    marked.use(markedFootnote({
        description: '<hr><h3>Footnotes:</h3>'
    }));
    
    // Define replacements for aggAnnoy patterns
    const annoyReplacements = {
        '01': '<p class="ffoodie">Why aren′t you reading this at northbladetldotcom?',
        '02': '<p class="fooodie">Y aren′t you reading this at northbladetldotcom?',
        '03': '<p class="fooddie">You ought to read this at northbladetldotcom.',
        '04': '<p class="foodiie">Read this at northbladetldotcom, or else.',
        '05': '<p class="foodiee">northbladetldotcom welcomes you.',
        '06': '<p class="ffoodie">This is a non-profit translation. You should not be seeing ads.',
        '07': '<p class="fooodie">This is a free translation. You should not be seeing ads.',
        '08': '<p class="fooddie">This is a non-profit translation. There are no ads.',
        '09': '<p class="foodiie">This is a non-profit translation. Ads? What ads?',
        '10': '<p class="foodiee">If you′re seeing this, you are at the wrong place.'
    };

    try {
        const response = await fetch(`/SIMB/chapters/${sourceFile}`, {
            headers: {
                'X-Internal-Request-Token': atob(htmlViewer)
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let markdown = await response.text();

        // Process markdown and convert to HTML
        let htmlContent = marked.parse(
            markdown
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, '</span>')
        );

        // Apply all HTML replacements efficiently in a single chain
        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>aggAnnoy(\d{2})/g, (match, key) => annoyReplacements[key] || match)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Failed to load chapter content:", error);
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
    }
});