var scheduleFile;
var schedule;
var today = new Date();

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    //var event;
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
        //$('#shr, $smin, $dhr, $dmin').removeClass('is-invalid');
        clearError();
    });
    $('#save').click(function(e) {
        e.preventDefault();
        var event = [
            {
                "start": `${$('#shr').val()}:${$('#smin').val()}`,
                "duration": `${$('#dhr').val()}:${$('#dmin').val()}`,
                "color": $('#color').val(),
                "event": [
                    {
                        "name": $('#name').val(),
                        "image": $('#image').val()
                    }
                ]
            }
        ];
        if (isSplit(event[0])) {
            event = splitEvent(event[0]);
        }
        if (isConflict(event[0]) || event[1] != undefined && isConflict(event[1])) {
            displayError();
        } else {
            saveEvent(event);
        }
    });
    $('#schedule-content').on('click', '.event', function() {
        //e.preventDefault();
        $('label[for="start"], #shr, #smin, #save').addClass('hide');
        $('#delete, #update').removeClass('hide');
        clearError();
        index = getIndex($(this).attr('id').substring(1));
        //event = schedule[index];
        $('#name').val(schedule[index].event[0].name);
        $('#dhr').val(schedule[index].duration.split(':')[0]);
        $('#dmin').val(schedule[index].duration.split(':')[1]);
        $('#color').val(schedule[index].color);
        //$('#image').val(schedule[index].event[0].image);
        $('#schedule-modal').modal();
    });
    $('#update').click(function(e) {
        e.preventDefault();
        var event = JSON.parse(JSON.stringify(schedule[index]));
        var tempEvent = [JSON.parse(JSON.stringify(event))];
        //alert(`${JSON.stringify(tempEvent)} - ${JSON.stringify(event)}`);
        schedule[index] = {};
        tempEvent[0].event[0].name = $('#name').val();
        tempEvent[0].duration = `${$('#dhr').val()}:${$('#dmin').val()}`;
        tempEvent[0].color = $('#color').val();
        tempEvent[0].event[0].image = $('#image').val();
        if (isSplit(tempEvent[0])) {
            tempEvent = splitEvent(tempEvent[0]);
        }
        if (isConflict(tempEvent[0]) || tempEvent[1] != undefined && isConflict(tempEvent[1])) {
            schedule[index] = event;
            displayError();
        } else {
            $(`#b${toTimestamp(event.start)}`).remove();
            schedule.splice(index, 1);
            saveEvent(tempEvent);
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

function toHumanTime(ts) {
    let hr = Math.floor(ts / 60);
    let min = ts - hr * 60;
    return `${hr}:${min}`;
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

function isSplit(event) {
    let e = toTimestamp(event.start) + toTimestamp(event.duration);
    if (1440 < e) {
        return true;
    }
}

function splitEvent(event) {
    let event1 = JSON.parse(JSON.stringify(event));
    event1.duration = toHumanTime(1440 - toTimestamp(event.start));
    let event2 = JSON.parse(JSON.stringify(event));
    event2.duration = toHumanTime(toTimestamp(event.duration) - toTimestamp(event1.duration));
    event2.start = '00:00';
    return [event1, event2];
}

function saveEvent(event) {
    for (i = 0; i < event.length; i++) {
        schedule.push(event[i]);
        writeFile(JSON.stringify(schedule));
        displaySchedule(event[i]);
    }
    $('#schedule-modal').modal('hide');
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

function displayError() {
    $('#shr, #smin, #dhr, #dmin').addClass('is-invalid');
}

function clearError() {
    $('#shr, #smin, #dhr, #dmin').removeClass('is-invalid');
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