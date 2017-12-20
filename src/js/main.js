$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  function isRetinaDisplay() {
    if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        return (mq && mq.matches || (window.devicePixelRatio > 1));
    }
  }

  var _mobileDevice = isMobile();
  // detect mobile devices
  function isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      return true
    } else {
      return false
    }
  }

  function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true
    } else {
      return false
    }
  }

  if ( msieversion() ){
    $('body').addClass('is-ie');
  }

  // BREAKPOINT SETTINGS
  var bp = {
    mobileS: 375,
    mobile: 568,
    tablet: 768,
    desktop: 992,
    wide: 1336,
    hd: 1440
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint(){
    var wWidth = _window.width();

    var content = "<div class='dev-bp-debug'>"+wWidth+"</div>";

    $('.page').append(content);
    setTimeout(function(){
      $('.dev-bp-debug').fadeOut();
    },1000);
    setTimeout(function(){
      $('.dev-bp-debug').remove();
    },1500)
  }

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  function pageReady(){
    legacySupport();
    initBuggifill();

    initSliders();
    initPopups();

    updateHeaderActiveClass();
    initMasks();
    initFitText();
    runScrollMonitor();

    revealFooter();
    _window.on('resize', throttle(revealFooter, 100));

    initYandexMap();

    // temp - developer
    _window.on('resize', debounce(setBreakpoint, 200))
  }

  pageReady();

  //////////
  // COMMON
  //////////

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();
  }

  function initBuggifill(){
    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 250,
      appendToBody: true
    });
  }


 	// Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
  		e.preventDefault();
  	})
  	.on( 'click', 'a[href^="#section"]', function() {
      var el = $(this).attr('href');
      $('body, html').animate({
          scrollTop: $(el).offset().top}, 1000);
      return false;
  	})

  // FOOTER REVEAL
  function revealFooter() {
    var footer = $('[js-reveal-footer]');
    if (footer.length > 0) {
      var footerHeight = footer.outerHeight();
      var maxHeight = _window.height() - footerHeight > 100;
      if (maxHeight && !msieversion() ) {
        $('body').css({
          'margin-bottom': footerHeight
        });
        footer.css({
          'position': 'fixed',
          'z-index': -10
        });
      } else {
        $('body').css({
          'margin-bottom': 0
        });
        footer.css({
          'position': 'static',
          'z-index': 10
        });
      }
    }
  }

  // HEADER SCROLL
  // add .header-static for .page or body
  // to disable sticky header
  if ( $('.header-static').length == 0 ){
    _window.on('scroll', throttle(function() { // scrolled is a constructor for scroll delay listener
      var vScroll = _window.scrollTop();
      var header = $('.header').not('.header--static');
      var headerHeight = header.height();
      var heroHeight = $('.page__content').children().first().outerHeight() - headerHeight;

      if ( vScroll > headerHeight ){
        header.addClass('header--transformed');
      } else {
        header.removeClass('header--transformed');
      }

      if ( vScroll > heroHeight ){
        header.addClass('header--fixed');
      } else {
        header.removeClass('header--fixed');
      }
    }, 10));
  }

  // HAMBURGER TOGGLER
  _document.on('click', '[js-hamburger]', function(){
    $(this).toggleClass('is-active');
    $('.header').toggleClass('is-menu-opened')
    $('[js-header-menu]').toggleClass('is-active');
    $('.mobile-navi').toggleClass('is-active');
  });

  function closeMobileMenu(){
    $('[js-hamburger]').removeClass('is-active');
    $('.header').removeClass('is-menu-opened')
    $('[js-header-menu]').removeClass('is-active');
    $('.mobile-navi').removeClass('is-active');
  }
  // MOBILE NAVI
  _document
    .on('click', '[js-mobile-nav] > li', function(){
      var hasUl = $(this).has('ul').length > 0

      if ( hasUl ){
        $(this).toggleClass('is-opened');
        $(this).find('ul').slideToggle()

      }
    })
    .on('click', '[js-mobile-nav] > li > ul', function(e){
      e.stopPropagation();
    })

  // SET ACTIVE CLASS IN HEADER
  // * could be removed in production and server side rendering
  // user .active for li instead
  function updateHeaderActiveClass(){
    $('.header__menu li').each(function(i,val){
      if ( $(val).find('a').attr('href') == window.location.pathname.split('/').pop() ){
        $(val).addClass('is-active');
      } else {
        $(val).removeClass('is-active')
      }
    });
  }

  // FIT TEXT
  function initFitText(){
    $('[js-fittext]').each(function(i, text){
      var _this = $(text);

      var min = $(this).data('min') || "20px";
      var max = $(this).data('max') || "70px";

      _this.fitText(1, {minFontSize: min, maxFontSize: max})
    })

    $('.title__name').fitText(1, {minFontSize: '24px', maxFontSize: '100px'})

  }

  //////////
  // SLIDERS
  //////////

  function initSliders(){
    var slickNextArrow = '<div class="slick-prev"><svg class="ico ico-back-arrow"><use xlink:href="img/sprite.svg#ico-back-arrow"></use></svg></div>';
    var slickPrevArrow = '<div class="slick-next"><svg class="ico ico-next-arrow"><use xlink:href="img/sprite.svg#ico-next-arrow"></use></svg></div>'

    $('[js-slider]').each(function(i, slider){
      var self = $(slider);

      if (self && self !== undefined) {
        self.slick({
          autoplay: self.data('slick-autoplay') !== undefined ? true : false,
          dots: self.data('slick-dots') !== undefined ? true : false,
          arrows: self.data('slick-arrows') !== undefined ? true : false,
          prevArrow: slickNextArrow,
          nextArrow: slickPrevArrow,
          infinite: self.data('slick-infinite') !== undefined ? true : true,
          speed: 300,
          slidesToShow: 1,
          accessibility: false,
          adaptiveHeight: false,
          draggable: self.data('slick-no-controls') !== undefined ? false : true,
          swipe: self.data('slick-no-controls') !== undefined ? false : true,
          swipeToSlide: self.data('slick-no-controls') !== undefined ? false : true,
          touchMove: self.data('slick-no-controls') !== undefined ? false : true
        });
      }

    })

    $('[js-slider-col-3]').slick({
      autoplay: false,
      dots: true,
      arrows: true,
      prevArrow: slickNextArrow,
      nextArrow: slickPrevArrow,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      accessibility: false,
      adaptiveHeight: false,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            arrows: false,
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            arrows: false,
          }
        },
        {
          breakpoint: 568,
          settings: {
            slidesToShow: 1,
            arrows: false,
          }
        },
      ]
    })

    $('[js-slider-col-2]').slick({
      autoplay: false,
      dots: true,
      arrows: true,
      prevArrow: slickNextArrow,
      nextArrow: slickPrevArrow,
      infinite: true,
      speed: 300,
      slidesToShow: 2,
      slidesToScroll: 2,
      accessibility: false,
      adaptiveHeight: false,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            arrows: false
          }
        },
        {
          breakpoint: 568,
          settings: {
            slidesToShow: 1,
          }
        },
      ]
    })

  }

  //////////
  // TABS
  //////////
  _document.on('change', '[js-checkbox-tabs] [data-tab-for]', function(e){

    var choosenTab = $(this).data('tab-for');
    var tabTarget = $('[data-tab="'+choosenTab+'"]');

    tabTarget.addClass('is-active').siblings().removeClass('is-active');
    $(this).parent().siblings().find('input').prop('checked', false)

    if ( tabTarget.find('.slick-slider').length > 0 ){
      setTimeout(function() {
        tabTarget.find('.slick-slider').resize();
        // _window.trigger('resize')
      }, 200)
    }
    // e.preventDefault();
  })

  //////////
  // SCROLLDOWN
  //////////
  _document.on('click', '[js-scrolldown]', function(){
    var el = $(this).closest('.hero').next();
    $('body, html').animate({
        scrollTop: $(el).offset().top}, 1000);
    return false;
  })


  // TABS TOGGLER
  _document
    .on('click', '.tabs__item-name', function(){

      $(this).toggleClass('is-opened');
      $(this).next().slideToggle()

    })
    // .on('click', '[js-mobile-nav] > li > ul', function(e){
    //   e.stopPropagation();
    // })

  // CATEGORY TOGGLER
  _document
    .on('click', '.sidebar__category-top', function(){
      $(this).toggleClass('is-opened');
      $(this).parent().find('.sidebar__category-drop').slideToggle();
    })
    .on('click', '.sidebar__mobile-control', function(){
      $(this).toggleClass('is-opened');
      if ( $(this).is('.is-opened') ){
        $(this).find('> span').text('Скрыть меню');
      } else {
        $(this).find('> span').text('Раскрыть меню');
      }
      $('.sidebar__category').slideToggle();
    })

    // LOAD MORE
    _document
      .on('click', '[js-load-more]', function(){
        // // fake functionality
        // var contentObj = $('[js-load-more-faker]');
        //
        // contentObj.append( contentObj.html() )

        // runScrollMonitor();
      });


  // testimonial TOGGLER
  _document.on('click', '[js-testimonial-up]', function(){
    $(this).toggleClass('is-active');
    $(this).closest('.testimonial-item').find('.testimonial-item__text').slideToggle();
  })


  //////////
  // MODALS
  //////////

  function initPopups(){
    // Magnific Popup
    var startWindowScroll = 0;
    $('[js-popup]').magnificPopup({
      type: 'inline',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble',
      callbacks: {
        beforeOpen: function() {
          startWindowScroll = _window.scrollTop();
          // $('html').addClass('mfp-helper');
        },
        close: function() {
          // $('html').removeClass('mfp-helper');
          _window.scrollTop(startWindowScroll);
        }
      }
    });

    $('[js-image-popup]').magnificPopup({
      type: 'image',
      fixedContentPos: true,
      closeOnContentClick: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: false,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble mfp-with-zoom',
      zoom: {
  			enabled: true,
  			duration: 300 // don't foget to change the duration also in CSS
  		}
    });

    $('[js-video-popup]').magnificPopup({
  		disableOn: 700,
  		type: 'iframe',
  		mainClass: 'popup-buble mfp-with-zoom',
  		removalDelay: 160,
  		preloader: false,
  		fixedContentPos: false
  	});


    _document.on('click', '[js-popup-i-want]', function(){
      if ( _window.width() > bp.desktop ){
        $.magnificPopup.open({
          items: {
            src: $(this).attr('href') || $(this).attr('data-mfp-src')
          },
          type: 'inline',
          fixedContentPos: true,
          fixedBgPos: true,
          overflowY: 'auto',
          closeBtnInside: true,
          preloader: false,
          midClick: true,
          removalDelay: 300,
          mainClass: 'popup-buble',
        });
      } else {
        $(this).toggleClass('is-active');
      }
    })

    if ( _document.find('[js-popup-i-want]').length > 0 ){
      _window.on('resize', throttle(closeMfp, 200))
    }

    function closeMfp(){
      if ( _window.width() < bp.desktop ){
        $.magnificPopup.close();
      }
    }


    $('[js-popup-gallery]').magnificPopup({
      // src: {
      //   items: '.slick-slide:not(.slick-cloned) img'
      // },
  		delegate: '.slick-slide:not(.slick-cloned) img',
  		type: 'image',
  		tLoading: 'Загрузка #%curr%...',
  		mainClass: 'popup-buble',
  		gallery: {
  			enabled: true,
  			navigateByImgClick: true,
  			preload: [0,1]
  		},
  		image: {
  			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
  		}
  	});
  }

  ////////////
  // UI
  ////////////

  // Masked input
  function initMasks(){
    $(".js-dateMask").mask("99.99.99",{placeholder:"ДД.ММ.ГГ"});
    $("input[type='tel']").mask("+7 (000) 000-0000", {placeholder: "+7 (___) ___-____"});
  }

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
    });



  ////////////
  // SCROLLMONITOR - WOW LIKE
  ////////////

  var monitorActive = false;
  function runScrollMonitor(){
    setTimeout(function(){

      // require
      if ( !monitorActive ){
        monitorActive = true;
        _document.find('.wow').each(function(i, el){

          var elWatcher = scrollMonitor.create( $(el) );

          var delay;
          if ( $(window).width() < 768 ){
            delay = 0
          } else {
            delay = $(el).data('animation-delay');
          }

          var animationClass

          if ( $(el).data('animation-class') ){
            animationClass = $(el).data('animation-class');
          } else {
            animationClass = "wowFadeUp"
          }

          var animationName

          if ( $(el).data('animation-name') ){
            animationName = $(el).data('animation-name');
          } else {
            animationName = "wowFade"
          }

          elWatcher.enterViewport(throttle(function() {
            $(el).addClass(animationClass);
            $(el).css({
              'animation-name': animationName,
              'animation-delay': delay,
              'visibility': 'visible'
            });
          }, 100, {
            'leading': true
          }));
          elWatcher.exitViewport(throttle(function() {
            $(el).removeClass(animationClass);
            $(el).css({
              'animation-name': 'none',
              'animation-delay': 0,
              'visibility': 'hidden'
            });
          }, 100));
        });
      }

    },300);
  }

  ////////////
  // YANDEX MAPS
  ////////////

  function initYandexMap(){
    if ( $(".contact-map").length > 0 ){
      ymaps.ready(init);
    }
  }

  var myMap,
      myPlacemark;

  function init(){
    myMap = new ymaps.Map("contact-map", {
      center: [55.754152, 37.578496],
      zoom: 15
    });

    // myMap.controls.remove('zoomControl');
    myMap.controls.remove('trafficControl');
    myMap.controls.remove('searchControl');
    myMap.controls.remove('fullscreenControl');
    myMap.controls.remove('rulerControl');
    myMap.controls.remove('geolocationControl');
    myMap.controls.remove('routeEditor');

    myMap.behaviors.disable('scrollZoom');

    myPlacemark = new ymaps.Placemark([55.754152, 37.578496], {
      hintContent: 'г. Москва, ул. Новый Арбат 36/9, корпус 2!',
    });

    myMap.geoObjects.add(myPlacemark);
  }

  //////////
  // BARBA PJAX
  //////////

  Barba.Pjax.Dom.containerClass = "page";

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      return $(this.oldContainer).animate({ opacity: .5 }, 200).promise();
    },

    fadeIn: function() {
      var _this = this;
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      $el.css({
        visibility : 'visible',
        opacity : .5
      });

      $el.animate({ opacity: 1 }, 200, function() {
        document.body.scrollTop = 0;
        _this.done();
      });
    }
  });

  Barba.Pjax.getTransition = function() {
    return FadeTransition;
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {
    monitorActive = false

    pageReady();

    // close mobile menu
    if ( _window.width() < bp.mobile ){
      closeMobileMenu();
    }
  });

});
