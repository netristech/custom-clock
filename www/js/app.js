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
            $('#schedule-content').append(`<div class="row"><div class="col-2">${hours[i]}:${minutes[j]}</div><div id="${hours[i]}:${minutes[j]}" class="col-10"></div></div>`);
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
            "start": "00:00",
            "end": "23:59",
            "color": "240,240,240",
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
    //$("#schedule").append(JSON.stringify(event));
    $("#schedule-content").append(`<div id="${event.start}" class="event" style="background-color: rgba(${event.color},0.5);">${event.events[0].name}</div>`);
}