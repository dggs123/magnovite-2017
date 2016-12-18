(function($) {
    "use strict";
	
	
    // WINDOW.LOAD FUNCTION start
    $(window).load(function() {
		
        // preloader
        $("#preloader").fadeOut(1200);
        $("#preloader-status").delay(200).fadeOut("slow");
		
        // elements.Timeout
        setTimeout(function() {
            $(".overlay, .introduction").removeClass("OFF");
        }, 400);
        setTimeout(function() {
            $(".navbar").removeClass("OFF");
        }, 1000);
        setTimeout(function() {
            $(".logo, .launcher-wrapper").removeClass("OFF");
        }, 600);
        setTimeout(function() {
            $(".left-side").removeClass("left-position");
        }, 800);
        setTimeout(function() {
            $(".right-side").removeClass("right-position");
        }, 800);

		
        // scale IN
        $(".hero-bg").addClass("hero-bg-show");
		$(".clouds").addClass("clouds-show");
	
    });
    // WINDOW.LOAD FUNCTION end
	
	
    // DOCUMENT.READY FUNCTION start
	
    // kenburnsy
    $("#kenburnsy-bg").kenburnsy({
        fullscreen: true
    });

    // countdown setup start
    $("#countdown").countdown({
        date: "04 March 2017 12:00:00", // countdown target date settings
        format: "on"
    }, function() {});
	
    // owlCarousel welcome slides
    $(".welcome-slides").owlCarousel({
        navigation: false,
        pagination: false,
        transitionStyle: "fadeUp", // fade, backSlide, goDown, fadeUp
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        autoPlay: 5000
    });
	
	// owlCarousel HERO slider SPLIT
    $(".hero-slider-split").owlCarousel({
        autoPlay: true,
        navigation: false,
        pagination: false,
        slideSpeed: 300,
        paginationSpeed: 800,
        singleItem: false,
        items: 2,
        autoHeight: true
    });
	
	// owlCarousel HERO slider ZOOM
	$(".hero-slider-zoom").owlCarousel({
	    autoPlay: true,
	    navigation: false,
	    pagination: false,
	    transitionStyle: "fadeUp", // fade, backSlide, goDown, fadeUp
	    slideSpeed: 300,
	    paginationSpeed: 400,
	    singleItem: true,
	    items: 1,
	    autoHeight: true
	});
	
    // swiper
    var mySwiper = new Swiper('.swiper-container', {
        initialSlide: 1,
        // pagination: '.swiper-pagination',
		pagination: false,
        paginationClickable: true,
        nextButton: '.arrow-right',
        prevButton: '.arrow-left',
        parallax: true,
        speed: 600
    });
	
	// YTPlayer
    $(function() {
        $(".player").mb_YTPlayer();
    });
	
    // Vimeofy
    $('#videoContainment-vimeo').vimeofy({
        'url': 'https://vimeo.com/105001064', // Vimeo VIDEO URL
        'color': '#00D8D8',
        'autoplay': true,
        'loop': true,
        'delay': 5000
    });
	
    // show/hide launcher INTRO
    $(".intro-launcher").on("click", function() {
        $(".intro-content-visible").hasClass("hide") ? ($(".intro-content-visible").removeClass("hide"), $(".intro-content-visible").toggleClass("show")) : ($(".intro-content-visible").toggleClass(
            "show"), $(".intro-content-visible").addClass("hide"), $(".intro-content-visible").addClass("hide"));
    }), $(".intro-launcher").on("click", function(e) {
        e.preventDefault(), $(this).toggleClass("open"), $(".intro-content-hidden").toggleClass("show");
    });
	
    // show/hide launcher ABOUT
    $(".about-launcher").on("click", function() {
        $(".about-content-visible").hasClass("hide") ? ($(".about-content-visible").removeClass("hide"), $(".about-content-visible").toggleClass("show")) : ($(".about-content-visible").toggleClass(
            "show"), $(".about-content-visible").addClass("hide"), $(".about-content-visible").addClass("hide"));
    }), $(".about-launcher").on("click", function(e) {
        e.preventDefault(), $(this).toggleClass("open"), $(".about-content-hidden").toggleClass("show");
    });
	
    // show/hide launcher CONTACT
    $(".contact-launcher").on("click", function() {
        $(".contact-content-visible").hasClass("hide") ? ($(".contact-content-visible").removeClass("hide"), $(".contact-content-visible").toggleClass("show")) : ($(
            ".contact-content-visible").toggleClass("show"), $(".contact-content-visible").addClass("hide"), $(".contact-content-visible").addClass("hide"));
    }), $(".contact-launcher").on("click", function(e) {
        e.preventDefault(), $(this).toggleClass("open"), $(".contact-content-hidden").toggleClass("show");
    });
	
    // progresss
    function showprogresss() {
        $(".show-progress").removeClass("isHidden");
        $(".progress-holder");
        $({
            value: 0
        }).animate({
            value: $(".num2").attr("name")
        }, {
            duration: 2200,
            easing: 'swing',
            step: function() {
                $(".num2").val(Math.ceil(this.value)).trigger("change");
            }
        });
    }

    function hideprogresss() {
        $(".show-progress").addClass("isHidden");
    }
    $(".num").knob();
    $(".show-progress").on("click", function() {
        if ($(this).hasClass("isHidden")) {
            showprogresss();
        } else {
            hideprogresss();
        }
        return false;
    });
	
    // contact form
    $("form#form").submit(function() {
        $("form#form .error").remove();
        var s = !1;
        if ($(".requiredField").each(function() {
            if ("" === jQuery.trim($(this).val())) $(this).prev("label").text(), $(this).parent().append('<span class="error">This field is required</span>'), $(this).addClass(
                "inputError"), s = !0;
            else if ($(this).hasClass("email")) {
                var r = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                r.test(jQuery.trim($(this).val())) || ($(this).prev("label").text(), $(this).parent().append('<span class="error">Invalid email address</span>'), $(this).addClass(
                    "inputError"), s = !0);
            }
        }), !s) {
            $("form#form input.submit").fadeOut("normal", function() {
                $(this).parent().append("");
            });
            var r = $(this).serialize();
            $.post($(this).attr("action"), r, function() {
                $("form#form").slideUp("fast", function() {
                    $(this).before('<div class="success">Your email was sent successfully.</div>');
                });
            });
        }
        return !1;
    });
	
    // newsletter form
    $("form#subscribe").submit(function() {
        $("form#subscribe .subscribe-error").remove();
        var s = !1;
        if ($(".subscribe-requiredField").each(function() {
            if ("" === jQuery.trim($(this).val())) $(this).prev("label").text(), $(this).parent().append('<span class="subscribe-error">Please enter your Email</span>'),
                $(this).addClass("inputError"), s = !0;
            else if ($(this).hasClass("subscribe-email")) {
                var r = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                r.test(jQuery.trim($(this).val())) || ($(this).prev("label").text(), $(this).parent().append('<span class="subscribe-error">Please enter a valid Email</span>'), $(
                    this).addClass("inputError"), s = !0);
            }
        }), !s) {
            $("form#subscribe input.submit").fadeOut("normal", function() {
                $(this).parent().append("");
            });
            var r = $(this).serialize();
            $.post($(this).attr("action"), r, function() {
                $("form#subscribe").slideUp("fast", function() {
                    $(this).before('<div class="subscribe-success">Thank you for subscribing.</div>');
                });
            });
        }
        return !1;
    });
	
    // DOCUMENT.READY FUNCTION end
	
	
    // MOBILE DETECT start
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    // MOBILE DETECT end


})(jQuery);


// GOOGLE ANALYTICS [for demonstration purposes only]
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-3033286-18']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();