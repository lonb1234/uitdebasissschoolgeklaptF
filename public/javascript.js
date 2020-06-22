// safety check before delete & confirmation of checked values to prevent error.
function deleteCheck() {
  var checked = document.querySelectorAll('input:checked');
  if (checked.length === 0) {
    alert("er is niets geselecteerd om te verwijderen.")
    return false;
  } else {
    var conf = confirm("wil je deze blog(s) zeker verwijderen?")
    if (conf == true) {
      return true
    } else {
      return false
    }
  }
}
