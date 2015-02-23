;(function() {
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

  var show = function(ticket, discount) {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-select').addClass('active');
    modal.find('.step').hide();
    modal.find('.step-select > *').hide();
    modal.find('.step-select .loading').show();
    modal.find('.step-select').show();
    modal.modal({
      backdrop: 'static',
      keyboard: false
    });
    $.get('/api/tickets/available', {ticket: ticket, discount: discount}, function(response) {
      if(response.error) {
        // TODO: show error
      }
      if (response.discount) {
        if (response.discount.id) {
          modal.find('.discount').show().find('.code').removeClass('error').text('Code Applied: ' + response.discount.code);
        } else if (response.discount.invalid) {
          modal.find('.discount').show().find('.code').addClass('error').text('Invalid Code: ' + response.discount.code);
        }
      }
      if (response.tickets.length) {
        modal.find('.tickets ul').html('');
        response.tickets.forEach(function(ticket) {
          var input = $('<input min="1" type="number" />').val('1');
          $('<li />')
            .append($('<div />').addClass('name').text(ticket.name))
            .append(
              $('<div />').addClass('buy').append(
                $('<span />').text((ticket.price > 0 ? '$ ' + ticket.price : 'Free') + ' x'),
                input,
                $('<button />').text('Buy').click(function(e) {
                  reserve(ticket.id, response.discount ? response.discount.id : null, input.val());
                })
              )
            )
            .appendTo(modal.find('.tickets ul'));
        });
        modal.find('.step-select .tickets').show();
      } else {
        modal.find('.step-select .soldout').show();
      }
      modal.find('.step-select .note').show();
      modal.find('.step-select .loading').hide();
    });
  };

  var reserve = function(ticket, discount, quantity) {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-payment').addClass('active');
    modal.find('.step').hide();
    modal.find('.step-payment > *').hide();
    modal.find('.step-payment .loading').show();
    modal.find('.step-payment').show();
    $.post('/api/tickets/reserve', {ticket: ticket, discount: discount, quantity: quantity}, function(response) {
      if(response.error) {
        // TODO: show error
      }
      modal.find('.step-payment > *').show();
      modal.find('.step-payment .loading').hide();
    });
  };

  var checkout = function() {
    alert('checkout');

  };

  modal.find('.step-payment .action button').click(function(e){ checkout(); });
  $('*[data-buy]').click(function(e){ show(); });
  if (modal.data('ticket') || modal.data('discount')) {
    show(modal.data('ticket'), modal.data('discount'));
  }

})();
