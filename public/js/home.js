;(function() {
  'use strict';

  $('.navbar').removeClass('active');
  $(document).scroll(function(e) {
    if ($(document).scrollTop() >= $(window).height() - 70) {
      $('.navbar').addClass('active');
    } else {
      $('.navbar').removeClass('active');
    }
  });

})();
