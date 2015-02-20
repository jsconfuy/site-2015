(function(){
  $(document).on('ready', function () {
    var sticky = function () {
      if ($(document).scrollTop() > $('body > header').offset().top) {
        $('body > header').addClass('sticky');
      } else {
        $('body > header').removeClass('sticky');
      }

      // if ($(document).scrollTop() > $('.speakers').offset().top - 300) {
      //   $('.speakers li:not(.active)').each(function (index) {
      //     var $el = $(this);
      //     window.setTimeout(function () {
      //       $el.addClass('active');
      //     }, index * 100);
      //   });
      // }

      // if ($(document).scrollTop() > $('.sponsors').offset().top - 300) {
      //   $('.sponsors li:not(.active)').each(function (index) {
      //     var $el = $(this);
      //     window.setTimeout(function () {
      //       $el.addClass('active');
      //     }, index * 100);
      //   });
      // }
    };
    $(window).on('resize', sticky);
    $(document).on('scroll', sticky);
  });
})();
