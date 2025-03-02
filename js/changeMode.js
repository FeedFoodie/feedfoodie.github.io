// Set Font Size
function setFontSize(value) {
	document.getElementById("content").style.fontSize = value;
	var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = value;
		}
}
if(localStorage.getItem('fontSize')) {
	var storedSize = localStorage.getItem('fontSize');
	setFontSize(storedSize);
}


// Change Font Size
var currentSize = 0;
function changeFontSize(change) {	
	if (change == '0') {
		var selectedSize = "16px";
		document.getElementById("content").style.fontSize = selectedSize;
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = selectedSize;
		}
	}
	else {
		currentSize = parseInt(document.getElementById("content").style.fontSize);
		var selectedSize = currentSize + change + 'px';
		document.getElementById("content").style.fontSize = selectedSize;
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = selectedSize;
		}
	}
	localStorage.setItem('fontSize', window.getComputedStyle(content).fontSize);
}

//Change Color
function changeWrapColor() {
	document.getElementById("wrappertext").classList.toggle("day-mode");
	var quotes = document.getElementsByClassName("night-mode-quotes");
	for (var i = 0; i < quotes.length; i++) {
		quotes[i].classList.toggle("day-mode-quotes")
	}
}

// When the user clicks on the button, toggle between hiding and showing the dropdown content
function navbarDropdown() {
	document.getElementById("novelDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(e) {
	if (!e.target.matches('.dropbtn')) {
	var novelDropdown = document.getElementById("novelDropdown");
		if (novelDropdown.classList.contains('show')) {
			novelDropdown.classList.remove('show');
		}
	}
}

