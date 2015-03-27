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

  var showError = function(err, exit) {
    if (exit) {
      modal.modal('hide');
    }
    alert(err.message);
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
        return showError(response.error, true);
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
                $('<span />').text((ticket.price > 0 ? 'USD ' + ticket.price : 'Free') + ' × '),
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
      modal.find('.step-select .description').show();
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
    modal.modal({
      backdrop: 'static',
      keyboard: false
    });
    $.post('/api/tickets/select', {ticket: ticket, discount: discount, quantity: quantity}, function(response) {
      if(response.error) {
        return showError(response.error, true);
      } else {
        if (response.order.paid) {
          assign(response.order.id);
        } else if (response.order.quantity == 0) {
          show(modal.data('ticket'), modal.data('discount'));
        } else if (response.order.paid) {
          assign(response.order.id);
        } else {
          modal.find('.step-payment .invoice .detail').text(response.order.quantity + ' ' +  response.order.ticket + ' × $ ' + response.order.price + ' USD');
          modal.find('.step-payment .invoice .pay button').data('order', response.order.id).text('Pay $ ' + response.order.total + ' USD');
          modal.find('.step-payment > *').show();
          modal.find('.step-payment .loading').hide();
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
    modal.modal({
      backdrop: 'static',
      keyboard: false
    });
    $.get('/api/tickets/assign', {order: order}, function(response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        modal.find('.step-assign .attendees ul').empty();
        response.attendees.forEach(function(attendee, index) {
          var li = $('<li />').append(
            $('<div class="title" />').text('Attendee #' + (index + 1)),
            $('<div class="personal" />').append(
              $('<div class="name" />').append(
                $('<input placeholder="Full Name" />').attr('name', attendee.id + '_name').val(attendee.name)
              ),
              $('<div class="email" />').append(
                $('<input type="email" placeholder="Email" />').attr('name', attendee.id + '_email').val(attendee.email)
              ),
              $('<div class="tshirt" />').append(
                $('<select placeholdecommentsT-Shirt" />').attr('name', attendee.id + '_tshirt').append(
                  $('<option />', {value: 'XS', text: 'Size XS'}),
                  $('<option />', {value: 'S', text: 'Size S'}),
                  $('<option />', {value: 'M', text: 'Size M'}),
                  $('<option />', {value: 'L', text: 'Size L'}),
                  $('<option />', {value: 'XL', text: 'Size XL'}),
                  $('<option />', {value: 'XXL', text: 'Size XXL'})
                ).val(attendee.tshirt || 'L')
              )
            ),
            $('<div class="comments" />').append(
              $('<textarea />')
                .attr('name', attendee.id + '_comments')
                .attr('placeholder', 'Anything you would like us to know. E.g: Meal requisites (vegan, vegetarian, diabetic, coeliac), Accessibility, etc.')
                .val(attendee.comments)
            )
          );
          modal.find('.step-assign .attendees ul').append(li);
        });
        modal.find('.step-assign .save button').data('order', response.order.id);
        modal.find('.step-assign > *').show();
        modal.find('.step-assign .loading').hide();
      }
    });
  };

  var save = function(order) {
    var data = {order: order};
    modal.find('.step-assign').find('input, textarea, select').each(function(){
      data[$(this).attr('name')] = $(this).val();
    });
    $.post('/api/tickets/save', data, function(response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        modal.modal('hide');
      }
    });
  };

  modal.find('.step-payment .pay button').click(function(e){
    var order = $(this).data('order');
    var windowTimeout;
    window.purchaseCompleted = function(err) {
      clearTimeout(windowTimeout);
      if (err) {
        showError(err, true);
      } else {
        assign(order);
      }
    };
    var purchaseWindow = window.open('/purchase/' + order, 'Payment','scrollbars=1,height=550,width=800');
    windowTimeout = setTimeout(function () {
      setTimeout(function () { alert('Your reservation expired'); }, 10); // Prevent FF hangs
      purchaseWindow.close();
      show(modal.data('ticket'), modal.data('discount'));
    }, 12 * 60 * 1000); // 12 minutes
    if (window.focus) {purchaseWindow.focus()}
    return false;
  });

  modal.find('.step-assign .save button').click(function(e){
    var order = $(this).data('order');
    save(order);
  });

  $('*[data-buy]').click(function(e){ show(); });

  if (modal.data('order')) {
    assign(modal.data('order'));
  } else if (modal.data('ticket') || modal.data('discount') || document.location.hash == '#asap') {
    show(modal.data('ticket'), modal.data('discount'));
  }

})();
