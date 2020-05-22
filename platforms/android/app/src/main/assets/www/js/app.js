var scheduleFile;
var schedule;
var today = new Date();

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    var event;
    var index;
    drawSchedule();
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		dir.getFile("schedule.json", {create:true}, function(file) {
            scheduleFile = file;
            readFile(scheduleFile);
        });
    }, fail);
    $('.switch').click(function(e) {
        e.preventDefault();
        if ($('#clock').hasClass('hide')) {
            $('#schedule').addClass('hide');
            $('#clock').removeClass('hide');
            displayClock();         
        } else {
            $('#clock').addClass('hide');
            $('#schedule').removeClass('hide');
            focusSchedule();
        }
    });
    $('#add').click(function(e) {
        e.preventDefault();
        $('#schedule-form').trigger('reset');
        $('#update, #delete').addClass('hide');
        $('label[for="start"], #shr, #smin, #save').removeClass('hide');
        $('#shr, $smin, $dhr, $dmin').removeClass('is-invalid');
    });
    $('#save').click(function(e) {
        e.preventDefault();
        event = {
            "start": `${$('#shr').val()}:${$('#smin').val()}`,
            "duration": `${$('#dhr').val()}:${$('#dmin').val()}`,
            "color": $('#color').val(),
            "event": [
                {
                    "name": $('#name').val(),
                    "image": $('#image').val()
                }
            ]
        };
        if (isConflict(event)) {
            $('#shr, #smin, #dhr, #dmin').addClass('is-invalid');
        } else {
            schedule.push(event);
            writeFile(JSON.stringify(schedule));
            displaySchedule(event);
            $('#schedule-modal').modal('hide');
        }
    });
    $('#schedule-content').on('click', '.event', function() {
        //e.preventDefault();
        $('label[for="start"], #shr, #smin, #save').addClass('hide');
        $('#delete, #update').removeClass('hide');
        $('#shr, #smin, #dhr, #dmin').removeClass('is-invalid');
        index = getIndex($(this).attr('id').substring(1));
        event = schedule[index];
        $('#name').val(event.event[0].name);
        $('#dhr').val(event.duration.split(':')[0]);
        $('#dmin').val(event.duration.split(':')[1]);
        $('#color').val(event.color);
        //$('#image').val(event.event[0].image);
        $('#schedule-modal').modal();
    });
    $('#update').click(function(e) {
        e.preventDefault();
        tempEvent = event;
        schedule[index] = {};
        tempEvent.event[0].name = $('#name').val();
        tempEvent.duration = `${$('#dhr').val()}:${$('#dmin').val()}`;
        tempEvent.color = $('#color').val();
        tempEvent.event[0].image = $('#image').val();
        if (isConflict(tempEvent)) {
            schedule[index] = event;
            $('#shr, #smin, #dhr, #dmin').addClass('is-invalid');
        } else {
            schedule[index] = tempEvent;
            writeFile(JSON.stringify(schedule));
            $(`#b${toTimestamp(event.start)}`).remove();
            displaySchedule(schedule[index]);
            $('#schedule-modal').modal('hide');
        }
    });
    $('#delete').click(function(e) {
        e.preventDefault();
        $(`#b${toTimestamp(schedule[index].start)}`).remove();
        schedule.splice(index, 1);
        writeFile(JSON.stringify(schedule));
        $('#schedule-modal').modal('hide');
    });
}

function fail(err) {
    alert("Error Code " + err.code + ": " + JSON.stringify(err));
}

function toTimestamp(str) {
    return Number(str.split(':')[0]) * 60 + Number(str.split(':')[1]);
}

function getIndex(id) {
    for (i = 0; i < schedule.length; i++) {
        if (toTimestamp(schedule[i].start) == Number(id)) {
            return i;
        }
    }
}

