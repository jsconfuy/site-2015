;(function() {
  'use strict';

  var countdownTime = '';

  $('.navbar').removeClass('active');

  $(document).scroll(function (e) {
    if ($(document).scrollTop() >= $(window).height() - 70) {
      $('.navbar').addClass('active');
    } else {
      $('.navbar').removeClass('active');
    }
  });

  $('#tickets-sale .countdown').countdown('2015/03/27 12:00:00', function (clock) {
    countdownTime = clock.strftime('%D day%!d %H:%M:%S');
    $(this).text(countdownTime);
  });

}());
