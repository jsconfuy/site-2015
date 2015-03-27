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

  var start = new Date(Date.UTC(2015, 2, 27, 17, 0, 0));
  $('#tickets-sale .countdown').countdown(start, function (clock) {
    countdownTime = clock.strftime('%D day%!d %H:%M:%S');
    $(this).text(countdownTime);
  });

}());
