// Font size functions
function setFontSize(e){
    const t=document.getElementById("content");
    t&&(t.style.fontSize=e);
    const o=document.getElementsByClassName("night-mode-quotes");
    for(let t=0;t<o.length;t++)o[t].style.fontSize=e;
}

// Mode functions
function setMode(e){
    const wrapper = document.getElementById("wrappertext");
    const title = document.getElementById("chapterTitle");
    const quotes = document.getElementsByClassName("night-mode-quotes");
    if("day" == e){
        wrapper?.classList.add("day-mode");
        title?.classList.add("day-mode-heading");
        for(let t=0;t<quotes.length;t++) {
            quotes[t].classList.add("day-mode-quotes");
        }
    } else {
        wrapper?.classList.remove("day-mode");
        title?.classList.remove("day-mode-heading");
        for(let t=0;t<quotes.length;t++) {
            quotes[t].classList.remove("day-mode-quotes");
        }
    }
}

// Font family functions
function setSelectedFont(fontName) {
    // Apply font to the main content container
    const content = document.getElementById("content");
    const wrapper = document.getElementById("wrappertext");
    
    if (content || wrapper) {
        // Remove all font classes
        const fontClasses = ['font-default', 'font-sfprotext', 'font-selawik', 'font-notosans', 'font-literata'];
        
        // Apply to content if it exists
        if (content) {
            content.classList.remove(...fontClasses);
            switch(fontName) {
                case 'default':
                    content.classList.add('font-default');
                    break;
                case 'SFProText':
                    content.classList.add('font-sfprotext');
                    break;
                case 'Selawik':
                    content.classList.add('font-selawik');
                    break;
                case 'NotoSans':
                    content.classList.add('font-notosans');
                    break;
                case 'Literata':
                    content.classList.add('font-literata');
                    break;
            }
        }
        
        // Apply to wrapper if it exists (for broader coverage)
        if (wrapper) {
            wrapper.classList.remove(...fontClasses);
            switch(fontName) {
                case 'default':
                    wrapper.classList.add('font-default');
                    break;
                case 'SFProText':
                    wrapper.classList.add('font-sfprotext');
                    break;
                case 'Selawik':
                    wrapper.classList.add('font-selawik');
                    break;
                case 'NotoSans':
                    wrapper.classList.add('font-notosans');
                    break;
                case 'Literata':
                    wrapper.classList.add('font-literata');
                    break;
            }
        }
        
        // Also apply to any chapter titles
        const chapterTitle = document.getElementById("chapterTitle");
        if (chapterTitle) {
            chapterTitle.classList.remove(...fontClasses);
            switch(fontName) {
                case 'default':
                    chapterTitle.classList.add('font-default');
                    break;
                case 'SFProText':
                    chapterTitle.classList.add('font-sfprotext');
                    break;
                case 'Selawik':
                    chapterTitle.classList.add('font-selawik');
                    break;
                case 'NotoSans':
                    chapterTitle.classList.add('font-notosans');
                    break;
                case 'Literata':
                    chapterTitle.classList.add('font-literata');
                    break;
            }
        }
    }
}

// Change functions
function changeFontSize(e){
    const t=document.getElementById("content");
    if(!t)return;
    const o=Number(e);
    let n;
    if(0===o)n="16px";
    else{
        n=parseInt(window.getComputedStyle(t).fontSize)+o+"px";
    }
    localStorage.setItem("fontSize",n);
    setFontSize(n);
}

function changeWrapColor(){
    const e=document.getElementById("wrappertext");
    const t=document.getElementById("chapterTitle");
    const o=document.getElementsByClassName("night-mode-quotes");
    e.classList.toggle("day-mode");
    t.classList.toggle("day-mode-heading");
    for(let e=0;e<o.length;e++)o[e].classList.toggle("day-mode-quotes");
    e.classList.contains("day-mode")?localStorage.setItem("colorScheme","day"):localStorage.setItem("colorScheme","night");
}

function changeFontFamily(fontName) {
    // Save the selected font to localStorage
    localStorage.setItem("selectedFont", fontName);    
    // Apply the font to the content
    setSelectedFont(fontName);
    // Update the dropdown selection
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.value = fontName;
    }
}

// Helper function to apply font to specific elements (keeping for compatibility)
function applyFont(fontName) {
    // For backward compatibility, just call setSelectedFont
    setSelectedFont(fontName);
}

// Function to apply ALL saved settings
function applySavedSettings() {
    // Apply saved font size
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
        setFontSize(savedFontSize);
    }
    
    // Apply saved color scheme
    const savedColorScheme = localStorage.getItem("colorScheme");
    if (savedColorScheme) {
        setMode(savedColorScheme);
    }
    
    // Apply saved font
    const savedFont = localStorage.getItem("selectedFont");
    if (savedFont) {
        setSelectedFont(savedFont);
        // Update dropdown
        const fontSelect = document.getElementById("fontSelect");
        if (fontSelect) {
            fontSelect.value = savedFont;
        }
    }
}

// Apply settings when DOM is ready AND when content loads dynamically
document.addEventListener('DOMContentLoaded', function() { 
    // Apply saved settings initially
    applySavedSettings();
    
    // Collapsible setup
    var coll = document.getElementsByClassName('collapsible'); 
    for (var i = 0; i < coll.length; i++) { 
        coll[i].addEventListener('click', function() {  
            this.classList.toggle('active');  
            var content = this.nextElementSibling;   
            if (content.style.maxHeight) {  
                content.style.maxHeight = null;  
            } else {  
                content.style.maxHeight = content.scrollHeight + 'px'; 
            }
        }); 
    }
});

// Listen for content being loaded dynamically
window.addEventListener('ContentReady', function() {
    applySavedSettings();
});