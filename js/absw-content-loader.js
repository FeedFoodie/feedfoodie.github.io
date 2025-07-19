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
        '01': '<p class="ffoodie">WHY AREN′T YOU READING THIS AT NORTHBLADETLDOTCOM?',
        '02': '<p class="fooodie">Y AREN′T YOU READING THIS AT NORTHBLADETLDOTCOM?',
        '03': '<p class="fooddie">YOU OUGHT TO READ THIS AT NORTHBLADETLDOTCOM.',
        '04': '<p class="foodiie">READ THIS AT NORTHBLADETLDOTCOM, OR ELSE.',
        '05': '<p class="foodiee">NORTHBLADETLDOTCOM WELCOMES YOU.',
        '06': '<p class="ffoodie">THIS IS A NON-PROFIT TRANSLATION. YOU SHOULD NOT BE SEEING ADS.',
        '07': '<p class="fooodie">THIS IS A FREE TRANSLATION. YOU SHOULD NOT BE SEEING ADS.',
        '08': '<p class="fooddie">THIS IS A NON-PROFIT TRANSLATION. THERE ARE NO ADS.',
        '09': '<p class="foodiie">THIS IS A NON-PROFIT TRANSLATION. ADS? WHAT ADS?',
        '10': '<p class="foodiee">IF YOU′RE SEEING THIS, YOU ARE AT THE WRONG PLACE.',
    };

    try {
        const response = await fetch(`/ABSW/chapters/${sourceFile}`, {
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
