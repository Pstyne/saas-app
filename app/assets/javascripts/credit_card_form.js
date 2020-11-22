/* global $ global Stripe */

function getURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if(sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

$(document).on('turbolinks:load', function(){
  
  var show_error, stripeResponseHandler, submitHandler;

  submitHandler = (e) => {
    var $form = $(e.target);
    $form.find("input[type=submit]").prop("disabled", true);

    if (Stripe){
      Stripe.card.createToken($form, stripeResponseHandler);
    } else {
      show_error("Failed to load credit card processing functionality. Please reload this page in your browser.");
    }
    return false;
  };

  $(".cc_form").on("submit", submitHandler);
  
  var handlePlanChange = (planType, form) => {
    var $form = $(form);
    
    if(planType == undefined) {
      planType = $('#tenant_plan :selected').val();
    }
    
    if(planType === 'premium') {
      $('[data-stripe]').prop('required', true);
      $form.off('submit');
      $form.on('submit', submitHandler);
      $('[data-stripe]').show();
    } else {
      $('[data-stripe]').hide();
      $form.off('submit');
      $('[data-stripe]').removeProp('required');
    }
  };
  
  $('#tenant_plan').on('change', function(e){
    handlePlanChange($('#tenant_plan :selected').val(), 'cc_form');
  });
  
  handlePlanChange(getURLParameter('plan'), '.cc_form');

  stripeResponseHandler = (status, res) => {
    var token, $form;

    $form = $(".cc_form");

    if (res.error){
      console.log(res.error.message);
      show_error(res.error.message);
      $form.find("input[type=submit]").prop("disabled", false);
    } else {
      token = res.id;
      $form.append($("<input type=\"hidden\" name=\"payment[token]\" />").val(token));
      $("[data-stripe=number]").remove();
      $("[data-stripe=cvc]").remove();
      $("[data-stripe=year]").remove();
      $("[data-stripe=month]").remove();
      $("[data-stripe=label]").remove();
      $form.get(0).submit();
    }

    return false;
  };

  show_error = (m) => {
    if ($("#flash-messages").size() < 1){
      $("div.container.main div:first").prepend("<div id='flash-messages'></div>");
    }
    $("#flash-messages").html("<div class='alert alert-warning'><a class='close' data-dismiss='alert'>×</a><div id='flash_alert'>"+m+"</div></div>");
    $(".alert").delay(5000).fadeOut(3000);
    return false;
  };
});