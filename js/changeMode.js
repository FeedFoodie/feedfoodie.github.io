// Change Font Size
var cont = document.getElementById("container");  
function changeFontSize(change) {  
	if (change == 0) {
		cont.style.fontSize = 16px;
	} else {
		cont.style.fontSize = cont.style.fontSize + change;
	}	
}