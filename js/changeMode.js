// Change Font Size
var cont = document.getElementById("container");  
function changeFontSize(change) {  
	if (change == 0) {
		cont.style.fontSize = 0.9375em;
	} else {
		cont.style.fontSize = cont.style.fontSize + change;
	}	
}