var scheduleFile;
var schedule;
var today = new Date();

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    //$('#schedule-content').css('padding-top', `${$('.buttons').outerHeight() + 8}px`);
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
            $('#clock').removeClass('hide');
            displayClock();
            $('#schedule').addClass('hide');
        } else {
            $('#clock').addClass('hide');
            $('#schedule').removeClass('hide');
        }
    });
    $('#save').click(function(e) {
        e.preventDefault();
        let event = {
            "index": schedule.length.toString(),
            "start": $('#start').val().split(':').join(''),
            "duration": $('#duration').val(),
            "color": $('#color').val(),
            "event": [
                {
                    "name": $('#name').val(),
                    "image": $('#image').val()
                }
            ]
        };
        schedule.push(event);
        writeFile(JSON.stringify(schedule));
        displaySchedule(event);
        $('#schedule-modal').modal('hide');
    });
}

function fail(err) {
    alert("Error Code " + err.code + ": " + JSON.stringify(err));
}

function drawSchedule() {
    var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    var minutes = ['00', '15', '30', '45'];
    for (i = 0; i < hours.length; i++) {
        //$('#hour').append(`<option value="${hours[i]}">${hours[i]}</option>`);
        for (j = 0; j < minutes.length; j++) {
            $('#schedule-content').append(`<div class="row"><div class="col-2">${hours[i]}:${minutes[j]}</div><div id="a${hours[i]}${minutes[j]}" class="col-10"></div></div>`);
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
    if (contents == "") {
        /*schedule = [
                {
                "index": "0",
                "start": "0000",
                "duration": "1440",
                "color": "#ddd",
                "event": [
                    {
                        "name": "Nothing Planned",
                        "image": null
                    }
                ]
            }
        ];*/
        schedule = [];
    } else {
        schedule = JSON.parse(contents);
    }
    for (i = 0; i < schedule.length; i++) {
        //alert(JSON.stringify(schedule[i]));
        displaySchedule(schedule[i]);
    }
    if ($('#schedule').hasClass('hide')) {
        displayClock();
    }
}

function isNow(event) {
    let n = today.getHours() * 60 + today.getMinutes();
    let s = Number(event.start.slice(0, 2)) * 60 + Number(event.start.slice(2));
    let e = s + Number(event.duration);
    if (n >= s && n <= e ) {
        return true;
    }
}

function displaySchedule(event) {
    var s = event.start;
    if (!$(`#b${s}`).length) {
        let t = $(`#a${s}`).position().top;
        let l = $(`#a${s}`).position().left;
        let b = t + $(`#a${s}`).outerHeight() * (event.duration / 15);
        let w = $(`#a${s}`).outerWidth() - 16;
        let h = b - t;
        let c = event.color;
        $("#schedule-content").append(`<button type="button" id="b${s}" class="event" data="${event.index}" style="top: ${t}px; left: ${l}px; width: ${w}px; height: ${h}px; background-color: ${c};"><span style="opacity: 1.0;">${event.event[0].name}</span></button>`);
    }
    $('.event').click(function(e) {
        e.preventDefault();
        var event = schedule[Number($(this).attr('data'))];
        $('#edit-name').val(event.event[0].name);
        $('#edit-duration').val(event.duration);
        $('#edit-color').val(event.color);
        $('#edit-image').val(event.event[0].image);
        $('#edit-schedule-modal').modal();
        $('#delete').click(function(e) {
            e.preventDefault();
            $(`#b${event.start}`).remove();
            schedule.splice(Number(event.index), 1);
            writeFile(JSON.stringify(schedule));
            $('#edit-schedule-modal').modal('hide');
        });
    });
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