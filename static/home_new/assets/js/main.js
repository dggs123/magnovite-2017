
$('#clock').countdown('2017/3/2', function(event) {
  	$(this).html(event.strftime('%D days'));
});

var isMobile = /Android/i.test(navigator.userAgent);
if (isMobile) {
  /* your code here */
  window.open("https://play.google.com/store/apps/details?id=gulzar.magnovite&hl=en",'_blank');
}

function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}