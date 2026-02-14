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
    //const content = document.getElementById("navibar");
    const wrapper = document.getElementById("wrappertext");
    //const chapterTitle = document.getElementById("chapterTitle");

    let fontFamily = 'inherit';
    switch(fontName) {
        case 'Helvetica': fontFamily = '"Helvetica", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'; break;
        //case 'NotoSans': fontFamily = '"NotoSans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'; break;
        case 'Literata': fontFamily = '"Literata", serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'; break;
        //case 'SFProText': fontFamily = '"SFProText", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'; break;
        case 'Selawik': fontFamily = '"Selawik", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'; break;
    }

    [wrapper].forEach(el => {
        if(el) el.style.fontFamily = fontFamily;
    });

    // Save font selection
    localStorage.setItem("selectedFont", fontName);
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
    localStorage.setItem("selectedFont", fontName);    
    setSelectedFont(fontName);
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) fontSelect.value = fontName;
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
    const savedFont = localStorage.getItem("selectedFont") || "Helvetica";
    if (savedFont) {
        setSelectedFont(savedFont);
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