function drawSchedule() {
    $('#schedule-content').append(`<div style="height: ${$('.buttons').outerHeight() + 8}px;"></div>`);
    var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    var minutes = ['00', '15', '30', '45'];
    for (i = 0; i < hours.length; i++) {
        //$('#hour').append(`<option value="${hours[i]}">${hours[i]}</option>`);
        for (j = 0; j < minutes.length; j++) {
            let t = `${hours[i]}:${minutes[j]}`;
            $('#schedule-content').append(`<div class="row"><div class="col-2">${t}</div><div id="a${toTimestamp(t)}" class="col-10"></div></div>`);
            //$('#schedule-content').append(`<div class="row"><div class="col-2">${t}</div><div id="a${t}" class="col-10"></div></div>`);
        }
    }
}

function readFile(fileEntry) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
            parseFile(this.result);
		}
		reader.readAsText(file);
	}, fail); 
}

function writeFile(line) {
	if (!scheduleFile) return;
	scheduleFile.createWriter(function(fileWriter) {		
		//fileWriter.seek(fileWriter.length);
		var blob = new Blob([line], {type:'text/plain'});
		fileWriter.write(blob);
	}, fail);
}

function parseFile(contents) {
    if (contents == '') {
        schedule = [];
    } else {
        schedule = JSON.parse(contents);
    }
    for (i = 0; i < schedule.length; i++) {
        displaySchedule(schedule[i]);
    }
    if ($('#schedule').hasClass('hide')) {
        displayClock();
    }
}

function isNow(event) {
    let n = today.getHours() * 60 + today.getMinutes();
    //let s = Number(event.start.slice(0, 2)) * 60 + Number(event.start.slice(2));
    let s = toTimestamp(event.start);
    let e = s + (toTimestamp(event.duration) - 1);
    if (n >= s && n <= e ) {
        return true;
    }
}

function isConflict(event) {
    var s1 = toTimestamp(event.start);
    var e1 = s1 + toTimestamp(event.duration) - 1;
    for (i = 0; i < schedule.length; i++) {
        if (!jQuery.isEmptyObject(schedule[i])) {
            let s2 = toTimestamp(schedule[i].start);
            let e2 = s2 + toTimestamp(schedule[i].duration) - 1;
            if (s1 <= e2 && s2 <= e1) {
                return true;
            }
        }
    }
}

function displaySchedule(event) {
    var s = toTimestamp(event.start);
    if (!$(`#b${s}`).length) {
        let t = $(`#a${s}`).position().top;
        let l = $(`#a${s}`).position().left;
        let b = t + $(`#a${s}`).outerHeight() * (toTimestamp(event.duration) / 15);
        let w = $(`#a${s}`).outerWidth() - 8;
        let h = b - t;
        let c = event.color;
        $("#schedule-content").append(`<button type="button" id="b${s}" class="event" style="top: ${t}px; left: ${l}px; width: ${w}px; height: ${h}px; background-color: ${c};"><span style="opacity: 1.0;">${event.event[0].name}</span></button>`);
    }
}

function focusSchedule() {
    let h = today.getHours();
    let m = 15 * (Math.floor(today.getMinutes() / 15));
    let e = `#a${h * 60 + m}`;
    let em = $(e).offset().top + ($(e).outerHeight() / 2);
    $('html').scrollTop(em - $(window).height() / 2);
}

function displayClock() {
    $('#clock').css('background-image', 'url(img/beach.jpg');
    $('#clock-content').html(`<div class="center"><strong>Nothing Planned</strong></div>`);
    for (i = 0; i < schedule.length; i++) {
        if (isNow(schedule[i])) {
            if (schedule[i].event[0].image != '') {
                $('#clock').css('background-image', `url(${schedule[i].event[0].image})`);
            } else {
                $('#clock').css('background-image', 'none');
                $('#clock').css('background-color', schedule[i].color);
            }
            $('#clock-content').html(`<div class="center"><strong>${schedule[i].event[0].name}</strong></div>`);
        }
    }
}