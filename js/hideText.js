// Get the div with class name 'post-content'
const div = document.querySelector('.post-content');

// Get all the paragraphs inside the div
const paragraphs = div.querySelectorAll('p');

// Hide all the content paragraphs
for (let i = 4; i < paragraphs.length; i++) {
  paragraphs[i].style.display = 'none';
}

// Show the Content Again
window.addEventListener('load', function() {
  for (let i = 4; i < paragraphs.length; i++) {
    paragraphs[i].style.display = 'inline';
  }
});