var scheduleFile;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    drawSchedule();
    //drawCurrentEvent();
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
    //window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "schedule.json", readFile, fail);
}

function fail(err) {
    alert("Error Code " + err.code + ": " + JSON.stringify(err));
}

function drawSchedule() {
    var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    var minutes = ['00', '15', '30', '45'];
    for (i = 0; i < hours.length; i++) {
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
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([line], {type:'text/plain'});
		fileWriter.write(blob);
	}, fail);
}

function parseFile(contents) {
    if (contents == "") {
        let event = {
            "start": "0000",
            "end": "2359",
            "color": "200,200,200",
            "events": [
                {
                    "name": "Nothing Planned",
                    "image": null
                }
            ]
        };
        displayEvent(event);
    } else {
        contents = '[' + contents + ']';
        var schedule = JSON.parse(contents);
        for (i = 0; i < schedule.length; i++) {
            displayEvent(schedule[i]);
        }
    }
}

function displayEvent(event) {
    alert(`width is: ${$('.switch').height()}`);
    //$("#schedule").append(JSON.stringify(event));
    $("#schedule-content").append(`<div id="${event.start}" class="event" style="position: absolute; top: ${$('#a0000').position().top}px; left: ${$('#a0000').position().left}px; width: ${$('#a0000').width()}px; background-color: rgba(${event.color},0.8);">${event.events[0].name}</div>`);
    $('#clock-content').append(`<div id="" class="" style="">${event.events[0].name}</div>`);
}