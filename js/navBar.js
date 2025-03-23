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