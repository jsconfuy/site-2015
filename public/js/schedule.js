;(function() {
  'use strict';
  $('.title').click(function (e) {
    $(this).parent().find('.description').toggleClass('active');
  });

}());
