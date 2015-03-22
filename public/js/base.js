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

  var showError = function(message, exit) {
    alert(message);
    if (exit) {
      modal.modal('hide');
    }
    return false;
  }

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
        return showError(reponse.error, true);
      }
      if (response.messages.invalid_discount) {
        modal.find('.discount').show().find('.code').addClass('error').text('Invalid Code');
      }
      if (response.discount) {
        modal.find('.discount').show().find('.code').removeClass('error').text('Code Applied: ' + response.discount.code);
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
                $('<button />').text('Select').click(function(e) {
                  select(ticket.code, response.discount && response.discount.code, input.val());
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

  var select = function(ticket, discount, quantity) {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-payment').addClass('active');
    modal.find('.step').hide();
    modal.find('.step-payment > *').hide();
    modal.find('.step-payment .loading').show();
    modal.find('.step-payment').show();
    $.post('/api/tickets/select', {ticket: ticket, discount: discount, quantity: quantity}, function(response) {
      if(response.error) {
        return showError(response.error, true);
      } else {
        modal.find('.step-payment .detail').text(response.order.quantity + ' ' +  response.order.ticket + ' x $ ' + response.order.price);
        modal.find('.step-payment .total').text('Total $ ' + response.order.total);
        modal.find('.step-payment .action button').data('order', response.order.id);
        modal.find('.step-payment > *').show();
        modal.find('.step-payment .loading').hide();
      }
    });
  };

  var checkout = function(order) {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-assign').addClass('active');
    modal.find('.step').hide();
    modal.find('.step-assign > *').hide();
    modal.find('.step-assign .loading').show();
    modal.find('.step-assign').show();
    var data = {order: order};
    var card = {};
    var ok = true;
    modal.find('.step-payment').find('input').removeClass('error').each(function(){
      var value = $.trim($(this).val());
      if(!value && $(this).attr('required')) {
        $(this).addClass('error');
        ok = false;
      } else {
        var name = $(this).attr('name');
        if (name.slice(0, 'card'.length) == 'card') {
          card[name] = value;
        } else {
          data[name] = value;
        }
      }
    });
    if (!ok) {
      modal.find('.indicator').removeClass('active');
      modal.find('.indicator-payment').addClass('active');
      modal.find('.step').hide();
      modal.find('.step-payment').show();
      modal.find('.step-payment > *').show();
      modal.find('.step-payment .loading').hide();
      return;
    }
    var tokenRequest = function() {
      var args = {
          sellerId: TWOCO_SELLER_ID,
          publishableKey: TWOCO_PUBLIC_KEY,
          ccNo: card.card_number,
          cvv: card.card_cvc,
          expMonth: card.card_expiration_month,
          expYear: card.card_expiration_year,
      };
      TCO.requestToken(tokenOK, tokenError, args);
    };
    var tokenOK = function(response) {
      if (response.response && response.response.token) {
        data.token = response.response.token.token;
        $.post('/api/tickets/checkout', data, function(response) {
          if (response.error) {
            return showError(response.error);
          } else {
            modal.find('.step-assign .more a').attr('href', '/attendees/' + response.order.id);
            modal.find('.step-assign > *').show();
            modal.find('.step-assign .loading').hide();
          }
        });
      }
      // TODO: else???
    };
    var tokenError = function(response) {
      if (response.errorCode === 200) {
        tokenRequest();
      } else {
        showError(response.errorMsg);
      }
    };
    tokenRequest();
  };

  TCO.loadPubKey(TWOCO_ENV);
  modal.find('.step-payment .action button').click(function(e){ checkout($(this).data('order')); });
  $('*[data-buy]').click(function(e){ show(); });
  if (modal.data('ticket') || modal.data('discount') || document.location.hash == '#now') {
    show(modal.data('ticket'), modal.data('discount'));
  }

})();
