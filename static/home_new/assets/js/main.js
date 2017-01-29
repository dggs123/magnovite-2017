
$('#clock').countdown('2017/3/2', function(event) {
  	$(this).html(event.strftime('%D days'));
});

var isMobile = /Android/i.test(navigator.userAgent);


function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("header-small-logo").style.display = "none";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("header-small-logo").style.display = "block";
}
function about() {
	if (isMobile) {
    document.getElementById("mainpart").style.display = "block";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "none";
    }
}
function contactus() {
    if (isMobile) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "block";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "none";
    }
}
function sponsor() {
  if (isMobile) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "block";
    document.getElementById("team").style.display = "none";
    }
}
function team() {
if (isMobile) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "block";
    }
}