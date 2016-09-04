function showDismissibleAlert(title, message, alertType) {
    $('#alertContainer').append('<div class="alert alert-dismissible fade in ' + alertType + ' role=alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+ '<strong>'+ title +'</strong> ' + message +'</div>');
    setTimeout(function() { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
        $('.alert').alert('close');
    }, 7000);
}


    $(document).ready(function(){
        // mask for date, email and cie diagnosis fields
        $('.date').inputmask("date");
        $('.time').inputmask("hh:mm");
        $('.email').inputmask("email");
        $('.cie').inputmask("A99[.9]");
    });  
