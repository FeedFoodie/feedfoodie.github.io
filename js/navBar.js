function navbarDropdown(id) {
  var dropdown = document.getElementById(id);
  dropdown.classList.toggle("show");
  var allOpen = document.querySelectorAll('.dropdown-content.show');
  allOpen.forEach(function(el) {
    if (el.id !== id) {
      el.classList.remove('show');
    }
  });
}
window.onclick=function(o){if(!o.target.matches(".dropbtn")){var n=document.getElementById("novelDropdown");n.classList.contains("show")&&n.classList.remove("show")}};