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
          var input = $('<input type="number" />').attr('min', ticket.min).attr('max', ticket.max).val(ticket.min);
          $('<li />')
            .append($('<div />').addClass('name').text(ticket.name))
            .append(
              $('<div />').addClass('buy').append(
                $('<span />').text((ticket.price > 0 ? '$ ' + ticket.price : 'Free') + ' x'),
                input,
                $('<button />').text(ticket.price ? 'Select' : 'Confirm').click(function(e) {
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
        if (response.order.paid) {
          assign(response.order.id);
        } else if (response.order.quantity == 0) {
          show(modal.data('ticket'), modal.data('discount'));
        } else if (response.order.price > 0) {
          modal.find('.step-payment .invoice .detail').text(response.order.quantity + ' ' +  response.order.ticket + ' x $ ' + response.order.price);
          modal.find('.step-payment .invoice .pay button').data('order', response.order.id).text('Pay $ ' + response.order.total);
          modal.find('.step-payment > *').show();
          modal.find('.step-payment .loading').hide();
        } else {
          assign(response.order.id);
        }
      }
    });
  };

  var assign = function(order) {
    modal.find('.indicator').removeClass('active');
    modal.find('.indicator-assign').addClass('active');
    modal.find('.step').hide();
    modal.find('.step-assign > *').hide();
    modal.find('.step-assign .loading').show();
    modal.find('.step-assign').show();
    var data = {order: order};
    $.post('/api/tickets/assign', data, function(response) {
      if (response.error) {
        return showError(response.error);
      } else {
        // TODO: Add attendees placeholders
        modal.find('.step-assign > *').show();
        modal.find('.step-assign .loading').hide();
      }
    });
  };

  modal.find('.step-payment .pay button').click(function(e){
    var order = $(this).data('order');
    window.purchaseCompleted = function(err) {
      if (err) {
        // TODO: check err!
      } else {
        assign(order);
      }
    };
    var newwindow = window.open('/purchase/' + order, 'Payment','height=400,width=350');
    if (window.focus) {newwindow.focus()}
    return false;
  });

  $('*[data-buy]').click(function(e){ show(); });
  if (modal.data('ticket') || modal.data('discount') || document.location.hash == '#asap') {
    show(modal.data('ticket'), modal.data('discount'));
  }

})();
