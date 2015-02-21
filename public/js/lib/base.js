;(function(document, window) {
    'use strict';

    var elSelector  = 'body > header',
      element = document.querySelector(elSelector);

    if( !element ) return true;

    var elHeight = 0,
      elTop = 0,
      dHeight = 0,
      wHeight = 0,
      wScrollCurrent = 0,
      wScrollBefore = 0,
      wScrollDiff = 0;

    window.addEventListener('scroll', function()
    {
      elHeight    = element.offsetHeight;
      dHeight      = document.body.offsetHeight;
      wHeight      = window.innerHeight;
      wScrollCurrent  = window.pageYOffset;
      wScrollDiff    = wScrollBefore - wScrollCurrent;
      elTop      = parseInt(window.getComputedStyle( element ).getPropertyValue('top')) + wScrollDiff;

      if( wScrollCurrent <= 0 ) // scrolled to the very top; element sticks to the top
        element.style.top = '0px';

      else if( wScrollDiff > 0 ) // scrolled up; element slides in
        element.style.top = ( elTop > 0 ? 0 : elTop ) + 'px';

      else if( wScrollDiff < 0 ) // scrolled down
      {
        if( wScrollCurrent + wHeight >= dHeight - elHeight )  // scrolled to the very bottom; element slides in
          element.style.top = ( ( elTop = wScrollCurrent + wHeight - dHeight ) < 0 ? elTop : 0 ) + 'px';

        else // scrolled down; element slides out
          element.style.top = ( Math.abs( elTop ) > elHeight ? -elHeight : elTop ) + 'px';
      }

      wScrollBefore = wScrollCurrent;
    });

}(document, window));

(function(){
  // $(document).on('ready', function () {
  //   var sticky = function () {
  //     if ($(document).scrollTop() > $('body > header').offset().top) {
  //       $('body > header').addClass('sticky');
  //     } else {
  //       $('body > header').removeClass('sticky');
  //     }

  //     // if ($(document).scrollTop() > $('.speakers').offset().top - 300) {
  //     //   $('.speakers li:not(.active)').each(function (index) {
  //     //     var $el = $(this);
  //     //     window.setTimeout(function () {
  //     //       $el.addClass('active');
  //     //     }, index * 100);
  //     //   });
  //     // }

  //     // if ($(document).scrollTop() > $('.sponsors').offset().top - 300) {
  //     //   $('.sponsors li:not(.active)').each(function (index) {
  //     //     var $el = $(this);
  //     //     window.setTimeout(function () {
  //     //       $el.addClass('active');
  //     //     }, index * 100);
  //     //   });
  //     // }
  //   };
  //   var stickyid;
  //   var stickyout = function() {
  //     if ($(document).scrollTop() > $('body > header').offset().top) {
  //       $('body > header').addClass('sticky');
  //     }
  //     clearTimeout(stickyid);
  //     stickyid = setTimeout(sticky, 50);
  //   };
  //   $(window).on('resize', stickyout);
  //   $(document).on('scroll', stickyout);
  // });
})();
