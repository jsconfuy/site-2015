;(function() {
  'use strict';

  // NavBar
  $(".navbar-fixed-top").autoHidingNavbar({});

  // Map
  var point = new google.maps.LatLng(-34.892589, -56.194638);
  var map = new google.maps.Map(
    document.getElementById('map'),
    {
      center: point,
      zoom: 15,
      draggable: false,
      scrollwheel: false,
      panControl: false,
      streetViewControl: false,
    }
  );
  var marker = new google.maps.Marker({
    position: point,
    map: map,
    icon: {
      url: '/images/base/logo.png',
      size: new google.maps.Size(32, 32),
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32),
    }
  });

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
    var data = {};
    var ok = true;
    modal.find('.step-payment').find('input').removeClass('error').each(function(){
      var value = $.trim($(this).val());
      if(!value) {
        $(this).addClass('error');
        ok = false;
      } else {
        data[$(this).attr('name')] = value;
      }
    });
    if (ok) {
      alert('ok');
    }

  };

  modal.find('.step-payment .action button').click(function(e){ checkout(); });
  $('*[data-buy]').click(function(e){ show(); });
  if (modal.data('ticket') || modal.data('discount')) {
    show(modal.data('ticket'), modal.data('discount'));
  }

})();
