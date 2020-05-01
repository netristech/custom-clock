var today = new Date();
var hour = today.getHours();
var minute = today.getMinutes();
var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
var minutes = ['00', '15', '30', '45']

$(document).ready(function() {
	/* Check for touch input */
	window.addEventListener('touchstart', function is_touch() {
		window.isTouch = true;
		window.removeEventListener('touchstart', is_touch, false);
    }, false);

    /* parse schedule file */

    /* Populate calendar 
    for (i = 0; i < hours.length; i++) {
        for (j = 0; j < minutes.length; j++) {
            $('#schedule').append('<div class="row"><div class="col-2">' + hours[i] + ':' + minutes[j] + '</div><div class="col-10"></div></div>')
        }
    } */

    /* Modal show */
    $('#scheduleModal').on('shown.bs.modal', function () {
        $('.modal-body').trigger('focus')
    })

});

$(window).load( function() {
	/* handle swipes for the caousel */
	$('#carousel').swiperight(function() {
		$(this).carousel('prev');
	});  
	$("#carousel").swipeleft(function() {
		$(this).carousel('next');
	});
});
