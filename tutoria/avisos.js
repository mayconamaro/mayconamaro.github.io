$( document ).ready(function() {
    if ($('#aviso').is(':empty')) { 
      $('.avisos').addClass('d-none')
  } else {
    $('.avisos').removeClass('d-none')
  }
}) 
