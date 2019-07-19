function login() {
    $username = $('input[name=txtusername]');
    $password = $('input[name=txtpassword]');

    $.ajax({
        method: 'POST',
        url: '/login',
        contentType: 'application/json',
        data: JSON.stringify({"username": $username.val(), "password": $password.val()}),
        success: function (response) {
            var data = response;
            $('body').overhang({
                type: data.status,
                message: data.message
            });
            if (data.status == "success") {
                sessionStorage['position'] = data.details.position;
                sessionStorage['owner'] = data.details.id;
                window.location.href = '/pages/';
            }
        }
    });
}
            
$(document).ready(function (e) {
    $('input[name=txtusername], input[name=txtpassword]').on('keyup', function(e) {
        if (e.keyCode === 13) {
            login();
        }
    });
});