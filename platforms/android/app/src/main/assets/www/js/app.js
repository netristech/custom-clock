var scheduleFile;
var schedule;
var today = new Date();

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
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
            $('#schedule').addClass('hide');
        } else {
            $('#clock').addClass('hide');
            $('#schedule').removeClass('hide');
        }
    });
    $('#save').click(function(e) {
        e.preventDefault();
        var event = {
            "start": $('#start').val().split(':').join(''),
            "duration": $('#duration').val(),
            "color": $('#color').val(),
            "event": [
                {
                    "name": $('#name').val(),
                    "image": $('#image').val()
                }
            ]
        }
        if (schedule.length < 2 && schedule[0].duration == '1440') {
            $(`#b${schedule[0].start}`).remove();
            schedule = [event];
        } else {
            schedule.push(event);
        }
        //writeFile(`${JSON.stringify(event)},`);
        writeFile(JSON.stringify(schedule));
        displayEvent(event);
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
        schedule = [
                {
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
        ];
    } else {
        //schedule = JSON.parse(`[${contents.substring(0, contents.length - 1)}]`);
        schedule = JSON.parse(contents);
    }
    //displayEvents();
    for (i = 0; i < schedule.length; i++) {
        displayEvent(schedule[i]);
    }
}

function isNow(event) {
    let n = today.getHours() * 60 + today.getMinutes();
    let s = Number(event.start.slice(0, 2)) * 60 + Number(event.start.slice(2));
    let e = s + Number(event.duration);
    //alert(`now: ${n} start: ${s} end: ${e}`);
    if (n >= s && n <= e ) {
        return true;
    }
}

function displayEvent(event) {
    if (isNow(event)) {
        $('#clock-content').html(`<div class="center"><strong>${event.event[0].name}</strong></div>`);
    } else {
        $('#clock-content').html(`<div class="center"><strong>Nothing Planned</strong></div>`);
    }
    var s = event.start;
    if (!$(`#b${s}`).length) {
        let t = $(`#a${s}`).position().top;
        let l = $(`#a${s}`).position().left;
        let b = t + $(`#a${s}`).outerHeight() * (event.duration / 15);
        let w = $(`#a${s}`).outerWidth();
        let h = b - t;
        let c = event.color;
        $("#schedule-content").append(`<div id="b${s}" class="event" style="top: ${t}px; left: ${l}px; width: ${w}px; height: ${h}px; background-color: ${c};"><span style="opacity: 1.0;">${event.event[0].name}</span></div>`);
    }
}