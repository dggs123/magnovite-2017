
$('#clock').countdown('2017/3/2', function(event) {
  	$(this).html(event.strftime('%D days'));
});

var isMobile = /Android/i.test(navigator.userAgent);
if (isMobile) {
    window.open(url,'_blank');
    }

function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("header-small-logo").style.display = "none";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("header-small-logo").style.display = "block";
}
function openNav1() {
    document.getElementById("mySidenav1").style.width = "100%";
}

function closeNav1() {
    document.getElementById("mySidenav1").style.width = "0";
}
function about() {
	if (screen.width <=700) {
    document.getElementById("mainpart").style.display = "block";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "none";
    }
    else
    {
    document.getElementById("mainpart").style.zIndex = "1";
    document.getElementById("contact").style.zIndex = "0";
    document.getElementById("sponsor").style.zIndex = "0";
    document.getElementById("team").style.zIndex = "0";
    }
}
function contactus() {
    if (screen.width <=700) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "block";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "none";
    }
    else
    {
    document.getElementById("mainpart").style.zIndex = "0";
    document.getElementById("contact").style.zIndex = "1";
    document.getElementById("sponsor").style.zIndex = "0";
    document.getElementById("team").style.zIndex = "0";
    }
}
function sponsor() {
  if (screen.width <=700) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "block";
    document.getElementById("team").style.display = "none";
    }
    else
    {
    document.getElementById("mainpart").style.zIndex = "0";
    document.getElementById("contact").style.zIndex = "0";
    document.getElementById("sponsor").style.zIndex = "1";
    document.getElementById("team").style.zIndex = "0";
    }
}
function team() {
if (screen.width <=700) {
    document.getElementById("mainpart").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById("sponsor").style.display = "none";
    document.getElementById("team").style.display = "block";
    }
    else
    {
    document.getElementById("mainpart").style.zIndex = "0";
    document.getElementById("contact").style.zIndex = "0";
    document.getElementById("sponsor").style.zIndex = "0";
    document.getElementById("team").style.zIndex = "1";
    }
}
$( document ).ready(function() {
    document.getElementById("mainpart").style.zIndex = "1";
    document.getElementById("contact").style.zIndex = "0";
    document.getElementById("sponsor").style.zIndex = "0";
    document.getElementById("team").style.zIndex = "0";
});