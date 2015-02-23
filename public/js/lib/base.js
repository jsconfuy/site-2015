;(function(document, window) {
  'use strict';

  // FIXME: Navbar
  // var elSelector  = 'body > header',
  //   element = document.querySelector(elSelector);
  // var element;

  // if( !element ) return true;

  // var elHeight = 0,
  //   elTop = 0,
  //   dHeight = 0,
  //   wHeight = 0,
  //   wScrollCurrent = 0,
  //   wScrollBefore = 0,
  //   wScrollDiff = 0;

  // window.addEventListener('scroll', function()
  // {
  //   elHeight    = element.offsetHeight;
  //   dHeight      = document.body.offsetHeight;
  //   wHeight      = window.innerHeight;
  //   wScrollCurrent  = window.pageYOffset;
  //   wScrollDiff    = wScrollBefore - wScrollCurrent;
  //   elTop      = parseInt(window.getComputedStyle( element ).getPropertyValue('top')) + wScrollDiff;

  //   if( wScrollCurrent <= 0 ) // scrolled to the very top; element sticks to the top
  //     element.style.top = '0px';

  //   else if( wScrollDiff > 0 ) // scrolled up; element slides in
  //     element.style.top = ( elTop > 0 ? 0 : elTop ) + 'px';

  //   else if( wScrollDiff < 0 ) // scrolled down
  //   {
  //     if( wScrollCurrent + wHeight >= dHeight - elHeight )  // scrolled to the very bottom; element slides in
  //       element.style.top = ( ( elTop = wScrollCurrent + wHeight - dHeight ) < 0 ? elTop : 0 ) + 'px';

  //     else // scrolled down; element slides out
  //       element.style.top = ( Math.abs( elTop ) > elHeight ? -elHeight : elTop ) + 'px';
  //   }

  //   wScrollBefore = wScrollCurrent;
  // });

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

  // Tickets
  var modal = $('#buy');

  var show = function() {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-select').addClass('active');
    modal.find('.loading').show();
    modal.find('.soldout, .tickets').hide();
    modal.modal('show');
    $.get('/api/tickets/list', function(data) {
      if(data.error) {
        // TODO: show error
      }
      if (data.tickets.length) {
        modal.find('.tickets ul').html('');
        data.tickets.forEach(function(ticket) {
          $('<li />')
            .append($('<div />').addClass('name').text(ticket.name))
            .append(
              $('<div />').addClass('buy').data('ticket', ticket.id).append(
                $('<span />').text('$ 100 x'),
                $('<input min="1" type="number" />').val('1'),
                $('<button />').text('Buy')
              )
            )
            .appendTo(modal.find('.tickets ul'));
        });
        modal.find('.tickets').show();
      } else {
        modal.find('.soldout').show();
      }
      modal.find('.loading').hide();

    });
  };

  $('*[data-buy]').click(function(e) {
    show();
  });


})();
